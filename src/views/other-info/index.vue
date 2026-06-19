<template>
  <div class="other-info-container">
    <AppHeader />

    <div class="basic">
      <div class="basic-icon">
        <img :src="user.icon || '/imgs/icons/default-icon.png'" alt="" />
      </div>
      <div class="basic-info">
        <div class="name">{{ user.nickName }}</div>
        <span>杭州</span>
      </div>
      <div class="logout-btn" @click="handleFollow" style="text-align: center">
        {{ followed ? '取消关注' : '关注' }}
      </div>
    </div>

    <div class="introduce">
      <span v-if="info.introduce">{{ info.introduce }}</span>
      <span v-else>这个人很懒，什么都没有留下</span>
    </div>

    <div class="content">
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="笔记" name="1">
          <div v-for="b in blogs" :key="b.id" class="blog-item">
            <div class="blog-img"><img :src="b.images.split(',')[0]" alt="" /></div>
            <div class="blog-info">
              <div class="blog-title" v-html="b.title"></div>
              <div class="blog-liked">
                <img src="/imgs/thumbup.png" alt="" /> {{ b.liked }}
              </div>
              <div class="blog-comments">
                <el-icon><ChatDotRound /></el-icon> {{ b.comments }}
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="共同关注" name="2">
          <div>你们都关注了：</div>
          <div class="follow-info" v-for="u in commonFollows" :key="u.id">
            <div class="follow-info-icon" @click="toOtherInfo(u.id)">
              <img :src="u.icon || '/imgs/icons/default-icon.png'" alt="" />
            </div>
            <div class="follow-info-name">
              <div class="name">{{ u.nickName }}</div>
            </div>
            <div class="follow-info-btn" @click="toOtherInfo(u.id)">去主页看看</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <FootBar :active-btn="0" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserById, getUserInfo, getUserMe } from '@/api/user'
import { getBlogsOfUser } from '@/api/blog'
import { isFollowed, follow, getCommonFollows } from '@/api/follow'
import AppHeader from '@/components/AppHeader/index.vue'
import FootBar from '@/components/FootBar/index.vue'

const router = useRouter()
const route = useRoute()

const user = ref({})
const loginUser = ref({})
const activeName = ref('1')
const info = ref({})
const blogs = ref([])
const followed = ref(false)
const commonFollows = ref([])

// 查询当前用户
async function queryLoginUser() {
  try {
    const res = await getUserMe()
    loginUser.value = res.data
  } catch (e) {
    console.log(e)
  }
}

// 查询目标用户
async function queryUser() {
  const id = route.query.id
  try {
    const res = await getUserById(id)
    user.value = res.data
    queryUserInfo()
    queryBlogs()
    checkIsFollowed()
  } catch (e) {
    console.log(e)
  }
}

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

async function queryBlogs() {
  try {
    const res = await getBlogsOfUser({ id: user.value.id, current: 1 })
    blogs.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

async function checkIsFollowed() {
  try {
    const res = await isFollowed(user.value.id)
    followed.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

async function queryCommonFollow() {
  try {
    const res = await getCommonFollows(user.value.id)
    commonFollows.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

async function handleFollow() {
  try {
    await follow(user.value.id, !followed.value)
    ElMessage.success(followed.value ? '已取消关注' : '已关注')
    followed.value = !followed.value
  } catch (err) {
    ElMessage.error(err)
  }
}

function handleTabClick(t) {
  if (t.name === '2') {
    queryCommonFollow()
  }
}

function toOtherInfo(id) {
  router.push({ name: 'otherInfo', query: { id } })
}

onMounted(() => {
  queryUser()
  queryLoginUser()
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

.follow-info {
  display: flex;
  justify-content: space-between;
  padding: 15px 10px 5px 10px;
  align-items: center;
}

.follow-info-icon {
  width: 15%;
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

.follow-info-name {
  width: 56%;
  padding: 8px;
  font-size: 14px;
}

.follow-info-btn {
  width: 30%;
  font-size: 10px;
  line-height: 20px;
  height: 20px;
  border: #ff6633 1px solid;
  color: #ff6633;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
}
</style>
