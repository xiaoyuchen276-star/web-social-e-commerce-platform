import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

/**
 * 触摸滑动组合式函数（从原 blog-detail.html 迁移）
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - 容器元素的 ref
 * @param {import('vue').Ref<number>} itemCount - 子项数量
 * @returns {{ active: import('vue').Ref<number>, go: Function }}
 */
export function useSwiper(containerRef, itemCount) {
  const active = ref(0)
  const _width = ref(0)
  const duration = 300
  const sensitivity = 60
  const resistance = 0.3

  const start = { x: 0, y: 0 }
  const move = { x: 0, y: 0 }
  let isMoving = false

  function getItems() {
    if (!containerRef.value) return []
    return containerRef.value.querySelectorAll('.swiper-item')
  }

  function setTransform(offset = 0) {
    const items = getItems()
    items.forEach((item, i) => {
      let distance = (i - active.value) * _width.value + offset
      item.style.webkitTransform = `translate3d(${distance}px, 0, 0)`
      item.style.transform = `translate3d(${distance}px, 0, 0)`
    })
  }

  function setTransition(dur) {
    dur = dur || duration
    dur = typeof dur === 'number' ? dur + 'ms' : dur
    const items = getItems()
    items.forEach(item => {
      item.style.webkitTransition = dur
      item.style.transition = dur
    })
  }

  function updateWidth() {
    if (containerRef.value) {
      _width.value = containerRef.value.offsetWidth || document.documentElement.offsetWidth
    }
  }

  function go(index) {
    active.value = index
    if (active.value < 0) active.value = 0
    else if (active.value > itemCount.value - 1) active.value = itemCount.value - 1
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
      if ((active.value === 0 && distanceX > 0) || (active.value === itemCount.value - 1 && distanceX < 0)) {
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

  return {
    active,
    moveStart,
    moving,
    moveEnd,
    go
  }
}
