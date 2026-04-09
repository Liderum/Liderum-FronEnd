import { rbacApi } from './api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type {
  RbacRole,
  RbacPermission,
  RbacModule,
  CreateRoleRequest,
} from '@/types/rbac';

export class RbacAdminService {
  static async listRoles(): Promise<RbacRole[]> {
    try {
      const response = await rbacApi.get<RbacRole[]>('/roles');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async createRole(payload: CreateRoleRequest): Promise<RbacRole> {
    try {
      const response = await rbacApi.post<RbacRole>('/roles', payload);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async listPermissions(): Promise<RbacPermission[]> {
    try {
      const response = await rbacApi.get<RbacPermission[]>('/permissions');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async listModules(): Promise<RbacModule[]> {
    try {
      const response = await rbacApi.get<RbacModule[]>('/modules');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await rbacApi.post(`/roles/${roleId}/permissions/${permissionId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await rbacApi.delete(`/roles/${roleId}/permissions/${permissionId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async assignRoleToUser(roleId: string, userId: string): Promise<void> {
    try {
      await rbacApi.post(`/roles/${roleId}/users/${userId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async removeRoleFromUser(roleId: string, userId: string): Promise<void> {
    try {
      await rbacApi.delete(`/roles/${roleId}/users/${userId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
