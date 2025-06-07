import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    }),
    vueJsx(),
    vueDevTools(),
    svgLoader(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 代理百度天气API请求
      '/api/weather': {
        target: 'https://api.map.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, '/weather/v1'),
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('天气API代理错误:', err)
          })
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('天气API代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('天气API代理响应:', proxyRes.statusCode, req.url)
          })
        }
      },
      // 代理百度逆地理编码API请求
      '/api/geocode': {
        target: 'https://api.map.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geocode/, '/reverse_geocoding/v3'),
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('逆地理编码API代理错误:', err)
          })
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('逆地理编码API代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('逆地理编码API代理响应:', proxyRes.statusCode, req.url)
          })
        }
      }
    }
  }
})
