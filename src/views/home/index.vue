<template>
  <div class="home-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="city-btn">杭州 <el-icon><ArrowDown /></el-icon></div>
      <div class="search-input">
        <el-input size="small" placeholder="请输入商户名、地点">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="header-icon" @click="$router.push('/info')">
        <el-icon><UserFilled /></el-icon>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="type-list">
      <div class="type-box" v-for="t in types" :key="t.id" @click="toShopList(t.id, t.name)">
        <div class="type-view"><img :src="'/imgs/' + t.icon" alt="" /></div>
        <div class="type-text">{{ t.name }}</div>
      </div>
    </div>

    <!-- 博客列表 -->
    <div class="blog-list" @scroll="scrollHandler">
      <BlogCard
        v-for="b in blogs"
        :key="b.id"
        :blog="b"
        @click="toBlogDetail"
        @like="handleLike"
      />
    </div>

    <FootBar :active-btn="1" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getShopTypeList } from '@/api/shop'
import { getHotBlogs, getBlogById, likeBlog } from '@/api/blog'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import FootBar from '@/components/FootBar/index.vue'
import BlogCard from '@/components/BlogCard/index.vue'

const router = useRouter()

const types = ref([])
const blogs = ref([])
const current = ref(1)

// 查询分类
async function queryTypes() {
  try {
    const res = await getShopTypeList()
    types.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 加载热门博客
async function loadHotBlogs() {
  try {
    const res = await getHotBlogs(current.value)
    res.data.forEach(b => (b.img = b.images.split(',')[0]))
    blogs.value = blogs.value.concat(res.data)
  } catch (err) {
    ElMessage.error(err)
  }
}

// 无限滚动加载更多
const { scrollHandler } = useInfiniteScroll(async () => {
  current.value++
  await loadHotBlogs()
})

// 点赞
async function handleLike(b) {
  try {
    await likeBlog(b.id)
    // 刷新博客数据
    const res = await getBlogById(b.id)
    b.liked = res.data.liked
    b.isLike = res.data.isLike
  } catch (err) {
    ElMessage.error(err)
  }
}

// 跳转商户列表
function toShopList(id, name) {
  router.push({ name: 'shopList', query: { type: id, name } })
}

// 跳转博客详情
function toBlogDetail(b) {
  router.push({ name: 'blogDetail', query: { id: b.id } })
}

onMounted(() => {
  queryTypes()
  loadHotBlogs()
})
</script>

<style lang="scss" scoped>
.home-container {
  display: grid;
  grid-template-rows: var(--app-header-height) 184px minmax(0, 1fr) var(--app-footer-height);
  height: 100%;
}

.search-bar {
  background-color: #ff6633;
  color: white;
  display: flex;
  justify-content: space-around;
  min-height: var(--app-header-height);
  height: auto;
  align-items: center;
  padding: 0 8px;
}

.city-btn {
  font-size: 13px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 2px;
}

.header-icon {
  font-size: 14px;
  cursor: pointer;
}

.search-input {
  width: 70%;
}

.type-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-content: start;
  gap: 4px 8px;
  padding: 10px 8px;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.type-box {
  width: auto;
  text-align: center;
  cursor: pointer;
}

.type-box img {
  width: 100%;
}

.type-text {
  color: #111;
  font-size: 10px;
  margin-top: -8px;
  margin-bottom: 0;
}

.blog-list {
  background-color: #eee;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: start;
  justify-content: space-around;
  height: auto;
  padding: 12px 10px;
  overflow-y: auto;
}

:deep(.foot) {
  position: static;
  grid-row: 4;
}

@media (min-width: 768px) {
  .home-container {
    grid-template-rows: var(--app-header-height) 212px minmax(0, 1fr) var(--app-footer-height);
  }

  .search-bar {
    justify-content: center;
    gap: 20px;
    padding: 0 28px;
  }

  .search-input {
    width: min(70%, 620px);
  }

  .type-list {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px 24px;
    padding: 16px 32px;
  }

  .type-box img {
    max-width: 88px;
    margin: 0 auto;
  }

  .type-text {
    margin-top: -4px;
    font-size: 12px;
  }

  .blog-list {
    justify-content: space-between;
    gap: 0 16px;
    padding: 20px 28px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .type-box img {
    max-width: 66px;
  }
}

@media (min-width: 1200px) {
  .type-list {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }
}
</style>
