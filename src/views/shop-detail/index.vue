<template>
  <div class="shop-detail-container">
    <AppHeader :show-share="true" />

    <div class="shop-detail-content">
      <!-- 商户基本信息 -->
      <div class="shop-info-box">
        <div class="shop-title">{{ shop.name }}</div>
        <div class="shop-rate">
          <el-rate disabled :model-value="rateValue" text-color="#F63" show-score />
          <span>{{ shop.comments }}条</span>
        </div>
        <div class="shop-rate-info">口味:4.9 &nbsp; 环境:4.8 &nbsp; 服务:4.7</div>
        <div class="shop-rank">
          <img src="/imgs/bd.png" width="63" height="20" alt="" />
          <span>拱墅区好评榜第3名</span>
          <div><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="shop-images">
          <div v-for="(s, i) in shop.images" :key="i">
            <img :src="s" alt="" />
          </div>
        </div>
        <div class="shop-address">
          <div><el-icon><MapLocation /></el-icon></div>
          <span>{{ shop.address }}</span>
          <div class="address-divider">|</div>
          <div class="address-icon">
            <img src="https://p0.meituan.net/travelcube/bf684aa196c870810655e45b1e52ce843484.png@24w_16h_40q" alt="" />
          </div>
          <div>
            <img src="https://p0.meituan.net/travelcube/9277ace32123e0c9f59dedf4407892221566.png@24w_24h_40q" alt="" />
          </div>
        </div>
      </div>

      <div class="shop-divider"></div>

      <!-- 营业时间 -->
      <div class="shop-open-time">
        <span><el-icon><Clock /></el-icon></span>
        <div>营业时间</div>
        <div>{{ shop.openHours }}</div>
        <span class="line-right">查看详情 <el-icon><ArrowRight /></el-icon></span>
      </div>

      <div class="shop-divider"></div>

      <!-- 代金券 -->
      <div class="shop-voucher">
        <div>
          <span class="voucher-icon">券</span>
          <span style="font-weight: bold">代金券</span>
        </div>
        <div class="voucher-box" v-for="v in vouchers" :key="v.id" v-show="!isEnd(v)">
          <div class="voucher-circle">
            <div class="voucher-b"></div>
            <div class="voucher-b"></div>
            <div class="voucher-b"></div>
          </div>
          <div class="voucher-left">
            <div class="voucher-title">{{ v.title }}</div>
            <div class="voucher-subtitle">{{ v.subTitle }}</div>
            <div class="voucher-price">
              <div>￥ {{ formatPrice(v.payValue) }}</div>
              <span>{{ ((v.payValue * 10) / v.actualValue).toFixed(1) }}折</span>
            </div>
          </div>
          <div class="voucher-right">
            <div v-if="v.type" class="seckill-box">
              <div
                class="voucher-btn"
                :class="{ 'disable-btn': isNotBegin(v) || v.stock < 1 }"
                @click="handleSeckill(v)"
              >
                限时抢购
              </div>
              <div class="seckill-stock">剩余 <span>{{ v.stock }}</span> 张</div>
              <div class="seckill-time">{{ formatTime(v) }}</div>
            </div>
            <div class="voucher-btn" v-else>抢购</div>
          </div>
        </div>
      </div>

      <div class="shop-divider"></div>

      <!-- 网友评价 -->
      <div class="shop-comments">
        <div class="comments-head">
          <div>网友评价 <span>（119）</span></div>
          <div><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="comment-tags">
          <div class="tag">味道赞(19)</div>
          <div class="tag">牛肉赞(16)</div>
          <div class="tag">菜品不错(11)</div>
          <div class="tag">回头客(4)</div>
          <div class="tag">分量足(4)</div>
          <div class="tag">停车方便(3)</div>
          <div class="tag">海鲜棒(3)</div>
          <div class="tag">饮品赞(3)</div>
          <div class="tag">朋友聚餐(6)</div>
        </div>
        <div class="comment-list">
          <div class="comment-box" v-for="i in 3" :key="i">
            <div class="comment-icon">
              <img src="https://p0.meituan.net/userheadpicbackend/57e44d6eba01aad0d8d711788f30a126549507.jpg%4048w_48h_1e_1c_1l%7Cwatermark%3D0" alt="" />
            </div>
            <div class="comment-info">
              <div class="comment-user">叶小乙 <span>Lv5</span></div>
              <div style="display: flex">打分 <el-rate disabled :model-value="4.5" /></div>
              <div class="comment-text">某平台上买的券，价格可以当工作餐吃，虽然价格便宜，但是这家店一点都没有...</div>
              <div class="comment-images">
                <img v-for="j in 4" :key="j" src="https://qcloud.dpfile.com/pc/6T7MfXzx7USPIkSy7jzm40qZSmlHUF2jd-FZUL6WpjE9byagjLlrseWxnl1LcbuSGybIjx5eX6WNgCPvcASYAw.jpg" alt="" />
              </div>
              <div>浏览641 &nbsp;&nbsp;&nbsp;&nbsp;评论5</div>
            </div>
          </div>
        </div>
      </div>

      <div class="shop-divider"></div>
      <div class="copyright">copyright ©2021 web-social-e-commerce-platform.com</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getShopById } from '@/api/shop'
import { getVoucherList, seckillVoucher } from '@/api/voucher'
import { formatPrice } from '@/utils'
import AppHeader from '@/components/AppHeader/index.vue'

const route = useRoute()

const shop = ref({})
const vouchers = ref([])

const rateValue = computed(() => (shop.value.score || 0) / 10)

// 查询商户
async function queryShopById(shopId) {
  try {
    const res = await getShopById(shopId)
    res.data.images = res.data.images.split(',')
    shop.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 查询优惠券
async function queryVoucher(shopId) {
  try {
    const res = await getVoucherList(shopId)
    vouchers.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 格式化时间
function formatTime(v) {
  const b = new Date(v.beginTime)
  const e = new Date(v.endTime)
  return (
    b.getMonth() +
    1 +
    '月' +
    b.getDate() +
    '日 ' +
    b.getHours() +
    ':' +
    formatMinutes(b.getMinutes()) +
    ' ~ ' +
    e.getHours() +
    ':' +
    formatMinutes(e.getMinutes())
  )
}

function formatMinutes(m) {
  if (m < 10) m = '0' + m
  return m
}

function isNotBegin(v) {
  return new Date(v.beginTime).getTime() > new Date().getTime()
}

function isEnd(v) {
  return new Date(v.endTime).getTime() < new Date().getTime()
}

// 秒杀
async function handleSeckill(v) {
  const token = sessionStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    setTimeout(() => {
      location.href = '/#/login'
    }, 200)
    return
  }
  if (isNotBegin(v)) {
    ElMessage.error('优惠券抢购尚未开始！')
    return
  }
  if (isEnd(v)) {
    ElMessage.error('优惠券抢购已经结束！')
    return
  }
  if (v.stock < 1) {
    ElMessage.error('库存不足，请刷新再试试！')
    return
  }
  try {
    const res = await seckillVoucher(v.id)
    ElMessage.success('抢购成功，订单id：' + res.data)
  } catch (err) {
    ElMessage.error(err)
  }
}

onMounted(() => {
  const shopId = route.query.id
  if (shopId) {
    queryShopById(shopId)
    queryVoucher(shopId)
  }
})
</script>

<style lang="scss" scoped>
.shop-info-box {
  padding: 0 10px;
}

.shop-detail-content {
  padding-top: 0;
}

.shop-title {
  font-size: 20px;
  font-weight: bold;
  margin: 5px 0;
}

.shop-rate {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.shop-rate-info {
  margin: 5px 0;
  color: #82848a;
}

.shop-rank {
  margin: 5px 0;
  display: flex;
  width: 100%;

  span {
    color: #B15E2C;
    font-size: 11px;
    background: linear-gradient(-248deg, #FFEBCF 2%, #FFECDD 61%);
    border-radius: 1px;
    height: 20px;
    line-height: 20px;
    padding: 0 6px;
  }

  div {
    color: #5a5b5b;
    font-size: 14px;
    width: 45%;
    text-align: end;
  }
}

.shop-images {
  display: flex;
  overflow-x: scroll;
  padding: 5px 0;

  img {
    height: 106px;
    width: 145px;
    margin-right: 3px;
    display: inline-block;
    border-radius: 7px;
    border: 1px solid #e1e1e1;
  }
}

.shop-address {
  font-size: 14px;
  color: #82848a;
  height: 42px;
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.address-divider {
  width: 10px;
  text-align: center;
  color: #e1e2e3;
}

.address-icon {
  margin: 0 5px;
}

.shop-divider {
  height: 10px;
  background-color: #f3f1f1;
}

.shop-open-time {
  display: flex;
  padding: 10px;
  font-size: 14px;

  div {
    margin-right: 10px;
  }
}

.line-right {
  flex: 1;
  color: #82848a;
  font-size: 12px;
  text-align: right;
}

.shop-voucher {
  padding: 10px;
}

.voucher-icon {
  display: inline-block;
  line-height: 16px;
  background-color: #f5a966;
  color: white;
  padding: 0 4px 2px 4px;
}

.voucher-box {
  background-color: #fff1f1;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  margin: 10px 0;
}

.voucher-circle {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 80px;
}

.voucher-b {
  height: 10px;
  width: 10px;
  background-color: #fff;
  border-radius: 50%;
}

.voucher-left {
  flex: 1;
  margin-left: 15px;
}

.voucher-right {
  margin-right: 15px;
}

.voucher-title,
.voucher-subtitle,
.voucher-price {
  padding: 5px 0;
}

.voucher-title {
  font-weight: bold;
}

.voucher-subtitle {
  color: #82848a;
}

.voucher-price {
  color: #F63;
  display: flex;
  align-items: center;

  div {
    font-weight: bold;
    font-size: 14px;
  }

  span {
    margin-left: 10px;
    font-size: 10px;
    padding: 0 5px;
    line-height: 10px;
    background-color: #fce5e5;
  }
}

.voucher-btn {
  background-color: #ff6633;
  color: white;
  font-size: 14px;
  line-height: 30px;
  width: 65px;
  text-align: center;
  border-radius: 15px;
}

.seckill-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  padding: 15px 0 0 0;

  div {
    font-size: 12px;
  }
}

.disable-btn {
  background-color: #adacab;
}

.seckill-time {
  color: #F63;
}

.seckill-stock {
  color: #adacab;

  span {
    background-color: #fce5e5;
    color: rgb(240, 51, 51);
  }
}

.copyright {
  color: #d1d1d1;
  margin-top: 20px;
  text-shadow: 0 1px 1px #fff;
  text-align: center;
}

.shop-comments {
  padding: 10px;
}

.comments-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: bold;

  span {
    font-size: 12px;
    font-weight: normal;
    color: #82848a;
  }
}

.comment-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .tag {
    width: 25%;
    border: 1px solid #427fc4;
    border-radius: 5px;
    text-align: center;
    color: #427fc4;
    padding: 5px 10px;
    margin-top: 7px;
  }
}

.comment-list {
  margin-top: 15px;
}

.comment-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.comment-icon {
  width: 55px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
}

.comment-info {
  flex: 1;
}

.comment-user {
  font-size: 14px;

  span {
    font-size: 10px;
    padding: 0 10px;
    border-radius: 8px;
    background-color: #f7b253;
    color: white;
  }
}

.comment-text {
  padding: 5px 0;
  font-size: 14px;
}

.comment-images {
  display: flex;
  width: 100%;
  overflow-x: scroll;
  padding: 10px 0;

  img {
    height: 94px;
    width: 92px;
    border-radius: 5px;
    margin-right: 5px;
  }
}

@media (min-width: 768px) {
  .shop-detail-content {
    width: min(100%, 960px);
    margin: 0 auto;
    padding: 20px 28px 36px;
  }

  .shop-info-box,
  .shop-voucher,
  .shop-comments {
    padding-right: 0;
    padding-left: 0;
  }

  .shop-images {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    overflow: visible;
    gap: 10px;

    img {
      width: 100%;
      height: 180px;
      margin: 0;
      object-fit: cover;
    }
  }

  .voucher-box {
    width: calc(50% - 8px);
    display: inline-flex;
    vertical-align: top;
    min-height: 130px;
    margin: 8px 4px;
  }

  .comment-tags {
    justify-content: flex-start;
    gap: 10px;

    .tag {
      width: auto;
      min-width: 140px;
      margin-top: 0;
    }
  }
}

@media (min-width: 1200px) {
  .shop-images {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
