<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  FileAddOutlined,
  AuditOutlined,
  LogoutOutlined,
  UserOutlined,
  SolutionOutlined,
  TeamOutlined,
  FundOutlined,
  TrophyOutlined,
  SettingOutlined,
  ApartmentOutlined,
  SafetyOutlined,
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isPc = computed(() => route.path.startsWith('/pc'));
const isMobile = computed(() => route.path.startsWith('/mobile'));
const isLogin = computed(() => route.path.endsWith('/login'));
const isFullscreen = computed(() => route.path === '/pc/bi');

const pcMenu = [
  { key: '/pc/dashboard', label: '工作台', icon: DashboardOutlined, roles: ['admin','middleware_ops','investment_manager','investment_staff','channel_manager','channel_specialist'] },
  { key: '/pc/intakes', label: '进件管理', icon: UnorderedListOutlined, roles: ['admin','middleware_ops','investment_manager','investment_staff','channel_manager','channel_specialist'] },
  { key: '/pc/intakes/new', label: '新建进件', icon: FileAddOutlined, roles: ['admin','channel_manager','channel_specialist'] },
  { key: '/pc/review', label: '中台审核', icon: AuditOutlined, roles: ['admin','middleware_ops','investment_manager','investment_staff'] },
  { key: '/pc/follow-ups', label: '跟进记录', icon: SolutionOutlined, roles: ['admin','middleware_ops','investment_manager','investment_staff','channel_manager','channel_specialist'] },
  { key: '/pc/visits', label: '拜访记录', icon: TeamOutlined, roles: ['admin','middleware_ops','investment_manager','investment_staff','channel_manager','channel_specialist'] },
  { key: '/pc/bi', label: '数据大屏', icon: FundOutlined, roles: ['admin','middleware_ops','investment_manager','channel_manager'] },
  { key: '/pc/referrals', label: '我的推荐', icon: TrophyOutlined, roles: ['admin','middleware_ops','investment_manager','investment_staff','channel_manager','channel_specialist'] },
  { key: '/pc/admin/regions', label: '园区管理', icon: ApartmentOutlined, roles: ['admin','middleware_ops'] },
  { key: '/pc/admin/users', label: '用户管理', icon: UserOutlined, roles: ['admin','middleware_ops'] },
  { key: '/pc/admin/roles', label: '角色权限', icon: SafetyOutlined, roles: ['admin'] },
  { key: '/pc/admin/settings', label: '系统设置', icon: SettingOutlined, roles: ['admin','middleware_ops'] },
];

const visiblePcMenu = computed(() => {
  const userRoles = userStore.roles || [];
  if (userRoles.includes('admin')) return pcMenu;
  return pcMenu.filter((m) => m.roles.some((r) => userRoles.includes(r)));
});

function navigate(path: string) {
  router.push(path);
}

function logout() {
  userStore.logout();
  router.push('/pc/login');
}

const userMenuOpen = computed(() => !['/pc/login', '/mobile/login'].includes(route.path));

const selectedKeys = computed(() => [route.path]);
const siderCollapsed = ref(false);
</script>

<template>
  <router-view v-if="isLogin || isMobile || isFullscreen" />

  <a-layout v-else-if="isPc" class="pc-layout">
    <a-layout-sider v-model:collapsed="siderCollapsed" collapsible width="200" theme="light">
      <div class="logo">
        <strong>产业投资</strong>
        <span>进件系统</span>
      </div>
      <a-menu
        :selected-keys="selectedKeys"
        mode="inline"
        @click="({ key }: any) => navigate(key)"
      >
        <a-menu-item v-for="item in visiblePcMenu" :key="item.key">
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="pc-header">
        <div class="header-left">
          <span class="breadcrumb" v-if="route.meta.title">
            {{ route.meta.title }}
          </span>
        </div>
        <div class="header-right" v-if="userMenuOpen">
          <a-dropdown>
            <span class="user-info">
              <a-avatar :size="28" style="background-color: #1677ff; margin-right: 8px">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              {{ userStore.userInfo?.name || '未登录' }}
            </span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="logout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content class="pc-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>

  <router-view v-else />
</template>

<style scoped>
.pc-layout {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
.logo {
  height: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1677ff;
  font-size: 18px;
  font-weight: bold;
  gap: 2px;
  white-space: nowrap;
}
.logo span {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}
.pc-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  height: 56px;
  flex-shrink: 0;
}
.header-left .breadcrumb {
  font-size: 16px;
  color: #333;
}
.header-right .user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}
.header-right .user-info:hover {
  background: #f5f5f5;
}
.pc-content {
  background: #f5f5f5;
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 0;
}
.pc-content > * {
  width: 100%;
  min-height: 100%;
}
@media (max-width: 1280px) {
  :deep(.ant-layout-sider) {
    width: 180px !important;
  }
}
@media (max-width: 1024px) {
  :deep(.ant-layout-sider) {
    width: 160px !important;
  }
  :deep(.ant-layout-sider .ant-menu-item) {
    padding-left: 16px !important;
    font-size: 13px;
  }
}
</style>
