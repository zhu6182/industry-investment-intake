import { request } from '../../utils/request';

export interface RoleItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  dataScope: string;
  permissions: PermissionItem[];
}

export interface PermissionItem {
  id: number;
  code: string;
  name: string;
  module: string;
}

export function listRoles() {
  return request<RoleItem[]>({ url: '/api/roles', method: 'get' });
}

export function getRoleById(id: number) {
  return request<RoleItem>({ url: `/api/roles/${id}`, method: 'get' });
}

export function listPermissions() {
  return request<PermissionItem[]>({ url: '/api/roles/permissions/list', method: 'get' });
}

export function updateRolePermissions(id: number, permissionIds: number[]) {
  return request<RoleItem>({ url: `/api/roles/${id}/permissions`, method: 'patch', data: { permissionIds } });
}
