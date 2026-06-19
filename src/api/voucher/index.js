import request from '@/api/request'

// 获取商户优惠券列表
export function getVoucherList(shopId) {
  return request.get(`/voucher/list/${shopId}`)
}

// 秒杀优惠券
export function seckillVoucher(voucherId) {
  return request.post(`/voucher-order/seckill/${voucherId}`)
}
