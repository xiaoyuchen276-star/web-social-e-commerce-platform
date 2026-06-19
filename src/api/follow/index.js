import request from '@/api/request'

// 检查是否关注了某用户
export function isFollowed(userId) {
  return request.get(`/follow/or/not/${userId}`)
}

// 关注/取消关注
export function follow(userId, followFlag) {
  return request.put(`/follow/${userId}/${followFlag}`)
}

// 获取共同关注
export function getCommonFollows(userId) {
  return request.get(`/follow/common/${userId}`)
}
