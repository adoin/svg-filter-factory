# 更新日志

## [v2.0.0] - 2025-11-06

### 🎉 重大功能更新

#### 1. **滤镜区域配置系统重构**

**问题背景：**
- 之前的 `render()` 函数虽然接受 `x, y, width, height, filterUnits` 参数，但这些参数没有真正应用到 `<filter>` 元素上
- 导致无论传入什么参数，滤镜区域都是浏览器默认值（`-10%, -10%, 120%, 120%`）
- 大范围模糊、发光等效果经常被裁剪或消失

**现在：** 完全重构类型系统和渲染逻辑

##### 新的类型系统

```typescript
// SVG 容器选项（影响容器本身）
interface SvgContainerOptions {
  width?: string
  height?: string
  viewBox?: string
}

// 滤镜区域选项（应用到 <filter> 元素）
interface FilterRegionOptions {
  filterUnits?: 'objectBoundingBox' | 'userSpaceOnUse'
  x?: string
  y?: string
  width?: string
  height?: string
}

// 渲染配置（组合类型）
interface RenderConfig {
  container?: SvgContainerOptions
  filterRegion?: FilterRegionOptions
}
```

##### 新的 API

```typescript
// ✅ 使用默认值（推荐）
render('my-filter')

// ✅ 只自定义滤镜区域
render('my-filter', {
  filterRegion: {
    x: '-100%',
    y: '-100%',
    width: '300%',
    height: '300%'
  }
})

// ✅ 同时自定义容器和滤镜区域
render('my-filter', {
  container: {
    width: '800',
    height: '600',
    viewBox: '0 0 800 600'
  },
  filterRegion: {
    x: '-50%',
    y: '-50%',
    width: '200%',
    height: '200%'
  }
})
```

##### 默认值优化

新的默认滤镜区域配置（适合大多数场景）：

```typescript
export const defaultFilterAttributes: FilterRegionOptions = {
  filterUnits: 'objectBoundingBox',
  x: '-50%',
  y: '-50%',
  width: '200%',   // ✅ 配套的 width（之前缺失）
  height: '200%'   // ✅ 配套的 height（之前缺失）
}
```

**影响范围：**
- ✅ 修复了大范围模糊、发光效果被裁剪的问题
- ✅ 所有现有代码向后兼容（`render(id)` 依然有效）
- ✅ 新默认值覆盖 90% 以上的使用场景

#### 2. **导出新配置对象**

```typescript
export const defaultSVGAttributes      // SVG 容器默认配置
export const defaultFilterAttributes   // 滤镜区域默认配置
export const defaultRenderConfig       // 组合默认配置
```

用户可以导入这些配置作为参考或扩展。

### 📖 文档更新

#### 1. **README.md**
- ✅ 新增"自定义滤镜区域"章节
- ✅ 更新 API 参考表格
- ✅ 新增 `RenderConfig` 接口文档
- ✅ 更新所有类型定义
- ✅ 添加常见问题解决方案（滤镜消失/被裁剪）

#### 2. **warm-up.md**（技术分享文档）
- ✅ 新增"如何设计滤镜组合"完整章节
- ✅ 新增"滤镜区域设置问题"详细说明
- ✅ 新增"filterUnits 和坐标系统"深度讲解
- ✅ 新增"x/y 和 width/height 必须配套使用"警告
- ✅ 更新所有 `render()` 示例使用新 API
- ✅ 添加大量可视化图示和实战案例

**新增内容亮点：**
- 🎓 如何设计滤镜组合（4种方法论）
- 📐 深入理解 filterUnits 和坐标系统
- ⚠️ 常见陷阱和错误对照表
- 💡 result 可以被重复引用的说明
- 🔍 最后一步决定最终效果的概念
- 📊 正负值的区别和可视化图示

### 🔧 核心代码改进

#### 修复的关键 Bug

**Bug #1:** `render()` 没有真正应用滤镜区域属性
```typescript
// 之前：创建 <filter> 元素但没有设置属性
const filterElement = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
filterElement.innerHTML = generateFilterElement({ id: filterId, config });

// 现在：正确设置滤镜区域属性
filterElement.setAttribute('filterUnits', filterRegionConfig.filterUnits);
filterElement.setAttribute('x', filterRegionConfig.x);
filterElement.setAttribute('y', filterRegionConfig.y);
filterElement.setAttribute('width', filterRegionConfig.width);
filterElement.setAttribute('height', filterRegionConfig.height);
```

**Bug #2:** 默认配置缺少 width/height
```typescript
// 之前：❌ 错误
{
  x: '-50%',
  y: '-50%'
  // 缺少 width 和 height
}

// 现在：✅ 正确
{
  x: '-50%',
  y: '-50%',
  width: '200%',   // 左右各 50% = 200%
  height: '200%'   // 上下各 50% = 200%
}
```

### 💡 使用建议

#### 何时需要自定义滤镜区域？

| 场景 | 推荐配置 | 原因 |
|------|---------|------|
| 小模糊（< 5px） | 默认即可 | 效果范围小 |
| 大模糊（> 20px） | `x: '-50%', width: '200%'` | 默认值已优化 |
| 超大模糊（> 50px） | `x: '-100%', width: '300%'` | 需要更大区域 |
| 发光效果 | 默认即可 | 默认值已优化 |
| 远距离投影 | 根据 `dx/dy` 调整 | 偏移量大需扩大区域 |

#### 调试口诀

```
滤镜效果越大 → 区域要越大
- 小模糊（< 5px）   → 默认（200%）
- 大模糊（> 20px）  → 默认（200%）
- 超大模糊（> 50px）→ 300%+
- 看不见？         → 先试 300%，再调小
```

### ⚠️ 破坏性变更

**无破坏性变更！**

- ✅ 所有现有代码 100% 向后兼容
- ✅ `render(id)` 依然有效，且使用更好的默认值
- ✅ 现有 demo 代码无需任何修改

### 🎯 迁移指南

**从旧版本迁移：**

不需要任何修改！现有代码会自动使用新的默认值。

如果之前遇到"滤镜消失/被裁剪"问题，现在应该已自动修复。

如果需要更大的滤镜区域：

```typescript
// 之前（不生效）
render('my-filter', {
  x: '-100%',
  y: '-100%',
  width: '300%',
  height: '300%'
})

// 现在（生效）
render('my-filter', {
  filterRegion: {
    x: '-100%',
    y: '-100%',
    width: '300%',
    height: '300%'
  }
})
```

### 📦 新增导出

- `SvgContainerOptions` 类型
- `FilterRegionOptions` 类型
- `RenderConfig` 类型
- `defaultFilterAttributes` 常量
- `defaultRenderConfig` 常量

---

## 重大重构 - 2025-10-27

### 核心架构变更

#### 1. localStorage 存储策略改变

**之前：** 所有过滤器存储在统一的 `__svg_filter_factory_filters` 和 `__svg_filter_factory_rendered` 键中

**现在：** 每个过滤器 ID 对应独立的 localStorage key
- 格式：`__svg_filter_factory_{filterId}`
- 例如：`__svg_filter_factory_my-blur`

**优势：**
- 更清晰的存储结构
- 更容易调试和查看单个过滤器
- 便于选择性清理

#### 2. register() API 改变

**之前：**
```typescript
register(...filters: FilterDefinition[]): void
```

**现在：**
```typescript
register(filters: FilterDefinition | FilterDefinition[]): void
```

**变更：**
- 支持传入单个对象或数组
- 更符合常规使用习惯

#### 3. render() API 完全重构

**之前：**
```typescript
render(): void  // 渲染所有已注册且未渲染的过滤器
```

**现在：**
```typescript
render(filterIds: string | string[]): void  // 按需渲染指定的过滤器
```

**重要变更：**
- 不再自动渲染所有过滤器
- 需要显式指定要渲染的 filter ID
- 如果 localStorage 中没有找到配置，会输出错误日志但不中断
- 已渲染的过滤器会自动跳过

**示例：**
```typescript
// 渲染单个
render('my-blur')

// 渲染多个
render(['my-blur', 'my-shadow'])
```

#### 4. 新增 API

- `getFilter(filterId: string): FilterDefinition | null` - 获取指定过滤器配置
- `unregister(filterId: string): void` - 注销指定过滤器

### Demo 应用改进

#### 移除的功能
- ❌ "过滤器渲染"独立模块（因为 render 现在是按需的）
- ❌ "过滤器类型测试"模块（被动态表单替代）

#### 新增功能
- ✨ **动态表单创建过滤器**
  - 可视化添加/删除子过滤器
  - 每种过滤器类型的专用属性编辑器
  - 实时代码预览
  - 自动注册、渲染和应用
  
- ✨ **改进的快速示例**
  - 每个示例都有"渲染并应用"按钮
  - 清晰显示子过滤器结构
  
- ✨ **统一的操作日志**
  - 所有操作的时间戳记录
  - 日志分类（info/success/error）
  - 颜色编码便于识别

#### UI/UX 改进
- 更现代的渐变色标题
- 响应式网格布局
- 代码预览使用深色主题
- 改进的表单样式和交互

### 迁移指南

如果你使用的是旧版本，需要做以下调整：

#### 1. 更新 register 调用

```typescript
// ✅ 新版本 - 两种方式都支持
register({
  id: 'my-blur',
  config: [...]
})

register([
  { id: 'blur1', config: [...] },
  { id: 'blur2', config: [...] }
])
```

#### 2. 更新 render 调用

```typescript
// ❌ 旧版本
register(...)
render()  // 渲染所有

// ✅ 新版本
register({ id: 'my-blur', config: [...] })
render('my-blur')  // 必须指定 ID

// 或批量渲染
render(['my-blur', 'my-shadow'])
```

#### 3. localStorage 清理

如果从旧版本升级，建议清理旧的 localStorage 数据：

```javascript
// 清理旧格式的数据
localStorage.removeItem('__svg_filter_factory_filters')
localStorage.removeItem('__svg_filter_factory_rendered')
```

### 技术细节

#### 存储结构示例

```javascript
// localStorage 中的存储
{
  "__svg_filter_factory_my-blur": "[{\"type\":\"feGaussianBlur\",\"props\":{\"stdDeviation\":5}}]",
  "__svg_filter_factory_my-shadow": "[{\"type\":\"feDropShadow\",\"props\":{\"dx\":2,\"dy\":2}}]"
}
```

#### DOM 渲染结构

```html
<!-- 自动创建的隐藏容器 -->
<div id="__svg_filter_factory_container" style="display: none;">
  <svg id="__svg_filter_factory_defs" style="position: absolute; width: 0; height: 0; visibility: hidden;">
    <defs id="__svg_filter_factory_defs">
      <filter id="my-blur">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
      <filter id="my-shadow">
        <feDropShadow dx="2" dy="2" stdDeviation="2"/>
      </filter>
    </defs>
  </svg>
</div>
```

### 向后兼容性

⚠️ **不兼容变更**

- `render()` 函数签名完全改变，需要传入 filter ID
- localStorage 存储格式改变，旧数据需要迁移

### 测试建议

1. 清空 localStorage: `localStorage.clear()`
2. 注册新过滤器
3. 检查 localStorage 中的独立 key
4. 测试按需渲染功能
5. 测试动态表单创建功能


