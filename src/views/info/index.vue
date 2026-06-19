<template>
  <div class="info-container">
    <AppHeader title="个人主页" />

    <div class="basic">
      <div class="basic-icon">
        <img :src="user.icon || '/imgs/icons/default-icon.png'" alt="" />
      </div>
      <div class="basic-info">
        <div class="name">{{ user.nickName }}</div>
        <span>杭州</span>
        <div class="edit-btn" @click="$router.push('/info-edit')">编辑资料</div>
      </div>
      <div class="logout-btn" @click="handleLogout">退出登录</div>
    </div>

    <div class="introduce">
      <span v-if="info.introduce">{{ info.introduce }}</span>
      <span v-else>添加个人简介，让大家更好的认识你 <el-icon><Edit /></el-icon></span>
    </div>

    <div class="content">
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="笔记" name="1">
          <div v-for="b in blogs" :key="b.id" class="blog-item">
            <div class="blog-img"><img :src="b.images.split(',')[0]" alt="" /></div>
            <div class="blog-info">
              <div class="blog-title">{{ b.title }}</div>
              <div class="blog-liked">
                <img src="/imgs/thumbup.png" alt="" /> {{ b.liked }}
              </div>
              <div class="blog-comments">
                <el-icon><ChatDotRound /></el-icon> {{ b.comments }}
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="评价" name="2">评价</el-tab-pane>
        <el-tab-pane label="粉丝(0)" name="3">粉丝(0)</el-tab-pane>

        <el-tab-pane label="关注(0)" name="4">
          <div class="follow-blog-list" @scroll="scrollHandler">
            <div class="follow-blog-box" v-for="b in blogs2" :key="b.id">
              <div class="follow-blog-img" @click="toBlogDetail(b)">
                <img :src="b.img" alt="" />
              </div>
              <div class="follow-blog-title">{{ b.title }}</div>
              <div class="follow-blog-foot">
                <div class="follow-blog-user-icon">
                  <img :src="b.icon || '/imgs/icons/default-icon.png'" alt="" />
                </div>
                <div class="follow-blog-user-name">{{ b.name }}</div>
                <div class="follow-blog-liked" @click="handleLike(b)">
                  <LikeSvg :filled="b.isLike" :size="14" />
                  {{ b.liked }}
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <FootBar :active-btn="4" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserMe, getUserInfo } from '@/api/user'
import { getBlogsOfMe, getBlogsOfFollow, getBlogById, likeBlog } from '@/api/blog'
import { useAuthStore } from '@/store/modules/auth'
import { useInfiniteScrollWithRefresh } from '@/hooks/useInfiniteScroll'
import AppHeader from '@/components/AppHeader/index.vue'
import FootBar from '@/components/FootBar/index.vue'
import LikeSvg from '@/components/LikeSvg/index.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = ref({})
const activeName = ref('1')
const info = ref({})
const blogs = ref([])
const blogs2 = ref([])

const params = reactive({
  minTime: 0,
  offset: 0
})

// 查询用户
async function queryUser() {
  try {
    const res = await getUserMe()
    user.value = res.data
    queryUserInfo()
    queryBlogs()
  } catch (err) {
    router.push('/login')
  }
}

// 查询用户详情
async function queryUserInfo() {
  try {
    const res = await getUserInfo(user.value.id)
    if (res.data) {
      info.value = res.data
      sessionStorage.setItem('userInfo', JSON.stringify(res.data))
    }
  } catch (err) {
    ElMessage.error(err)
  }
}

// 查询我的博客
async function queryBlogs() {
  try {
    const res = await getBlogsOfMe()
    blogs.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

// 查询关注用户的博客
async function queryBlogsOfFollow(clear) {
  if (clear) {
    params.offset = 0
    params.minTime = new Date().getTime() + 1
  }
  const { minTime, offset: os } = params
  try {
    const res = await getBlogsOfFollow({ offset: os, lastId: minTime || new Date().getTime() + 1 })
    if (!res.data) return
    const { list, ...restParams } = res.data
    list.forEach(b => (b.img = b.images.split(',')[0]))
    blogs2.value = clear ? list : blogs2.value.concat(list)
    Object.assign(params, restParams)
  } catch (e) {
    console.log(e)
  }
}

// 关注 Tab 无限滚动（支持下拉刷新）
const { scrollHandler } = useInfiniteScrollWithRefresh(
  () => queryBlogsOfFollow(false),
  () => queryBlogsOfFollow(true)
)

// Tab 切换
function handleTabClick(r) {
  if (r.name === '4') {
    queryBlogsOfFollow(true)
  }
}

// 点赞
async function handleLike(b) {
  try {
    await likeBlog(b.id)
    const res = await getBlogById(b.id)
    b.liked = res.data.liked
    b.isLike = res.data.isLike
  } catch (err) {
    ElMessage.error(err)
  }
}

// 跳转博客详情
function toBlogDetail(b) {
  router.push({ name: 'blogDetail', query: { id: b.id } })
}

// 退出登录
async function handleLogout() {
  await authStore.logout()
  router.replace('/')
}

onMounted(() => {
  queryUser()
})
</script>

<style lang="scss" scoped>
.basic {
  height: 15%;
  display: flex;
  justify-content: space-between;
  padding: 15px 15px 5px 15px;
}

.basic-icon {
  width: 80px;
  height: 80px;
  padding: 1px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.07);

  img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
}

.basic-info {
  width: 54%;
  padding: 8px;

  .name {
    overflow: hidden;
    font-weight: bold;
    font-size: 14px;
  }

  span {
    display: inline-block;
    padding: 0 10px;
    background-color: #eeeded;
    margin: 5px 0 10px;
    border-radius: 2px;
  }
}

.edit-btn {
  width: 90%;
  line-height: 20px;
  border-radius: 12px;
  text-align: center;
  border: #eeeded 1px solid;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.logout-btn {
  width: 18%;
  margin-top: 8px;
  height: 20px;
  line-height: 20px;
  color: white;
  padding: 0 2px;
  border-radius: 3px;
  background-color: #f63;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.04);
  text-align: center;
  cursor: pointer;
  font-size: 12px;
}

.introduce {
  padding: 0 15px;
}

.content {
  height: 61%;
}

.blog-item {
  display: flex;
  padding: 10px;
  height: 90px;
  width: 90%;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.blog-img {
  width: 70px;
  height: 90px;
  margin-right: 10px;

  img {
    width: 100%;
    height: 100%;
  }
}

.blog-info {
  flex: 1;
}

.blog-title {
  line-height: 20px;
}

.blog-liked {
  line-height: 16px;
  align-items: center;

  img {
    width: 16px;
    height: 16px;
  }
}

.blog-comments i {
  font-size: 16px;
}

// 关注博客列表
.follow-blog-list {
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  overflow-y: auto;
}

.follow-blog-box {
  width: 90%;
  background-color: #fff;
  margin: 5px 0;
  box-shadow: 0 3px 4px 1px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.follow-blog-img img {
  width: 100%;
  border-radius: 3px;
}

.follow-blog-title {
  padding: 2px 10px;
  line-height: 24px;
  width: 92%;
  overflow: hidden;
}

.follow-blog-foot {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 5px 0;
  padding: 0 10px;
}

.follow-blog-user-icon {
  width: 10%;
  margin-right: 3px;

  img {
    width: 100%;
  }
}

.follow-blog-user-name {
  width: 65%;
  overflow: hidden;
}

.follow-blog-liked {
  width: 25%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}
</style>
