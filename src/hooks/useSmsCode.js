import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sendCode } from '@/api/user'

/**
 * 短信验证码倒计时组合式函数
 */
export function useSmsCode() {
  const disabled = ref(false)
  const codeBtnMsg = ref('发送验证码')

  async function send(phone) {
    if (!phone) {
      ElMessage.error('手机号不能为空')
      return
    }
    try {
      await sendCode(phone)
    } catch (err) {
      console.log(err)
      ElMessage.error(err)
      return
    }

    // 禁用按钮
    disabled.value = true
    // 倒计时
    let i = 60
    codeBtnMsg.value = i-- + '秒后可重发'
    const taskId = setInterval(() => {
      codeBtnMsg.value = i-- + '秒后可重发'
    }, 1000)

    setTimeout(() => {
      disabled.value = false
      clearInterval(taskId)
      codeBtnMsg.value = '发送验证码'
    }, 59000)
  }

  return {
    disabled,
    codeBtnMsg,
    send
  }
}
