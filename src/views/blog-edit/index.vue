<template>
  <div class="blog-edit-container">
    <!-- 顶栏 -->
    <div class="blog-edit-header">
      <div class="header-cancel-btn" @click="$router.back()">取消</div>
      <div class="header-title">
        &nbsp;&nbsp;发笔记<el-icon><InfoFilled /></el-icon>
      </div>
      <div class="header-commit">
        <div class="header-commit-btn" @click="submitBlog">发布</div>
      </div>
    </div>

    <!-- 图片上传 -->
    <div class="upload-box">
      <input type="file" name="file" ref="fileInput" style="display: none" @change="fileSelected" />
      <div class="upload-btn" @click="openFileDialog">
        <el-icon><Camera /></el-icon>
        <div class="upload-text">上传照片</div>
      </div>
      <div class="pic-list">
        <div class="pic-box" v-for="(f, i) in fileList" :key="i">
          <img :src="f" alt="" />
          <el-icon class="pic-close" @click="deletePic(i)"><Close /></el-icon>
        </div>
      </div>
    </div>

    <!-- 标题 -->
    <div class="blog-title">
      <input v-model="params.title" type="text" placeholder="填写标题更容易上首页哦~" />
    </div>

    <!-- 内容 -->
    <div class="blog-content">
      <textarea v-model="params.content" placeholder="最近打卡了什么地方，有什么新奇体验呢？"></textarea>
    </div>

    <div class="divider"></div>

    <!-- 关联商户 -->
    <div class="blog-shop" @click="showDialog = true">
      <div class="shop-left">关联商户</div>
      <div v-if="selectedShop.name">{{ selectedShop.name }}</div>
      <div v-else>去选择&nbsp;<el-icon><ArrowRight /></el-icon></div>
    </div>

    <!-- 遮罩 -->
    <div class="mask" v-show="showDialog" @click="showDialog = false"></div>

    <!-- 商户选择弹窗 -->
    <transition name="el-zoom-in-bottom">
      <div class="shop-dialog" v-show="showDialog">
        <div class="blog-shop">
          <div class="shop-left">关联商户</div>
        </div>
        <div class="search-bar">
          <div class="city-select">杭州 <el-icon><ArrowDown /></el-icon></div>
          <div class="search-input">
            <el-icon @click="queryShops"><Search /></el-icon>
            <input v-model="shopName" type="text" placeholder="搜索商户名称" />
          </div>
        </div>
        <div class="shop-list">
          <div v-for="s in shops" class="shop-item" @click="selectShop(s)">
            <div class="shop-name">{{ s.name }}</div>
            <div>{{ s.area }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserMe } from '@/api/user'
import { searchShopsByName } from '@/api/shop'
import { createBlog } from '@/api/blog'
import { uploadBlogImage, deleteBlogImage } from '@/api/upload'

const router = useRouter()

const fileInput = ref(null)
const fileList = ref([])
const params = reactive({
  title: '',
  content: ''
})
const showDialog = ref(false)
const shops = ref([])
const shopName = ref('')
const selectedShop = ref({})

// 搜索商户
async function queryShops() {
  try {
    const res = await searchShopsByName(shopName.value)
    shops.value = res.data
  } catch (err) {
    ElMessage.error(err)
  }
}

function selectShop(s) {
  selectedShop.value = s
  showDialog.value = false
}

// 提交博客
async function submitBlog() {
  const data = { ...params }
  data.images = fileList.value.join(',')
  data.shopId = selectedShop.value.id
  try {
    await createBlog(data)
    router.push('/info')
  } catch (err) {
    ElMessage.error(err)
  }
}

// 打开文件选择器
function openFileDialog() {
  fileInput.value.click()
}

// 文件选择
async function fileSelected() {
  const file = fileInput.value.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await uploadBlogImage(formData)
    fileList.value.push('/imgs' + res.data)
  } catch (err) {
    ElMessage.error(err)
  }
}

// 删除图片
async function deletePic(i) {
  try {
    await deleteBlogImage(fileList.value[i])
    fileList.value.splice(i, 1)
  } catch (err) {
    ElMessage.error(err)
  }
}

// 检查登录
async function checkLogin() {
  const token = sessionStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  try {
    await getUserMe()
  } catch (err) {
    ElMessage.error(err)
    setTimeout(() => router.push('/login'), 200)
  }
}

onMounted(() => {
  checkLogin()
  queryShops()
})
</script>

<style lang="scss" scoped>
.blog-edit-header {
  padding: 15px;
  line-height: 20px;
  display: flex;
  justify-content: space-between;
  text-align: center;

  .header-cancel-btn {
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  }

  .header-commit-btn {
    color: white;
    background-color: #F63;
    padding: 0 12px;
    border-radius: 15px;
    cursor: pointer;
  }

  .header-title {
    text-align: center;
    font-size: 18px;
    font-family: Hiragino Sans GB, Arial, Helvetica, '\5B8B\4F53', sans-serif;
  }
}

.upload-box {
  padding: 15px;
  display: flex;
  overflow-x: scroll;
}

.upload-btn {
  width: 70px;
  height: 125px;
  line-height: 40px;
  text-align: center;
  align-items: center;
  border: 1px dashed #3a8ee6;
  border-radius: 5px;
  font-size: 30px;
  color: #82848a;
  margin-right: 10px;
  cursor: pointer;

  i {
    margin-top: 35px;
  }
}

.upload-text {
  font-size: 12px;
  line-height: 12px;
}

.pic-list {
  display: flex;
  overflow-x: scroll;
  height: 125px;
}

.pic-box {
  width: 100px;
  height: 120px;
  border-radius: 5px;
  margin-right: 2px;
  border: 1px solid #c0ccda;
  position: relative;

  img {
    width: 100px;
    height: 120px;
    border-radius: 5px;
  }
}

.pic-close {
  position: absolute;
  z-index: 99;
  top: 2px;
  right: 2px;
  color: gray;
  cursor: pointer;
}

.blog-title,
.blog-content {
  padding: 5px 15px;
}

.blog-title input {
  width: 100%;
  line-height: 30px;
  font-size: 14px;
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-bottom: 1px solid #e6e6e8;
}

input::placeholder,
textarea::placeholder {
  font-weight: bold;
  color: #cccccc;
}

.blog-content textarea {
  width: 100%;
  height: 310px;
  border: 0;
}

input:focus,
textarea:focus {
  outline: none;
}

.divider {
  background-color: #f4f4f5;
  height: 10px;
}

.blog-shop {
  color: #82848a;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}

.shop-left {
  color: #111111;
  font-size: 14px;
  font-weight: bold;
}

.mask {
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 299;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
}

.shop-dialog {
  position: absolute;
  z-index: 999;
  bottom: 0;
  height: min(500px, 78dvh);
  width: 100%;
  background-color: #fff;
}

.search-bar {
  display: flex;
  padding: 15px;
  line-height: 30px;
  justify-content: space-between;
}

.city-select {
  font-weight: bold;
  font-size: 14px;
  margin-right: 10px;
}

.search-input {
  width: 50%;
  flex: 1;
  background-color: #f1f1f1;
  line-height: 30px;
  align-items: center;
  border-radius: 20px;
  display: flex;
  padding: 0 10px;

  input {
    margin-left: 10px;
    border: 0;
    width: 100%;
    background-color: #f1f1f1;
  }
}

.shop-list {
  padding: 15px;
  overflow-y: scroll;
  height: calc(100% - 120px);
}

.shop-item {
  border-bottom: 1px solid #eae8e8;
  padding: 8px 0;
  cursor: pointer;
}

.shop-name {
  font-size: 14px;
  font-weight: bold;
}

@media (min-width: 768px) {
  .blog-edit-header,
  .upload-box,
  .blog-title,
  .blog-content,
  .blog-shop {
    width: min(100%, 860px);
    margin-right: auto;
    margin-left: auto;
  }

  .blog-edit-header,
  .upload-box,
  .blog-title,
  .blog-content,
  .blog-shop {
    padding-right: 24px;
    padding-left: 24px;
  }

  .blog-content textarea {
    height: clamp(320px, 40dvh, 520px);
  }

  .shop-dialog {
    right: 0;
    left: 0;
    width: min(100%, 760px);
    margin: 0 auto;
    border-radius: 16px 16px 0 0;
  }
}
</style>
