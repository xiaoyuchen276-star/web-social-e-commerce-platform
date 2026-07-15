<template>
  <div
    ref="swiperRef"
    class="swiper-container"
    @touchstart="moveStart"
    @touchmove="moving"
    @touchend="moveEnd"
  >
    <div
      v-for="(img, i) in images"
      :key="i"
      class="swiper-item"
      :style="getItemStyle(i)"
    >
      <img :src="img" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

const swiperRef = ref(null)
const active = ref(0)
const _width = ref(0)
const duration = 300
const sensitivity = 60
const resistance = 0.3

const start = { x: 0, y: 0 }
const move = { x: 0, y: 0 }
let isMoving = false

function each(ary, callback) {
  for (let i = 0, l = ary.length; i < l; i++) {
    if (callback(ary[i], i) === false) break
  }
}

function getItems() {
  if (!swiperRef.value) return []
  return swiperRef.value.querySelectorAll('.swiper-item')
}

function getItemStyle(i) {
  const distance = (i - active.value) * _width.value
  return {
    transform: `translate3d(${distance}px, 0, 0)`,
    transition: 'none'
  }
}

function setTransform(offset = 0) {
  const items = getItems()
  each(items, (item, i) => {
    let distance = (i - active.value) * _width.value + offset
    item.style.webkitTransform = `translate3d(${distance}px, 0, 0)`
    item.style.transform = `translate3d(${distance}px, 0, 0)`
  })
}

function setTransition(dur) {
  dur = dur || duration
  dur = typeof dur === 'number' ? dur + 'ms' : dur
  const items = getItems()
  each(items, item => {
    item.style.webkitTransition = dur
    item.style.transition = dur
  })
}

function updateWidth() {
  if (swiperRef.value) {
    _width.value = swiperRef.value.offsetWidth || document.documentElement.offsetWidth
  }
}

function go(index) {
  active.value = index
  if (active.value < 0) active.value = 0
  else if (active.value > props.images.length - 1) active.value = props.images.length - 1
  setTransition()
  setTransform()
}

function moveStart(e) {
  start.x = e.changedTouches[0].pageX
  start.y = e.changedTouches[0].pageY
  setTransition('none')
}

function moving(e) {
  e.preventDefault()
  e.stopPropagation()
  let distanceX = e.changedTouches[0].pageX - start.x
  let distanceY = e.changedTouches[0].pageY - start.y
  if (Math.abs(distanceX) > Math.abs(distanceY)) {
    isMoving = true
    move.x = start.x + distanceX
    move.y = start.y + distanceY
    if ((active.value === 0 && distanceX > 0) || (active.value === getItems().length - 1 && distanceX < 0)) {
      distanceX = distanceX * resistance
    }
    setTransform(distanceX)
  }
}

function moveEnd(e) {
  if (isMoving) {
    e.preventDefault()
    e.stopPropagation()
    let distance = move.x - start.x
    if (Math.abs(distance) > sensitivity) {
      if (distance < 0) {
        go(active.value + 1)
      } else {
        go(active.value - 1)
      }
    } else {
      setTransition()
      setTransform()
    }
    start.x = 0
    start.y = 0
    move.x = 0
    move.y = 0
    isMoving = false
  }
}

onMounted(() => {
  nextTick(() => {
    updateWidth()
  })
  window.addEventListener('resize', updateWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth)
})

defineExpose({ go })
</script>

<style lang="scss" scoped>
.swiper-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .swiper-item {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
