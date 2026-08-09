import { request } from '../utils/request';

export interface LoginParams {
  phone: string;
  password: string;
}

export interface RegisterParams {
  phone: string;
  password: string;
  name: string;
  email?: string;
}

export interface UserInfo {
  id: number;
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  regionId?: number;
  roles: Array<{ id: number; code: string; name: string; dataScope: string }>;
  permissions: string[];
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}

export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/api/auth/login',
    method: 'post',
    data,
  });
}

export function register(data: RegisterParams) {
  return request<LoginResult>({
    url: '/api/auth/register',
    method: 'post',
    data,
  });
}

export function getProfile() {
  return request<UserInfo>({
    url: '/api/auth/profile',
    method: 'get',
  });
}
