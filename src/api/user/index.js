import request from '@/api/request'

// 发送验证码
export function sendCode(phone) {
  return request.post('/user/code', null, { params: { phone } })
}

// 用户登录（短信验证码或密码）
export function login(data) {
  return request.post('/user/login', data)
}

// 密码登录
export function login2(data) {
  return request.post('/user/login2', data)
}

// 获取当前登录用户
export function getUserMe() {
  return request.get('/user/me')
}

// 获取用户信息
export function getUserById(id) {
  return request.get(`/user/${id}`)
}

// 获取用户详细信息
export function getUserInfo(id) {
  return request.get(`/user/info/${id}`)
}

// 退出登录
export function logout() {
  return request.post('/user/logout')
}
