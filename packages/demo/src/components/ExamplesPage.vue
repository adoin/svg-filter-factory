<template>
  <div class="bg-gradient-to-br from-gray-50 to-gray-100">
    <main class="flex h-[calc(100vh-64px)]">
      <!-- 左侧：案例列表 -->
      <section class="flex-1 overflow-y-auto p-6 mr-[400px]">
        <div class="max-w-5xl mx-auto space-y-3">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">经典 SVG 过滤器案例</h2>

          <div class="space-y-2">
            <div v-for="example in examples" :key="example.id"
              class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <h3 class="text-base font-bold text-purple-700 whitespace-nowrap">{{ example.name }}</h3>
                  <p class="text-sm text-gray-600 truncate flex-1">{{ example.description }}</p>
                  <span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                    {{ example.config.length }} 个
                  </span>
                </div>

                <div class="flex gap-2 shrink-0">
                  <el-button type="primary" size="small" @click="previewExample(example.id)">
                    <span class="i-carbon-view mr-1"></span>
                    预览
                  </el-button>
                  <el-button type="success" size="small" @click="copyCode(example)">
                    <span class="i-carbon-code mr-1"></span>
                    代码
                  </el-button>
                  <el-button type="info" size="small" @click="copyJson(example)">
                    <span class="i-carbon-document mr-1"></span>
                    JSON
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 共享预览组件（固定在右侧） -->
    <FilterPreview :current-filter="currentFilter" :rendered-filters="renderedFilters"
      @apply-filter="handleApplyFilter" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { register, render, getRegisteredFilters } from '@svg-filter-factory/core'
import type { FilterDefinition } from '@svg-filter-factory/core'
import FilterPreview from './FilterPreview.vue'

defineEmits<{
  'back-home': []
}>()

const currentFilter = ref('')
const renderedFilters = ref<string[]>([])

// 初始化已渲染的过滤器列表
onMounted(() => {
  const filters = getRegisteredFilters()
  renderedFilters.value = filters.map(f => f.id)
})

// 处理应用过滤器
const handleApplyFilter = (filter: string) => {
  currentFilter.value = filter
}

// 经典案例数据（按类别分组）
const examples = ref<Array<FilterDefinition & { name: string, description: string, category?: string }>>([
  // === 字体特效 ===
  {
    id: 'commando-chrome',
    name: '突击队字体 - 假铬效果',
    description: '80s 金属质感文字效果',
    category: 'font',
    config: [
      { type: 'feGaussianBlur', props: { in: 'SourceAlpha', stdDeviation: '3,3' }, result: 'blur' },
      { type: 'feFlood', props: { floodColor: '#00ff00', floodOpacity: 0.8 }, result: 'color' },
      { type: 'feComposite', props: { operator: 'in', in: 'color', in2: 'blur' }, result: 'glow' },
      { type: 'feMerge', props: { inputs: ['glow', 'SourceGraphic'] } }
    ]
  },
  {
    id: 'texture',
    name: '贴图纹理',
    description: '纹理贴图效果',
    config: [
      { type: 'feImage', props: { href: 'https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2019/01/Screen-Shot-2019-01-16-at-15.15.00.png?x70870', align: 'xMidYMid', meetOrSlice: 'slice' }, result: 'image' },
      { type: 'feColorMatrix', props: { type: 'saturate', values: '0', in: 'SourceGraphic' }, result: 'colormatrix' },
      { type: 'feGaussianBlur', props: { stdDeviation: '0.25,0.25', in: 'colormatrix' }, result: 'blur' },
      { type: 'feDisplacementMap', props: { scale: 15, xChannelSelector: 'R', yChannelSelector: 'R', in2: 'blur', in: 'SourceGraphic' }, result: 'texture' },
      { type: 'feImage', props: { href: 'https://codrops-1f606.kxcdn.com/codrops/wp-content/uploads/2019/01/Screen-Shot-2019-01-16-at-15.15.00.png?x70870', align: 'xMidYMid', meetOrSlice: 'slice' }, result: 'bg' },
      { type: 'feColorMatrix', props: { type: 'matrix', values: '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 0.9 0', in: 'texture' }, result: 'textured-template' },
      { type: 'feBlend', props: { mode: 'multiply', in: 'bg', in2: 'textured-template' }, result: 'blend' },
      { type: 'feMerge', props: { inputs: ['bg', 'blend'] }, result: 'merge' }
    ]
  },
  {
    id: 'example-emboss',
    name: '浮雕效果',
    description: '3D 浮雕凸起效果',
    config: [
      { type: 'feOffset', props: { dx: 2, dy: 2, in: 'SourceAlpha' }, result: 'offset' },
      { type: 'feGaussianBlur', props: { stdDeviation: '2,2', in: 'offset' }, result: 'blur' },
      { type: 'feSpecularLighting', props: { surfaceScale: 5, specularConstant: 1, specularExponent: 20, lightingColor: '#ffffff', lightType: 'distant', azimuth: 45, elevation: 30, in: 'blur' }, result: 'spec' },
      { type: 'feComposite', props: { operator: 'in', in: 'spec', in2: 'SourceAlpha' }, result: 'specOut' },
      { type: 'feComposite', props: { operator: 'over', in: 'specOut', in2: 'SourceGraphic' } }
    ]
  },
  {
    id: 'example-outline',
    name: '描边效果',
    description: '清晰的外边框',
    config: [
      { type: 'feMorphology', props: { operator: 'dilate', radius: '2,2', in: 'SourceAlpha' }, result: 'dilated' },
      { type: 'feComposite', props: { operator: 'out', in: 'dilated', in2: 'SourceAlpha' }, result: 'outline' },
      { type: 'feFlood', props: { floodColor: '#000000', floodOpacity: 1 }, result: 'black' },
      { type: 'feComposite', props: { operator: 'in', in: 'black', in2: 'outline' }, result: 'outlineColor' },
      { type: 'feComposite', props: { operator: 'over', in: 'outlineColor', in2: 'SourceGraphic' } }
    ]
  },
  {
    id: 'example-sharpen',
    name: '锐化效果',
    description: '增强图像清晰度',
    config: [
      {
        type: 'feConvolveMatrix',
        props: {
          order: '3,3',
          kernelMatrix: '0 -1 0 -1 5 -1 0 -1 0',
          bias: 0,
          edgeMode: 'duplicate'
        }
      }
    ]
  },
  {
    id: 'example-blur',
    name: '模糊效果',
    description: '柔和的高斯模糊',
    config: [
      { type: 'feGaussianBlur', props: { stdDeviation: '5,5' } }
    ]
  },
  {
    id: 'example-shadow',
    name: '投影效果',
    description: '经典阴影效果',
    config: [
      { type: 'feDropShadow', props: { dx: 4, dy: 4, stdDeviation: '3,3', floodColor: '#000000', floodOpacity: 0.5 } }
    ]
  },
  {
    id: 'example-hue-rotate',
    name: '色相旋转',
    description: '色彩变换效果',
    config: [
      { type: 'feColorMatrix', props: { type: 'hueRotate', values: '90' } }
    ]
  },
  {
    id: 'example-saturate',
    name: '饱和度增强',
    description: '提升色彩饱和度',
    config: [
      { type: 'feColorMatrix', props: { type: 'saturate', values: '2' } }
    ]
  },
  {
    id: 'example-contrast',
    name: '对比度增强',
    description: '增强明暗对比',
    config: [
      { type: 'feComponentTransfer', props: { funcR: { type: 'linear', slope: 1.5, intercept: -0.25 }, funcG: { type: 'linear', slope: 1.5, intercept: -0.25 }, funcB: { type: 'linear', slope: 1.5, intercept: -0.25 }, funcA: { type: 'identity' } } }
    ]
  },
  {
    id: 'example-water-ripple',
    name: '水波纹效果',
    description: '动态波纹扭曲',
    config: [
      { type: 'feTurbulence', props: { type: 'fractalNoise', baseFrequency: '0.02,0.02', numOctaves: 3, seed: 1 }, result: 'turbulence' },
      { type: 'feDisplacementMap', props: { scale: 20, xChannelSelector: 'R', yChannelSelector: 'G', in: 'SourceGraphic', in2: 'turbulence' } }
    ]
  },
  {
    id: 'example-metal',
    name: '金属质感',
    description: '金属光泽效果',
    config: [
      { type: 'feTurbulence', props: { type: 'turbulence', baseFrequency: '0.1,0.1', numOctaves: 2, seed: 1 }, result: 'noise' },
      { type: 'feSpecularLighting', props: { surfaceScale: 3, specularConstant: 1.5, specularExponent: 25, lightingColor: '#ffffff', lightType: 'distant', azimuth: 135, elevation: 45 , in: 'noise'}, result: 'light' },
      { type: 'feBlend', props: { mode: 'multiply', in: 'light', in2: 'SourceGraphic' } }
    ]
  },
  {
    id: 'example-3d-offset',
    name: '3D偏移',
    description: '3D立体偏移效果',
    config: [
      { type: 'feOffset', props: { dx: 3, dy: 3, in: 'SourceAlpha' }, result: 'layer1' },
      { type: 'feOffset', props: { dx: 6, dy: 6, in: 'SourceAlpha' }, result: 'layer2' },
      { type: 'feOffset', props: { dx: 9, dy: 9, in: 'SourceAlpha' }, result: 'layer3' },
      { type: 'feFlood', props: { floodColor: '#ff0066', floodOpacity: 0.7 }, result: 'color1' },
      { type: 'feComposite', props: { operator: 'in', in: 'color1', in2: 'layer1' }, result: 'coloredLayer1' },
      { type: 'feFlood', props: { floodColor: '#0066ff', floodOpacity: 0.5 }, result: 'color2' },
      { type: 'feComposite', props: { operator: 'in', in: 'color2', in2: 'layer2' }, result: 'coloredLayer2' },
      { type: 'feFlood', props: { floodColor: '#00ff66', floodOpacity: 0.3 }, result: 'color3' },
      { type: 'feComposite', props: { operator: 'in', in: 'color3', in2: 'layer3' }, result: 'coloredLayer3' },
      { type: 'feMerge', props: { inputs: ['coloredLayer3', 'coloredLayer2', 'coloredLayer1', 'SourceGraphic'] } }
    ]
  },

  {
    id: 'example-color-shadow',
    name: '红色通道加阴影',
    description: '内阴影+外发光效果',
    config: [
      { type: 'feFlood', props: { floodColor: '#d099ff', floodOpacity: 0.83 }, result: 'flood1' },
      { type: 'feComposite', props: { operator: 'out', in: 'flood1', in2: 'SourceAlpha' }, result: 'comp1' },
      { type: 'feMorphology', props: { operator: 'dilate', radius: '0.5,0.5', in: 'comp1' }, result: 'morph1' },
      { type: 'feBlend', props: { mode: 'lighten', in: 'morph1', in2: 'SourceGraphic' }, result: 'inner-shadow' },
      { type: 'feColorMatrix', props: { type: 'matrix', values: '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n1 0 0 0 -0.1', in: 'SourceGraphic' }, result: 'matrix1' },
      { type: 'feGaussianBlur', props: { stdDeviation: '3.5,3.5', in: 'matrix1' }, result: 'glow' },
      { type: 'feComposite', props: { operator: 'atop', in: 'inner-shadow', in2: 'SourceGraphic' }, result: 'comp2' },
      { type: 'feComposite', props: { operator: 'over', in: 'comp2', in2: 'glow' } }
    ]
  },
  {
    id: 'example-rounded',
    name: '圆角柔化',
    description: '圆角柔化效果',
    config: [
      { type: 'feGaussianBlur', props: { stdDeviation: '2,2', in: 'SourceGraphic' }, result: 'blur' },
      { type: 'feColorMatrix', props: { type: 'matrix', values: '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 19 -9', in: 'blur' }, result: 'goo' },
      { type: 'feComposite', props: { operator: 'atop', in: 'SourceGraphic', in2: 'goo' } }
    ]
  },

  {
    id: 'example-led',
    name: 'LED 霓虹灯',
    description: 'LED 立体发光效果',
    config: [
      { type: 'feFlood', props: { floodColor: '#4CFED7', floodOpacity: 1 }, result: 'COL_green-l' },
      { type: 'feFlood', props: { floodColor: '#FA5C71', floodOpacity: 1 }, result: 'COL_red-l' },
      { type: 'feMorphology', props: { operator: 'dilate', radius: '10,10', in: 'SourceAlpha' }, result: 'GREEN-BEVEL-1_10' },
      {
        type: 'feConvolveMatrix', props: {
          order: '8,8',
          kernelMatrix: '1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1',
          in: 'GREEN-BEVEL-1_10'
        }, result: 'GREEN-BEVEL-1_20'
      },
      { type: 'feComposite', props: { operator: 'in', in: 'COL_green-l', in2: 'GREEN-BEVEL-1_10' }, result: 'GREEN-FRONT-1_0' },
      { type: 'feOffset', props: { dx: 4, dy: 4, in: 'GREEN-FRONT-1_0' }, result: 'GREEN-FRONT-1_10' },
      { type: 'feConvolveMatrix', props: { order: '4,4', kernelMatrix: '1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1', in: 'SourceAlpha' }, result: 'RED-BEVEL-0_0' },
      { type: 'feComposite', props: { operator: 'in', in: 'COL_red-l', in2: 'RED-BEVEL-0_0' }, result: 'RED-BEVEL-0_10' },
      { type: 'feOffset', props: { dx: 20, dy: 20, in: 'RED-BEVEL-0_10' }, result: 'RED-FRONT-0_10' },
      { type: 'feMerge', props: { inputs: ['GREEN-BEVEL-1_10', 'GREEN-FRONT-1_10', 'RED-FRONT-0_10'] } }
    ]
  },
  {
    id: 'example-tetris',
    name: '俄罗斯方块',
    description: '像素风格立体效果',
    config: [
      { type: 'feFlood', props: { floodColor: '#000000', floodOpacity: 1 }, result: 'COLOR-black' },
      { type: 'feMorphology', props: { operator: 'dilate', radius: '4,4', in: 'SourceAlpha' }, result: 'FAT-OUTLINE_10' },
      { type: 'feConvolveMatrix', props: { order: '6,5', kernelMatrix: '0 0 1 1 0 0 0 1 1 1 1 0 1 1 1 1 1 1 0 1 1 1 1 0 0 0 1 1 0 0', in: 'FAT-OUTLINE_10' }, result: 'FAT-OUTLINE_20' },
      { type: 'feOffset', props: { dx: 4, dy: 0, in: 'FAT-OUTLINE_20' }, result: 'FAT-OUTLINE_30' },
      { type: 'feOffset', props: { dx: 7, dy: 8, in: 'FAT-OUTLINE_30' }, result: 'STRIPED-SHADOW_30' },
      { type: 'feComposite', props: { operator: 'in', in: 'COLOR-black', in2: 'STRIPED-SHADOW_30' }, result: 'SHADOW' },
      { type: 'feGaussianBlur', props: { stdDeviation: '4,4', in: 'SourceAlpha' }, result: 'REFLECTION_10' },
      { type: 'feSpecularLighting', props: { surfaceScale: 7, specularConstant: 1.8, specularExponent: 30, lightingColor: '#ffffff', lightType: 'point', x: -100, y: -150, z: 250, in: 'REFLECTION_10' }, result: 'REFLECTION_20' },
      { type: 'feComposite', props: { operator: 'in', in: 'REFLECTION_20', in2: 'SourceAlpha' }, result: 'REFLECTION_30' },
      { type: 'feMerge', props: { inputs: ['SHADOW', 'FAT-OUTLINE_30', 'SourceGraphic', 'REFLECTION_30'] } }
    ]
  },
  {
    id: 'example-comic',
    name: '美漫过场',
    description: '漫画风格扭曲效果',
    config: [
      { type: 'feFlood', props: { floodColor: '#73DCFF', floodOpacity: 0.75 }, result: 'COLOR-blu' },
      { type: 'feTurbulence', props: { baseFrequency: '0.05,0.05', type: 'fractalNoise', numOctaves: 3, seed: 0 }, result: 'Texture_10' },
      { type: 'feColorMatrix', props: { type: 'matrix', values: '0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 -2.1 1.1' , in: 'Texture_10'}, result: 'Texture_20' },
      { type: 'feOffset', props: { dx: -3, dy: 4, in: 'SourceAlpha' }, result: 'FILL_10' },
      { type: 'feDisplacementMap', props: { scale: 17, xChannelSelector: 'R', yChannelSelector: 'G', in2: 'Texture_10' , in: 'FILL_10'}, result: 'FILL_20' },
      { type: 'feComposite', props: { operator: 'in', in: 'COLOR-blu', in2: 'FILL_20' }, result: 'FILL_50' },
      { type: 'feMorphology', props: { operator: 'dilate', radius: '3,3', in: 'SourceAlpha' }, result: 'OUTLINE_10' },
      { type: 'feComposite', props: { operator: 'out', in: 'OUTLINE_10', in2: 'SourceAlpha' }, result: 'OUTLINE_20' },
      { type: 'feDisplacementMap', props: { scale: 7, xChannelSelector: 'R', yChannelSelector: 'G', in2: 'Texture_10' , in: 'OUTLINE_20'}, result: 'OUTLINE_30' },
      { type: 'feMerge', props: { inputs: ['FILL_50', 'OUTLINE_30'] } }
    ]
  },
  {
    id: 'example-light-shadow',
    name: '光影文字',
    description: '光影纹理质感',
    config: [
      { type: 'feFlood', props: { floodColor: '#582D1B', floodOpacity: 1 }, result: 'COLOR-red' },
      { type: 'feTurbulence', props: { baseFrequency: '0.05,0.004', type: 'fractalNoise', numOctaves: 4, seed: 0 }, result: 'FRACTAL-TEXTURE_10' },
      { type: 'feColorMatrix', props: { type: 'matrix', values: '0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 -1.2 1.1' , in: 'FRACTAL-TEXTURE_10'}, result: 'FRACTAL-TEXTURE_20' },
      { type: 'feMorphology', props: { operator: 'dilate', radius: '4,4', in: 'SourceAlpha' }, result: 'STROKE_10' },
      { type: 'feConvolveMatrix', props: { order: '8,8', kernelMatrix: '1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1' , in: 'STROKE_10'}, result: 'BEVEL_20' },
      { type: 'feOffset', props: { dx: 4, dy: 4 , in: 'BEVEL_20'}, result: 'BEVEL_25' },
      { type: 'feComposite', props: { operator: 'out', in: 'BEVEL_25', in2: 'STROKE_10' }, result: 'BEVEL_30' },
      { type: 'feComposite', props: { operator: 'in', in: 'COLOR-red', in2: 'BEVEL_30' }, result: 'BEVEL_40' },
      { type: 'feMerge', props: { inputs: ['BEVEL_40', 'SourceGraphic'] }, result: 'BEVEL_50' },
      { type: 'feComposite', props: { operator: 'in', in: 'BEVEL_50', in2: 'FRACTAL-TEXTURE_20' } }
    ]
  }
])

// 预览案例
const previewExample = (id: string) => {
  const example = examples.value.find(e => e.id === id)
  if (!example) return

  try {
    // 注册并渲染
    register(example)
    render(id)

    // 添加到已渲染列表
    if (!renderedFilters.value.includes(id)) {
      renderedFilters.value.push(id)
    }

    // 应用过滤器
    handleApplyFilter(`url(#${id})`)
    ElMessage.success(`已应用过滤器: ${example.name}`)
  } catch (error) {
    ElMessage.error(`应用过滤器失败: ${error}`)
  }
}

// 复制代码
const copyCode = async (example: FilterDefinition) => {
  const configArray = example.config.map((sub) => {
    const parts: string[] = []
    parts.push(`type: '${sub.type}'`)
    if (sub.props && Object.keys(sub.props).length > 0) {
      const propsStr = JSON.stringify(sub.props, null, 2)
        .split('\n')
        .map((line, idx) => idx === 0 ? line : '        ' + line)
        .join('\n')
      parts.push(`props: ${propsStr}`)
    }
    // in 现在在 props 内,不再单独输出
    if (sub.result) {
      parts.push(`result: '${sub.result}'`)
    }
    return `    {\n      ${parts.join(',\n      ')}\n    }`
  })

  const code = `// 1. 导入 SVG Filter Factory
import { register, render } from '@svg-filter-factory/core'

// 2. 注册过滤器
register({
  id: '${example.id}',
  config: [
${configArray.join(',\n')}
  ]
})

// 3. 渲染过滤器到页面
render('${example.id}')

// 4. 应用到元素
// document.getElementById('myElement').style.filter = 'url(#${example.id})'`

  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制到剪贴板！')
  } catch (error) {
    ElMessage.error('复制失败，请重试')
  }
}

// 复制JSON
const copyJson = async (example: FilterDefinition) => {
  try {
    const json = JSON.stringify(example, null, 2)
    await navigator.clipboard.writeText(json)
    ElMessage.success('JSON 已复制到剪贴板！')
  } catch (error) {
    ElMessage.error('复制失败，请重试')
  }
}
</script>