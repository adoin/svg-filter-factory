import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  shortcuts: {
    // 自定义快捷方式
    'btn': 'px-4 py-2 rounded cursor-pointer transition-all duration-200',
    'input-base': 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
  },
  theme: {
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
    },
  },
  safelist: [
    // 保护 Element Plus 的类名
    'el-button',
    'el-input',
    'el-select',
  ],
  // 排除 Element Plus 组件，避免样式冲突
  exclude: [
    'node_modules/**',
  ],
})

