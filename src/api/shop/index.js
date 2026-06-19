import request from '@/api/request'

// 获取商户类型列表
export function getShopTypeList() {
  return request.get('/shop-type/list')
}

// 按类型获取商户列表
export function getShopsByType(params) {
  return request.get('/shop/of/type', { params })
}

// 获取商户详情
export function getShopById(id) {
  return request.get(`/shop/${id}`)
}

// 按名称搜索商户
export function searchShopsByName(name) {
  return request.get('/shop/of/name', { params: { name } })
}
