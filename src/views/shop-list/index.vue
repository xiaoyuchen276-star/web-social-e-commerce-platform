<template>
  <div class="shop-list-container">
    <!-- 顶栏 -->
    <div class="header">
      <div class="header-back-btn" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">{{ typeName }}</div>
      <div class="header-search">
        <el-icon><Search /></el-icon>
      </div>
    </div>

    <!-- 排序栏 -->
    <div class="sort-bar">
      <div class="sort-item">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ typeName }}<el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="t in types" :key="t.id" :command="t">
                {{ t.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="sort-item" @click="sortAndQuery('')">
        距离 <el-icon><ArrowDown /></el-icon>
      </div>
      <div class="sort-item" @click="sortAndQuery('comments')">
        人气 <el-icon><ArrowDown /></el-icon>
      </div>
      <div class="sort-item" @click="sortAndQuery('score')">
        评分 <el-icon><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- 商户列表 -->
    <div class="shop-list" @scroll="scrollHandler">
      <div class="shop-box" v-for="s in shops" :key="s.id" @click="toDetail(s.id)">
        <div class="shop-img"><img :src="s.images" alt="" /></div>
        <div class="shop-info">
          <div class="shop-title shop-item">{{ s.name }}</div>
          <div class="shop-rate shop-item">
            <el-rate disabled :model-value="s.score / 10" text-color="#F63" show-score />
            <span>{{ s.comments }}条</span>
          </div>
          <div class="shop-area shop-item">
            <span>{{ s.area }}</span>
            <span v-if="s.distance">
              {{ s.distance < 1000 ? s.distance.toFixed(1) + 'm' : (s.distance / 1000).toFixed(1) + 'km' }}
            </span>
          </div>
          <div class="shop-avg shop-item">￥{{ s.avgPrice }}/人</div>
          <div class="shop-address shop-item">
            <el-icon><MapLocation /></el-icon>
            <span>{{ s.address }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getShopTypeList, getShopsByType } from '@/api/shop'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

const router = useRouter()
const route = useRoute()

const types = ref([])
const shops = ref([])
const typeName = ref(route.query.name || '')

const params = reactive({
  typeId: Number(route.query.type) || 0,
  current: 1,
  sortBy: '',
  x: 120.149993,
  y: 30.334229
})

// 查询分类
async function queryTypes() {
  try {
    const res = await getShopTypeList()
    types.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 查询商户
async function queryShops() {
  try {
    const res = await getShopsByType(params)
    if (!res.data) return
    res.data.forEach(s => (s.images = s.images.split(',')[0]))
    shops.value = shops.value.concat(res.data)
  } catch (err) {
    ElMessage.error(err)
  }
}

// 无限滚动
const { scrollHandler } = useInfiniteScroll(async () => {
  params.current++
  await queryShops()
})

// 切换分类
function handleCommand(t) {
  router.push({ name: 'shopList', query: { type: t.id, name: t.name } })
}

// 排序
function sortAndQuery(sortBy) {
  params.sortBy = sortBy
  shops.value = []
  params.current = 1
  queryShops()
}

// 跳转详情
function toDetail(id) {
  router.push({ name: 'shopDetail', query: { id } })
}

onMounted(() => {
  queryTypes()
  queryShops()
})
</script>

<style lang="scss" scoped>
#app {
  background-color: #f1f1f1;
}

.header,
.sort-bar,
.shop-list {
  background-color: #fff;
}

.header {
  width: 100%;
  height: 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #ff6633;
}

.header-back-btn {
  width: 10%;
  color: #ff6633;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.header-title {
  width: 80%;
  text-align: center;
  font-size: 18px;
  font-family: Hiragino Sans GB, Arial, Helvetica, '\5B8B\4F53', sans-serif;
}

.header-search {
  width: 10%;
  text-align: center;
  font-size: 18px;
  color: #ff6633;
}

.el-dropdown,
.el-dropdown-menu__item {
  font-size: 12px;
  line-height: 20px;
}

.sort-bar {
  display: flex;
  justify-content: space-around;
  height: 6%;
  align-items: center;
  margin-bottom: 5px;
}

.sort-item {
  width: 20%;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
}

.shop-list {
  height: 87%;
  background-color: #f1f1f1;
  overflow-y: auto;
}

.shop-box {
  display: flex;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 3px;
  background-color: #fff;
  cursor: pointer;
}

.shop-img {
  text-align: center;
  padding: 5px;
}

.shop-img img {
  width: 95px;
  height: 95px;
  border-radius: 5px;
}

.shop-info {
  width: 65%;
}

.shop-title {
  font-weight: bold;
  font-size: 14px;
}

.shop-rate {
  display: flex;
  justify-content: space-between;
}

.shop-area {
  color: #6f6f71;
  display: flex;
  justify-content: space-between;
}

.shop-item {
  line-height: 20px;
  align-items: center;
}

.shop-address {
  display: flex;
  color: #6c6767;
  overflow: hidden;
}

.shop-address span {
  height: 20px;
  line-height: 20px;
  overflow: hidden;
}
</style>
