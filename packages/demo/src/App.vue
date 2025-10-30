<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <header class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 shadow-md">
      <h1 class="text-2xl font-bold">SVG Filter Factory Demo</h1>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <!-- 1. 快速示例区 + 操作日志 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：快速示例 -->
        <section class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-purple-500 pb-2">快速示例</h2>
          <div class="space-y-4">
            <div class="flex gap-3">
              <el-button type="primary" @click="registerSampleFilters">
                注册示例过滤器
              </el-button>
              <el-button type="danger" @click="clearAllFilters">
                清除所有过滤器
              </el-button>
            </div>
            
            <div v-if="registeredFilters.length > 0" class="space-y-3">
              <h3 class="text-xl font-semibold text-gray-700">已注册的过滤器：</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="filter in registeredFilters" 
                  :key="filter.id" 
                  class="border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-indigo-50"
                >
                  <div class="flex justify-between items-center mb-3">
                    <strong class="text-lg font-mono text-purple-700">{{ filter.id }}</strong>
                    <span class="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      {{ filter.config.length }} 个子过滤器
                    </span>
                  </div>
                  <div class="space-y-2 mb-4">
                    <div 
                      v-for="(sub, idx) in filter.config" 
                      :key="idx" 
                      class="flex items-center gap-2 text-sm"
                    >
                      <span class="font-semibold text-gray-600">{{ idx + 1 }}.</span>
                      <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{{ sub.type }}</span>
                      <span v-if="sub.result" class="text-green-600 text-xs">→ {{ sub.result }}</span>
                      <span v-if="sub.in" class="text-gray-500 text-xs">(in: {{ sub.in }})</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <el-button type="success" size="small" class="flex-1" @click="renderAndApplyFilter(filter.id)">
                      渲染并应用
                    </el-button>
                    <el-button type="info" size="small" class="flex-1" @click="renderFilter(filter.id)">
                      仅渲染
                    </el-button>
                  </div>
                  <div class="mt-2 flex gap-2">
                    <el-button type="primary" size="small" class="flex-1" @click="copyFilterToBuilder(filter)">
                      <span class="i-carbon-copy mr-1"></span>
                      复制
                    </el-button>
                    <el-button type="danger" size="small" class="flex-1" @click="deleteFilterById(filter.id)">
                      <span class="i-carbon-trash-can mr-1"></span>
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右侧：操作日志 -->
        <section class="bg-white rounded-xl shadow-md p-6 flex flex-col">
          <div class="flex justify-between items-center mb-4 border-b-2 border-purple-500 pb-2">
            <h2 class="text-2xl font-bold text-gray-800">操作日志</h2>
            <el-button size="small" @click="logs = []">清空</el-button>
          </div>
          <div class="flex-1 overflow-y-auto max-h-[300px] space-y-1 bg-gray-50 rounded p-3 font-mono text-xs">
            <div 
              v-for="(log, index) in logs" 
              :key="index" 
              :class="[
                'py-1.5 px-2 rounded',
                log.type === 'info' ? 'text-blue-700 bg-blue-50' : '',
                log.type === 'success' ? 'text-green-700 bg-green-50' : '',
                log.type === 'error' ? 'text-red-700 bg-red-50' : ''
              ]"
            >
              <div class="font-semibold text-gray-500">[{{ log.time }}]</div>
              <div>{{ log.message }}</div>
            </div>
          </div>
        </section>
      </div>

      <!-- 2. 效果预览区 -->
      <section class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-purple-500 pb-2">效果预览</h2>
        <div class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center gap-3 mb-3">
              <strong class="text-gray-700">当前应用：</strong> 
              <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">
                {{ currentFilter || '无' }}
              </code>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button 
                @click="applyFilter('')" 
                :type="currentFilter === '' ? 'primary' : ''"
                size="small"
              >
                无过滤器
              </el-button>
              <el-button 
                v-for="filter in renderedFilters" 
                :key="filter"
                @click="applyFilter(`url(#${filter})`)" 
                :type="currentFilter === `url(#${filter})` ? 'primary' : ''"
                size="small"
                class="font-mono"
              >
                {{ filter }}
              </el-button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- SVG图形 -->
            <div class="flex flex-col">
              <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg">
                SVG 图形
              </h4>
              <div class="flex justify-center items-center h-240px bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-5">
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
                    :style="{ filter: currentFilter ? currentFilter : 'none' }"
                  />
                </svg>
              </div>
            </div>

            <!-- 文本 -->
            <div class="flex flex-col">
              <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg">
                文本
              </h4>
              <div class="flex justify-center items-center h-240px bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-5">
                <span 
                  class="text-5xl font-bold"
                  :style="{ 
                    filter: currentFilter ? currentFilter : 'none',
                    color: '#9b4607'
                  }"
                >
                  FILTER
                </span>
              </div>
            </div>

            <!-- 图片 -->
            <div class="flex flex-col">
              <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg">
                图片
              </h4>
              <div class="flex justify-center items-center h-240px bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-5">
                <img 
                  src="https://picsum.photos/160/160" 
                  class="rounded-lg shadow-md"
                  :style="{ filter: currentFilter ? currentFilter : 'none' }"
                />
              </div>
            </div>

            <!-- SVG文本 -->
            <div class="flex flex-col">
              <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg">
                SVG 文本
              </h4>
              <div class="flex justify-center items-center h-240px bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-5">
                <svg width="100%" height="200" viewBox="0 0 500 200">
                  
                  <text 
                    x="250" 
                    y="120" 
                    text-anchor="middle" 
                    font-size="22" 
                    font-weight="bold" 
                    fill="#667eea"
                    :filter="currentFilter ? currentFilter : 'none'"
                  >
                    SVG TEXT
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 动态表单创建过滤器 -->
      <section id="filter-builder" class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-purple-500 pb-2">动态创建过滤器</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 左侧：表单 -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block font-semibold text-gray-700">过滤器 ID:</label>
              <el-input v-model="newFilterId" placeholder="例如: my-custom-filter" />
            </div>
            
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-gray-700">子过滤器列表：</h3>
              <div 
                v-for="(subFilter, index) in newSubFilters" 
                :key="index" 
                class="border-2 border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
              >
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-purple-700">子过滤器 {{ index + 1 }}</span>
                  <el-button type="danger" size="small" @click="removeSubFilter(index)">删除</el-button>
                </div>
                
                <div class="space-y-2">
                  <label class="block font-medium text-gray-600 text-sm">类型:</label>
                  <el-select 
                    v-model="subFilter.type" 
                    @change="onFilterTypeChange(index, subFilter.type)" 
                    placeholder="选择类型..."
                    :options="filterTypeOptions"
                    class="w-full"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block font-medium text-gray-600 text-sm">别名 (result):</label>
                  <el-input v-model="subFilter.result" placeholder="用于后续混合引用，例如: blur" />
                  <small class="block text-gray-500 text-xs">为此过滤器效果定义一个别名，可在后续过滤器中通过 in 引用</small>
                </div>
                
                <!-- 动态属性编辑器 -->
                <div v-if="subFilter.type" class="mt-3">
                  <FilterPropsEditor 
                    :type="subFilter.type" 
                    v-model="subFilter.props"
                    :available-aliases="getAvailableAliases(index)"
                  />
                </div>
              </div>
              
              <el-button type="info" @click="addSubFilter" class="w-full">
                + 添加子过滤器
              </el-button>
            </div>
            
            <div class="flex gap-3">
              <el-button type="success" @click="createFilter" class="flex-1">
                创建并注册过滤器
              </el-button>
              <el-button @click="resetBuilder" class="flex-1">
                重置表单
              </el-button>
            </div>
          </div>
          
          <!-- 右侧：实时预览和代码 -->
          <div class="space-y-4">
            <!-- 实时预览效果 -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-700">实时预览:</h3>
              <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 flex items-center justify-center min-h-[150px]">
                <svg width="100%" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
                  <!-- 动态过滤器定义 -->
                  <defs>
                    <filter :id="previewFilterId" v-html="previewFilterSvg"></filter>
                  </defs>
                  <!-- 应用过滤器的文字 -->
                  <text 
                    x="200" 
                    y="77" 
                    text-anchor="middle" 
                    font-size="20" 
                    font-weight="bold" 
                    fill="#667eea"
                    :filter="`url(#${previewFilterId})`"
                  >
                    SVG Filter
                  </text>
                </svg>
              </div>
              <el-text type="info" size="small">实时查看过滤器效果，无需注册</el-text>
            </div>
            
            <!-- 代码预览 -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-700">预览代码:</h3>
                <el-button type="primary" size="small" @click="copyCode">
                  <span class="i-carbon-copy mr-1"></span>
                  复制代码
                </el-button>
              </div>
              <pre class="bg-gray-900 text-white rounded-lg p-4 overflow-x-auto text-sm"><code class="language-javascript" v-html="highlightedCode"></code></pre>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FilterPropsEditor from './components/FilterPropsEditor.vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/atom-one-dark.css'
import {
  register,
  render,
  renderAll,
  getRegisteredFilters,
  clearFilters,
  deleteFilter,
  updateFilterDom,
  updateFilterConfig,
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
  { label: '填充 (feFlood-请勿单独使用)', value: 'feFlood' },
  { label: '混合 (feBlend)', value: 'feBlend' },
  { label: '合成 (feComposite)', value: 'feComposite' },
  { label: '合并 (feMerge)', value: 'feMerge' },
  { label: '湍流 (feTurbulence-请勿单独使用)', value: 'feTurbulence' },
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
  if (logs.value.length > 100) {
    logs.value.pop()
  }
}

// 初始化
const init = () => {
  registeredFilters.value = getRegisteredFilters()
  addLog('应用已初始化', 'info')
  renderAll()
  renderedFilters.value = registeredFilters.value.map(f => f.id)
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
      },
      {
        id: 'sample-tile',
        config: [
          {
            type: 'feTurbulence',
            props: {
              type: 'fractalNoise',
              baseFrequency: '0.1,0.1',
              numOctaves: 2,
              seed: 1
            },
            result: 'pattern'
          },
          {
            type: 'feTile',
            props: {
              in: 'pattern'
            },
            result: 'tile'
          }
        ]
      }
    ])
    
    registeredFilters.value = getRegisteredFilters()
    addLog('成功注册6个示例过滤器', 'success')
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
    feGaussianBlur: { props: { in: 'SourceGraphic', stdDeviation: '2,2' }, result: 'blur' },
    feDropShadow: { props: { in: 'SourceGraphic', dx: 2, dy: 2, stdDeviation: '2,2', floodColor: '#000000', floodOpacity: 1 }, result: 'shadow' },
    feFlood: { props: { floodColor: '#000000', floodOpacity: 1 }, result: 'flood' },
    feOffset: { props: { in: 'SourceGraphic', dx: 0, dy: 0 }, result: 'offset' },
    feColorMatrix: { props: { in: 'SourceGraphic', type: 'saturate', values: '1' }, result: 'colormatrix' },
    feComponentTransfer: { 
      props: { 
        funcR: { type: 'identity' },
        funcG: { type: 'identity' },
        funcB: { type: 'identity' },
        funcA: { type: 'identity' }
      }, 
      result: 'transfer' 
    },
    feTurbulence: { props: { type: 'fractalNoise', baseFrequency: '0.05,0.05', numOctaves: 1, seed: 0, stitchTiles: 'noStitch' }, result: 'turbulence' },
    feBlend: { props: { mode: 'normal', in: 'SourceGraphic', in2: 'SourceAlpha' }, result: 'blend' },
    feComposite: { props: { operator: 'over', in: 'SourceGraphic', in2: 'SourceAlpha' }, result: 'composite' },
    feMerge: { props: { inputs: ['SourceGraphic'] }, result: 'merge' },
    feMorphology: { props: { in: 'SourceGraphic', operator: 'erode', radius: '0,0' }, result: 'morphology' },
    feConvolveMatrix: { props: { in: 'SourceGraphic', order: 3, kernelMatrix: '0 -1 0 -1 5 -1 0 -1 0', bias: 0, edgeMode: 'duplicate' }, result: 'convolve' },
    feDisplacementMap: { props: { scale: 50, xChannelSelector: 'R', yChannelSelector: 'G', in: 'SourceGraphic', in2: 'SourceGraphic' }, result: 'displace' },
    feSpecularLighting: { props: { in: 'SourceGraphic', lightType: 'distant', azimuth: 45, elevation: 30, surfaceScale: 1, specularConstant: 1, specularExponent: 20, lightingColor: '#ffffff' }, result: 'specular' },
    feDiffuseLighting: { props: { in: 'SourceGraphic', lightType: 'distant', azimuth: 45, elevation: 30, surfaceScale: 1, diffuseConstant: 1, lightingColor: '#ffffff' }, result: 'diffuse' },
    feTile: { props: { in: 'SourceGraphic' }, result: 'tile' },
    feImage: { props: { href: '', align: 'xMidYMid', meetOrSlice: 'meet' }, result: 'image' }
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
  if (!newFilterId.value) {
    addLog('请输入过滤器 ID', 'error')
    return
  }
  
  if (newSubFilters.value.length === 0) {
    addLog('请至少添加一个子过滤器', 'error')
    return
  }
  
  try {
    const config = newSubFilters.value.map((sf: Partial<SubFilter>) => ({
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
    
    // 清空表单
    resetBuilder()
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

// 复制过滤器到创建区域
const copyFilterToBuilder = (filter: FilterDefinition) => {
  try {
    // 清空 ID，保留配置
    newFilterId.value = ''
    
    // 深拷贝配置到创建区域
    newSubFilters.value = filter.config.map(sub => ({
      type: sub.type,
      props: { ...sub.props },
      in: sub.in,
      result: sub.result
    })) as Partial<SubFilter>[]
    
    addLog(`已复制过滤器配置到创建区域，请修改 ID 后注册`, 'success')
    ElMessage.success('已复制到创建区域！')
    
    // 滚动到创建区域
    const builderElement = document.querySelector('#filter-builder')
    if (builderElement) {
      builderElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } catch (error) {
    addLog(`复制失败: ${error}`, 'error')
    ElMessage.error('复制失败，请重试')
  }
}

// 删除单个过滤器
const deleteFilterById = (id: string) => {
  ElMessageBox.confirm(
    `确定要删除过滤器 "${id}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    try {
      deleteFilter(id)
      registeredFilters.value = getRegisteredFilters()
      
      // 从已渲染列表中移除
      const index = renderedFilters.value.indexOf(id)
      if (index > -1) {
        renderedFilters.value.splice(index, 1)
      }
      
      addLog(`已删除过滤器: ${id}`, 'success')
      ElMessage.success(`过滤器 "${id}" 已删除`)
    } catch (error) {
      addLog(`删除过滤器失败: ${error}`, 'error')
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {
    // 用户取消删除
    addLog(`取消删除过滤器: ${id}`, 'info')
  })
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
  
  return `// 1. 导入 SVG Filter Factory
import { register, render } from '@svg-filter-factory/core'

// 2. 注册过滤器
register({
  id: '${newFilterId.value}',
  config: [
${configArray.join(',\n')}
  ]
})

// 3. 渲染过滤器到页面
render('${newFilterId.value}')

// 4. 应用到元素
// document.getElementById('myElement').style.filter = 'url(#${newFilterId.value})'`
})

// 高亮后的代码
const highlightedCode = computed(() => {
  try {
    return hljs.highlight(previewCode.value, { language: 'javascript' }).value
  } catch {
    return previewCode.value
  }
})

// 预览过滤器 ID
const previewFilterId = computed(() => {
  return newFilterId.value || 'preview-filter'
})

// 生成预览光源元素
const generatePreviewLightElement = (props: any) => {
  const lightType = props.lightType || 'distant'
  
  switch (lightType) {
    case 'distant':
      return `<feDistantLight azimuth="${props.azimuth || 45}" elevation="${props.elevation || 30}" />`
    
    case 'point':
      return `<fePointLight x="${props.x || 100}" y="${props.y || 100}" z="${props.z || 200}" />`
    
    case 'spot':
      return `<feSpotLight x="${props.x || 100}" y="${props.y || 100}" z="${props.z || 200}" pointsAtX="${props.x || 100}" pointsAtY="${props.y || 100}" pointsAtZ="${props.pointsAtZ || 0}" specularExponent="${props.specularExponent || 1}" limitingConeAngle="${props.limitingConeAngle || 45}" />`
    
    default:
      return `<feDistantLight azimuth="45" elevation="30" />`
  }
}

// 生成预览 SVG 过滤器
const previewFilterSvg = computed(() => {
  if (newSubFilters.value.length === 0) {
    return ''
  }
  
  // 使用 core 库的逻辑生成 SVG（简化版）
  const defaultRegion = 'x="0%" y="0%" width="100%" height="100%"'
  
  const subFiltersHtml = newSubFilters.value.map((sf: Partial<SubFilter>) => {
    if (!sf.type) return ''
    
    const props = sf.props as any || {}
    const defaultIn = sf.in || 'SourceGraphic'
    const result = sf.result ? ` result="${sf.result}"` : ''
    
    // 简化的 SVG 生成逻辑
    switch (sf.type) {
      case 'feGaussianBlur':
        return `<feGaussianBlur ${defaultRegion} in="${defaultIn}" stdDeviation="${props.stdDeviation || '2,2'}"${result} />`
      
      case 'feDropShadow':
        return `<feDropShadow ${defaultRegion} in="${defaultIn}" dx="${props.dx || 0}" dy="${props.dy || 0}" stdDeviation="${props.stdDeviation || '2,2'}" flood-color="${props.floodColor || '#000000'}" flood-opacity="${props.floodOpacity || 1}"${result} />`
      
      case 'feFlood':
        return `<feFlood ${defaultRegion} flood-color="${props.floodColor || '#000000'}" flood-opacity="${props.floodOpacity || 1}"${result} />`
      
      case 'feOffset':
        return `<feOffset ${defaultRegion} in="${defaultIn}" dx="${props.dx || 0}" dy="${props.dy || 0}"${result} />`
      
      case 'feColorMatrix':
        return `<feColorMatrix ${defaultRegion} in="${defaultIn}" type="${props.type || 'saturate'}" values="${props.values || '1'}"${result} />`
      
      case 'feBlend':
        return `<feBlend ${defaultRegion} mode="${props.mode || 'normal'}" in="${props.in || 'SourceGraphic'}" in2="${props.in2 || 'SourceGraphic'}"${result} />`
      
      case 'feComposite':
        return `<feComposite ${defaultRegion} operator="${props.operator || 'over'}" in="${props.in || 'SourceGraphic'}" in2="${props.in2 || 'SourceGraphic'}"${result} />`
      
      case 'feMorphology':
        return `<feMorphology ${defaultRegion} in="${defaultIn}" operator="${props.operator || 'erode'}" radius="${props.radius || '0,0'}"${result} />`
      
      case 'feTurbulence':
        return `<feTurbulence ${defaultRegion} type="${props.type || 'fractalNoise'}" baseFrequency="${props.baseFrequency || '0.05,0.05'}" numOctaves="${props.numOctaves || 1}" seed="${props.seed || 0}"${result} />`
      
      case 'feConvolveMatrix':
        return `<feConvolveMatrix ${defaultRegion} in="${defaultIn}" order="${props.order || 3}" kernelMatrix="${props.kernelMatrix || '1 0 0 0 1 0 0 0 1'}" bias="${props.bias || 0}"${result} />`
      
      case 'feMerge': {
        const inputs = props.inputs || ['SourceGraphic']
        const nodes = inputs.map((input: string) => `<feMergeNode in="${input}" />`).join('')
        return `<feMerge ${defaultRegion}${result}>${nodes}</feMerge>`
      }
      
      case 'feImage': {
        const align = props.align || 'xMidYMid'
        const meetOrSlice = props.meetOrSlice || 'meet'
        const preserveAspectRatio = align === 'none' ? 'none' : `${align} ${meetOrSlice}`
        return `<feImage ${defaultRegion} href="${props.href || ''}" preserveAspectRatio="${preserveAspectRatio}"${result} />`
      }
      
      case 'feTile': {
        // feTile 需要先创建一个图案作为输入源
        const patternId = 'preview-pattern'
        return `
          <feTurbulence ${defaultRegion} type="fractalNoise" baseFrequency="0.1,0.1" numOctaves="2" seed="1" result="${patternId}" />
          <feTile ${defaultRegion} in="${patternId}"${result} />`
      }
      
      case 'feComponentTransfer': {
        const funcR = props.funcR || { type: 'identity' }
        const funcG = props.funcG || { type: 'identity' }
        const funcB = props.funcB || { type: 'identity' }
        const funcA = props.funcA || { type: 'identity' }
        
        const generateFuncElement = (func: any, channel: string) => {
          const attrs = []
          if (func.type === 'table' && func.tableValues) {
            attrs.push(`tableValues="${func.tableValues}"`)
          } else if (func.type === 'discrete' && func.tableValues) {
            attrs.push(`tableValues="${func.tableValues}"`)
          } else if (func.type === 'linear') {
            if (func.slope !== undefined) attrs.push(`slope="${func.slope}"`)
            if (func.intercept !== undefined) attrs.push(`intercept="${func.intercept}"`)
          } else if (func.type === 'gamma') {
            if (func.amplitude !== undefined) attrs.push(`amplitude="${func.amplitude}"`)
            if (func.exponent !== undefined) attrs.push(`exponent="${func.exponent}"`)
            if (func.offset !== undefined) attrs.push(`offset="${func.offset}"`)
          }
          
          return `<feFunc${channel} type="${func.type}"${attrs.length ? ' ' + attrs.join(' ') : ''} />`
        }
        
        return `<feComponentTransfer ${defaultRegion} in="${defaultIn}"${result}>
          ${generateFuncElement(funcR, 'R')}
          ${generateFuncElement(funcG, 'G')}
          ${generateFuncElement(funcB, 'B')}
          ${generateFuncElement(funcA, 'A')}
        </feComponentTransfer>`
      }
      
      case 'feDisplacementMap':
        return `<feDisplacementMap ${defaultRegion} in="${props.in || 'SourceGraphic'}" in2="${props.in2 || 'SourceGraphic'}" scale="${props.scale || 0}" xChannelSelector="${props.xChannelSelector || 'R'}" yChannelSelector="${props.yChannelSelector || 'G'}"${result} />`
      
      case 'feSpecularLighting': {
        const lightElement = generatePreviewLightElement(props)
        return `<feSpecularLighting ${defaultRegion} in="${defaultIn}" surfaceScale="${props.surfaceScale || 1}" specularConstant="${props.specularConstant || 1}" specularExponent="${props.specularExponent || 20}" lighting-color="${props.lightingColor || '#ffffff'}"${result}>${lightElement}</feSpecularLighting>`
      }
      
      case 'feDiffuseLighting': {
        const lightElement = generatePreviewLightElement(props)
        return `<feDiffuseLighting ${defaultRegion} in="${defaultIn}" surfaceScale="${props.surfaceScale || 1}" diffuseConstant="${props.diffuseConstant || 1}" lighting-color="${props.lightingColor || '#ffffff'}"${result}>${lightElement}</feDiffuseLighting>`
      }
      
      default:
        return `<!-- ${sf.type} 预览暂不支持 -->`
    }
  }).filter(Boolean).join('\n  ')
  
  return subFiltersHtml
})

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(previewCode.value)
    addLog('代码已复制到剪贴板', 'success')
    // 使用 Element Plus 消息提示
    ElMessage.success('代码已复制到剪贴板！')
  } catch (error) {
    addLog('复制失败: ' + error, 'error')
    ElMessage.error('复制失败，请重试')
  }
}

onMounted(() => {
  init()
})
</script>
