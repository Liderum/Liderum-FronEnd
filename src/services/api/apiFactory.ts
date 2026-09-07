import axios, { InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import { API_CONFIG, ApiModule } from '@/config/api';
import { tokenStore } from './tokenStore';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processPendingQueue(token: string | null, error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

const authApi = axios.create({
  baseURL: API_CONFIG.AUTH.BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

authApi.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class ApiFactory {
  private static instances = new Map<ApiModule, AxiosInstance>();

  static getInstance(module: ApiModule): AxiosInstance {
    if (!this.instances.has(module)) {
      const instance = axios.create({
        baseURL: API_CONFIG[module].BASE_URL,
        timeout: 30000,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      this.addAuthInterceptors(instance);
      this.instances.set(module, instance);
    }
    return this.instances.get(module)!;
  }

  private static addAuthInterceptors(instance: AxiosInstance) {
    instance.interceptors.request.use(
      (config) => {
        const token = tokenStore.getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error),
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as RetryableRequest | undefined;

        if (!originalRequest || originalRequest.url?.includes('/refresh-token')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const { data } = await authApi.post<{
                accessToken: string;
                refreshToken?: string;
              }>('/refresh-token');

              tokenStore.setAccessToken(data.accessToken);
              if (data.refreshToken) tokenStore.setRefreshToken(data.refreshToken);

              processPendingQueue(data.accessToken, null);

              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return instance(originalRequest);
            } catch (refreshError) {
              processPendingQueue(null, refreshError);
              tokenStore.clear();
              tokenStore.notifyAuthFailure();
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }

          return new Promise((resolve, reject) => {
            pendingQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(instance(originalRequest));
              },
              reject,
            });
          });
        }

        return Promise.reject(error);
      },
    );
  }
}

export const authApiInstance = authApi;
export const usersApi = ApiFactory.getInstance('USERS');
export const worksApi = ApiFactory.getInstance('WORKS');
export const rbacApi = ApiFactory.getInstance('RBAC');
export const tenantApi = ApiFactory.getInstance('TENANT');
/** @deprecated Use worksApi instead */
export const managementApi = worksApi;
export default authApiInstance;
