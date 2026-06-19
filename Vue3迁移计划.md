# 黑马点评 Vue2 多页应用 → Vue3 + Vite 单页应用 转换计划

## 背景

当前项目是一个传统的 **Vue 2 多页应用**（10 个独立 HTML 文件，无构建工具），由 nginx 直接托管。每个 HTML 页面内联 `<script>` 编写 `new Vue({...})`，通过 `<script src>` 加载本地 Vue 2 / Axios / Element UI 文件。页面间通过 `location.href` 跳转。

目标：按照 **中阳能碳平台 (RuoYi-Vue-Plus)** 的开发模式，将项目改造为现代化的 **Vue 3 + Vite 单页应用**。

## 参考项目开发规范（来自 web_ZhongYangServer_Admin）

| 维度 | 规范 |
|------|------|
| 视图命名 | `views/功能模块/` 目录，主页面 `index.vue` |
| 组件命名 | `components/ComponentName/` 目录，入口 `index.vue` |
| API 文件 | `api/功能模块/` 目录，入口 `index.js`，命名导出函数 |
| 状态管理 | `store/modules/` 目录，Pinia 组合式 API |
| 组合式函数 | `hooks/` 目录（非 composables） |
| 样式方案 | `assets/styles/` 全局样式 + `<style lang="scss" scoped>` |
| 路径别名 | `@/` → `src/` |
| 路由模式 | `createWebHistory`（但考虑到移动端部署简单性，本项目用 hash 模式） |
| 请求封装 | `utils/request.js` Axios 实例 + 拦截器 |

## 目标项目结构

```
web-social-e-commerce-platform/
├── .env.development            # VITE_API_BASE_URL=/api
├── .env.production             # VITE_API_BASE_URL=/api
├── .gitignore
├── index.html                  # Vite 入口
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.ico
│   └── imgs/                   # 静态图片（types/, icons/, blogs/, add.png 等）
└── src/
    ├── main.js                 # 应用入口
    ├── App.vue                 # 根组件
    ├── router/
    │   └── index.js            # 路由定义 + 导航守卫
    ├── store/
    │   ├── index.js            # 创建 Pinia 实例
    │   └── modules/
    │       ├── auth.js         # Token 管理
    │       └── user.js         # 当前用户信息
    ├── api/
    │   ├── request.js          # Axios 实例 + 拦截器
    │   ├── blog/
    │   │   └── index.js        # /blog/* 接口
    │   ├── shop/
    │   │   └── index.js        # /shop/*, /shop-type/* 接口
    │   ├── user/
    │   │   └── index.js        # /user/* 接口
    │   ├── voucher/
    │   │   └── index.js        # /voucher/* 接口
    │   ├── upload/
    │   │   └── index.js        # /upload/* 接口
    │   └── follow/
    │       └── index.js        # /follow/* 接口
    ├── hooks/
    │   ├── useInfiniteScroll.js  # 无限滚动
    │   ├── useSwiper.js          # 触摸滑动（博客图片）
    │   └── useSmsCode.js         # 短信倒计时
    ├── components/
    │   ├── FootBar/
    │   │   └── index.vue         # 底部导航栏
    │   ├── AppHeader/
    │   │   └── index.vue         # 通用顶部栏
    │   ├── LikeSvg/
    │   │   └── index.vue         # SVG 点赞图标
    │   ├── UserAvatar/
    │   │   └── index.vue         # 用户头像（含默认图）
    │   ├── BlogCard/
    │   │   └── index.vue         # 博客卡片
    │   └── ImageSwiper/
    │       └── index.vue         # 图片滑动组件
    ├── views/
    │   ├── home/
    │   │   └── index.vue         # 首页（原 index.html）
    │   ├── login/
    │   │   └── index.vue         # 短信登录（原 login.html）
    │   ├── login2/
    │   │   └── index.vue         # 密码登录（原 login2.html）
    │   ├── info/
    │   │   └── index.vue         # 个人主页（原 info.html）
    │   ├── info-edit/
    │   │   └── index.vue         # 编辑资料（原 info-edit.html）
    │   ├── other-info/
    │   │   └── index.vue         # 他人主页（原 other-info.html）
    │   ├── shop-list/
    │   │   └── index.vue         # 商户列表（原 shop-list.html）
    │   ├── shop-detail/
    │   │   └── index.vue         # 商户详情（原 shop-detail.html）
    │   ├── blog-detail/
    │   │   └── index.vue         # 博客详情（原 blog-detail.html）
    │   └── blog-edit/
    │       └── index.vue         # 发布博客（原 blog-edit.html）
    └── assets/
        └── styles/
            ├── main.scss         # 全局重置 + 底部栏样式
            └── element-overrides.scss  # Element Plus 覆盖样式
```

## 关键技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 路由模式 | Hash (`createWebHashHistory`) | 移动端项目，无需服务端配置即可部署 |
| Element Plus | 全局注册 `app.use(ElementPlus)` | 与原项目全局 Element UI 行为一致 |
| CSS 方案 | SCSS + scoped | 遵循参考项目模式；scoped 解决 `.header` 类名冲突 |
| 类型语言 | JavaScript（非 TypeScript） | 原项目为 JS，保持简洁，避免引入 TS 复杂度 |
| 图片滑动 | 自定义 hook（不用库） | 仅 ~80 行原生 DOM 操作，不需要额外依赖 |
| 无限滚动 | 自定义 hook（不用库） | ~10 行逻辑，简单可靠 |
| 路径别名 | `@/` → `src/` | 与参考项目一致 |
| 原 `util` 工具 | `utils/` 目录纯函数模块 | `formatPrice` 为纯函数，`getUrlParam` 改用 `route.query` |

## 转换映射表

### 路由映射

| 原页面 | 路由路径 | 视图文件 | 需要登录 |
|--------|----------|----------|----------|
| `index.html` | `/` | `views/home/index.vue` | 否 |
| `login.html` | `/login` | `views/login/index.vue` | 否 |
| `login2.html` | `/login2` | `views/login2/index.vue` | 否 |
| `info.html` | `/info` | `views/info/index.vue` | 是 |
| `info-edit.html` | `/info-edit` | `views/info-edit/index.vue` | 是 |
| `other-info.html` | `/other-info` | `views/other-info/index.vue` | 否 |
| `shop-list.html` | `/shop-list` | `views/shop-list/index.vue` | 否 |
| `shop-detail.html` | `/shop-detail` | `views/shop-detail/index.vue` | 否 |
| `blog-detail.html` | `/blog-detail` | `views/blog-detail/index.vue` | 否 |
| `blog-edit.html` | `/blog-edit` | `views/blog-edit/index.vue` | 是 |

### Vue 2 → Vue 3 语法映射

| 原写法 | 新写法 |
|--------|--------|
| `new Vue({ el, data, created, methods })` | `<script setup>` + `ref()` / `reactive()` / `onMounted()` |
| `this.$message.error(msg)` | `ElMessage.error(msg)` |
| `this.$refs.xxx` | `const xxx = ref(null)` → `xxx.value` |
| `this.$nextTick(fn)` | `import { nextTick } from 'vue'` |
| `location.href = '/xxx.html'` | `router.push({ name: 'xxx' })` |
| `util.getUrlParam('id')` | `route.query.id` |
| `Vue.component('footBar', {...})` | `FootBar/index.vue` 单文件组件 |
| `.then().catch()` | `async/await` + `try/catch` |

## 实施步骤

### 第 1 步：项目脚手架
- 创建 `package.json`，安装 `vue@^3`、`vue-router@^4`、`pinia`、`element-plus`、`axios`、`sass`
- 安装开发依赖：`vite`、`@vitejs/plugin-vue`
- 创建 `vite.config.js`（配置 `@/` 别名、`/api` 代理到后端、`/imgs` 代理）
- 创建 `.env.development` / `.env.production`
- 创建 `index.html`（Vite 入口）
- 更新 `.gitignore`
- 复制静态资源到 `public/imgs/`

### 第 2 步：核心基础设施
- `src/api/request.js` — Axios 实例 + 拦截器（从 `js/common.js` 迁移）
- `src/store/index.js` — 创建 Pinia 实例
- `src/store/modules/auth.js` — Token 管理（同步 sessionStorage）
- `src/store/modules/user.js` — 当前用户信息
- `src/router/index.js` — 10 条路由 + 登录守卫
- `src/main.js` — 应用入口
- `src/App.vue` — 根组件（`<router-view />`）
- `src/assets/styles/main.scss` — 全局样式（重置、底部栏、Element Plus 覆盖）
- `src/assets/styles/element-overrides.scss` — Element Plus 定制

### 第 3 步：共享组件
- `components/FootBar/index.vue` — 底部导航（从 `js/footer.js` 迁移）
- `components/AppHeader/index.vue` — 通用顶栏（含返回按钮 + 插槽）
- `components/LikeSvg/index.vue` — SVG 点赞图标
- `components/UserAvatar/index.vue` — 用户头像（含默认图 fallback）
- `components/BlogCard/index.vue` — 博客卡片
- `components/ImageSwiper/index.vue` — 图片触摸滑动组件

### 第 4 步：Hooks（组合式函数）
- `hooks/useInfiniteScroll.js` — 无限滚动（首页、商户列表、关注动态 3 处使用）
- `hooks/useSwiper.js` — 触摸滑动（从 `blog-detail.html` 迁移）
- `hooks/useSmsCode.js` — 短信倒计时（从 `login.html` 迁移）

### 第 5 步：API 层
- `api/blog/index.js` — 博客相关接口
- `api/shop/index.js` — 商户/分类接口
- `api/user/index.js` — 用户接口
- `api/voucher/index.js` — 优惠券/秒杀接口
- `api/upload/index.js` — 文件上传接口
- `api/follow/index.js` — 关注接口

### 第 6 步：页面视图（按复杂度从简到繁）
1. `views/login/index.vue` — 短信登录
2. `views/login2/index.vue` — 密码登录
3. `views/home/index.vue` — 首页（分类 + 博客流）
4. `views/shop-list/index.vue` — 商户列表（分类筛选 + 排序 + 无限滚动）
5. `views/shop-detail/index.vue` — 商户详情（信息 + 优惠券秒杀）
6. `views/info-edit/index.vue` — 编辑资料（只读展示）
7. `views/other-info/index.vue` — 他人主页
8. `views/blog-edit/index.vue` — 发布博客（图片上传 + 商户关联弹窗）
9. `views/info/index.vue` — 个人主页（4 个 Tab 页签 + 无限滚动）
10. `views/blog-detail/index.vue` — 博客详情（图片滑动 + 点赞 + 关注，最复杂）

### 第 7 步：验证
- `npm run dev` 启动开发服务器，验证 10 个页面功能正常
- `npm run build` 构建生产包，验证 dist/ 输出

## Axios 拦截器要点（从 js/common.js 迁移）

- **baseURL**：`/api`
- **超时**：2000ms
- **请求拦截器**：从 `sessionStorage` 读取 `token`，设置 `Authorization` 头
- **响应拦截器**：
  - `response.data.success === false` → `Promise.reject(errorMsg)`
  - HTTP 401 → 跳转 `/login`
- **paramsSerializer**：跳过 null/空值参数

## 验证清单

1. 首页分类图标显示、博客流加载、点赞切换
2. 短信验证码发送倒计时、登录成功跳转
3. 密码登录跳转
4. 商户列表按分类筛选、排序、下拉加载更多
5. 商户详情优惠券秒杀（未开始/已结束/库存不足/成功）
6. 个人主页 Tab 切换（笔记/评价/粉丝/关注）
7. 关注动态 Tab 无限滚动 + 下拉刷新
8. 退出登录
9. 他人主页查看、关注/取消关注、共同关注
10. 博客发布（图片上传、商户搜索弹窗）
11. 博客详情图片触摸滑动（边界弹性效果）
12. 博客详情点赞、关注博主
13. 未登录访问需登录页面自动跳转登录页
14. `npm run build` 成功构建
