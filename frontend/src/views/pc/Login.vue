<template>
  <div class="pc-login">
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="login-container">
      <div class="login-brand">
        <div class="brand-logo">
          <div class="logo-icon">
            <fund-outlined />
          </div>
          <div class="logo-text">产业投资</div>
        </div>

        <h1 class="brand-title">产业投资进件系统</h1>
        <p class="brand-subtitle">Enterprise Investment Intake Platform</p>

        <ul class="brand-features">
          <li>
            <check-circle-filled class="feat-icon" />
            <span>智能核名 · 天眼查实时对接</span>
          </li>
          <li>
            <check-circle-filled class="feat-icon" />
            <span>多角色协同 · 进件审核全流程</span>
          </li>
          <li>
            <check-circle-filled class="feat-icon" />
            <span>数据大屏 · 中国地图可视化</span>
          </li>
          <li>
            <check-circle-filled class="feat-icon" />
            <span>移动办公 · 手机端随时跟进</span>
          </li>
        </ul>

        <div class="brand-stats">
          <div class="stat-item">
            <div class="stat-num">6+</div>
            <div class="stat-label">角色体系</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">25+</div>
            <div class="stat-label">功能权限</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">31</div>
            <div class="stat-label">省级园区</div>
          </div>
        </div>
      </div>

      <div class="login-panel">
        <div class="panel-header">
          <h2>欢迎登录</h2>
          <p>请使用您的账号继续</p>
        </div>

        <a-form
          :model="formState"
          :rules="rules"
          layout="vertical"
          @finish="handleLogin"
          class="login-form"
        >
          <a-form-item label="手机号" name="phone">
            <a-input
              v-model:value="formState.phone"
              placeholder="请输入手机号"
              size="large"
              :maxlength="11"
              autocomplete="username"
            >
              <template #prefix>
                <mobile-outlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="密码" name="password">
            <a-input-password
              v-model:value="formState.password"
              placeholder="请输入密码"
              size="large"
              autocomplete="current-password"
            >
              <template #prefix>
                <lock-outlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <div class="form-options">
            <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
            <a class="forgot-link" @click.prevent="onForgot">忘记密码？</a>
          </div>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              block
              :loading="loading"
              class="login-btn"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登录中...</span>
            </a-button>
          </a-form-item>

          <a-divider plain class="quick-divider">
            <span class="divider-text">快捷登录</span>
          </a-divider>

          <div class="quick-fill">
            <a-tooltip title="填充管理员账号">
              <div class="quick-card" @click="fillAccount('admin')">
                <safety-certificate-outlined class="quick-icon" />
                <div class="quick-info">
                  <div class="quick-name">系统管理员</div>
                  <div class="quick-desc">13800000000</div>
                </div>
              </div>
            </a-tooltip>
          </div>
        </a-form>

        <div class="panel-footer">
          <span>登录即表示同意</span>
          <a>《用户协议》</a>
          <span>和</span>
          <a>《隐私政策》</a>
        </div>
      </div>
    </div>

    <div class="login-copyright">
      © 2026 产业投资进件系统 · 仅供授权用户使用
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import {
  UserOutlined,
  LockOutlined,
  MobileOutlined,
  FundOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);

const formState = reactive({
  phone: '',
  password: '',
  remember: true,
});

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
};

function fillAccount(type: 'admin') {
  if (type === 'admin') {
    formState.phone = '13800000000';
    formState.password = 'admin123';
    message.success('已填充管理员账号，点击登录');
  }
}

function onForgot() {
  Modal.info({
    title: '找回密码',
    content: '请联系系统管理员重置密码，或拨打客服热线 400-888-0000',
    okText: '我知道了',
  });
}

async function handleLogin() {
  try {
    loading.value = true;
    const user = await userStore.login(formState.phone, formState.password);
    message.success(`欢迎回来，${user.name}`);
    const redirect = (route.query.redirect as string) || '/pc/dashboard';
    router.replace(redirect);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '登录失败';
    message.error(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.pc-login {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a1929;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 12s ease-in-out infinite;
}

.shape-1 {
  width: 480px;
  height: 480px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  top: -120px;
  left: -120px;
}

.shape-2 {
  width: 380px;
  height: 380px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  bottom: -100px;
  right: -100px;
  animation-delay: -4s;
}

.shape-3 {
  width: 280px;
  height: 280px;
  background: linear-gradient(135deg, #0891b2, #06b6d4);
  top: 40%;
  left: 35%;
  animation-delay: -8s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.05); }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 1080px;
  max-width: 95vw;
  min-height: 640px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.login-brand {
  flex: 1.1;
  padding: 56px 48px;
  background: linear-gradient(160deg, #0c2461 0%, #1e3799 50%, #0c2461 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.3), transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.25), transparent 50%);
  pointer-events: none;
}

.login-brand > * {
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px;
  line-height: 1.3;
  background: linear-gradient(135deg, #fff 0%, #93c5fd 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 2px;
  margin: 0 0 40px;
}

.brand-features {
  list-style: none;
  padding: 0;
  margin: 0 0 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.feat-icon {
  font-size: 18px;
  color: #10b981;
  flex-shrink: 0;
}

.brand-stats {
  margin-top: auto;
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
}

.login-panel {
  flex: 1;
  padding: 56px 56px 40px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.panel-header {
  margin-bottom: 32px;
}

.panel-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.panel-header p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.login-form {
  flex: 1;
}

.login-form :deep(.ant-form-item-label > label) {
  font-size: 13px;
  font-weight: 500;
  color: #4a4a4a;
}

.login-form :deep(.ant-input-affix-wrapper-lg) {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.login-form :deep(.ant-input-affix-wrapper-lg:hover) {
  border-color: #3b82f6;
}

.login-form :deep(.ant-input-affix-wrapper-focused) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-icon {
  color: #9ca3af;
  font-size: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-link {
  color: #3b82f6;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #1d4ed8;
}

.login-btn {
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
  transition: all 0.2s;
  letter-spacing: 4px;
}

.login-btn:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(0);
}

.quick-divider {
  margin: 20px 0 16px;
  color: #d1d5db;
  font-size: 12px;
}

.divider-text {
  color: #9ca3af;
  font-size: 12px;
}

.quick-fill {
  display: flex;
  gap: 12px;
}

.quick-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-card:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.quick-icon {
  font-size: 24px;
  color: #0284c7;
  flex-shrink: 0;
}

.quick-info {
  flex: 1;
  min-width: 0;
}

.quick-name {
  font-size: 13px;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 2px;
}

.quick-desc {
  font-size: 12px;
  color: #64748b;
  font-family: 'SF Mono', Consolas, Monaco, monospace;
}

.panel-footer {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 20px;
}

.panel-footer a {
  color: #3b82f6;
  text-decoration: none;
  margin: 0 4px;
}

.panel-footer a:hover {
  text-decoration: underline;
}

.login-copyright {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  z-index: 1;
  letter-spacing: 1px;
}

@media (max-width: 960px) {
  .login-container {
    flex-direction: column;
    min-height: auto;
  }

  .login-brand {
    padding: 40px 32px;
  }

  .login-panel {
    padding: 40px 32px;
  }

  .brand-stats {
    display: none;
  }
}

@media (max-height: 700px) {
  .login-brand {
    padding: 32px 40px;
  }

  .brand-features {
    margin-bottom: 24px;
  }

  .login-panel {
    padding: 32px 40px;
  }
}
</style>
