# SVG Filter Factory - 更新 API 文档

## 新增方法

### 1. `updateFilterDom` - 临时修改（仅 DOM）

**功能：** 只修改已渲染的 SVG filter 的 DOM 属性，不修改 localStorage 配置。重新渲染后会恢复到配置的原始值。

**使用场景：**
- 临时预览参数调整效果
- 动画效果（实时修改属性）
- 临时测试不同的参数值

**签名：**
```typescript
function updateFilterDom(
  filterId: string,           // 过滤器 ID
  subFilterResult: string,    // 子过滤器的 result 名称
  attrName: string,           // 属性名称（SVG 属性名）
  attrValue: string | number  // 新的属性值
): boolean
```

**示例：**
```javascript
import { updateFilterDom, render } from '@svg-filter-factory/core'

// 临时修改模糊半径（不改变配置）
updateFilterDom('my-blur', 'blur', 'stdDeviation', '10,10')

// 重新渲染会恢复到配置的原始值
render('my-blur')  // stdDeviation 恢复到配置的值
```

---

### 2. `updateFilterConfig` - 永久修改（配置 + DOM）

**功能：** 同时修改 localStorage 配置和 DOM，修改会持久化保存。重新渲染后会保留修改的值。

**使用场景：**
- 保存参数调整
- 永久更新过滤器配置
- 用户界面中的参数编辑

**签名：**
```typescript
function updateFilterConfig(
  filterId: string,       // 过滤器 ID
  subFilterResult: string,// 子过滤器的 result 名称
  propName: string,       // 属性名称（配置属性名）
  propValue: any          // 新的属性值
): boolean
```

**示例：**
```javascript
import { updateFilterConfig, render } from '@svg-filter-factory/core'

// 永久修改模糊半径（同时更新配置和 DOM）
updateFilterConfig('my-blur', 'blur', 'stdDeviation', '10,10')

// 重新渲染会使用更新后的配置
render('my-blur')  // stdDeviation 仍然是 '10,10'
```

---

## 使用示例

### 示例 1：实时预览（临时修改）

```javascript
import { register, render, updateFilterDom } from '@svg-filter-factory/core'

// 注册一个模糊过滤器
register({
  id: 'preview-blur',
  config: [{
    type: 'feGaussianBlur',
    props: { stdDeviation: '2,2' },
    result: 'blur'
  }]
})

render('preview-blur')

// 使用滑块实时预览不同的模糊值
const slider = document.querySelector('#blur-slider')
slider.addEventListener('input', (e) => {
  const value = e.target.value
  // 临时修改，不保存到配置
  updateFilterDom('preview-blur', 'blur', 'stdDeviation', `${value},${value}`)
})

// 用户点击"保存"按钮时才永久保存
document.querySelector('#save-btn').addEventListener('click', () => {
  const value = slider.value
  updateFilterConfig('preview-blur', 'blur', 'stdDeviation', `${value},${value}`)
  console.log('已保存配置')
})
```

### 示例 2：动画效果

```javascript
import { register, render, updateFilterDom } from '@svg-filter-factory/core'

register({
  id: 'animated-blur',
  config: [{
    type: 'feGaussianBlur',
    props: { stdDeviation: '0,0' },
    result: 'blur'
  }]
})

render('animated-blur')

// 创建动画：从清晰到模糊
let blur = 0
const animate = setInterval(() => {
  blur += 0.5
  updateFilterDom('animated-blur', 'blur', 'stdDeviation', `${blur},${blur}`)
  
  if (blur >= 10) {
    clearInterval(animate)
  }
}, 50)
```

### 示例 3：参数编辑器

```javascript
import { 
  register, 
  render, 
  updateFilterDom, 
  updateFilterConfig 
} from '@svg-filter-factory/core'

register({
  id: 'editable-filter',
  config: [
    {
      type: 'feDropShadow',
      props: { 
        dx: 2, 
        dy: 2, 
        stdDeviation: '2,2',
        floodColor: '#000000',
        floodOpacity: 0.5
      },
      result: 'shadow'
    }
  ]
})

render('editable-filter')

// 参数编辑器
class FilterEditor {
  constructor(filterId, subFilterResult) {
    this.filterId = filterId
    this.subFilterResult = subFilterResult
    this.tempChanges = {}
  }
  
  // 临时预览修改
  preview(propName, value) {
    this.tempChanges[propName] = value
    // 将配置属性名转换为 SVG 属性名
    const attrName = this.propToAttr(propName)
    updateFilterDom(this.filterId, this.subFilterResult, attrName, value)
  }
  
  // 保存所有修改
  save() {
    for (const [propName, value] of Object.entries(this.tempChanges)) {
      updateFilterConfig(this.filterId, this.subFilterResult, propName, value)
    }
    this.tempChanges = {}
    console.log('所有修改已保存')
  }
  
  // 取消修改（重新渲染恢复）
  cancel() {
    this.tempChanges = {}
    render(this.filterId)
    console.log('已取消修改')
  }
  
  // 属性名转换
  propToAttr(propName) {
    const map = {
      'floodColor': 'flood-color',
      'floodOpacity': 'flood-opacity'
    }
    return map[propName] || propName
  }
}

// 使用编辑器
const editor = new FilterEditor('editable-filter', 'shadow')

// 用户调整参数时实时预览
document.querySelector('#dx-input').addEventListener('input', (e) => {
  editor.preview('dx', e.target.value)
})

document.querySelector('#dy-input').addEventListener('input', (e) => {
  editor.preview('dy', e.target.value)
})

// 保存或取消
document.querySelector('#save-btn').addEventListener('click', () => {
  editor.save()
})

document.querySelector('#cancel-btn').addEventListener('click', () => {
  editor.cancel()
})
```

---

## 注意事项

### 1. 属性名称转换

某些属性在配置中使用驼峰命名，但在 SVG 中使用连字符命名：

| 配置属性名 (propName) | SVG 属性名 (attrName) |
|----------------------|----------------------|
| `floodColor`         | `flood-color`        |
| `floodOpacity`       | `flood-opacity`      |
| `stdDeviation`       | `stdDeviation`       |
| `dx`, `dy`           | `dx`, `dy`          |

**解决方案：**
- `updateFilterDom`: 直接使用 SVG 属性名（如 `flood-color`）
- `updateFilterConfig`: 使用配置属性名（如 `floodColor`），方法内部会自动转换

### 2. result 别名

两个方法都通过 `subFilterResult` 参数来定位子过滤器，这个值必须与子过滤器的 `result` 属性匹配：

```javascript
register({
  id: 'my-filter',
  config: [{
    type: 'feGaussianBlur',
    props: { stdDeviation: '2,2' },
    result: 'blur'  // ← 这个值
  }]
})

// 使用时必须匹配
updateFilterDom('my-filter', 'blur', 'stdDeviation', '5,5')
                         // ↑ 必须匹配
```

### 3. 返回值

两个方法都返回 `boolean`：
- `true`: 操作成功
- `false`: 操作失败（可能是找不到过滤器或子过滤器）

### 4. 错误处理

方法内部会输出 console.error，建议在生产环境中捕获返回值：

```javascript
const success = updateFilterConfig('my-filter', 'blur', 'stdDeviation', '10,10')
if (!success) {
  console.error('更新失败')
  // 处理错误情况
}
```

---

## 完整示例项目

参见 `packages/demo/src/App.vue` 中的完整集成示例。

