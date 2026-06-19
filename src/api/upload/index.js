import request from '@/api/request'

// 上传博客图片
export function uploadBlogImage(formData) {
  return request.post('/upload/blog', formData, {
    headers: { 'Content-Type': 'multipart/form-data;boundary=' + new Date().getTime() }
  })
}

// 删除博客图片
export function deleteBlogImage(name) {
  return request.get('/upload/blog/delete', { params: { name } })
}
