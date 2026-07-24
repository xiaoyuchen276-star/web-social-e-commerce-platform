import request from '@/api/request'

// 新增普通优惠券
export function createVoucher(data) {
  return request.post('/voucher', data)
}

// 新增秒杀优惠券
export function createSeckillVoucher(data) {
  return request.post('/voucher/seckill', data)
}

// 获取商户优惠券列表
export function getVoucherList(shopId) {
  return request.get(`/voucher/list/${shopId}`)
}

// 秒杀优惠券
export function seckillVoucher(voucherId) {
  return request.post(`/voucher-order/seckill/${voucherId}`)
}
