export interface RbacRole {
  id: string;
  name: string;
  description?: string;
}

export interface RbacPermission {
  id: string;
  name: string;
  description?: string;
}

export interface RbacModule {
  id: string;
  name: string;
  description?: string;
}

export interface RolePermissionsResponse {
  roles: string[];
  modules: string[];
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface RoleWithPermissions extends RbacRole {
  permissions: string[];
}
