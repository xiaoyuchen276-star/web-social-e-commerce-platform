<template>
  <div class="header">
    <div class="header-left" @click="goBack">
      <slot name="left">
        <el-icon v-if="showBack"><ArrowLeft /></el-icon>
      </slot>
    </div>
    <div class="header-title">{{ title }}</div>
    <div class="header-right">
      <slot name="right">
        <span v-if="showShare">...</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  },
  showShare: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style lang="scss" scoped>
.header {
  height: 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0 12px;

  .header-left {
    width: 20%;
    font-size: 20px;
    cursor: pointer;
  }

  .header-title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }

  .header-right {
    width: 20%;
    text-align: right;
    font-size: 16px;
    cursor: pointer;
  }
}
</style>
