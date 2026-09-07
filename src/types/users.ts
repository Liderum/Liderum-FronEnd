export type UserStatus = 'active' | 'inactive';

export interface UserDto {
  identifier: string;
  name: string;
  email: string;
  role: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string | null;
  permissions: string[];
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  permissions: string[];
}

export interface UpdateUserRequest {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: UserStatus;
  permissions: string[];
  password?: string;
  confirmPassword?: string;
}

export interface PagedRequest {
  page: number;
  pageSize: number;
  search?: string;
  status?: UserStatus | 'all';
  role?: string | 'all';
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
