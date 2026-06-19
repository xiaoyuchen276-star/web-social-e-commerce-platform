import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT) || 80,
      proxy: {
        '/api': {
          target: env.VITE_APP_BASE_URI || 'http://192.168.50.115:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
        // /imgs 开发时由 Vite 静态服务提供，不代理到后端
      }
    },
    base: env.VITE_APP_CONTEXT_PATH || '/'
  }
})
