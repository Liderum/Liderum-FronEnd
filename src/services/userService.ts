import { usersApi } from './api/apiFactory';
import { ApiResponse, CreateUserRequest, PagedRequest, PagedResponse, UpdateUserRequest, UserDto } from '@/types/users';

export class UserService {
  static async list(params: PagedRequest): Promise<PagedResponse<UserDto>> {
    const response = await usersApi.get<ApiResponse<PagedResponse<UserDto>>>('/list', { params });
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Erro ao listar usuários');
    }
    return response.data.data[0];
  }

  static async create(payload: CreateUserRequest): Promise<string> {
    const response = await usersApi.post<ApiResponse<null>>('/create', payload);
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Erro ao criar usuário');
    }
    return response.data.message;
  }

  static async update(payload: UpdateUserRequest): Promise<string> {
    const response = await usersApi.put<ApiResponse<null>>(`/update/${payload.id}`, payload);
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Erro ao atualizar usuário');
    }
    return response.data.message;
  }

  static async remove(id: string): Promise<string> {
    const response = await usersApi.delete<ApiResponse<null>>(`/delete/${id}`);
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Erro ao excluir usuário');
    }
    return response.data.message;
  }
}


