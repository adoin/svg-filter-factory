<template>
  <div 
    :class="[
      'fixed right-0 top-0 h-screen bg-white shadow-2xl transition-all duration-300 z-50',
      isCollapsed ? 'w-0' : 'w-[400px]'
    ]"
  >
    <!-- 收缩按钮 -->
    <button
      @click="toggleCollapse"
      :class="[
        'absolute left-0 top-1/2 -translate-x-full bg-purple-600 text-white px-2 py-4 rounded-l-lg hover:bg-purple-700 transition-colors z-10',
        isCollapsed ? '' : 'shadow-lg'
      ]"
    >
      <span :class="['i-carbon-chevron-right text-xl transition-transform', isCollapsed ? 'rotate-180' : '']">{{ isCollapsed?'<':'>' }}</span>
    </button>

    <!-- 内容区域 -->
    <div v-show="!isCollapsed" class="h-full flex flex-col overflow-hidden">
      <!-- 标题 -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
        <h3 class="text-xl font-bold">效果预览</h3>
      </div>

      <!-- 过滤器选择 -->
      <div class="px-6 py-4 bg-gray-50 border-b">
        <div class="flex items-center gap-3 mb-3">
          <strong class="text-gray-700 text-sm">当前应用：</strong> 
          <code class="bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono text-xs">
            {{ currentFilter || '无' }}
          </code>
        </div>
        <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          <el-button 
            @click="$emit('apply-filter', '')" 
            :type="currentFilter === '' ? 'primary' : ''"
            size="small"
          >
            无过滤器
          </el-button>
          <el-button 
            v-for="filter in renderedFilters" 
            :key="filter"
            @click="$emit('apply-filter', `url(#${filter})`)" 
            :type="currentFilter === `url(#${filter})` ? 'primary' : ''"
            size="small"
            class="font-mono text-xs"
          >
            {{ filter }}
          </el-button>
        </div>
      </div>

      <!-- 预览内容 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- SVG图形 -->
        <div class="flex flex-col">
          <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg text-sm">
            SVG 图形
          </h4>
          <div class="flex justify-center items-center h-40 bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-4">
            <svg width="100%" height="160" viewBox="0 0 200 200">
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
          <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg text-sm">
            文本
          </h4>
          <div class="flex justify-center items-center h-40 bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-4">
            <span 
              class="text-4xl font-bold"
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
          <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg text-sm">
            图片
          </h4>
          <div class="flex justify-center items-center h-40 bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-4">
            <img 
              src="https://picsum.photos/120/120" 
              class="rounded-lg shadow-md"
              :style="{ filter: currentFilter ? currentFilter : 'none' }"
            />
          </div>
        </div>

        <!-- SVG文本 -->
        <div class="flex flex-col">
          <h4 class="text-center font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-t-lg text-sm">
            SVG 文本
          </h4>
          <div class="flex justify-center items-center h-40 bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-lg shadow p-4">
            <svg width="100%" height="160" viewBox="0 0 500 200">
              <text 
                x="250" 
                y="120" 
                text-anchor="middle" 
                font-size="20" 
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  currentFilter: string
  renderedFilters: string[]
}>()

defineEmits<{
  'apply-filter': [filter: string]
  'collapse-change': [collapsed: boolean]
}>()

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

