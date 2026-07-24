import request from '@/api/request'

// 获取博客评论
export function getBlogComments(blogId, current = 1) {
  return request.get(`/blog-comments/${blogId}`, { params: { current } })
}

// 发布博客评论
export function createBlogComment(data) {
  return request.post('/blog-comments', data)
}
