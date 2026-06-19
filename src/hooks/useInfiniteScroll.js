import { ref } from 'vue'

/**
 * 无限滚动组合式函数
 * @param {Function} loadMore - 加载更多的回调函数
 * @returns {{ scrollHandler: Function, isReachBottom: import('vue').Ref<boolean> }}
 */
export function useInfiniteScroll(loadMore) {
  const isReachBottom = ref(false)

  function scrollHandler(e) {
    const scrollTop = e.target.scrollTop
    const offsetHeight = e.target.offsetHeight
    const scrollHeight = e.target.scrollHeight

    // 触底检测
    if (scrollTop + offsetHeight + 1 > scrollHeight && !isReachBottom.value) {
      isReachBottom.value = true
      loadMore().finally(() => {
        isReachBottom.value = false
      })
    }
  }

  return {
    scrollHandler,
    isReachBottom
  }
}

/**
 * 无限滚动（支持下拉刷新）
 * @param {Function} loadMore - 加载更多
 * @param {Function} refresh - 下拉刷新
 */
export function useInfiniteScrollWithRefresh(loadMore, refresh) {
  const isReachBottom = ref(false)

  function scrollHandler(e) {
    const scrollTop = e.target.scrollTop
    const offsetHeight = e.target.offsetHeight
    const scrollHeight = e.target.scrollHeight

    // 触顶刷新
    if (scrollTop === 0) {
      refresh()
      return
    }

    // 触底加载更多
    if (scrollTop + offsetHeight + 1 > scrollHeight && !isReachBottom.value) {
      isReachBottom.value = true
      loadMore().finally(() => {
        isReachBottom.value = false
      })
    }
  }

  return {
    scrollHandler,
    isReachBottom
  }
}
