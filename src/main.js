import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  ChatDotRound,
  ChatSquare,
  Clock,
  Close,
  Edit,
  HomeFilled,
  InfoFilled,
  MapLocation,
  Search,
  UserFilled
} from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import store from './store'
import router from './router'
import './assets/styles/main.scss'
import './assets/styles/element-overrides.scss'

const app = createApp(App)
Object.entries({
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  ChatDotRound,
  ChatSquare,
  Clock,
  Close,
  Edit,
  HomeFilled,
  InfoFilled,
  MapLocation,
  Search,
  UserFilled
}).forEach(([name, component]) => {
  app.component(name, component)
})
app.use(store)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
