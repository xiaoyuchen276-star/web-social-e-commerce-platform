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
          <div>网友评价 <span>（{{ commentTotal }}）</span></div>
        </div>
        <div class="comment-editor">
          <el-input
            ref="commentInputRef"
            v-model="commentContent"
            maxlength="255"
            placeholder="说说你的看法"
            show-word-limit
            type="textarea"
            :rows="2"
          />
          <el-button
            type="primary"
            :disabled="!commentContent.trim()"
            :loading="commentSubmitting"
            @click="handleCommentSubmit"
          >
            发布
          </el-button>
        </div>
        <div class="comment-list">
          <div v-if="!comments.length && !commentLoading" class="comment-empty">暂无评论，来发表第一条吧</div>
          <div class="comment-box" v-for="comment in comments" :key="comment.id">
            <div class="comment-icon">
              <img :src="comment.user?.icon || '/imgs/icons/default-icon.png'" alt="" />
            </div>
            <div class="comment-info">
              <div class="comment-user">{{ comment.user?.nickName || `用户${comment.userId}` }}</div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-time">{{ formatCommentTime(comment.createTime) }}</div>
            </div>
          </div>
          <el-button
            v-if="comments.length < commentTotal"
            class="comment-more"
            text
            :loading="commentLoading"
            @click="loadMoreComments"
          >
            加载更多
          </el-button>
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
      <div class="foot-box-item" @click="focusCommentInput">
        <el-icon :size="26"><ChatSquare /></el-icon>
        <span>{{ commentTotal }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBlogById, getBlogLikes, likeBlog } from '@/api/blog'
import { createBlogComment, getBlogComments } from '@/api/comment'
import { getShopById } from '@/api/shop'
import { getUserById, getUserMe } from '@/api/user'
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
const comments = ref([])
const commentTotal = ref(0)
const commentCurrent = ref(1)
const commentLoading = ref(false)
const commentSubmitting = ref(false)
const commentContent = ref('')
const commentInputRef = ref(null)
const commentUsers = new Map()

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
    queryComments(id, true)
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

// 查询评论，并补充评论用户的公开信息
async function queryComments(blogId, reset = false) {
  if (commentLoading.value) return
  if (reset) {
    commentCurrent.value = 1
  }
  commentLoading.value = true
  try {
    const res = await getBlogComments(blogId, commentCurrent.value)
    const records = res.data || []
    const enrichedRecords = await Promise.all(
      records.map(async comment => {
        if (!commentUsers.has(comment.userId)) {
          const userRes = await getUserById(comment.userId)
          commentUsers.set(comment.userId, userRes.data)
        }
        return { ...comment, user: commentUsers.get(comment.userId) }
      })
    )
    comments.value = reset ? enrichedRecords : comments.value.concat(enrichedRecords)
    commentTotal.value = res.total || 0
  } catch (err) {
    ElMessage.error(err)
  } finally {
    commentLoading.value = false
  }
}

async function loadMoreComments() {
  commentCurrent.value++
  await queryComments(blog.value.id)
}

async function handleCommentSubmit() {
  const content = commentContent.value.trim()
  if (!content) return
  if (!sessionStorage.getItem('token')) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  commentSubmitting.value = true
  try {
    await createBlogComment({
      blogId: blog.value.id,
      content
    })
    commentContent.value = ''
    await queryComments(blog.value.id, true)
    blog.value.comments = commentTotal.value
    ElMessage.success('评论发布成功')
  } catch (err) {
    ElMessage.error(err)
  } finally {
    commentSubmitting.value = false
  }
}

function focusCommentInput() {
  commentInputRef.value?.focus()
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

function formatCommentTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
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
  height: calc(100% - var(--app-header-height) - var(--app-footer-height));
  overflow-y: scroll;
  overflow-x: hidden;
  padding-top: 0;
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

.comment-editor {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-top: 14px;

  .el-button {
    flex: 0 0 auto;
  }
}

.comment-empty,
.comment-time {
  color: #909399;
  font-size: 12px;
}

.comment-empty {
  padding: 24px 0;
  text-align: center;
}

.comment-more {
  display: block;
  margin: 0 auto;
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
  white-space: pre-wrap;
  word-break: break-word;
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
  min-height: var(--app-footer-height);
  height: var(--app-footer-height);
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

@media (min-width: 768px) {
  .blog-body {
    width: min(100%, 920px);
    margin: 0 auto;
  }

  .blog-info-box {
    height: clamp(300px, 42vw, 460px);
  }

  .blog-text,
  .blog-comments {
    padding-right: 28px;
    padding-left: 28px;
  }

  .shop-basic,
  .zan-box {
    width: min(86%, 760px);
  }

  .blog-foot-bar {
    padding-right: max(24px, 12%);
    padding-left: max(24px, 12%);
  }
}
</style>
