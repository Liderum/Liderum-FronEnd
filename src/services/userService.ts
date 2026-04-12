import { usersApi } from './api/apiFactory';
import type { CreateUserRequest, PagedRequest, PagedResponse, UpdateUserRequest, UserDto } from '@/types/users';

export class UserService {
  static async list(params: PagedRequest): Promise<PagedResponse<UserDto>> {
    const queryParams: Record<string, string | number> = {
      page: params.page,
      pageSize: params.pageSize,
    };
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.role && params.role !== 'all') queryParams.role = params.role;

    const response = await usersApi.get<PagedResponse<UserDto>>('/list', { params: queryParams });
    return response.data;
  }

  static async create(payload: CreateUserRequest): Promise<void> {
    // Mapeia o payload do frontend para o formato do AddMember do backend
    await usersApi.post('/add-member', {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
      roleName: payload.role,
      modules: payload.permissions, // Frontend envia permissões como nomes de módulos
    });
  }

  static async update(payload: UpdateUserRequest): Promise<void> {
    await usersApi.put(`/update/${payload.id}`, {
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      permissions: payload.permissions,
      password: payload.password || undefined,
    });
  }

  static async remove(id: string): Promise<void> {
    await usersApi.delete(`/delete/${id}`);
  }
}
