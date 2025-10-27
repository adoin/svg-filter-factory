# 更新日志

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


