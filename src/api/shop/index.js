import request from '@/api/request'

// 获取商户类型列表
export function getShopTypeList() {
  return request.get('/shop-type/list')
}

// 按类型获取商户列表
export function getShopsByType(params) {
  const { typeId, current } = params
  return request.get('/shop/of/type', { params: { typeId, current } })
}

// 获取商户详情
export function getShopById(id) {
  return request.get(`/shop/${id}`)
}

// 新增商户
export function createShop(data) {
  return request.post('/shop', data)
}

// 更新商户
export function updateShop(data) {
  return request.put('/shop', data)
}

// 按名称搜索商户
export function searchShopsByName(name, current = 1) {
  return request.get('/shop/of/name', { params: { name, current } })
}
