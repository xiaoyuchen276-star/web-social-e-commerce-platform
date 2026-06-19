import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/login2',
    name: 'login2',
    component: () => import('@/views/login2/index.vue')
  },
  {
    path: '/info',
    name: 'info',
    component: () => import('@/views/info/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/info-edit',
    name: 'infoEdit',
    component: () => import('@/views/info-edit/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/other-info',
    name: 'otherInfo',
    component: () => import('@/views/other-info/index.vue')
  },
  {
    path: '/shop-list',
    name: 'shopList',
    component: () => import('@/views/shop-list/index.vue')
  },
  {
    path: '/shop-detail',
    name: 'shopDetail',
    component: () => import('@/views/shop-detail/index.vue')
  },
  {
    path: '/blog-detail',
    name: 'blogDetail',
    component: () => import('@/views/blog-detail/index.vue')
  },
  {
    path: '/blog-edit',
    name: 'blogEdit',
    component: () => import('@/views/blog-edit/index.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 导航守卫：需要登录的页面
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
