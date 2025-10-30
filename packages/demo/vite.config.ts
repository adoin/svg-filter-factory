import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  // 为 GitHub Pages 子路径部署设置 base
  // 站点地址: https://<user>.github.io/svg-filter-factory/
  // 需使用以仓库名为前缀的子路径
  base: '/svg-filter-factory/',
  plugins: [
    vue(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3812,
    open: true
  }
})
