# SVG Filter Factory

一个强大且易用的 SVG 过滤器工厂库，支持可视化创建、存储和渲染复杂的 SVG 过滤器效果。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-green)](https://vuejs.org/)

## 📖 背景知识

想要深入了解 SVG Filter 的历史、设计理念和技术演进？

**👉 [阅读 Warm-up 文档：SVG Filter 技术分享](./warm-up.md)**

这份文档从主讲人的视角讲述：
- 🎭 传统样式的局限性
- 🌟 SVG Filter 的诞生与发展历程
- 🎨 17 种基元的分类与应用
- ⚠️ 技术局限性与解决方案
- 🔮 未来技术展望

## 🌟 在线演示

**👉 [立即体验：https://adoin.github.io/svg-filter-factory/](https://adoin.github.io/svg-filter-factory/)**

在线演示包含：
- 📦 经典案例：预设的经典 SVG 过滤器效果
- 🎬 动画案例：结合 GSAP 的动态过滤器动画
- 🛠️ 动态创建：可视化表单创建自定义过滤器
- 📋 JSON 导入：从剪贴板快速导入过滤器配置

## 项目结构

这是一个 pnpm monorepo 项目，包含以下包：

- **[@svg-filter-factory/core](./packages/core)** - 核心库，提供 SVG 过滤器的注册和渲染功能
- **[@svg-filter-factory/demo](./packages/demo)** - Vue3 演示应用，展示如何使用核心库

## 特性

✨ **完整的 SVG 过滤器支持**
- 支持全部 17 种 SVG 过滤器基元类型
- 支持多个子过滤器的链式组合

💾 **智能存储**
- 每个 filter ID 对应独立的 localStorage key
- 格式：`__svg_filter_factory_{filterId}`

🎨 **动态创建**
- 提供可视化表单界面
- 实时代码预览
- 支持复杂过滤器组合

🚀 **按需渲染**
- 只渲染需要的过滤器
- 避免重复渲染
- 自动错误提示

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 构建核心库

```bash
pnpm --filter @svg-filter-factory/core build
```

### 运行演示

```bash
pnpm dev
```

演示应用将在 `http://localhost:3000` 启动（如果端口被占用会自动切换）。

## 使用示例

### 基础用法

```typescript
import { register, render } from '@svg-filter-factory/core'

// 注册过滤器
register({
  id: 'my-blur',
  config: [
    {
      type: 'feGaussianBlur',
      props: { stdDeviation: 5 }
    }
  ]
})

// 渲染到 DOM
render('my-blur')

// 在 HTML/SVG 中使用
// <circle filter="url(#my-blur)" ... />
```

### 复杂组合

```typescript
// 发光效果
register({
  id: 'glow',
  config: [
    {
      type: 'feGaussianBlur',
      in: 'SourceAlpha',
      result: 'blur',
      props: { stdDeviation: 4 }
    },
    {
      type: 'feFlood',
      result: 'color',
      props: { floodColor: '#00ff00', floodOpacity: 0.8 }
    },
    {
      type: 'feComposite',
      result: 'glow',
      props: { operator: 'in', in: 'color', in2: 'blur' }
    },
    {
      type: 'feMerge',
      props: { inputs: ['glow', 'SourceGraphic'] }
    }
  ]
})

render('glow')
```

## 核心 API

### register(filters)

注册过滤器配置到 localStorage。

- 参数：`FilterDefinition | FilterDefinition[]`
- 支持单个或批量注册

### render(filterIds)

渲染指定的过滤器到 DOM。

- 参数：`string | string[]`
- 如果配置不存在会输出错误日志
- 已渲染的过滤器会自动跳过

### 其他辅助方法

- `getRegisteredFilters()` - 获取所有已注册的过滤器
- `getFilter(filterId)` - 获取指定过滤器
- `isRegistered(filterId)` - 检查过滤器是否已注册
- `unregister(filterId)` - 注销指定过滤器
- `clearFilters()` - 清除所有过滤器

## 支持的过滤器类型

| 类型 | 说明 |
|------|------|
| `feGaussianBlur` | 高斯模糊 |
| `feDropShadow` | 投影 |
| `feMorphology` | 变形 |
| `feOffset` | 偏移 |
| `feColorMatrix` | 颜色矩阵 |
| `feComponentTransfer` | 组件转换 |
| `feFlood` | 填充 |
| `feBlend` | 混合 |
| `feComposite` | 合成 |
| `feMerge` | 合并 |
| `feTurbulence` | 湍流 |
| `feConvolveMatrix` | 卷积矩阵 |
| `feDisplacementMap` | 置换映射 |
| `feSpecularLighting` | 镜面光照 |
| `feDiffuseLighting` | 漫反射光照 |
| `feTile` | 平铺 |
| `feImage` | 图像 |

## 📖 使用说明

### 核心库使用

#### 1. 安装核心库

```bash
npm install @svg-filter-factory/core
# 或
pnpm add @svg-filter-factory/core
```

#### 2. 基础用法

```typescript
import { register, render } from '@svg-filter-factory/core'

// 1. 注册过滤器
register({
  id: 'my-filter',
  config: [
    { type: 'feGaussianBlur', props: { stdDeviation: '5,5' } }
  ]
})

// 2. 渲染到 DOM
render('my-filter')

// 3. 在 CSS 中使用
element.style.filter = 'url(#my-filter)'
```

#### 3. 高级用法：链式组合

```typescript
// 创建复杂的发光效果
register({
  id: 'advanced-glow',
  config: [
    {
      type: 'feGaussianBlur',
      props: { stdDeviation: '3,3' },
      in: 'SourceAlpha',
      result: 'blur'
    },
    {
      type: 'feFlood',
      props: { floodColor: '#00ff00', floodOpacity: 0.8 },
      result: 'color'
    },
    {
      type: 'feComposite',
      props: { operator: 'in', in: 'color', in2: 'blur' },
      result: 'glow'
    },
    {
      type: 'feMerge',
      props: { inputs: ['glow', 'SourceGraphic'] }
    }
  ]
})
```

#### 4. 动态更新过滤器

```typescript
import { updateFilterConfig, updateFilterDom } from '@svg-filter-factory/core'

// 永久更新（同时更新 DOM 和 localStorage）
updateFilterConfig('my-filter', 'blur', 'stdDeviation', '10,10')

// 临时更新（仅更新 DOM）
updateFilterDom('my-filter', 'blur', 'stdDeviation', '10,10')
```

#### 5. 配合 GSAP 实现动画

```typescript
import { updateFilterConfig } from '@svg-filter-factory/core'
import gsap from 'gsap'

// 模糊值动画
gsap.to({}, {
  duration: 2,
  repeat: -1,
  yoyo: true,
  onUpdate: function() {
    const blur = this.progress() * 10
    updateFilterConfig('my-filter', 'blur', 'stdDeviation', `${blur},${blur}`)
  }
})
```

### 演示应用使用指南

#### 🏠 主页功能

**1. 快速示例区**
- 一键注册预设的示例过滤器
- 包含模糊、阴影、发光等常用效果
- 点击"渲染并应用"查看效果
- 支持复制配置、删除过滤器

**2. 动态创建过滤器**
- 可视化表单配置过滤器参数
- 实时预览效果
- 实时代码生成
- 支持多个子过滤器链式组合
- 支持从剪贴板导入 JSON 配置

**3. 效果预览面板**（右侧固定）
- 实时预览过滤器效果
- 支持多种预览元素（SVG、文本、图片）
- 可收缩展开
- 快速切换已注册的过滤器

**4. 操作日志**
- 实时记录所有操作
- 显示时间戳和操作类型
- 支持清空日志

#### 📦 经典案例页面

浏览和学习经典的 SVG 过滤器案例：

- **发光效果** - 柔和的外发光
- **贴图纹理** - 纹理贴图效果
- **浮雕效果** - 3D 立体浮雕
- **描边效果** - 清晰的外边框
- **锐化效果** - 增强图像清晰度
- **挖孔效果** - 黑色区域挖空
- **彩色阴影** - 内阴影+外发光
- **水渍效果** - 液体飞溅质感
- **LED 霓虹灯** - LED 立体发光
- **俄罗斯方块** - 像素风格立体
- **美漫过场** - 漫画风格扭曲
- **光影文字** - 光影纹理质感

每个案例支持：
- 🔍 预览效果
- 📋 复制代码
- 📄 复制 JSON 配置

#### 🎬 动画案例页面

展示结合 GSAP 的动态过滤器效果：

- **模糊波动** - 高斯模糊值随时间波动
- **色相旋转** - 色相值持续旋转
- **投影移动** - 阴影位置动态变化
- **湍流扭曲** - 湍流种子值变化
- **发光脉冲** - 外发光强度脉冲变化
- **点击扰动** - 按钮点击时产生扰动效果

所有动画自动播放，并提供完整的代码示例。

#### 💡 使用技巧

**快速导入配置**
1. 在"经典案例"页面点击"复制 JSON"
2. 回到主页，点击"从剪贴板导入 JSON"
3. 自动填充表单，修改 ID 后注册

**复制已注册过滤器**
- 点击过滤器卡片上的"复制"按钮
- 自动填充到创建表单
- 修改配置后可创建新的变体

**查看实时效果**
- 动态创建区域会实时显示预览
- 右侧预览面板支持多种预览元素
- 支持在不同元素上查看同一过滤器的效果

## 开发

### 项目命令

```bash
# 安装依赖
pnpm install

# 构建 core 包
pnpm --filter @svg-filter-factory/core build

# 运行 demo
pnpm dev

# 构建所有包
pnpm build

# 清理
pnpm clean
```

### 技术栈

- **Core**: TypeScript + Tsup
- **Demo**: Vue 3 + Vite + TypeScript + Element Plus + UnoCSS
- **Monorepo**: pnpm workspace
- **动画**: GSAP
- **代码高亮**: highlight.js

## 📚 API 参考

### 注册与渲染

| 方法 | 说明 | 参数 |
|------|------|------|
| `register()` | 注册过滤器 | `FilterDefinition \| FilterDefinition[]` |
| `render()` | 渲染过滤器到 DOM | `string \| string[]` |
| `renderAll()` | 渲染所有已注册的过滤器 | - |

### 查询方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `getRegisteredFilters()` | 获取所有已注册的过滤器 | `FilterDefinition[]` |
| `getFilter(id)` | 获取指定过滤器 | `FilterDefinition \| null` |
| `isRegistered(id)` | 检查过滤器是否已注册 | `boolean` |

### 管理方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `deleteFilter(id)` | 删除过滤器（DOM + localStorage） | `string` |
| `clearFilters()` | 清除所有过滤器 | - |

### 更新方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `updateFilterConfig()` | 永久更新过滤器属性 | `filterId, result, attr, value` |
| `updateFilterDom()` | 临时更新过滤器属性 | `filterId, result, attr, value` |

### 类型定义

```typescript
interface FilterDefinition {
  id: string
  config: SubFilter[]
}

interface SubFilter {
  type: FilterType
  props: Record<string, any>
  in?: string
  result?: string
}

type FilterType = 
  | 'feGaussianBlur'
  | 'feDropShadow'
  | 'feMorphology'
  | 'feOffset'
  | 'feColorMatrix'
  | 'feComponentTransfer'
  | 'feFlood'
  | 'feBlend'
  | 'feComposite'
  | 'feMerge'
  | 'feTurbulence'
  | 'feConvolveMatrix'
  | 'feDisplacementMap'
  | 'feSpecularLighting'
  | 'feDiffuseLighting'
  | 'feTile'
  | 'feImage'
```

## 🎯 使用场景

- 🖼️ **图像处理** - 为图片添加模糊、锐化、色彩调整等效果
- 🎨 **UI 装饰** - 为网页元素添加阴影、发光、纹理等视觉效果
- 🎬 **动画效果** - 结合 GSAP 实现动态过滤器动画
- 🎮 **游戏开发** - 为游戏元素添加特效
- 📊 **数据可视化** - 增强图表和数据展示的视觉效果

## 🚀 性能优化

- ✅ 过滤器配置存储在 localStorage，页面刷新后保留
- ✅ 已渲染的过滤器会被缓存，避免重复渲染
- ✅ 支持按需渲染，只渲染需要的过滤器
- ✅ 使用原子化 CSS（UnoCSS）优化样式性能

## 📝 常见问题

**Q: 如何在项目中使用已创建的过滤器？**

A: 有两种方式：
1. **CSS 方式**: `element.style.filter = 'url(#my-filter)'`
2. **SVG 属性**: `<circle filter="url(#my-filter)" />`

**Q: 过滤器配置存储在哪里？**

A: 存储在浏览器的 localStorage 中，格式为 `__svg_filter_factory_{filterId}`

**Q: 如何导出和分享过滤器配置？**

A: 使用演示应用的"复制 JSON"功能，将配置复制后分享给他人，对方可以通过"从剪贴板导入 JSON"功能导入。

**Q: 过滤器不生效怎么办？**

A: 检查以下几点：
1. 确保调用了 `render()` 方法
2. 检查过滤器 ID 是否正确
3. 确认 DOM 中已生成对应的 `<filter>` 元素
4. 查看浏览器控制台是否有错误信息

## 🌐 浏览器兼容性

支持所有现代浏览器：
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ✅ Edge 80+

## 📦 部署

演示应用使用 GitHub Pages 自动部署：

```bash
# 构建项目
pnpm build

# 部署到 GitHub Pages（自动触发）
git push origin main
```

## 许可

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！

## 致谢

感谢所有为这个项目做出贡献的开发者！
