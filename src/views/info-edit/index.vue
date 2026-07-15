<template>
  <div class="info-edit-container">
    <AppHeader title="资料编辑" />

    <div class="edit-container">
      <div class="info-box">
        <div class="info-item">
          <div class="info-label">头像</div>
          <div class="info-btn">
            <img width="35" :src="user.icon || '/imgs/icons/default-icon.png'" alt="" />
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info-item">
          <div class="info-label">昵称</div>
          <div class="info-btn">
            <div>{{ user.nickName }}</div>
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info-item">
          <div class="info-label">个人介绍</div>
          <div class="info-btn">
            <div class="intro-text">{{ info.introduce || '介绍一下自己' }}</div>
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
      </div>

      <div class="info-box">
        <div class="info-item">
          <div class="info-label">性别</div>
          <div class="info-btn">
            <div>{{ info.gender || '选择' }}</div>
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info-item">
          <div class="info-label">城市</div>
          <div class="info-btn">
            <div>{{ info.city || '选择' }}</div>
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info-item">
          <div class="info-label">生日</div>
          <div class="info-btn">
            <div>{{ info.birthday || '添加' }}</div>
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
      </div>

      <div class="info-box">
        <div class="info-item">
          <div class="info-label">我的积分</div>
          <div class="info-btn">
            <div>查看积分</div>
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info-item">
          <div class="info-label">会员等级</div>
          <div class="info-btn">
            <div><a href="javascript:void(0)">成为VIP尊享特权</a></div>
            <div><el-icon><ArrowRight /></el-icon></div>
          </div>
        </div>
      </div>
    </div>

    <FootBar :active-btn="4" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserMe } from '@/api/user'
import AppHeader from '@/components/AppHeader/index.vue'
import FootBar from '@/components/FootBar/index.vue'

const router = useRouter()

const user = ref({})
const info = ref({})

onMounted(async () => {
  try {
    const res = await getUserMe()
    user.value = res.data
    info.value = JSON.parse(sessionStorage.getItem('userInfo')) || {}
  } catch (err) {
    ElMessage.error(err)
    setTimeout(() => router.push('/login'), 1000)
  }
})
</script>

<style lang="scss" scoped>
.edit-container {
  background-color: #f4f4f4;
  height: calc(100% - 6% - 8%);
  overflow-y: auto;
}

@media (min-width: 768px) {
  .edit-container {
    padding: 20px max(24px, 12%);
  }

  .info-box {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.divider {
  height: 1px;
  background-color: #e4e4e4;
}

.info-box {
  margin-bottom: 10px;
  padding: 5px 15px;
  background-color: #fff;
}

.info-item {
  display: flex;
  justify-content: space-between;
  line-height: 40px;
}

.info-label {
  font-size: 14px;
}

.info-btn {
  display: flex;
  align-items: center;
  color: #82848a;

  div {
    margin-left: 5px;
  }
}

.intro-text {
  overflow: hidden;
  width: 150px;
  text-align: right;
}
</style>
