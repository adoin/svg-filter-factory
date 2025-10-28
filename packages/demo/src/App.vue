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
                  <select v-model="subFilter.type" @change="onFilterTypeChange(index, subFilter.type)">
                    <option value="">选择类型...</option>
                    <option value="feGaussianBlur">高斯模糊 (feGaussianBlur)</option>
                    <option value="feDropShadow">投影 (feDropShadow)</option>
                    <option value="feMorphology">变形 (feMorphology)</option>
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
                  <label>别名 (result):</label>
                  <input v-model="subFilter.result" type="text" placeholder="用于后续混合引用，例如: blur" />
                  <small class="field-desc">为此过滤器效果定义一个别名，可在后续过滤器中通过 in 引用</small>
                </div>
                
                <!-- 动态属性编辑器 -->
                <div v-if="subFilter.type" class="props-editor">
                  <component 
                    :is="getPropsComponent(subFilter.type)" 
                    v-model="subFilter.props"
                    :available-aliases="getAvailableAliases(index)"
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
            <pre class="code-preview"><code class="language-javascript" v-html="highlightedCode"></code></pre>
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
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/atom-one-dark.css'
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

// 注册 JavaScript 语言支持
hljs.registerLanguage('javascript', javascript)

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

// 动态表单 - 添加子过滤器（根据类型设置合理的默认值）
const getDefaultSubFilter = (type: string = 'feGaussianBlur') => {
  const defaults: Record<string, { props: any; result: string }> = {
    feGaussianBlur: { props: { stdDeviation: '2,2' }, result: 'blur' },
    feDropShadow: { props: { dx: 2, dy: 2, stdDeviation: '2,2', floodColor: '#000000', floodOpacity: 1 }, result: 'shadow' },
    feFlood: { props: { floodColor: '#000000', floodOpacity: 1 }, result: 'flood' },
    feOffset: { props: { dx: 0, dy: 0 }, result: 'offset' },
    feColorMatrix: { props: { type: 'saturate', values: '1' }, result: 'colormatrix' },
    feTurbulence: { props: { type: 'fractalNoise', baseFrequency: 0.05, numOctaves: 1 }, result: 'turbulence' },
    feBlend: { props: { mode: 'normal', in: 'SourceGraphic', in2: 'SourceGraphic' }, result: 'blend' },
    feComposite: { props: { operator: 'over', in: 'SourceGraphic', in2: 'SourceGraphic' }, result: 'composite' },
    feMerge: { props: { inputs: ['SourceGraphic'] }, result: 'merge' },
    feMorphology: { props: { operator: 'erode', radius: '0,0' }, result: 'morphology' },
    feConvolveMatrix: { props: { order: 3, kernelMatrix: '1 0 0 0 1 0 0 0 1', bias: 0 }, result: 'convolve' },
    feDisplacementMap: { props: { scale: 0, xChannelSelector: 'R', yChannelSelector: 'G' }, result: 'displace' }
  }
  
  const config = defaults[type] || { props: {}, result: 'effect' }
  return {
    type,
    props: config.props,
    in: 'SourceGraphic',
    result: config.result
  }
}

const addSubFilter = () => {
  newSubFilters.value.push(getDefaultSubFilter('feGaussianBlur') as Partial<SubFilter>)
}

// 动态表单 - 删除子过滤器
const removeSubFilter = (index: number) => {
  newSubFilters.value.splice(index, 1)
}

// 动态表单 - 类型改变时更新默认值（完全覆盖）
const onFilterTypeChange = (index: number, type: any) => {
  if (!type) return
  const defaultConfig = getDefaultSubFilter(type)
  
  // 完全覆盖为新类型的默认配置
  newSubFilters.value[index] = defaultConfig as Partial<SubFilter>
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
    const config: SubFilter[] = newSubFilters.value.map((sf: Partial<SubFilter>) => ({
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

// 获取当前子过滤器之前已定义的所有别名
const getAvailableAliases = (currentIndex: number): string[] => {
  const aliases = ['SourceGraphic', 'SourceAlpha', 'BackgroundImage', 'BackgroundAlpha', 'FillPaint', 'StrokePaint']
  
  // 添加当前索引之前的所有别名
  for (let i = 0; i < currentIndex; i++) {
    if (newSubFilters.value[i]?.result) {
      aliases.push(newSubFilters.value[i].result as string)
    }
  }
  
  return aliases
}

// 预览代码
const previewCode = computed(() => {
  if (!newFilterId.value || newSubFilters.value.length === 0) {
    return '// 请配置过滤器'
  }
  
  const configArray = newSubFilters.value.map((sf: Partial<SubFilter>) => {
    const parts: string[] = []
    
    parts.push(`type: '${sf.type}'`)
    
    if (sf.props && Object.keys(sf.props).length > 0) {
      const propsStr = JSON.stringify(sf.props, null, 2)
        .split('\n')
        .map((line, idx) => idx === 0 ? line : '        ' + line)
        .join('\n')
      parts.push(`props: ${propsStr}`)
    }
    
    if (sf.in) {
      parts.push(`in: '${sf.in}'`)
    }
    
    if (sf.result) {
      parts.push(`result: '${sf.result}'`)
    }
    
    return `    {\n      ${parts.join(',\n      ')}\n    }`
  })
  
  return `register({\n  id: '${newFilterId.value}',\n  config: [\n${configArray.join(',\n')}\n  ]\n})`
})

// 高亮后的代码
const highlightedCode = computed(() => {
  return hljs.highlight(previewCode.value, { language: 'javascript' }).value
})

// 动态属性编辑器组件
const getPropsComponent = (type: string) => {
  const propsComponents: Record<string, any> = {
    feGaussianBlur: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const localStdDeviationX = ref('')
        const localStdDeviationY = ref('')
        
        const updateStdDeviation = (axis: 'x' | 'y', value: string) => {
          const x = axis === 'x' ? value : (props.modelValue?.stdDeviation?.split(',')[0] || '2')
          const y = axis === 'y' ? value : (props.modelValue?.stdDeviation?.split(',')[1] || '2')
          emit('update:modelValue', { stdDeviation: `${x},${y}` })
        }
        
        return () => {
          const stdDeviationX = props.modelValue?.stdDeviation?.split(',')[0] || '2'
          const stdDeviationY = props.modelValue?.stdDeviation?.split(',')[1] || '2'
          
          if (!localStdDeviationX.value) localStdDeviationX.value = stdDeviationX
          if (!localStdDeviationY.value) localStdDeviationY.value = stdDeviationY
          
          return h('div', [
            h('div', { class: 'prop-label' }, '偏差值'),
            h('div', { class: 'horizontal-inputs' }, [
              h('div', { class: 'input-with-label' }, [
                h('label', '偏差值 X'),
                h('input', {
                  type: 'number',
                  value: localStdDeviationX.value,
                  style:'width: 50px;',
                  onInput: (e: any) => { localStdDeviationX.value = e.target.value || '2' },
                  onBlur: (e: any) => updateStdDeviation('x', e.target.value || '2'),
                  step: 0.1,
                  min: 0,
                  placeholder: '2'
                })
              ]),
              h('div', { class: 'input-with-label' }, [
                h('label', '偏差值 Y'),
                h('input', {
                  type: 'number',
                  value: localStdDeviationY.value,
                  style:'width: 50px;',
                  onInput: (e: any) => { localStdDeviationY.value = e.target.value || '2' },
                  onBlur: (e: any) => updateStdDeviation('y', e.target.value || '2'),
                  step: 0.1,
                  min: 0,
                  placeholder: '2'
                })
              ])
            ]),
            h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
              '控制水平和垂直方向的模糊程度，值越大越模糊')
          ])
        }
      }
    }),
    feDropShadow: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const localDx = ref('')
        const localDy = ref('')
        const localStdDeviationX = ref('')
        const localStdDeviationY = ref('')
        const localFloodOpacity = ref('')
        
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        
        const updateStdDeviation = (axis: 'x' | 'y', value: string) => {
          const x = axis === 'x' ? value : (props.modelValue?.stdDeviation?.toString().split(',')[0] || '2')
          const y = axis === 'y' ? value : (props.modelValue?.stdDeviation?.toString().split(',')[1] || '2')
          updateProp('stdDeviation', `${x},${y}`)
        }
        
        return () => {
          const stdDeviationX = props.modelValue?.stdDeviation?.toString().split(',')[0] || '2'
          const stdDeviationY = props.modelValue?.stdDeviation?.toString().split(',')[1] || '2'
          
          if (!localDx.value) localDx.value = String(props.modelValue?.dx || 2)
          if (!localDy.value) localDy.value = String(props.modelValue?.dy || 2)
          if (!localStdDeviationX.value) localStdDeviationX.value = stdDeviationX
          if (!localStdDeviationY.value) localStdDeviationY.value = stdDeviationY
          if (!localFloodOpacity.value) localFloodOpacity.value = String(props.modelValue?.floodOpacity || 1)
          
          return h('div', [
            h('div', { class: 'prop-label' }, '阴影参数'),
            h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' }, [
              h('div', { class: 'horizontal-inputs' }, [
                h('div', { class: 'input-with-label' }, [
                  h('label', '偏移 X'),
                  h('input', {
                    type: 'number',
                    value: localDx.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localDx.value = e.target.value || '2' },
                    onBlur: (e: any) => updateProp('dx', parseFloat(e.target.value) || 2),
                    placeholder: '2'
                  })
                ]),
                h('div', { class: 'input-with-label' }, [
                  h('label', '偏移 Y'),
                  h('input', {
                    type: 'number',
                    value: localDy.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localDy.value = e.target.value || '2' },
                    onBlur: (e: any) => updateProp('dy', parseFloat(e.target.value) || 2),
                    placeholder: '2'
                  })
                ])
              ]),
              h('div', { class: 'horizontal-inputs' }, [
                h('div', { class: 'input-with-label' }, [
                  h('label', '模糊偏差 X'),
                  h('input', {
                    type: 'number',
                    value: localStdDeviationX.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localStdDeviationX.value = e.target.value || '2' },
                    onBlur: (e: any) => updateStdDeviation('x', e.target.value || '2'),
                    step: 0.1,
                    min: 0,
                    placeholder: '2'
                  })
                ]),
                h('div', { class: 'input-with-label' }, [
                  h('label', '模糊偏差 Y'),
                  h('input', {
                    type: 'number',
                    value: localStdDeviationY.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localStdDeviationY.value = e.target.value || '2' },
                    onBlur: (e: any) => updateStdDeviation('y', e.target.value || '2'),
                    step: 0.1,
                    min: 0,
                    placeholder: '2'
                  })
                ])
              ]),
              h('div', { class: 'horizontal-inputs' }, [
                h('div', { class: 'input-with-label' }, [
                  h('label', '阴影颜色'),
                  h('input', {
                    type: 'color',
                    value: props.modelValue?.floodColor || '#000000',
                    style: 'width: 60px; height: 34px; cursor: pointer;',
                    onChange: (e: any) => updateProp('floodColor', e.target.value)
                  })
                ]),
                h('div', { class: 'input-with-label' }, [
                  h('label', '不透明度'),
                  h('input', {
                    type: 'number',
                    value: localFloodOpacity.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localFloodOpacity.value = e.target.value || '1' },
                    onBlur: (e: any) => updateProp('floodOpacity', parseFloat(e.target.value) || 1),
                    min: 0,
                    max: 1,
                    step: 0.1,
                    placeholder: '1'
                  })
                ])
              ])
            ]),
            h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
              '设置阴影的偏移、模糊程度、颜色和透明度')
          ])
        }
      }
    }),
    feFlood: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const localFloodOpacity = ref('')
        
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        
        return () => {
          if (!localFloodOpacity.value) localFloodOpacity.value = String(props.modelValue?.floodOpacity || 1)
          
          return h('div', [
            h('div', { class: 'prop-label' }, '填充参数'),
            h('div', { class: 'horizontal-inputs' }, [
              h('div', { class: 'input-with-label' }, [
                h('label', '颜色'),
                h('input', {
                  type: 'color',
                  value: props.modelValue?.floodColor || '#000000',
                  style: 'width: 60px; height: 34px; cursor: pointer;',
                  onChange: (e: any) => updateProp('floodColor', e.target.value)
                })
              ]),
              h('div', { class: 'input-with-label' }, [
                h('label', '不透明度'),
                h('input', {
                  type: 'number',
                  value: localFloodOpacity.value,
                  style: 'width: 50px;',
                  onInput: (e: any) => { localFloodOpacity.value = e.target.value || '1' },
                  onBlur: (e: any) => updateProp('floodOpacity', parseFloat(e.target.value) || 1),
                  min: 0,
                  max: 1,
                  step: 0.1,
                  placeholder: '1'
                })
              ])
            ]),
            h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
              '用指定的颜色和不透明度填充整个区域')
          ])
        }
      }
    }),
    feColorMatrix: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const localMatrixValue = ref('')
        const localInputValue = ref('')
        
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        
        const onTypeChange = (newType: string) => {
          // 根据类型设置默认值
          let defaultValues = '1'
          if (newType === 'saturate') {
            defaultValues = '1'
          } else if (newType === 'hueRotate') {
            defaultValues = '0'
          } else if (newType === 'luminanceToAlpha') {
            defaultValues = ''
          } else if (newType === 'matrix') {
            defaultValues = '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 1 0'
          }
          
          // 一次性更新所有属性
          emit('update:modelValue', { 
            ...props.modelValue, 
            type: newType, 
            values: defaultValues 
          })
          
          // 同步本地状态
          if (newType === 'matrix') {
            localMatrixValue.value = defaultValues
          } else {
            localInputValue.value = defaultValues
          }
        }
        
        return () => {
          const currentType = props.modelValue?.type || 'saturate'
          const isMatrixType = currentType === 'matrix'
          
          // 初始化本地值
          if (isMatrixType && !localMatrixValue.value) {
            localMatrixValue.value = props.modelValue?.values || '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 1 0'
          }
          if (!isMatrixType && !localInputValue.value) {
            localInputValue.value = props.modelValue?.values || '1'
          }
          
          return h('div', [
            h('div', { class: 'prop-label' }, '颜色矩阵'),
            h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' }, [
              h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
                h('label', { style: 'min-width: 80px;' }, '类型'),
                h('select', {
                  value: currentType,
                  onChange: (e: any) => onTypeChange(e.target.value),
                  style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
                }, [
                  h('option', { value: 'saturate' }, '饱和度 (saturate)'),
                  h('option', { value: 'hueRotate' }, '色相旋转 (hueRotate)'),
                  h('option', { value: 'luminanceToAlpha' }, '亮度转Alpha (luminanceToAlpha)'),
                  h('option', { value: 'matrix' }, '自定义矩阵 (matrix)')
                ])
              ]),
              isMatrixType 
                ? h('div', { style: 'display: flex; flex-direction: column;' }, [
                    h('label', { style: 'font-size: 12px; color: #666; margin-bottom: 5px;' }, '矩阵值 (4行5列，每行5个数字):'),
                    h('textarea', {
                      value: localMatrixValue.value,
                      onInput: (e: any) => {
                        localMatrixValue.value = e.target.value
                      },
                      onBlur: (e: any) => {
                        updateProp('values', e.target.value)
                      },
                      style: 'flex: 1; padding: 8px 10px; border: 2px solid #ddd; border-radius: 4px; font-family: "Consolas", monospace; font-size: 12px; resize: vertical; min-height: 90px;',
                      placeholder: '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 1 0'
                    })
                  ])
                : h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
                    h('label', { style: 'min-width: 80px;' }, '值'),
                    h('input', {
                      type: 'text',
                      value: localInputValue.value,
                      style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;',
                      onInput: (e: any) => { localInputValue.value = e.target.value },
                      onBlur: (e: any) => updateProp('values', e.target.value),
                      placeholder: currentType === 'saturate' ? '0-2 (0=灰度, 1=原色, 2=增强)' : 
                                  currentType === 'hueRotate' ? '0-360 (度数)' : ''
                    })
                  ])
            ]),
            h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
              currentType === 'saturate' ? '饱和度：0=灰度, 1=原色, >1=增强' :
              currentType === 'hueRotate' ? '色相旋转：0-360度旋转色环' :
              currentType === 'luminanceToAlpha' ? '将图像亮度转换为Alpha透明度通道' :
              '自定义4x5颜色转换矩阵，每行5个数字，控制RGBA通道变换')
          ])
        }
      }
    }),
    feOffset: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const localDx = ref('')
        const localDy = ref('')
        
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        
        return () => {
          if (!localDx.value) localDx.value = String(props.modelValue?.dx || 0)
          if (!localDy.value) localDy.value = String(props.modelValue?.dy || 0)
          
          return h('div', [
            h('div', { class: 'prop-label' }, '偏移参数'),
            h('div', { class: 'horizontal-inputs' }, [
              h('div', { class: 'input-with-label' }, [
                h('label', '偏移 X'),
                h('input', {
                  type: 'number',
                  value: localDx.value,
                  style: 'width: 50px;',
                  onInput: (e: any) => { localDx.value = e.target.value || '0' },
                  onBlur: (e: any) => updateProp('dx', parseFloat(e.target.value) || 0),
                  placeholder: '0'
                })
              ]),
              h('div', { class: 'input-with-label' }, [
                h('label', '偏移 Y'),
                h('input', {
                  type: 'number',
                  value: localDy.value,
                  style: 'width: 50px;',
                  onInput: (e: any) => { localDy.value = e.target.value || '0' },
                  onBlur: (e: any) => updateProp('dy', parseFloat(e.target.value) || 0),
                  placeholder: '0'
                })
              ])
            ]),
            h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
              '将图像在水平和垂直方向上偏移指定距离')
          ])
        }
      }
    }),
    feMorphology: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const localRadiusX = ref('')
        const localRadiusY = ref('')
        
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        
        const updateRadius = (axis: 'x' | 'y', value: string) => {
          const x = axis === 'x' ? value : (props.modelValue?.radius?.toString().split(',')[0] || '0')
          const y = axis === 'y' ? value : (props.modelValue?.radius?.toString().split(',')[1] || '0')
          updateProp('radius', `${x},${y}`)
        }
        
        return () => {
          const radiusX = props.modelValue?.radius?.toString().split(',')[0] || '0'
          const radiusY = props.modelValue?.radius?.toString().split(',')[1] || '0'
          
          if (!localRadiusX.value) localRadiusX.value = radiusX
          if (!localRadiusY.value) localRadiusY.value = radiusY
          
          return h('div', [
            h('div', { class: 'prop-label' }, '变形参数'),
            h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' }, [
              h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
                h('label', { style: 'min-width: 80px;' }, '操作类型'),
                h('select', {
                  value: props.modelValue?.operator || 'erode',
                  onChange: (e: any) => updateProp('operator', e.target.value),
                  style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
                }, [
                  h('option', { value: 'erode' }, '腐蚀 (erode)'),
                  h('option', { value: 'dilate' }, '膨胀 (dilate)')
                ])
              ]),
              h('div', { class: 'horizontal-inputs' }, [
                h('div', { class: 'input-with-label' }, [
                  h('label', '变形半径 X'),
                  h('input', {
                    type: 'number',
                    value: localRadiusX.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localRadiusX.value = e.target.value || '0' },
                    onBlur: (e: any) => updateRadius('x', e.target.value || '0'),
                    min: 0,
                    step: 0.1,
                    placeholder: '0'
                  })
                ]),
                h('div', { class: 'input-with-label' }, [
                  h('label', '变形半径 Y'),
                  h('input', {
                    type: 'number',
                    value: localRadiusY.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localRadiusY.value = e.target.value || '0' },
                    onBlur: (e: any) => updateRadius('y', e.target.value || '0'),
                    min: 0,
                    step: 0.1,
                    placeholder: '0'
                  })
                ])
              ])
            ]),
            h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
              '腐蚀使图像收缩变细，膨胀使图像扩张变粗，半径控制变形程度')
          ])
        }
      }
    }),
    feTurbulence: defineComponent({
      props: ['modelValue'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const localBaseFrequency = ref('')
        const localNumOctaves = ref('')
        
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        
        return () => {
          if (!localBaseFrequency.value) localBaseFrequency.value = String(props.modelValue?.baseFrequency || 0.05)
          if (!localNumOctaves.value) localNumOctaves.value = String(props.modelValue?.numOctaves || 1)
          
          return h('div', [
            h('div', { class: 'prop-label' }, '湍流参数'),
            h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' }, [
              h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
                h('label', { style: 'min-width: 80px;' }, '类型'),
                h('select', {
                  value: props.modelValue?.type || 'fractalNoise',
                  onChange: (e: any) => updateProp('type', e.target.value),
                  style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
                }, [
                  h('option', { value: 'turbulence' }, '湍流 (turbulence)'),
                  h('option', { value: 'fractalNoise' }, '分形噪声 (fractalNoise)')
                ])
              ]),
              h('div', { class: 'horizontal-inputs' }, [
                h('div', { class: 'input-with-label' }, [
                  h('label', '基础频率'),
                  h('input', {
                    type: 'number',
                    value: localBaseFrequency.value,
                    style: 'width: 60px;',
                    onInput: (e: any) => { localBaseFrequency.value = e.target.value || '0.05' },
                    onBlur: (e: any) => updateProp('baseFrequency', parseFloat(e.target.value) || 0.05),
                    step: 0.01,
                    min: 0,
                    placeholder: '0.05'
                  })
                ]),
                h('div', { class: 'input-with-label' }, [
                  h('label', '八度数'),
                  h('input', {
                    type: 'number',
                    value: localNumOctaves.value,
                    style: 'width: 50px;',
                    onInput: (e: any) => { localNumOctaves.value = e.target.value || '1' },
                    onBlur: (e: any) => updateProp('numOctaves', parseInt(e.target.value) || 1),
                    min: 1,
                    placeholder: '1'
                  })
                ])
              ])
            ]),
            h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
              '生成湍流或噪声纹理效果，频率越大纹理越密集')
          ])
        }
      }
    }),
    feBlend: defineComponent({
      props: ['modelValue', 'availableAliases'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        return () => h('div', [
          h('div', { class: 'prop-label' }, '混合参数'),
          h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' }, [
            h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
              h('label', { style: 'min-width: 80px;' }, '混合模式'),
              h('select', {
                value: props.modelValue?.mode || 'normal',
                onChange: (e: any) => updateProp('mode', e.target.value),
                style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
              }, [
                h('option', { value: 'normal' }, '正常 (normal)'),
                h('option', { value: 'multiply' }, '正片叠底 (multiply)'),
                h('option', { value: 'screen' }, '滤色 (screen)'),
                h('option', { value: 'darken' }, '变暗 (darken)'),
                h('option', { value: 'lighten' }, '变亮 (lighten)'),
                h('option', { value: 'overlay' }, '叠加 (overlay)'),
                h('option', { value: 'color-dodge' }, '颜色减淡 (color-dodge)'),
                h('option', { value: 'color-burn' }, '颜色加深 (color-burn)')
              ])
            ]),
            h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
              h('label', { style: 'min-width: 80px;' }, '输入1 (in)'),
              h('select', {
                value: props.modelValue?.in || 'SourceGraphic',
                onChange: (e: any) => updateProp('in', e.target.value),
                style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
              }, (props.availableAliases || ['SourceGraphic']).map((alias: string) => 
                h('option', { value: alias }, alias)
              ))
            ]),
            h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
              h('label', { style: 'min-width: 80px;' }, '输入2 (in2)'),
              h('select', {
                value: props.modelValue?.in2 || 'SourceGraphic',
                onChange: (e: any) => updateProp('in2', e.target.value),
                style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
              }, (props.availableAliases || ['SourceGraphic']).map((alias: string) => 
                h('option', { value: alias }, alias)
              ))
            ])
          ]),
          h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
            '将两个输入源按指定模式进行混合')
        ])
      }
    }),
    feComposite: defineComponent({
      props: ['modelValue', 'availableAliases'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const updateProp = (key: string, value: any) => {
          emit('update:modelValue', { ...props.modelValue, [key]: value })
        }
        return () => h('div', [
          h('div', { class: 'prop-label' }, '合成参数'),
          h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' }, [
            h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
              h('label', { style: 'min-width: 80px;' }, '合成操作'),
              h('select', {
                value: props.modelValue?.operator || 'over',
                onChange: (e: any) => updateProp('operator', e.target.value),
                style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
              }, [
                h('option', { value: 'over' }, '覆盖 (over)'),
                h('option', { value: 'in' }, '保留in范围 (in)'),
                h('option', { value: 'out' }, '保留out范围 (out)'),
                h('option', { value: 'atop' }, '顶部叠加 (atop)'),
                h('option', { value: 'xor' }, '异或 (xor)'),
                h('option', { value: 'arithmetic' }, '算术 (arithmetic)')
              ])
            ]),
            h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
              h('label', { style: 'min-width: 80px;' }, '输入1 (in)'),
              h('select', {
                value: props.modelValue?.in || 'SourceGraphic',
                onChange: (e: any) => updateProp('in', e.target.value),
                style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
              }, (props.availableAliases || ['SourceGraphic']).map((alias: string) => 
                h('option', { value: alias }, alias)
              ))
            ]),
            h('div', { class: 'input-with-label', style: 'display: flex; align-items: center;' }, [
              h('label', { style: 'min-width: 80px;' }, '输入2 (in2)'),
              h('select', {
                value: props.modelValue?.in2 || 'SourceGraphic',
                onChange: (e: any) => updateProp('in2', e.target.value),
                style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px;'
              }, (props.availableAliases || ['SourceGraphic']).map((alias: string) => 
                h('option', { value: alias }, alias)
              ))
            ])
          ]),
          h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
            '使用Porter-Duff合成操作组合两个输入源')
        ])
      }
    }),
    feMerge: defineComponent({
      props: ['modelValue', 'availableAliases'],
      emits: ['update:modelValue'],
      setup(props, { emit }) {
        const inputs = props.modelValue?.inputs || ['SourceGraphic']
        
        const updateInputs = (newInputs: string[]) => {
          emit('update:modelValue', { inputs: newInputs })
        }
        
        const addInput = () => {
          const newInputs = [...inputs, 'SourceGraphic']
          updateInputs(newInputs)
        }
        
        const removeInput = (index: number) => {
          const newInputs = inputs.filter((_: any, i: number) => i !== index)
          updateInputs(newInputs)
        }
        
        const updateInput = (index: number, value: string) => {
          const newInputs = [...inputs]
          newInputs[index] = value
          updateInputs(newInputs)
        }
        
        return () => h('div', [
          h('div', { class: 'prop-label' }, '合并输入源'),
          h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' }, [
            ...inputs.map((input: string, index: number) => 
              h('div', { key: index, style: 'display: flex; align-items: center; gap: 8px;' }, [
                h('label', { style: 'min-width: 60px; font-size: 12px; color: #666;' }, `输入 ${index + 1}`),
                h('select', {
                  value: input,
                  onChange: (e: any) => updateInput(index, e.target.value),
                  style: 'flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 13px;'
                }, (props.availableAliases || ['SourceGraphic']).map((alias: string) => 
                  h('option', { value: alias }, alias)
                )),
                h('button', {
                  onClick: () => removeInput(index),
                  class: 'btn btn-danger btn-small',
                  style: 'padding: 4px 8px; font-size: 11px;'
                }, '删除')
              ])
            ),
            h('button', {
              onClick: addInput,
              class: 'btn btn-secondary btn-small',
              style: 'align-self: flex-start; padding: 6px 12px;'
            }, '+ 添加输入源')
          ]),
          h('small', { class: 'field-desc', style: 'margin-top: 8px; display: block;' }, 
            '按顺序合并多个输入源，后面的会覆盖在前面的上方')
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

.field-desc {
  display: block;
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
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
  padding: 15px;
  background: #fafbfc;
  border-radius: 5px;
  border: 1px solid #e8eaf6;
}

.prop-label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.horizontal-inputs {
  display: flex;
  gap: 15px;
  align-items: center;
}

.input-with-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-with-label label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  min-width: 60px;
  white-space: nowrap;
}

.input-with-label input {
  width: 80px;
  padding: 6px 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
}

.input-with-label input:focus {
  outline: none;
  border-color: #667eea;
}

.fixed-params-hint {
  display: block;
  margin-top: 10px;
  padding: 8px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  color: #856404;
  font-size: 11px;
  border-radius: 3px;
  line-height: 1.4;
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
  margin: 0;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 600px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.code-preview code {
  display: block;
  padding: 20px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: #282c34;
  color: #abb2bf;
  overflow-x: auto;
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
