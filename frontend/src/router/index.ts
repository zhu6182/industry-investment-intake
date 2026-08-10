import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { isMobile, toMobilePath, toPcPath } from '@/utils/device';

// 角色常量
const R_ADMIN = 'admin';
const R_MIDDLEWARE = 'middleware_ops';
const R_INV_MANAGER = 'investment_manager';
const R_INV_STAFF = 'investment_staff';
const R_CH_MANAGER = 'channel_manager';
const R_CH_SPECIALIST = 'channel_specialist';

const ALL_ROLES = [R_ADMIN, R_MIDDLEWARE, R_INV_MANAGER, R_INV_STAFF, R_CH_MANAGER, R_CH_SPECIALIST];
const TEAM_ROLES = [R_ADMIN, R_MIDDLEWARE, R_INV_MANAGER, R_CH_MANAGER];
const INTAKE_CREATORS = [R_ADMIN, R_CH_MANAGER, R_CH_SPECIALIST];
const REVIEW_ROLES = [R_ADMIN, R_MIDDLEWARE, R_INV_MANAGER, R_INV_STAFF];
const BI_ROLES = [R_ADMIN, R_MIDDLEWARE, R_INV_MANAGER, R_CH_MANAGER];
const ADMIN_REGIONS = [R_ADMIN, R_MIDDLEWARE];
const ADMIN_USERS = [R_ADMIN, R_MIDDLEWARE];
const ADMIN_ROLES = [R_ADMIN];
const ADMIN_SETTINGS = [R_ADMIN, R_MIDDLEWARE];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      if (isMobile()) return '/mobile/home';
      return '/pc/dashboard';
    },
  },
  {
    path: '/pc/login',
    name: 'PCLogin',
    component: () => import('@/views/pc/Login.vue'),
    meta: { title: '登录', platform: 'pc', public: true },
  },
  {
    path: '/pc',
    name: 'PC',
    children: [
      {
        path: 'dashboard',
        name: 'PCDashboard',
        component: () => import('@/views/pc/dashboard/InvestmentDashboard.vue'),
        meta: { title: '招商工作台', platform: 'pc', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'dashboard/team',
        name: 'PCTeamDashboard',
        component: () => import('@/views/pc/dashboard/TeamDashboard.vue'),
        meta: { title: '团队工作台', platform: 'pc', requiresAuth: true, roles: TEAM_ROLES },
      },
      {
        path: 'intakes',
        name: 'PCIntakeList',
        component: () => import('@/views/pc/intakes/IntakeList.vue'),
        meta: { title: '进件管理', platform: 'pc', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'intakes/new',
        name: 'PCIntakeNew',
        component: () => import('@/views/pc/intakes/IntakeForm.vue'),
        meta: { title: '新建进件', platform: 'pc', requiresAuth: true, roles: INTAKE_CREATORS },
      },
      {
        path: 'intakes/:id',
        name: 'PCIntakeDetail',
        component: () => import('@/views/pc/intakes/IntakeDetail.vue'),
        meta: { title: '进件详情', platform: 'pc', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'review',
        name: 'PCReviewList',
        component: () => import('@/views/pc/review/ReviewList.vue'),
        meta: { title: '中台审核', platform: 'pc', requiresAuth: true, roles: REVIEW_ROLES },
      },
      {
        path: 'review/:id',
        name: 'PCReviewDetail',
        component: () => import('@/views/pc/review/ReviewDetail.vue'),
        meta: { title: '审核详情', platform: 'pc', requiresAuth: true, roles: REVIEW_ROLES },
      },
      {
        path: 'follow-ups',
        name: 'PCFollowUps',
        component: () => import('@/views/pc/follow-ups/FollowUpList.vue'),
        meta: { title: '跟进记录', platform: 'pc', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'visits',
        name: 'PCVisits',
        component: () => import('@/views/pc/visits/VisitList.vue'),
        meta: { title: '拜访记录', platform: 'pc', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'bi',
        name: 'PCBi',
        component: () => import('@/views/pc/bi/BigScreen.vue'),
        meta: { title: '数据大屏', platform: 'pc', requiresAuth: true, roles: BI_ROLES },
      },
      {
        path: 'bi2',
        name: 'PCBiV2',
        component: () => import('@/views/pc/bi/BigScreenV2.vue'),
        meta: { title: '数据大屏 V2', platform: 'pc', requiresAuth: true, roles: BI_ROLES },
      },
      {
        path: 'referrals',
        name: 'PCReferrals',
        component: () => import('@/views/pc/referrals/MyReferrals.vue'),
        meta: { title: '我的推荐', platform: 'pc', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'admin/regions',
        name: 'PCAdminRegions',
        component: () => import('@/views/pc/admin/RegionManage.vue'),
        meta: { title: '园区地区管理', platform: 'pc', requiresAuth: true, roles: ADMIN_REGIONS },
      },
      {
        path: 'admin/users',
        name: 'PCAdminUsers',
        component: () => import('@/views/pc/admin/UserManage.vue'),
        meta: { title: '用户管理', platform: 'pc', requiresAuth: true, roles: ADMIN_USERS },
      },
      {
        path: 'admin/roles',
        name: 'PCAdminRoles',
        component: () => import('@/views/pc/admin/RoleManage.vue'),
        meta: { title: '角色权限管理', platform: 'pc', requiresAuth: true, roles: ADMIN_ROLES },
      },
      {
        path: 'admin/duplicate-check-logs',
        name: 'PCAdminDuplicateCheckLogs',
        component: () => import('@/views/pc/admin/DuplicateCheckLogs.vue'),
        meta: { title: '查重历史', platform: 'pc', requiresAuth: true, roles: [R_ADMIN, R_MIDDLEWARE] },
      },
      {
        path: 'admin/settings',
        name: 'PCAdminSettings',
        component: () => import('@/views/pc/admin/Settings.vue'),
        meta: { title: '系统设置', platform: 'pc', requiresAuth: true, roles: ADMIN_SETTINGS },
      },
    ],
  },
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: () => import('@/views/mobile/Login.vue'),
    meta: { title: '登录', platform: 'mobile', public: true },
  },
  {
    path: '/mobile',
    name: 'Mobile',
    children: [
      {
        path: 'home',
        name: 'MobileHome',
        component: () => import('@/views/mobile/Home.vue'),
        meta: { title: '首页', platform: 'mobile', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'intakes',
        name: 'MobileIntakeList',
        component: () => import('@/views/mobile/intakes/IntakeList.vue'),
        meta: { title: '进件管理', platform: 'mobile', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'intakes/new',
        name: 'MobileIntakeNew',
        component: () => import('@/views/mobile/intakes/IntakeForm.vue'),
        meta: { title: '新建进件', platform: 'mobile', requiresAuth: true, roles: INTAKE_CREATORS },
      },
      {
        path: 'intakes/:id',
        name: 'MobileIntakeDetail',
        component: () => import('@/views/mobile/intakes/IntakeDetail.vue'),
        meta: { title: '进件详情', platform: 'mobile', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'follow-ups/new',
        name: 'MobileFollowUpNew',
        component: () => import('@/views/mobile/follow-ups/FollowUpForm.vue'),
        meta: { title: '记录跟进', platform: 'mobile', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'visits/new',
        name: 'MobileVisitNew',
        component: () => import('@/views/mobile/visits/VisitForm.vue'),
        meta: { title: '记录拜访', platform: 'mobile', requiresAuth: true, roles: ALL_ROLES },
      },
      {
        path: 'bi',
        name: 'MobileBi',
        component: () => import('@/views/mobile/bi/DataPanel.vue'),
        meta: { title: '数据概览', platform: 'mobile', requiresAuth: true, roles: BI_ROLES },
      },
      {
        path: 'referrals',
        name: 'MobileReferrals',
        component: () => import('@/views/mobile/referrals/MyReferrals.vue'),
        meta: { title: '我的推荐', platform: 'mobile', requiresAuth: true, roles: ALL_ROLES },
      },
    ],
  },
  {
    path: '/m',
    redirect: '/mobile',
  },
  {
    path: '/m/intakes',
    redirect: '/mobile/intakes',
  },
  {
    path: '/m/intakes/new',
    redirect: '/mobile/intakes/new',
  },
  {
    path: '/m/intakes/:id',
    redirect: '/mobile/intakes/:id',
  },
  {
    path: '/m/home',
    redirect: '/mobile/home',
  },
  {
    path: '/login',
    redirect: () => {
      if (isMobile()) return '/mobile/login';
      return '/pc/login';
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || ''} - ${import.meta.env.VITE_APP_TITLE || '产业投资进件系统'}`;

  const userStore = useUserStore();
  const isPublic = !!to.meta.public;
  const requiresAuth = !!to.meta.requiresAuth;
  const requiredRoles = to.meta.roles as string[] | undefined;
  const platform = to.meta.platform as string;
  const isMob = isMobile();

  // 设备不匹配时自动跳转（只针对有明确 platform 标记的页面）
  if (platform && platform !== 'both') {
    if (isMob && platform === 'pc') {
      // 手机访问 PC 页 → 跳手机版
      const mobilePath = to.fullPath.replace('/pc/', '/mobile/');
      next(mobilePath);
      return;
    }
    if (!isMob && platform === 'mobile') {
      // PC 访问手机页 → 跳 PC 版
      const pcPath = to.fullPath.replace('/mobile/', '/pc/');
      next(pcPath);
      return;
    }
  }

  if (isPublic) {
    if (userStore.isLoggedIn && (to.name === 'PCLogin' || to.name === 'MobileLogin')) {
      const platform = to.meta.platform as string;
      next(platform === 'mobile' ? '/mobile/home' : '/pc/dashboard');
      return;
    }
    next();
    return;
  }

  if (requiresAuth && !userStore.isLoggedIn) {
    const platform = to.meta.platform as string;
    const loginPath = platform === 'mobile' ? '/mobile/login' : '/pc/login';
    next({ path: loginPath, query: { redirect: to.fullPath } });
    return;
  }

  // 角色权限检查
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = userStore.roles || [];
    const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      const platform = to.meta.platform as string;
      const fallback = platform === 'mobile' ? '/mobile/home' : '/pc/dashboard';
      next(fallback);
      return;
    }
  }

  next();
});

export default router;
