import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '../api/auth';
import type { UserInfo } from '../api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null'),
  );

  const isLoggedIn = computed(() => !!token.value);
  const roles = computed(() => userInfo.value?.roles?.map((r) => r.code) || []);
  const permissions = computed(() => userInfo.value?.permissions || []);

  const setToken = (t: string) => {
    token.value = t;
    localStorage.setItem('token', t);
  };

  const setUserInfo = (u: UserInfo | null) => {
    userInfo.value = u;
    if (u) {
      localStorage.setItem('userInfo', JSON.stringify(u));
    } else {
      localStorage.removeItem('userInfo');
    }
  };

  const hasRole = (role: string) => {
    return roles.value.includes(role);
  };

  const hasPermission = (perm: string) => {
    return permissions.value.includes(perm);
  };

  const login = async (phone: string, password: string) => {
    const res = await authApi.login({ phone, password });
    setToken(res.token);
    setUserInfo(res.user);
    return res.user;
  };

  const fetchProfile = async () => {
    const user = await authApi.getProfile();
    setUserInfo(user);
    return user;
  };

  const logout = () => {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  return {
    token,
    userInfo,
    isLoggedIn,
    roles,
    permissions,
    setToken,
    setUserInfo,
    hasRole,
    hasPermission,
    login,
    fetchProfile,
    logout,
  };
});
