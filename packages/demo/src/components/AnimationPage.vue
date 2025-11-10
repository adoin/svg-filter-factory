<template>
  <div class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
    <main class="p-6">
      <div class="max-w-6xl mx-auto space-y-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">SVG Filter + GSAP 动画案例</h2>
        
        <div class="space-y-6">
          <div
            v-for="example in examples"
            :key="example.id"
            class="bg-white rounded-xl shadow-md p-6 border border-gray-200"
          >
            <!-- 标题和描述 -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-bold text-purple-700">{{ example.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ example.description }}</p>
              </div>
              <el-button type="primary" size="small" @click="copyCode(example)">
                <span class="i-carbon-code mr-1"></span>
                复制代码
              </el-button>
            </div>

            <!-- 预览区域 -->
            <div class="flex gap-6">
              <!-- 左侧：动画预览 -->
              <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                <div :id="`preview-${example.id}`" class="relative">
                  <div 
                    :id="`target-${example.id}`" 
                    :style="example.applyFilterToRoot !== false ? { filter: `url(#filter-${example.id})` } : {}"
                    v-html="example.element"
                  />
                </div>
              </div>

              <!-- 右侧：代码预览 -->
              <div class="flex-1 w-0">
                <div class="bg-gray-900 rounded-lg overflow-hidden">
                  <div class="bg-gray-800 px-4 py-2 text-white text-sm font-semibold">JavaScript + GSAP</div>
                  <pre class="p-4 overflow-x-auto text-sm"><code class="text-white" v-html="highlightCode(example.code)"></code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { register, render, updateFilterConfig } from '@svg-filter-factory/core'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'

hljs.registerLanguage('javascript', javascript)

// 声明全局 GSAP 类型
declare global {
  interface Window {
    gsap: any
  }
}

// 定义动画案例
interface AnimationExample {
  id: string
  name: string
  description: string
  element: string
  filter: any
  code: string
  animate: () => void
  applyFilterToRoot?: boolean  // 是否在外层容器应用过滤器，默认 true
}

const examples = ref<AnimationExample[]>([])
const animations = new Map<string, any>()

// 1. 模糊波动动画
const blurWaveExample = {
  id: 'blur-wave',
  name: '模糊波动',
  description: '高斯模糊值随时间波动',
  element: '<div class="text-6xl font-bold text-white">BLUR</div>',
  filter: {
    id: 'filter-blur-wave',
    config: [
      { type: 'feGaussianBlur', props: { stdDeviation: '0,0' }, result: 'blur' }
    ]
  },
  code: `// 1. 注册过滤器
register({
  id: 'filter-blur-wave',
  config: [
    { type: 'feGaussianBlur', props: { stdDeviation: '0,0' }, result: 'blur' }
  ]
})
render('filter-blur-wave')

// 2. GSAP 动画 - 模糊值波动
gsap.to({}, {
  duration: 2,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  onUpdate: function() {
    const progress = this.progress()
    const blur = progress * 10
    updateFilterConfig('filter-blur-wave', 'blur', 'stdDeviation', \`\${blur},\${blur}\`)
  }
})`,
  animate: () => {
    if (typeof window.gsap === 'undefined') return
    const gsap = (window as any).gsap
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to({}, {
      duration: 2,
      ease: 'sine.inOut',
      onUpdate: function() {
        const progress = this.progress()
        const blur = progress * 10
        updateFilterConfig('filter-blur-wave', 'blur', 'stdDeviation', `${blur},${blur}`)
      }
    })
    animations.set('blur-wave', tl)
  }
}

// 2. 色相旋转动画
const hueRotateExample = {
  id: 'hue-rotate',
  name: '色相旋转',
  description: '色相值持续旋转',
  element: '<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="url(#grad1)" /><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#667eea;stop-opacity:1" /><stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" /></linearGradient></defs></svg>',
  filter: {
    id: 'filter-hue-rotate',
    config: [
      { type: 'feColorMatrix', props: { type: 'hueRotate', values: '0' }, result: 'hue' }
    ]
  },
  code: `// 1. 注册过滤器
register({
  id: 'filter-hue-rotate',
  config: [
    { type: 'feColorMatrix', props: { type: 'hueRotate', values: '0' }, result: 'hue' }
  ]
})
render('filter-hue-rotate')

// 2. GSAP 动画 - 色相旋转 0-360
gsap.to({ hue: 0 }, {
  hue: 360,
  duration: 5,
  repeat: -1,
  ease: 'none',
  onUpdate: function() {
    updateFilterConfig('filter-hue-rotate', 'hue', 'values', this.targets()[0].hue.toString())
  }
})`,
  animate: () => {
    if (typeof window.gsap === 'undefined') return
    const gsap = (window as any).gsap
    const tl = gsap.to({ hue: 0 }, {
      hue: 360,
      duration: 5,
      repeat: -1,
      ease: 'none',
      onUpdate: function() {
        updateFilterConfig('filter-hue-rotate', 'hue', 'values', this.targets()[0].hue.toString())
      }
    })
    animations.set('hue-rotate', tl)
  }
}

// 获取 base URL
const baseUrl = import.meta.env.BASE_URL

// 3. 水波纹效果动画
const waterRippleExample = {
  id: 'water-ripple',
  name: '水波纹效果',
  description: '模拟湖面水波纹动态效果',
  applyFilterToRoot: false,  // 不在外层应用过滤器
  element: `<div style="position: relative; width: 400px; height: 300px; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); background-image: url('${baseUrl}lake.jpg'); background-position: center bottom; background-size: cover;">
    <div id="water-surface" style="position: absolute; bottom: 0; width: 100%; height: 66%; background-image: url('${baseUrl}lake.jpg'); background-position: center bottom; background-size: cover; filter: url(#filter-water-ripple);"></div>
  </div>`,
  filter: {
    id: 'filter-water-ripple',
    config: [
      { type: 'feTurbulence', props: { type: 'fractalNoise', numOctaves: 3, seed: 2, baseFrequency: '0.015,0.1' }, result: 'turbulence' },
      { type: 'feDisplacementMap', props: { scale: 20, xChannelSelector: 'G', yChannelSelector: 'B', in: 'SourceGraphic', in2: 'turbulence' } }
    ]
  },
  code: `// 1. 注册过滤器
register({
  id: 'filter-water-ripple',
  config: [
    { type: 'feTurbulence', props: { type: 'fractalNoise', numOctaves: 3, seed: 2, baseFrequency: '0.015,0.1' }, result: 'turbulence' },
    { type: 'feDisplacementMap', props: { scale: 20, xChannelSelector: 'G', yChannelSelector: 'B', in: 'SourceGraphic', in2: 'turbulence' } }
  ]
})
render('filter-water-ripple')

// 2. GSAP 动画 - 使用 updateFilterConfig 动态更新
gsap.to({}, {
  duration: 8,
  repeat: -1,
  yoyo: true,
  onUpdate: function() {
    const progress = this.progress()
    const bfX = progress * 0.005 + 0.015
    const bfY = progress * 0.05 + 0.1
    // 使用 updateFilterConfig 更新过滤器属性
    updateFilterConfig('filter-water-ripple', 'turbulence', 'baseFrequency', \`\${bfX},\${bfY}\`)
  }
})

// 3. 应用到水面元素
const waterSurface = document.getElementById('water-surface')
if (waterSurface) {
  waterSurface.style.filter = 'url(#filter-water-ripple)'
}`,
  animate: () => {
    if (typeof window.gsap === 'undefined') return
    const gsap = (window as any).gsap
    
    const tl = gsap.to({}, {
      duration: 8,
      repeat: -1,
      yoyo: true,
      onUpdate: function() {
        const progress = this.progress()
        const bfX = progress * 0.005 + 0.015
        const bfY = progress * 0.05 + 0.1
        // 使用 updateFilterConfig 更新过滤器属性
        updateFilterConfig('filter-water-ripple', 'turbulence', 'baseFrequency', `${bfX},${bfY}`)
      }
    })
    
    // 应用过滤器到水面元素
    setTimeout(() => {
      const waterSurface = document.getElementById('water-surface')
      if (waterSurface) {
        waterSurface.style.filter = 'url(#filter-water-ripple)'
      }
    }, 100)
    
    animations.set('water-ripple', tl)
  }
}

// 4. 湍流动画
const turbulenceExample = {
  id: 'turbulence',
  name: '湍流扭曲',
  description: '湍流种子值变化产生动画',
  element: '<div class="text-5xl font-bold text-cyan-400">WAVE</div>',
  filter: {
    id: 'filter-turbulence',
    config: [
      { type: 'feTurbulence', props: { baseFrequency: '0.02,0.02', numOctaves: 3, seed: 0 }, result: 'turbulence' },
      { type: 'feDisplacementMap', props: { scale: 30, xChannelSelector: 'R', yChannelSelector: 'G', in: 'SourceGraphic', in2: 'turbulence' } }
    ]
  },
  code: `// 1. 注册过滤器
register({
  id: 'filter-turbulence',
  config: [
    { type: 'feTurbulence', props: { baseFrequency: '0.02,0.02', numOctaves: 3, seed: 0 }, result: 'turbulence' },
    { type: 'feDisplacementMap', props: { scale: 30, xChannelSelector: 'R', yChannelSelector: 'G', in: 'SourceGraphic', in2: 'turbulence' } }
  ]
})
render('filter-turbulence')

// 2. GSAP 动画 - 改变 seed 值
gsap.to({ seed: 0 }, {
  seed: 100,
  duration: 10,
  repeat: -1,
  ease: 'none',
  onUpdate: function() {
    updateFilterConfig('filter-turbulence', 'turbulence', 'seed', Math.floor(this.targets()[0].seed))
  }
})`,
  animate: () => {
    if (typeof window.gsap === 'undefined') return
    const gsap = (window as any).gsap
    const tl = gsap.to({ seed: 0 }, {
      seed: 100,
      duration: 10,
      repeat: -1,
      ease: 'none',
      onUpdate: function() {
        updateFilterConfig('filter-turbulence', 'turbulence', 'seed', Math.floor(this.targets()[0].seed))
      }
    })
    animations.set('turbulence', tl)
  }
}

// 5. 发光脉冲动画
const glowPulseExample = {
  id: 'glow-pulse',
  name: '发光脉冲',
  description: '外发光强度脉冲变化',
  element: '<svg width="400" height="200" viewBox="0 0 400 200"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="bold" fill="#ff00ff">GLOW</text></svg>',
  filter: {
    id: 'filter-glow-pulse',
    config: [
      { type: 'feMorphology', props: { in: 'SourceAlpha', operator: 'dilate', radius: '0,0' }, result: 'dilated' },
      { type: 'feGaussianBlur', props: { in: 'dilated', stdDeviation: '4,4' }, result: 'blurred' },
      { type: 'feFlood', props: { floodColor: '#00ffff', floodOpacity: 0 }, result: 'color' },
      { type: 'feComposite', props: { operator: 'in', in: 'color', in2: 'blurred' }, result: 'glow' },
      { type: 'feMerge', props: { inputs: ['glow', 'SourceGraphic'] } }
    ]
  },
  code: `// 1. 注册过滤器
register({
  id: 'filter-glow-pulse',
  config: [
    { type: 'feMorphology', props: { in: 'SourceAlpha', operator: 'dilate', radius: '0,0' }, result: 'dilated' },
    { type: 'feGaussianBlur', props: { in: 'dilated', stdDeviation: '4,4' }, result: 'blurred' },
    { type: 'feFlood', props: { floodColor: '#00ffff', floodOpacity: 0 }, result: 'color' },
    { type: 'feComposite', props: { operator: 'in', in: 'color', in2: 'blurred' }, result: 'glow' },
    { type: 'feMerge', props: { inputs: ['glow', 'SourceGraphic'] } }
  ]
})
render('filter-glow-pulse')

// 2. GSAP 动画 - 发光脉冲
gsap.to({ radius: 0, opacity: 0 }, {
  radius: 5,
  opacity: 1,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  onUpdate: function() {
    const target = this.targets()[0]
    updateFilterConfig('filter-glow-pulse', 'dilated', 'radius', \`\${target.radius},\${target.radius}\`)
    updateFilterConfig('filter-glow-pulse', 'color', 'floodOpacity', target.opacity)
  }
})`,
  animate: () => {
    if (typeof window.gsap === 'undefined') return
    const gsap = (window as any).gsap
    const tl = gsap.to({ radius: 0, opacity: 0 }, {
      radius: 5,
      opacity: 1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      onUpdate: function() {
        const target = this.targets()[0]
        updateFilterConfig('filter-glow-pulse', 'dilated', 'radius', `${target.radius},${target.radius}`)
        updateFilterConfig('filter-glow-pulse', 'color', 'floodOpacity', target.opacity)
      }
    })
    animations.set('glow-pulse', tl)
  }
}

// 6. 按钮点击扰动效果
const buttonClickExample = {
  id: 'button-click',
  name: '点击扰动',
  description: '按钮点击时产生湍流扰动效果',
  element: '<button class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-bold cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-colors" id="click-button">Click Me</button>',
  filter: {
    id: 'filter-button-click',
    config: [
      { type: 'feTurbulence', props: { type: 'fractalNoise', baseFrequency: '0,0.000001', numOctaves: 2 }, result: 'NOISE' },
      { type: 'feDisplacementMap', props: { scale: 30, xChannelSelector: 'R', yChannelSelector: 'R', in: 'SourceGraphic', in2: 'NOISE' } }
    ]
  },
  code: `// 1. 注册过滤器
register({
  id: 'filter-button-click',
  config: [
    { type: 'feTurbulence', props: { type: 'fractalNoise', baseFrequency: '0,0.000001', numOctaves: 2 }, result: 'NOISE' },
    { type: 'feDisplacementMap', props: { scale: 30, xChannelSelector: 'R', yChannelSelector: 'R', in: 'SourceGraphic', in2: 'NOISE' } }
  ]
})
render('filter-button-click')

// 2. GSAP 动画 - 点击时扰动
const button = document.getElementById('click-button')
const turbVal = { val: 0.000001 }
const btTl = gsap.timeline({ 
  paused: true, 
  onUpdate: function() {
    updateFilterConfig('filter-button-click', 'NOISE', 'baseFrequency', \`0,\${turbVal.val}\`)
  }
})

btTl.to(turbVal, 0.2, { val: 0.2 })
    .to(turbVal, 0.2, { val: 0.000001 })

button.addEventListener('click', function() {
  btTl.restart()
})`,
  animate: () => {
    if (typeof window.gsap === 'undefined') return
    const gsap = (window as any).gsap
    
    // 创建 Timeline，初始暂停
    const turbVal = { val: 0.000001 }
    const btTl = gsap.timeline({ 
      paused: true,
      onUpdate: function() {
        updateFilterConfig('filter-button-click', 'NOISE', 'baseFrequency', `0,${turbVal.val}`)
      }
    })
    
    btTl.to(turbVal, 0.2, { val: 0.2 })
       .to(turbVal, 0.2, { val: 0.000001 })
    
    // 只在点击时触发，不自动播放
    setTimeout(() => {
      const button = document.getElementById('click-button')
      if (button) {
        button.addEventListener('click', () => {
          btTl.restart()
        })
      }
    }, 100)
    
    animations.set('button-click', btTl)
  }
}

// 初始化示例
examples.value = [
  blurWaveExample,
  hueRotateExample,
  waterRippleExample,
  turbulenceExample,
  glowPulseExample,
  buttonClickExample
] as AnimationExample[]

// 代码高亮
const highlightCode = (code: string) => {
  try {
    return hljs.highlight(code, { language: 'javascript' }).value
  } catch {
    return code
  }
}

// 复制代码
const copyCode = async (example: AnimationExample) => {
  try {
    await navigator.clipboard.writeText(example.code)
    ElMessage.success('代码已复制到剪贴板！')
  } catch (error) {
    ElMessage.error('复制失败，请重试')
  }
}

// 初始化
onMounted(() => {
  // 注册所有过滤器
  examples.value.forEach(example => {
    register(example.filter)
    render(example.filter.id)
  })
  // 延迟启动所有动画
  setTimeout(() => {
    examples.value.forEach(example => {
      example.animate()
    })
  }, 500)
  ElMessage.success('动画案例已加载并自动播放')
})

// 清理
onBeforeUnmount(() => {
  animations.forEach(tl => tl.kill())
  animations.clear()
})
</script>

