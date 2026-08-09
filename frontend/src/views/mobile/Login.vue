<template>
  <div class="mobile-login">
    <div class="login-header">
      <h1>产业投资进件系统</h1>
      <p>移动端</p>
    </div>

    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="formState.phone"
          name="phone"
          label="手机号"
          type="tel"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请填写手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]"
          maxlength="11"
        />
        <van-field
          v-model="formState.password"
          name="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[
            { required: true, message: '请填写密码' },
            { validator: (val: string) => val.length >= 6, message: '密码至少6位' }
          ]"
        />
      </van-cell-group>

      <div class="submit-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
    </van-form>

    <div class="login-tip">
      默认账号：13800000000 / 123456
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);
const formState = reactive({
  phone: '',
  password: '',
});

async function handleLogin() {
  try {
    loading.value = true;
    const user = await userStore.login(formState.phone, formState.password);
    showToast(`欢迎回来，${user.name}`);
    const redirect = (route.query.redirect as string) || '/mobile/home';
    router.replace(redirect);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '登录失败';
    showToast(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.mobile-login {
  min-height: 100vh;
  background: linear-gradient(160deg, #4facfe 0%, #00f2fe 100%);
  padding-top: 80px;
}

.login-header {
  text-align: center;
  padding: 40px 20px;
  color: #fff;
}

.login-header h1 {
  font-size: 22px;
  margin: 0 0 8px;
  font-weight: 600;
}

.login-header p {
  font-size: 13px;
  margin: 0;
  opacity: 0.85;
}

.submit-wrap {
  padding: 32px 24px;
}

.login-tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 16px;
}
</style>
