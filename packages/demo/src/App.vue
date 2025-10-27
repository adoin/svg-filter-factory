<template>
  <div class="app">
    <header class="header">
      <h1>SVG Filter Factory Demo</h1>
      <p>演示SVG过滤器的注册、渲染和动态创建 - 基于17种SVG过滤器类型</p>
    </header>

    <main class="main">
      <!-- 1. 快速示例区 -->
      <section class="demo-section">
        <h2>快速示例</h2>
        <div class="quick-demo">
          <button @click="registerSampleFilters" class="btn">
            注册示例过滤器
          </button>
          <button @click="clearAllFilters" class="btn btn-danger">
            清除所有过滤器
          </button>
          <div v-if="registeredFilters.length > 0" class="registered-filters">
            <h3>已注册的过滤器：</h3>
            <div class="filter-cards">
              <div v-for="filter in registeredFilters" :key="filter.id" class="filter-card">
                <div class="filter-card-header">
                  <strong class="filter-id">{{ filter.id }}</strong>
                  <span class="filter-count">{{ filter.config.length }} 个子过滤器</span>
                </div>
                <div class="filter-card-details">
                  <div v-for="(sub, idx) in filter.config" :key="idx" class="sub-filter-detail">
                    <span class="sub-filter-index">{{ idx + 1 }}.</span>
                    <span class="sub-filter-type">{{ sub.type }}</span>
                    <span v-if="sub.result" class="sub-filter-attr">→ {{ sub.result }}</span>
                    <span v-if="sub.in" class="sub-filter-attr">(in: {{ sub.in }})</span>
                  </div>
                </div>
                <div class="filter-card-actions">
                  <button @click="renderAndApplyFilter(filter.id)" class="btn btn-small btn-apply">
                    渲染并应用
                  </button>
                  <button @click="renderFilter(filter.id)" class="btn btn-small btn-secondary">
                    仅渲染
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. SVG预览区 -->
      <section class="demo-section">
        <h2>SVG元素预览</h2>
        <div class="svg-demo">
          <div class="svg-canvas">
            <svg width="500" height="350" viewBox="0 0 500 350">
              <circle 
                id="demo-circle" 
                cx="120" 
                cy="120" 
                r="60" 
                fill="#4CAF50"
                :filter="currentFilter"
              />
              
              <rect 
                id="demo-rect" 
                x="250" 
                y="60" 
                width="120" 
                height="120" 
                fill="#2196F3"
                :filter="currentFilter"
              />
              
              <polygon 
                id="demo-polygon" 
                points="100,280 150,220 200,280 150,340" 
                fill="#FF9800"
                :filter="currentFilter"
              />
              
              <text x="300" y="280" font-size="48" fill="#E91E63" :filter="currentFilter">
                TEXT
              </text>
            </svg>
          </div>
          
          <div class="filter-controls">
            <h3>选择过滤器</h3>
            <div class="filter-selector">
              <button 
                @click="applyFilter('')" 
                :class="{ active: currentFilter === '' }" 
                class="btn btn-filter"
              >
                无过滤器
              </button>
              <button 
                v-for="filter in renderedFilters" 
                :key="filter"
                @click="applyFilter(`url(#${filter})`)" 
                :class="{ active: currentFilter === `url(#${filter})` }" 
                class="btn btn-filter"
              >
                {{ filter }}
              </button>
            </div>
            <p class="current-filter-info">
              <strong>当前应用：</strong> 
              <code>{{ currentFilter || '无' }}</code>
            </p>
          </div>
        </div>
      </section>

      <!-- 3. 动态表单创建过滤器 -->
      <section class="demo-section">
        <h2>动态创建过滤器</h2>
        <div class="filter-builder">
          <div class="builder-controls">
            <div class="form-group">
              <label>过滤器 ID:</label>
              <input v-model="newFilterId" type="text" placeholder="例如: my-custom-filter" />
            </div>
            
            <div class="sub-filters">
              <h3>子过滤器列表：</h3>
              <div v-for="(subFilter, index) in newSubFilters" :key="index" class="sub-filter-item">
                <div class="sub-filter-header">
                  <span>子过滤器 {{ index + 1 }}</span>
                  <button @click="removeSubFilter(index)" class="btn btn-danger btn-small">删除</button>
                </div>
                
                <div class="form-group">
                  <label>类型:</label>
                  <select v-model="subFilter.type">
                    <option value="">选择类型...</option>
                    <option value="feGaussianBlur">高斯模糊 (feGaussianBlur)</option>
                    <option value="feDropShadow">投影 (feDropShadow)</option>
                    <option value="feMorphology">形态学 (feMorphology)</option>
                    <option value="feOffset">偏移 (feOffset)</option>
                    <option value="feColorMatrix">颜色矩阵 (feColorMatrix)</option>
                    <option value="feComponentTransfer">组件转换 (feComponentTransfer)</option>
                    <option value="feFlood">填充 (feFlood)</option>
                    <option value="feBlend">混合 (feBlend)</option>
                    <option value="feComposite">合成 (feComposite)</option>
                    <option value="feMerge">合并 (feMerge)</option>
                    <option value="feTurbulence">湍流 (feTurbulence)</option>
                    <option value="feConvolveMatrix">卷积矩阵 (feConvolveMatrix)</option>
                    <option value="feDisplacementMap">置换映射 (feDisplacementMap)</option>
                    <option value="feSpecularLighting">镜面光照 (feSpecularLighting)</option>
                    <option value="feDiffuseLighting">漫反射光照 (feDiffuseLighting)</option>
                    <option value="feTile">平铺 (feTile)</option>
                    <option value="feImage">图像 (feImage)</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>输入源 (in):</label>
                  <input v-model="subFilter.in" type="text" placeholder="例如: SourceGraphic, blur 等" />
                </div>
                
                <div class="form-group">
                  <label>输出名称 (result):</label>
                  <input v-model="subFilter.result" type="text" placeholder="例如: blur, shadow 等" />
                </div>
                
                <!-- 动态属性编辑器 -->
                <div v-if="subFilter.type" class="props-editor">
                  <h4>属性配置:</h4>
                  <component 
                    :is="getPropsComponent(subFilter.type)" 
                    v-model="subFilter.props"
                  />
                </div>
              </div>
              
              <button @click="addSubFilter" class="btn btn-secondary">
                + 添加子过滤器
              </button>
            </div>
            
            <div class="builder-actions">
              <button @click="createFilter" class="btn btn-primary">
                创建并注册过滤器
              </button>
              <button @click="resetBuilder" class="btn">
                重置表单
              </button>
            </div>
          </div>
          
          <div class="builder-preview">
            <h3>预览代码:</h3>
            <pre class="code-preview">{{ previewCode }}</pre>
          </div>
        </div>
      </section>

      <!-- 4. 日志区 -->
      <section class="demo-section">
        <h2>操作日志</h2>
        <div class="logs">
          <button @click="logs = []" class="btn btn-small">清空日志</button>
          <ul>
            <li v-for="(log, index) in logs" :key="index" :class="'log-' + log.type">
              [{{ log.time }}] {{ log.message }}
            </li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'
import {
  register,
  render,
  getRegisteredFilters,
  clearFilters,
  type FilterDefinition,
  type SubFilter,
  type GaussianBlurProps,
  type DropShadowProps,
  type MorphologyProps,
  type OffsetProps,
  type ColorMatrixProps,
  type FloodProps,
  type BlendProps,
  type CompositeProps,
  type MergeProps,
  type TurbulenceProps,
  type ConvolveMatrixProps,
  type DisplacementMapProps
} from '@svg-filter-factory/core'

// 状态管理
const registeredFilters = ref<FilterDefinition[]>([])
const renderedFilters = ref<string[]>([])  // 已渲染的过滤器ID列表
const currentFilter = ref('')
const logs = ref<Array<{ time: string, message: string, type: 'info' | 'success' | 'error' }>>([])

// 表单状态
const newFilterId = ref('')
const newSubFilters = ref<Array<Partial<SubFilter>>>([])

// 添加日志
const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  if (logs.value.length > 50) logs.value.pop()
}

// 注册示例过滤器
const registerSampleFilters = () => {
  try {
    register([
      {
        id: 'sample-blur',
        config: [
          { type: 'feGaussianBlur', props: { stdDeviation: 5, edgeMode: 'duplicate' } as GaussianBlurProps }
        ]
      },
      {
        id: 'sample-shadow',
        config: [
          { type: 'feDropShadow', props: { dx: 4, dy: 4, stdDeviation: 3 } as DropShadowProps }
        ]
      },
      {
        id: 'sample-glow',
        config: [
          { type: 'feGaussianBlur', props: { stdDeviation: 3 } as GaussianBlurProps, in: 'SourceAlpha', result: 'blur' },
          { type: 'feFlood', props: { floodColor: '#00ff00', floodOpacity: 0.8 } as FloodProps, result: 'color' },
          { type: 'feComposite', props: { operator: 'in', in: 'color', in2: 'blur' } as CompositeProps, result: 'glow' },
          { type: 'feMerge', props: { inputs: ['glow', 'SourceGraphic'] } as MergeProps }
        ]
      },
      {
        id: 'sample-complex',
        config: [
          { type: 'feGaussianBlur', props: { stdDeviation: 2 } as GaussianBlurProps, result: 'blur' },
          { type: 'feColorMatrix', props: { type: 'hueRotate', values: '90' } as ColorMatrixProps, in: 'blur' }
        ]
      }
    ])
    
    registeredFilters.value = getRegisteredFilters()
    addLog('成功注册4个示例过滤器', 'success')
  } catch (error) {
    addLog('注册示例过滤器失败: ' + error, 'error')
  }
}

// 清除所有过滤器
const clearAllFilters = () => {
  clearFilters()
  registeredFilters.value = []
  renderedFilters.value = []
  currentFilter.value = ''
  addLog('已清除所有过滤器', 'info')
}

// 仅渲染过滤器（不应用）
const renderFilter = (filterId: string) => {
  try {
    render(filterId)
    if (!renderedFilters.value.includes(filterId)) {
      renderedFilters.value.push(filterId)
    }
    addLog(`成功渲染过滤器: ${filterId}`, 'success')
  } catch (error) {
    addLog(`渲染过滤器失败: ${error}`, 'error')
  }
}

// 渲染并应用过滤器
const renderAndApplyFilter = (filterId: string) => {
  try {
    render(filterId)
    if (!renderedFilters.value.includes(filterId)) {
      renderedFilters.value.push(filterId)
    }
    applyFilter(`url(#${filterId})`)
    addLog(`成功渲染并应用过滤器: ${filterId}`, 'success')
  } catch (error) {
    addLog(`渲染过滤器失败: ${error}`, 'error')
  }
}

// 应用过滤器
const applyFilter = (filter: string) => {
  currentFilter.value = filter
  const filterName = filter ? filter.replace('url(#', '').replace(')', '') : '无'
  addLog(`应用过滤器: ${filterName}`, 'info')
}

// 动态表单 - 添加子过滤器
const addSubFilter = () => {
  newSubFilters.value.push({
    type: 'feGaussianBlur',
    props: {},
    in: '',
    result: ''
  })
}

// 动态表单 - 删除子过滤器
const removeSubFilter = (index: number) => {
  newSubFilters.value.splice(index, 1)
}

// 动态表单 - 创建过滤器
const createFilter = () => {
  if (!newFilterId.value.trim()) {
    addLog('请输入过滤器ID', 'error')
    return
  }
  
  if (newSubFilters.value.length === 0) {
    addLog('请至少添加一个子过滤器', 'error')
    return
  }
  
  try {
    const config: SubFilter[] = newSubFilters.value.map(sf => ({
      type: sf.type!,
      props: sf.props || {},
      in: sf.in || undefined,
      result: sf.result || undefined
    }))
    
    register({
      id: newFilterId.value,
      config
    })
    
    registeredFilters.value = getRegisteredFilters()
    addLog(`成功创建过滤器: ${newFilterId.value}`, 'success')
    
    // 自动渲染并应用
    render(newFilterId.value)
    if (!renderedFilters.value.includes(newFilterId.value)) {
      renderedFilters.value.push(newFilterId.value)
    }
    applyFilter(`url(#${newFilterId.value})`)
  } catch (error) {
    addLog(`创建过滤器失败: ${error}`, 'error')
  }
}

// 动态表单 - 重置
const resetBuilder = () => {
  newFilterId.value = ''
  newSubFilters.value = []
  addLog('表单已重置', 'info')
}

// 预览代码
const previewCode = computed(() => {
  if (!newFilterId.value || newSubFilters.value.length === 0) {
    return '// 请配置过滤器'
  }
  
  const config = newSubFilters.value.map(sf => {
    const obj: any = { type: sf.type }
    if (sf.props && Object.keys(sf.props).length > 0) obj.props = sf.props
    if (sf.in) obj.in = sf.in
    if (sf.result) obj.result = sf.result
    return obj
  })
  
  return `register({\n  id: '${newFilterId.value}',\n  config: ${JSON.stringify(config, null, 2).replace(/"([^"]+)":/g, '$1:')}\n})`
})

// 动态属性编辑器组件
const getPropsComponent = (type: string) => {
  const propsComponents: Record<string, any> = {
    feGaussianBlur: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        return () => h('div', { class: 'props-fields' }, [
          h('label', 'stdDeviation:'),
          h('input', {
            type: 'number',
            value: props.modelValue?.stdDeviation || 0,
            onInput: (e: any) => updateProp('stdDeviation', parseFloat(e.target.value) || 0),
            step: 0.1
          }),
          h('label', 'edgeMode:'),
          h('select', {
            value: props.modelValue?.edgeMode || 'duplicate',
            onChange: (e: any) => updateProp('edgeMode', e.target.value)
          }, [
            h('option', { value: 'duplicate' }, 'duplicate'),
            h('option', { value: 'wrap' }, 'wrap'),
            h('option', { value: 'none' }, 'none')
          ])
        ])
      }
    }),
    feDropShadow: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        return () => h('div', { class: 'props-fields' }, [
          h('label', 'dx:'),
          h('input', {
            type: 'number',
            value: props.modelValue?.dx || 0,
            onInput: (e: any) => updateProp('dx', parseFloat(e.target.value) || 0)
          }),
          h('label', 'dy:'),
          h('input', {
            type: 'number',
            value: props.modelValue?.dy || 0,
            onInput: (e: any) => updateProp('dy', parseFloat(e.target.value) || 0)
          }),
          h('label', 'stdDeviation:'),
          h('input', {
            type: 'number',
            value: props.modelValue?.stdDeviation || 0,
            onInput: (e: any) => updateProp('stdDeviation', parseFloat(e.target.value) || 0),
            step: 0.1
          })
        ])
      }
    }),
    feFlood: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        return () => h('div', { class: 'props-fields' }, [
          h('label', 'floodColor:'),
          h('input', {
            type: 'color',
            value: props.modelValue?.floodColor || '#000000',
            onInput: (e: any) => updateProp('floodColor', e.target.value)
          }),
          h('label', 'floodOpacity:'),
          h('input', {
            type: 'number',
            value: props.modelValue?.floodOpacity || 1,
            onInput: (e: any) => updateProp('floodOpacity', parseFloat(e.target.value) || 1),
            min: 0,
            max: 1,
            step: 0.1
          })
        ])
      }
    }),
    feColorMatrix: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        return () => h('div', { class: 'props-fields' }, [
          h('label', 'type:'),
          h('select', {
            value: props.modelValue?.type || 'matrix',
            onChange: (e: any) => updateProp('type', e.target.value)
          }, [
            h('option', { value: 'matrix' }, 'matrix'),
            h('option', { value: 'saturate' }, 'saturate'),
            h('option', { value: 'hueRotate' }, 'hueRotate'),
            h('option', { value: 'luminanceToAlpha' }, 'luminanceToAlpha')
          ]),
          h('label', 'values:'),
          h('input', {
            type: 'text',
            value: props.modelValue?.values || '',
            onInput: (e: any) => updateProp('values', e.target.value),
            placeholder: '例如: 0.5 或 90'
          })
        ])
      }
    }),
    feTurbulence: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        return () => h('div', { class: 'props-fields' }, [
          h('label', 'type:'),
          h('select', {
            value: props.modelValue?.type || 'turbulence',
            onChange: (e: any) => updateProp('type', e.target.value)
          }, [
            h('option', { value: 'turbulence' }, 'turbulence'),
            h('option', { value: 'fractalNoise' }, 'fractalNoise')
          ]),
          h('label', 'baseFrequency:'),
          h('input', {
            type: 'number',
            value: props.modelValue?.baseFrequency || 0.05,
            onInput: (e: any) => updateProp('baseFrequency', parseFloat(e.target.value) || 0.05),
            step: 0.01
          }),
          h('label', 'numOctaves:'),
          h('input', {
            type: 'number',
            value: props.modelValue?.numOctaves || 1,
            onInput: (e: any) => updateProp('numOctaves', parseInt(e.target.value) || 1)
          })
        ])
      }
    }),
    // 简化版：其他类型显示通用编辑器
    default: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        return () => h('div', { class: 'props-fields' }, [
          h('p', { style: 'color: #666; font-size: 12px;' }, '此类型暂无专用编辑器，请手动编辑 props 对象')
        ])
      }
    })
  }
  
  return propsComponents[type] || propsComponents.default
}

// 初始化
const init = () => {
  registeredFilters.value = getRegisteredFilters()
  addLog('应用已加载', 'info')
}

init()
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}

.header {
  text-align: center;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

.header p {
  margin: 0;
  opacity: 0.9;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  margin-right: 10px;
  margin-bottom: 10px;
}

.btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: #4CAF50;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #2196F3;
}

.btn-secondary:hover {
  background: #0b7dda;
}

.btn-danger {
  background: #f44336;
}

.btn-danger:hover {
  background: #da190b;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

.registered-filters {
  margin-top: 20px;
}

.filter-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.filter-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 18px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.filter-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.filter-id {
  font-size: 16px;
  color: #667eea;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.filter-count {
  font-size: 12px;
  color: #666;
  background: #e8eaf6;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.filter-card-details {
  margin: 12px 0;
  padding: 10px;
  background: rgba(102, 126, 234, 0.04);
  border-radius: 5px;
  font-size: 13px;
}

.sub-filter-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  line-height: 1.6;
}

.sub-filter-index {
  color: #999;
  font-weight: 600;
  min-width: 20px;
}

.sub-filter-type {
  color: #333;
  font-weight: 600;
  font-family: 'Consolas', monospace;
}

.sub-filter-attr {
  color: #666;
  font-size: 12px;
  font-family: 'Consolas', monospace;
}

.filter-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-apply {
  flex: 1;
  background: #4CAF50 !important;
}

.btn-apply:hover {
  background: #45a049 !important;
}

.svg-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.svg-canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 10px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.svg-canvas svg {
  border: 3px solid white;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.filter-controls h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.filter-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background: white;
  border-radius: 5px;
  margin-bottom: 15px;
}

.btn-filter {
  text-align: left;
  padding: 12px 16px;
  font-family: 'Consolas', monospace;
  background: white;
  border: 2px solid #e0e0e0;
  transition: all 0.2s;
}

.btn-filter:hover {
  border-color: #667eea;
  background: #f8f9fe;
  transform: translateX(4px);
}

.btn-filter.active {
  background: #667eea !important;
  border-color: #667eea !important;
  color: white;
  font-weight: 600;
  transform: translateX(8px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.current-filter-info {
  padding: 12px;
  background: #e8eaf6;
  border-radius: 5px;
  font-size: 14px;
  margin: 0;
}

.current-filter-info code {
  background: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  color: #667eea;
  font-weight: 600;
}

/* 动态表单样式 */
.filter-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.sub-filters {
  margin-top: 20px;
}

.sub-filter-item {
  background: #f8f9fa;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
}

.sub-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
}

.props-editor {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ccc;
}

.props-editor h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.props-fields {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.props-fields label {
  font-size: 13px;
  color: #666;
}

.props-fields input,
.props-fields select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.builder-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.builder-preview {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.code-preview {
  background: #282c34;
  color: #abb2bf;
  padding: 20px;
  border-radius: 5px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 600px;
  overflow-y: auto;
}

/* 日志样式 */
.logs ul {
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
}

.logs li {
  padding: 8px 12px;
  margin-bottom: 5px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
}

.log-info {
  background: #e3f2fd;
  color: #1976d2;
}

.log-success {
  background: #e8f5e9;
  color: #388e3c;
}

.log-error {
  background: #ffebee;
  color: #c62828;
}

.active {
  background: #4CAF50 !important;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

@media (max-width: 1024px) {
  .filter-builder {
    grid-template-columns: 1fr;
  }
  
  .builder-preview {
    position: static;
  }
  
  .svg-demo {
    grid-template-columns: 1fr;
  }
  
  .filter-cards {
    grid-template-columns: 1fr;
  }
}
</style>
