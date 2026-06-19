<template>
  <div class="blog-box" @click="handleClick">
    <div class="blog-img">
      <img :src="blog.img" alt="" />
    </div>
    <div class="blog-title">{{ blog.title }}</div>
    <div class="blog-foot">
      <div class="blog-user-icon">
        <UserAvatar :src="blog.icon" :size="20" />
      </div>
      <div class="blog-user-name">{{ blog.name }}</div>
      <div class="blog-liked" @click.stop="handleLike">
        <LikeSvg :filled="blog.isLike" :size="14" />
        {{ blog.liked }}
      </div>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from '@/components/UserAvatar/index.vue'
import LikeSvg from '@/components/LikeSvg/index.vue'

const props = defineProps({
  blog: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'like'])

function handleClick() {
  emit('click', props.blog)
}

function handleLike() {
  emit('like', props.blog)
}
</script>

<style lang="scss" scoped>
.blog-box {
  width: 48%;
  margin-bottom: 10px;

  .blog-img {
    width: 100%;
    height: 0;
    padding-bottom: 66%;
    overflow: hidden;
    position: relative;

    img {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .blog-title {
    padding: 5px 3px;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .blog-foot {
    display: flex;
    align-items: center;
    padding: 0 3px;
    font-size: 10px;
    color: #82848a;

    .blog-user-icon {
      margin-right: 4px;
    }

    .blog-user-name {
      flex: 1;
    }

    .blog-liked {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }
}
</style>
