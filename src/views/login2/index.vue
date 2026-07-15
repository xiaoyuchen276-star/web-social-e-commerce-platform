<template>
  <div class="login-container">
    <AppHeader title="密码登录" />

    <div class="content">
      <div class="login-form">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
        <div class="form-gap"></div>
        <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        <div class="forgot-password"><a href="javascript:void(0)">忘记密码</a></div>
        <el-button class="login-button" @click="handleLogin">登录</el-button>
        <div class="switch-login"><router-link to="/login">验证码登录</router-link></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login2 as loginApi } from '@/api/user'
import { useAuthStore } from '@/store/modules/auth'
import AppHeader from '@/components/AppHeader/index.vue'

const router = useRouter()
const authStore = useAuthStore()
const form = reactive({ phone: '', password: '' })

async function handleLogin() {
  if (!form.phone || !form.password) {
    ElMessage.error('手机号和密码不能为空！')
    return
  }
  try {
    const res = await loginApi({ phone: form.phone, password: form.password })
    if (res.data) authStore.login(res.data)
    router.replace('/info')
  } catch (err) {
    ElMessage.error(err)
  }
}
</script>

<style lang="scss" scoped>
.login-container { height: 100%; }
.content { height: calc(100% - var(--app-header-height)); padding: 24px 16px; background: #f7f5f5; }
.login-form { width: min(100%, 420px); margin: 0 auto; }
.form-gap { height: 10px; }
.forgot-password, .switch-login { margin-top: 8px; text-align: right; }
.login-button { width: 100%; color: #fff; border: none; background-color: #f63; }
@media (min-width: 768px) {
  .content { width: min(100%, 520px); min-height: 560px; margin: 0 auto; padding: 32px; }
}
</style>
