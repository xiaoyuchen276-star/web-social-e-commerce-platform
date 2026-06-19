<template>
  <img :src="src || '/imgs/icons/default-icon.png'" :style="imgStyle" alt="" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  size: {
    type: [Number, String],
    default: 24
  }
})

const imgStyle = computed(() => ({
  width: typeof props.size === 'number' ? props.size + 'px' : props.size,
  height: typeof props.size === 'number' ? props.size + 'px' : props.size,
  borderRadius: '50%'
}))
</script>
