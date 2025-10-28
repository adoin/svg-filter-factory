# @svg-filter-factory/core

SVG Filter Factory 核心库 - 一个用于注册、存储和渲染 SVG 过滤器的 TypeScript 库。

## 特性

- 🎨 支持全部 17 种 SVG 过滤器基元类型
- 🔗 支持过滤器链式组合（通过 `in` 和 `result` 属性）
- 💾 自动持久化到 localStorage（每个 filter ID 独立存储）
- 🚀 按需渲染到 DOM
- 📦 零依赖
- 🔷 完整的 TypeScript 类型支持

## 安装

```bash
pnpm add @svg-filter-factory/core
```

## 核心概念

### 存储策略

每个过滤器 ID 对应一个独立的 localStorage key：
- 格式：`__svg_filter_factory_{filterId}`
- 例如：ID 为 `my-blur` 的过滤器会存储在 `__svg_filter_factory_my-blur`

### API 设计

1. **register()** - 注册过滤器配置到 localStorage
2. **render()** - 从 localStorage 读取配置并渲染到 DOM

## 快速开始

```typescript
import { register, render } from '@svg-filter-factory/core'

// 1. 注册一个简单的模糊过滤器
register({
  id: 'my-blur',
  config: [
    {
      type: 'feGaussianBlur',
      props: { stdDeviation: 5 }
    }
  ]
})

// 2. 渲染到 DOM
render('my-blur')

// 3. 在 HTML/SVG 中使用
// <circle filter="url(#my-blur)" ... />
```

## API 文档

### register(filters)

注册一个或多个过滤器配置到 localStorage。

**参数：**
- `filters: FilterDefinition | FilterDefinition[]` - 单个或多个过滤器定义

**示例：**

```typescript
// 注册单个过滤器
register({
  id: 'my-blur',
  config: [
    { type: 'feGaussianBlur', props: { stdDeviation: 3 } }
  ]
})

// 注册多个过滤器
register([
  {
    id: 'blur',
    config: [{ type: 'feGaussianBlur', props: { stdDeviation: 5 } }]
  },
  {
    id: 'shadow',
    config: [{ type: 'feDropShadow', props: { dx: 2, dy: 2, stdDeviation: 2 } }]
  }
])
```

### render(filterIds)

从 localStorage 读取配置并渲染指定的过滤器到 DOM。

**参数：**
- `filterIds: string | string[]` - 单个或多个过滤器 ID

**行为：**
- 如果 filter 已经渲染，则跳过
- 如果 localStorage 中没有找到配置，则输出错误日志但不渲染

**示例：**

```typescript
// 渲染单个过滤器
render('my-blur')

// 渲染多个过滤器
render(['my-blur', 'my-shadow'])
```

### getRegisteredFilters()

获取所有已注册的过滤器配置。

**返回：** `FilterDefinition[]`

```typescript
const filters = getRegisteredFilters()
console.log(filters) // [{ id: 'my-blur', config: [...] }, ...]
```

### getFilter(filterId)

获取指定过滤器的配置。

**参数：**
- `filterId: string` - 过滤器 ID

**返回：** `FilterDefinition | null`

```typescript
const filter = getFilter('my-blur')
if (filter) {
  console.log(filter.config)
}
```

### isRegistered(filterId)

检查指定过滤器是否已注册。

**参数：**
- `filterId: string` - 过滤器 ID

**返回：** `boolean`

```typescript
if (isRegistered('my-blur')) {
  console.log('过滤器已注册')
}
```

### unregister(filterId)

注销指定的过滤器（从 localStorage 和 DOM 中删除）。

**参数：**
- `filterId: string` - 过滤器 ID

```typescript
unregister('my-blur')
```

### clearFilters()

清除所有已注册的过滤器。

```typescript
clearFilters()
```

## 复杂示例

### 发光效果（多个子过滤器链式组合）

```typescript
register({
  id: 'glow-effect',
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

render('glow-effect')
```

### 湍流纹理效果

```typescript
register({
  id: 'turbulence-effect',
  config: [
    {
      type: 'feTurbulence',
      result: 'noise',
      props: { type: 'fractalNoise', baseFrequency: 0.05, numOctaves: 3 }
    },
    {
      type: 'feBlend',
      props: { mode: 'multiply', in: 'SourceGraphic', in2: 'noise' }
    }
  ]
})

render('turbulence-effect')
```

## 支持的过滤器类型

| 类型 | 说明 | 主要属性 |
|------|------|----------|
| `feGaussianBlur` | 高斯模糊 | `stdDeviation`, `edgeMode` |
| `feDropShadow` | 投影 | `dx`, `dy`, `stdDeviation` |
| `feMorphology` | 变形 | `operator`, `radius` |
| `feOffset` | 偏移 | `dx`, `dy` |
| `feColorMatrix` | 颜色矩阵 | `type`, `values` |
| `feComponentTransfer` | 组件转换 | `type`, `slope`, `intercept` |
| `feFlood` | 填充 | `floodColor`, `floodOpacity` |
| `feBlend` | 混合 | `mode`, `in`, `in2` |
| `feComposite` | 合成 | `operator`, `in`, `in2` |
| `feMerge` | 合并 | `inputs` |
| `feTurbulence` | 湍流 | `type`, `baseFrequency`, `numOctaves` |
| `feConvolveMatrix` | 卷积矩阵 | `order`, `kernelMatrix`, `bias` |
| `feDisplacementMap` | 置换映射 | `scale`, `xChannelSelector`, `yChannelSelector` |
| `feSpecularLighting` | 镜面光照 | `surfaceScale`, `specularConstant`, `specularExponent` |
| `feDiffuseLighting` | 漫反射光照 | `surfaceScale`, `diffuseConstant` |
| `feTile` | 平铺 | 无主要属性 |
| `feImage` | 图像 | `href` |

## TypeScript 类型

```typescript
interface SubFilter {
  type: FilterType
  props?: FilterProps
  in?: string      // 输入源，如 'SourceGraphic', 'SourceAlpha' 或其他 result 名称
  result?: string  // 输出名称，用于后续过滤器引用
}

interface FilterDefinition {
  id: string
  config: SubFilter[]
}
```

## 许可

MIT
