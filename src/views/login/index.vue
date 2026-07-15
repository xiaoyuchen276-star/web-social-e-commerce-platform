<template>
  <div class="login-container">
    <AppHeader title="手机号快捷登录" />

    <div class="content">
      <div class="login-form">
        <div class="phone-row">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
          <el-button type="success" :disabled="disabled" @click="handleSendCode">
            {{ codeBtnMsg }}
          </el-button>
        </div>
        <div class="form-gap"></div>
        <el-input v-model="form.code" placeholder="请输入验证码" />
        <div class="login-tip">未注册的手机号验证后自动创建账户</div>
        <el-button class="login-button" @click="handleLogin">登录</el-button>
        <div class="switch-login"><router-link to="/login2">密码登录</router-link></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login as loginApi } from '@/api/user'
import { useAuthStore } from '@/store/modules/auth'
import { useSmsCode } from '@/hooks/useSmsCode'
import AppHeader from '@/components/AppHeader/index.vue'

const router = useRouter()
const authStore = useAuthStore()
const form = reactive({ phone: '', code: '' })
const { disabled, codeBtnMsg, send } = useSmsCode()

function handleSendCode() {
  send(form.phone)
}

async function handleLogin() {
  if (!form.phone || !form.code) {
    ElMessage.error('手机号和验证码不能为空！')
    return
  }
  try {
    const res = await loginApi({ phone: form.phone, code: form.code })
    if (res.data) authStore.login(res.data)
    router.replace('/')
  } catch (err) {
    ElMessage.error(err)
  }
}
</script>

<style lang="scss" scoped>
.login-container { height: 100%; }
.content { height: calc(100% - var(--app-header-height)); padding: 24px 16px; background: #f7f5f5; }
.login-form { width: min(100%, 420px); margin: 0 auto; }
.phone-row { display: flex; gap: 10px; }
.phone-row :deep(.el-input) { flex: 1; }
.phone-row :deep(.el-button) { min-width: 120px; }
.form-gap { height: 10px; }
.login-tip { margin: 8px 0; color: #8c939d; text-align: center; }
.login-button { width: 100%; color: #fff; border: none; background-color: #f63; }
.switch-login { margin-top: 8px; text-align: right; }
@media (min-width: 768px) {
  .content { width: min(100%, 520px); min-height: 560px; margin: 0 auto; padding: 32px; }
}
</style>
