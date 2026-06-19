import request from '@/api/request'

// 获取热门博客
export function getHotBlogs(current) {
  return request.get('/blog/hot', { params: { current } })
}

// 获取单个博客
export function getBlogById(id) {
  return request.get(`/blog/${id}`)
}

// 点赞/取消点赞
export function likeBlog(id) {
  return request.put(`/blog/like/${id}`)
}

// 获取我的博客
export function getBlogsOfMe() {
  return request.get('/blog/of/me')
}

// 获取指定用户的博客
export function getBlogsOfUser(params) {
  return request.get('/blog/of/user', { params })
}

// 获取关注用户的博客
export function getBlogsOfFollow(params) {
  return request.get('/blog/of/follow', { params })
}

// 获取博客点赞用户列表
export function getBlogLikes(id) {
  return request.get(`/blog/likes/${id}`)
}

// 创建博客
export function createBlog(data) {
  return request.post('/blog', data)
}
