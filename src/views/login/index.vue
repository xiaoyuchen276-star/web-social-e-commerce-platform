<template>
  <div class="login-container">
    <AppHeader title="手机号码快捷登录" />

    <div class="content">
      <div class="login-form">
        <div style="display: flex; justify-content: space-between">
          <el-input style="width: 60%" placeholder="请输入手机号" v-model="form.phone" />
          <el-button style="width: 38%" @click="handleSendCode" type="success" :disabled="disabled">
            {{ codeBtnMsg }}
          </el-button>
        </div>
        <div style="height: 5px"></div>
        <el-input placeholder="请输入验证码" v-model="form.code" />
        <div style="text-align: center; color: #8c939d; margin: 5px 0">
          未注册的手机号码验证后自动创建账户
        </div>
        <el-button @click="handleLogin" style="width: 100%; background-color: #f63; color: #fff; border: none">
          登录
        </el-button>
        <div style="text-align: right; color: #333; margin: 5px 0">
          <router-link to="/login2">密码登录</router-link>
        </div>
      </div>

      <div class="login-radio">
        <div>
          <input type="radio" name="readed" v-model="radio" value="1" />
          <label for="readed"></label>
        </div>
        <div>
          我已阅读并同意
          <a href="javascript:void(0)">《Deagle智选用户服务协议》</a>、
          <a href="javascript:void(0)">《隐私政策》</a>
          等，接受免除或者限制责任、诉讼管辖约定等粗体标示条款
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login as loginApi } from '@/api/user'
import { useAuthStore } from '@/store/modules/auth'
import { useSmsCode } from '@/hooks/useSmsCode'
import AppHeader from '@/components/AppHeader/index.vue'

const router = useRouter()
const authStore = useAuthStore()

const radio = ref('')
const form = reactive({
  phone: '',
  code: ''
})

const { disabled, codeBtnMsg, send } = useSmsCode()

function handleSendCode() {
  send(form.phone)
}

async function handleLogin() {
  if (!radio.value) {
    ElMessage.error('请先确认阅读用户协议！')
    return
  }
  if (!form.phone || !form.code) {
    ElMessage.error('手机号和验证码不能为空！')
    return
  }
  try {
    const res = await loginApi({ phone: form.phone, code: form.code })
    if (res.data) {
      authStore.login(res.data)
    }
    router.replace('/')
  } catch (err) {
    ElMessage.error(err)
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100%;
}

.content {
  height: 93%;
  background-color: #f7f5f5;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.login-form {
  height: 85%;
}

.login-radio {
  height: 15%;
  width: 100%;
  display: flex;
  align-items: start;

  a {
    color: #ff6633;
    text-decoration: none;
  }
}

input[type='radio'] + label::before {
  content: '\a0';
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
  width: 0.7em;
  height: 0.7em;
  margin-right: 0.4em;
  border-radius: 50%;
  border: 2px solid #F63;
  text-indent: 0.15em;
  line-height: 1;
  padding: 0.2em;
}

input[type='radio']:checked + label::before {
  background-color: #F63;
  background-clip: content-box;
  padding: 0.2em;
}

input[type='radio'] {
  opacity: 0;
}
</style>
