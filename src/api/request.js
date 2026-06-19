import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 设置后台服务地址
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL,
  timeout: 2000
})

// request 拦截器，将用户 token 放入头中
request.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['authorization'] = token
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// response 拦截器
request.interceptors.response.use(
  response => {
    // 判断执行结果
    if (!response.data.success) {
      ElMessage.error(response.data.errorMsg || '请求失败')
      return Promise.reject(response.data.errorMsg)
    }
    return response.data
  },
  error => {
    console.log(error)
    if (error.response && error.response.status === 401) {
      // 未登录，跳转
      setTimeout(() => {
        router.push('/login')
      }, 200)
      return Promise.reject('请先登录')
    }
    ElMessage.error(error.message || '服务器异常')
    return Promise.reject('服务器异常')
  }
)

// params 序列化，跳过 null/空值
request.defaults.paramsSerializer = function (params) {
  const parts = []
  Object.keys(params).forEach(k => {
    if (params[k] != null && params[k] !== '') {
      parts.push(k + '=' + encodeURIComponent(params[k]))
    }
  })
  return parts.join('&')
}

export default request
