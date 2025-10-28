# SVG Filter Factory

一个用于注册、存储和渲染 SVG 过滤器的 TypeScript 库，支持复杂的过滤器链式组合。

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

## 演示应用功能

1. **快速示例** - 预设的常用过滤器效果
2. **SVG 预览** - 实时查看过滤器效果
3. **动态创建** - 可视化表单创建复杂过滤器
4. **代码预览** - 实时生成对应的注册代码
5. **操作日志** - 查看所有操作的详细日志

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
- **Demo**: Vue 3 + Vite + TypeScript
- **Monorepo**: pnpm workspace

## 许可

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
