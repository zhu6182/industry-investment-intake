import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useUserStore } from '@/stores/user';

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
});

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      const userStore = useUserStore();
      userStore.logout();
      const currentPath = window.location.pathname;
      const isMobile = currentPath.startsWith('/mobile');
      const loginPath = isMobile ? '/mobile/login' : '/pc/login';
      if (currentPath !== loginPath) {
        window.location.href = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    const message = data?.message || data?.error || error.message || '请求失败';
    return Promise.reject(new Error(message));
  },
);

export default service;

export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config) as Promise<T>;
}
