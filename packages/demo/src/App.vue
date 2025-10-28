<script setup lang="ts">
import { ref, computed } from 'vue'
import FilterPropsEditor from './components/FilterPropsEditor.vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/atom-one-dark.css'
import {
  register,
  render,
  getRegisteredFilters,
  clearFilters,
  type FilterDefinition,
  type SubFilter
} from '@svg-filter-factory/core'

// 注册 JavaScript 语言支持
hljs.registerLanguage('javascript', javascript)

// 过滤器类型选项
const filterTypeOptions = [
  { label: '高斯模糊 (feGaussianBlur)', value: 'feGaussianBlur' },
  { label: '投影 (feDropShadow)', value: 'feDropShadow' },
  { label: '变形 (feMorphology)', value: 'feMorphology' },
  { label: '偏移 (feOffset)', value: 'feOffset' },
  { label: '颜色矩阵 (feColorMatrix)', value: 'feColorMatrix' },
  { label: '组件转换 (feComponentTransfer)', value: 'feComponentTransfer' },
  { label: '填充 (feFlood)', value: 'feFlood' },
  { label: '混合 (feBlend)', value: 'feBlend' },
  { label: '合成 (feComposite)', value: 'feComposite' },
  { label: '合并 (feMerge)', value: 'feMerge' },
  { label: '湍流 (feTurbulence)', value: 'feTurbulence' },
  { label: '卷积矩阵 (feConvolveMatrix)', value: 'feConvolveMatrix' },
  { label: '置换映射 (feDisplacementMap)', value: 'feDisplacementMap' },
  { label: '镜面光照 (feSpecularLighting)', value: 'feSpecularLighting' },
  { label: '漫反射光照 (feDiffuseLighting)', value: 'feDiffuseLighting' },
  { label: '平铺 (feTile)', value: 'feTile' },
  { label: '图像 (feImage)', value: 'feImage' }
]

// 状态管理
const registeredFilters = ref<FilterDefinition[]>([])
const renderedFilters = ref<string[]>([])
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
          { type: 'feGaussianBlur', props: { stdDeviation: '5,5' } }
        ]
      },
      {
        id: 'sample-shadow',
        config: [
          { type: 'feDropShadow', props: { dx: 4, dy: 4, stdDeviation: '3,3' } }
        ]
      },
      {
        id: 'sample-glow',
        config: [
          { type: 'feGaussianBlur', props: { stdDeviation: '3,3' }, in: 'SourceAlpha', result: 'blur' },
          { type: 'feFlood', props: { floodColor: '#00ff00', floodOpacity: 0.8 }, result: 'color' },
          { type: 'feComposite', props: { operator: 'in', in: 'color', in2: 'blur' }, result: 'glow' },
          { type: 'feMerge', props: { inputs: ['glow', 'SourceGraphic'] } }
        ]
      },
      {
        id: 'sample-complex',
        config: [
          { type: 'feGaussianBlur', props: { stdDeviation: '2,2' }, result: 'blur' },
          { type: 'feColorMatrix', props: { type: 'hueRotate', values: '90' }, in: 'blur' }
        ]
      },
      {
        id: 'sample-sepia',
        config: [
          {
            type: 'feComponentTransfer',
            props: {
              funcR: { type: 'linear', slope: 0.393, intercept: 0.607 },
              funcG: { type: 'linear', slope: 0.769, intercept: 0.189 },
              funcB: { type: 'linear', slope: 0.686, intercept: 0.131 },
              funcA: { type: 'identity' }
            }
          }
        ]
      }
    ])
    
    registeredFilters.value = getRegisteredFilters()
    addLog('成功注册5个示例过滤器', 'success')
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
    feComponentTransfer: { 
      props: { 
        funcR: { type: 'identity' },
        funcG: { type: 'identity' },
        funcB: { type: 'identity' },
        funcA: { type: 'identity' }
      }, 
      result: 'transfer' 
    },
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
    render(newFilterId.value)
    registeredFilters.value = getRegisteredFilters()
    addLog(`成功创建过滤器: ${newFilterId.value}`, 'success')
    
    // 自动渲染并应用
    renderAndApplyFilter(newFilterId.value)
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

// 初始化
const init = () => {
  registeredFilters.value = getRegisteredFilters()
  addLog('应用已加载', 'info')
}

init()
</script>
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
          <el-button type="primary" @click="registerSampleFilters">
            注册示例过滤器
          </el-button>
          <el-button type="danger" @click="clearAllFilters">
            清除所有过滤器
          </el-button>
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
                  <el-button type="success" size="small" @click="renderAndApplyFilter(filter.id)">
                    渲染并应用
                  </el-button>
                  <el-button type="info" size="small" @click="renderFilter(filter.id)">
                    仅渲染
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 效果预览区 -->
      <section class="demo-section">
        <h2>效果预览</h2>
        <div class="preview-container">
          <div class="filter-controls">
            <h3>选择过滤器</h3>
            <div class="filter-selector">
              <el-button 
                @click="applyFilter('')" 
                :type="currentFilter === '' ? 'primary' : ''"
                style="width: 100%; margin-bottom: 8px;"
              >
                无过滤器
              </el-button>
              <el-button 
                v-for="filter in renderedFilters" 
                :key="filter"
                @click="applyFilter(`url(#${filter})`)" 
                :type="currentFilter === `url(#${filter})` ? 'primary' : ''"
                style="width: 100%; margin-bottom: 8px;"
              >
                {{ filter }}
              </el-button>
            </div>
            <p class="current-filter-info">
              <strong>当前应用：</strong> 
              <code>{{ currentFilter || '无' }}</code>
            </p>
          </div>

          <div class="preview-items">
            <!-- SVG图形 -->
            <div class="preview-item">
              <h4>SVG 图形</h4>
              <div class="preview-box">
                <svg width="100%" height="200" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="60" 
                    fill="url(#gradient1)"
                    :filter="currentFilter"
                  />
                </svg>
              </div>
            </div>

            <!-- 文本 -->
            <div class="preview-item">
              <h4>文本</h4>
              <div class="preview-box">
                <div style="display: flex; justify-content: center; align-items: center; height:200px;width:100%;">
                  <span :style="{ filter: currentFilter,color:'#9b4607',fontSize:'40px',fontWeight:'bold' }">FILTER</span>
                </div>
                
              </div>
            </div>

            <!-- 图片 -->
            <div class="preview-item">
              <h4>图片</h4>
              <div class="preview-box">
                <svg width="100%" height="200" viewBox="0 0 200 200">
                  <image 
                    href="https://picsum.photos/160/160" 
                    x="20" 
                    y="20" 
                    width="160" 
                    height="160"
                    :filter="currentFilter"
                  />
                </svg>
              </div>
            </div>
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
              <el-input v-model="newFilterId" type="text" placeholder="例如: my-custom-filter" />
            </div>
            
            <div class="sub-filters">
              <h3>子过滤器列表：</h3>
              <div v-for="(subFilter, index) in newSubFilters" :key="index" class="sub-filter-item">
                <div class="sub-filter-header">
                  <span>子过滤器 {{ index + 1 }}</span>
                  <el-button type="danger" size="small" @click="removeSubFilter(index)">删除</el-button>
                </div>
                
                <div class="form-group">
                  <label>类型:</label>
                  <el-select 
                    v-model="subFilter.type" 
                    @change="onFilterTypeChange(index, subFilter.type)" 
                    placeholder="选择类型..."
                    :options="filterTypeOptions"
                  />
                </div>
                
                <div class="form-group">
                  <label>别名 (result):</label>
                  <el-input v-model="subFilter.result" type="text" placeholder="用于后续混合引用，例如: blur" />
                  <small class="field-desc">为此过滤器效果定义一个别名，可在后续过滤器中通过 in 引用</small>
                </div>
                
                <!-- 动态属性编辑器 -->
                <div v-if="subFilter.type" class="props-editor">
                  <FilterPropsEditor 
                    :type="subFilter.type" 
                    v-model="subFilter.props"
                    :available-aliases="getAvailableAliases(index)"
                  />
                </div>
              </div>
              
              <el-button type="info" @click="addSubFilter">
                + 添加子过滤器
              </el-button>
            </div>
            
            <div class="builder-actions">
              <el-button type="success" @click="createFilter">
                创建并注册过滤器
              </el-button>
              <el-button @click="resetBuilder">
                重置表单
              </el-button>
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
          <el-button size="small" @click="logs = []">清空日志</el-button>
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

/* 保留一些自定义按钮间距 */
.quick-demo .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
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

.filter-card-actions .el-button {
  flex: 1;
}

/* 效果预览布局 */
.preview-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  align-items: start;
}

.preview-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-item h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  text-align: center;
  padding: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.preview-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e0e7ef 100%);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

.preview-box svg {
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background: white;
  border-radius: 5px;
  margin-bottom: 15px;
}

.filter-selector .el-button {
  font-family: 'Consolas', monospace;
  justify-content: flex-start;
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

/* Element Plus 组件全宽 */
.form-group :deep(.el-input),
.form-group :deep(.el-select) {
  width: 100%;
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
</style>
