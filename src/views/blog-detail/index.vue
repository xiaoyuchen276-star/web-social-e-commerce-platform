<template>
  <div class="blog-detail-container">
    <!-- 顶栏 -->
    <AppHeader :show-share="true" />

    <div class="blog-body">
      <!-- 图片滑动区域 -->
      <div
        ref="swiperRef"
        class="blog-info-box"
        @touchstart="moveStart"
        @touchmove="moving"
        @touchend="moveEnd"
      >
        <div v-for="(img, i) in blog.images" :key="i" class="swiper-item">
          <img :src="img" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      </div>

      <!-- 用户信息 -->
      <div class="basic">
        <div class="basic-icon" @click="toUserPage">
          <img :src="blog.icon || '/imgs/icons/default-icon.png'" alt="" />
        </div>
        <div class="basic-info">
          <div class="name">{{ blog.name }}</div>
          <span class="time">{{ formatTime(new Date(blog.createTime)) }}</span>
        </div>
        <div style="width: 20%">
          <div class="follow-btn" v-show="!currentUser || currentUser.id !== blog.userId" @click="handleFollow">
            {{ followed ? '取消关注' : '关注' }}
          </div>
        </div>
      </div>

      <!-- 博客内容 -->
      <div class="blog-text" v-html="blog.content"></div>

      <!-- 关联商户 -->
      <div class="shop-basic">
        <div class="shop-icon">
          <img :src="shop.image" alt="" />
        </div>
        <div style="width: 80%">
          <div class="name">{{ shop.name }}</div>
          <div>
            <el-rate :model-value="shopRate" disabled />
          </div>
          <div class="shop-avg">￥{{ shop.avgPrice }}/人</div>
        </div>
      </div>

      <!-- 点赞区域 -->
      <div class="zan-box">
        <div @click="handleLike">
          <LikeSvg :filled="blog.isLike" :size="20" />
        </div>
        <div class="zan-list">
          <div class="user-icon-mini" v-for="u in likes" :key="u.id">
            <img :src="u.icon || '/imgs/icons/default-icon.png'" alt="" />
          </div>
          <div class="like-count">{{ blog.liked }}人点赞</div>
        </div>
      </div>

      <div class="blog-divider"></div>

      <!-- 评论区域 -->
      <div class="blog-comments">
        <div class="comments-head">
          <div>网友评价 <span>（119）</span></div>
          <div><el-icon><ArrowRight /></el-icon></div>
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

      <div class="blog-divider"></div>
    </div>

    <!-- 底部操作栏 -->
    <div class="blog-foot-bar">
      <div class="foot-box-item" @click="handleLike">
        <LikeSvg :filled="blog.isLike" :size="26" />
        <span :class="{ liked: blog.isLike }">{{ blog.liked }}</span>
      </div>
      <div style="width: 40%"></div>
      <div class="foot-box-item">
        <el-icon :size="26"><ChatSquare /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBlogById, getBlogLikes, likeBlog } from '@/api/blog'
import { getShopById } from '@/api/shop'
import { getUserMe } from '@/api/user'
import { isFollowed as checkFollowed, follow as followApi } from '@/api/follow'
import { useSwiper } from '@/hooks/useSwiper'
import AppHeader from '@/components/AppHeader/index.vue'
import LikeSvg from '@/components/LikeSvg/index.vue'

const router = useRouter()
const route = useRoute()

const swiperRef = ref(null)
const blog = ref({})
const shop = ref({})
const likes = ref([])
const currentUser = ref(null)
const followed = ref(false)

const shopRate = computed(() => (shop.value.score || 0) / 10)
const imageCount = computed(() => blog.value.images?.length || 0)

// 使用 swiper hook
const { moveStart, moving, moveEnd, go } = useSwiper(swiperRef, imageCount)

// 查询博客
async function queryBlogById(id) {
  try {
    const res = await getBlogById(id)
    res.data.images = res.data.images.split(',')
    blog.value = res.data
    await nextTick()
    // 初始化 swiper 宽度
    if (swiperRef.value) {
      const width = swiperRef.value.offsetWidth || document.documentElement.offsetWidth
    }
    queryShopById(res.data.shopId)
    queryLikeList(id)
    queryLoginUser()
  } catch (err) {
    ElMessage.error(err)
  }
}

// 查询商户
async function queryShopById(shopId) {
  try {
    const res = await getShopById(shopId)
    res.data.image = res.data.images.split(',')[0]
    shop.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 查询点赞列表
async function queryLikeList(id) {
  try {
    const res = await getBlogLikes(id)
    likes.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 点赞
async function handleLike() {
  try {
    await likeBlog(blog.value.id)
    const res = await getBlogById(blog.value.id)
    res.data.images = res.data.images.split(',')
    blog.value = res.data
    queryLikeList(blog.value.id)
  } catch (err) {
    ElMessage.error(err)
  }
}

// 查询当前登录用户
async function queryLoginUser() {
  try {
    const res = await getUserMe()
    currentUser.value = res.data
    if (currentUser.value.id !== blog.value.userId) {
      checkIsFollowed()
    }
  } catch (e) {
    console.log(e)
  }
}

// 检查关注
async function checkIsFollowed() {
  try {
    const res = await checkFollowed(blog.value.userId)
    followed.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 关注/取消关注
async function handleFollow() {
  try {
    await followApi(blog.value.userId, !followed.value)
    ElMessage.success(followed.value ? '已取消关注' : '已关注')
    followed.value = !followed.value
  } catch (err) {
    ElMessage.error(err)
  }
}

// 跳转用户主页
function toUserPage() {
  if (blog.value.userId === currentUser.value?.id) {
    router.push('/info')
  } else {
    router.push({ name: 'otherInfo', query: { id: blog.value.userId } })
  }
}

// 格式化时间
function formatTime(b) {
  return b.getFullYear() + '年' + (b.getMonth() + 1) + '月' + b.getDate() + '日 '
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    queryBlogById(id)
  }
})
</script>

<style lang="scss" scoped>
.blog-body {
  height: 85%;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-top: 40px;
}

.blog-info-box {
  position: relative;
  overflow: hidden;
  height: 280px;
  width: 100%;
}

.swiper-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.basic {
  display: flex;
  justify-content: space-between;
  padding: 15px 15px 5px 15px;
}

.basic-icon {
  width: 40px;
  height: 40px;
  padding: 1px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.07);
  cursor: pointer;

  img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
}

.basic-info {
  width: 60%;

  .name {
    font-weight: bold;
    font-size: 12px;
    color: #446889;
  }

  .time {
    display: inline-block;
    padding: 0 10px;
    margin: 5px 0 10px;
    border-radius: 2px;
    opacity: 0.4;
  }
}

.follow-btn {
  width: 100%;
  height: 25px;
  line-height: 25px;
  border-radius: 12px;
  text-align: center;
  border: #ff6633 1px solid;
  color: #ff6633;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  font-size: 12px;
}

.blog-text {
  width: 90%;
  padding: 5px 20px;
}

.shop-basic {
  margin: auto;
  width: 80%;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  padding: 15px 15px 5px 15px;
  box-shadow: 0 4px 4px 2px rgba(0, 0, 0, 0.1);

  .name {
    font-weight: bold;
    font-size: 14px;
  }
}

.shop-icon {
  width: 50px;
  height: 50px;

  img {
    width: 100%;
    height: 100%;
  }
}

.shop-avg {
  opacity: 0.4;
}

.zan-box {
  width: 90%;
  margin: auto;
  padding: 20px 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zan-list {
  width: 88%;
  display: flex;
  align-items: center;
}

.user-icon-mini {
  margin-left: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 1px;
  background-color: #fff;
  box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.07);

  img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
}

.like-count {
  margin-left: 10px;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
}

.blog-divider {
  height: 10px;
  background-color: #f3f1f1;
}

.blog-comments {
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

.blog-foot-bar {
  width: 100%;
  height: 8%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 -1px 2px 1px rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: 0;
  background: #fff;
}

.foot-box-item {
  width: 20%;
  color: #82848a;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  span {
    font-size: 14px;

    &.liked {
      color: #ff6633;
    }
  }
}
</style>
