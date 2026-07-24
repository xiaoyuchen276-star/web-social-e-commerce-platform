import request from '@/api/request'

// 上传博客图片
export function uploadBlogImage(formData) {
  return request.post('/upload/blog', formData)
}

// 删除博客图片
export function deleteBlogImage(name) {
  return request.get('/upload/blog/delete', { params: { name } })
}
