<template>
  <div class="p-3 bg-gray-50 rounded">
    <!-- feGaussianBlur -->
    <template v-if="type === 'feGaussianBlur'">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="偏差值 X">
            <el-input-number 
              v-model="localProps.stdDeviationX" 
              :min="0" 
              :step="0.1"
              size="small"
              @blur="updateStdDeviation"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="偏差值 Y">
            <el-input-number 
              v-model="localProps.stdDeviationY" 
              :min="0" 
              :step="0.1"
              size="small"
              @blur="updateStdDeviation"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-text type="info" size="small">控制水平和垂直方向的模糊程度，值越大越模糊</el-text>
    </template>

    <!-- feDropShadow -->
    <template v-else-if="type === 'feDropShadow'">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="偏移 X (dx)">
            <el-input-number 
              v-model="localProps.dx" 
              :step="1"
              size="small"
              @blur="emitUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="偏移 Y (dy)">
            <el-input-number 
              v-model="localProps.dy" 
              :step="1"
              size="small"
              @blur="emitUpdate"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="模糊偏差 X">
            <el-input-number 
              v-model="localProps.stdDeviationX" 
              :min="0" 
              :step="0.1"
              size="small"
              @blur="updateStdDeviation"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模糊偏差 Y">
            <el-input-number 
              v-model="localProps.stdDeviationY" 
              :min="0" 
              :step="0.1"
              size="small"
              @blur="updateStdDeviation"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="阴影颜色">
            <el-color-picker 
              v-model="localProps.floodColor" 
              @change="emitUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="不透明度">
            <el-slider 
              v-model="localProps.floodOpacity" 
              :min="0" 
              :max="1" 
              :step="0.01"
              @change="emitUpdate"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-text type="info" size="small">创建阴影效果：dx/dy 控制偏移，stdDeviation 控制模糊度</el-text>
    </template>

    <!-- feFlood -->
    <template v-else-if="type === 'feFlood'">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="填充颜色">
            <el-color-picker 
              v-model="localProps.floodColor" 
              @change="emitUpdate"
              show-alpha
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="不透明度">
            <el-slider 
              v-model="localProps.floodOpacity" 
              :min="0" 
              :max="1" 
              :step="0.01"
              @change="emitUpdate"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-text type="info" size="small">用指定颜色和透明度填充整个滤镜区域</el-text>
    </template>

    <!-- feColorMatrix -->
    <template v-else-if="type === 'feColorMatrix'">
      <el-form-item label="类型">
        <el-select 
          v-model="localProps.type" 
          @change="onColorMatrixTypeChange"
          :options="colorMatrixTypes"
        />
      </el-form-item>
      
      <!-- 当类型为 matrix 时使用 textarea -->
      <el-form-item v-if="localProps.type === 'matrix'" label="矩阵值 (4行5列)">
        <el-input
          v-model="localProps.matrixValues"
          type="textarea"
          :rows="5"
          @blur="updateColorMatrixValues"
          placeholder="1 0 0 0 0&#10;0 1 0 0 0&#10;0 0 1 0 0&#10;0 0 0 1 0"
          class="font-mono"
        />
      </el-form-item>
      
      <!-- 其他类型使用普通输入（luminanceToAlpha 不显示） -->
      <el-form-item v-else-if="localProps.type !== 'luminanceToAlpha'" label="值">
        <el-input
          v-model="localProps.singleValue"
          @blur="updateColorMatrixValues"
          :placeholder="getColorMatrixPlaceholder(localProps.type)"
        />
      </el-form-item>
      
      <el-text type="info" size="small">{{ getColorMatrixDescription(localProps.type) }}</el-text>
    </template>

    <!-- feMorphology -->
    <template v-else-if="type === 'feMorphology'">
      <el-form-item label="操作类型">
        <el-select 
          v-model="localProps.operator" 
          @change="emitUpdate"
          :options="morphologyOperators"
        />
      </el-form-item>
      
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="变形半径 X">
            <el-input-number 
              v-model="localProps.radiusX" 
              :min="0" 
              :step="1"
              size="small"
              @blur="updateRadius"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="变形半径 Y">
            <el-input-number 
              v-model="localProps.radiusY" 
              :min="0" 
              :step="1"
              size="small"
              @blur="updateRadius"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-text type="info" size="small">
        {{ localProps.operator === 'erode' ? '侵蚀：使图像变细，减小明亮区域' : '膨胀：使图像变粗，扩大明亮区域' }}
      </el-text>
    </template>

    <!-- feOffset -->
    <template v-else-if="type === 'feOffset'">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="偏移 X (dx)">
            <el-input-number 
              v-model="localProps.dx" 
              :step="1"
              size="small"
              @blur="emitUpdate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="偏移 Y (dy)">
            <el-input-number 
              v-model="localProps.dy" 
              :step="1"
              size="small"
              @blur="emitUpdate"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-text type="info" size="small">将图像在水平和垂直方向上移动指定的像素距离</el-text>
    </template>

    <!-- feComponentTransfer -->
    <template v-else-if="type === 'feComponentTransfer'">
      <div class="mb-3">
        <el-text type="primary" size="small">
          配置 RGBA 四个颜色通道的传输函数
        </el-text>
      </div>
      
      <!-- R 通道 -->
      <div class="p-4 mb-4 bg-white border border-gray-200 rounded">
        <h4 class="m-0 mb-2.5 text-blue-500 text-sm font-semibold">R 通道 (红色)</h4>
        <el-form-item label="函数类型">
          <el-select 
            v-model="localProps.funcR.type" 
            @change="onChannelTypeChange('funcR', $event)"
            :options="channelFunctionTypes"
          />
        </el-form-item>
        <component 
          :is="getChannelParamsComponent('funcR')" 
          v-model="localProps.funcR"
          @update:modelValue="emitUpdate"
        />
      </div>

      <!-- G 通道 -->
      <div class="p-4 mb-4 bg-white border border-gray-200 rounded">
        <h4 class="m-0 mb-2.5 text-blue-500 text-sm font-semibold">G 通道 (绿色)</h4>
        <el-form-item label="函数类型">
          <el-select 
            v-model="localProps.funcG.type" 
            @change="onChannelTypeChange('funcG', $event)"
            :options="channelFunctionTypes"
          />
        </el-form-item>
        <component 
          :is="getChannelParamsComponent('funcG')" 
          v-model="localProps.funcG"
          @update:modelValue="emitUpdate"
        />
      </div>

      <!-- B 通道 -->
      <div class="p-4 mb-4 bg-white border border-gray-200 rounded">
        <h4 class="m-0 mb-2.5 text-blue-500 text-sm font-semibold">B 通道 (蓝色)</h4>
        <el-form-item label="函数类型">
          <el-select 
            v-model="localProps.funcB.type" 
            @change="onChannelTypeChange('funcB', $event)"
            :options="channelFunctionTypes"
          />
        </el-form-item>
        <component 
          :is="getChannelParamsComponent('funcB')" 
          v-model="localProps.funcB"
          @update:modelValue="emitUpdate"
        />
      </div>

      <!-- A 通道 -->
      <div class="p-4 mb-4 bg-white border border-gray-200 rounded">
        <h4 class="m-0 mb-2.5 text-blue-500 text-sm font-semibold">A 通道 (透明度)</h4>
        <el-form-item label="函数类型">
          <el-select 
            v-model="localProps.funcA.type" 
            @change="onChannelTypeChange('funcA', $event)"
            :options="channelFunctionTypes"
          />
        </el-form-item>
        <component 
          :is="getChannelParamsComponent('funcA')" 
          v-model="localProps.funcA"
          @update:modelValue="emitUpdate"
        />
      </div>
    </template>

    <!-- feBlend -->
    <template v-else-if="type === 'feBlend'">
      <el-form-item label="混合模式">
        <el-select 
          v-model="localProps.mode" 
          @change="emitUpdate"
          :options="blendModes"
        />
      </el-form-item>
      
      <el-row :gutter="10">
        <el-col :span="24">
          <el-form-item label="输入源 1">
            <el-select 
              v-model="localProps.in" 
              @change="emitUpdate"
              :options="getInputOptions()"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="输入源 2">
            <el-select 
              v-model="localProps.in2" 
              @change="emitUpdate"
              :options="getInputOptions()"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-text type="info" size="small">
        将两个输入源按指定的混合模式进行混合
      </el-text>
    </template>

    <!-- feComposite -->
    <template v-else-if="type === 'feComposite'">
      <el-form-item label="合成操作">
        <el-select 
          v-model="localProps.operator" 
          @change="onCompositeOperatorChange"
          :options="compositeOperators"
        />
      </el-form-item>
      
      <el-row :gutter="10">
        <el-col :span="24">
          <el-form-item label="输入源 1">
            <el-select 
              v-model="localProps.in" 
              @change="emitUpdate"
              :options="getInputOptions()"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="输入源 2">
            <el-select 
              v-model="localProps.in2" 
              @change="emitUpdate"
              :options="getInputOptions()"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- arithmetic 模式需要额外的 k1-k4 参数 -->
      <div v-if="localProps.operator === 'arithmetic'" class="mt-3">
        <el-text type="warning" size="small" class="block mb-2">
          算术合成公式: result = k1*i1*i2 + k2*i1 + k3*i2 + k4
        </el-text>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="k1">
              <el-input-number 
                v-model="localProps.k1" 
                :step="0.1"
                size="small"
                @blur="emitUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="k2">
              <el-input-number 
                v-model="localProps.k2" 
                :step="0.1"
                size="small"
                @blur="emitUpdate"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="k3">
              <el-input-number 
                v-model="localProps.k3" 
                :step="0.1"
                size="small"
                @blur="emitUpdate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="k4">
              <el-input-number 
                v-model="localProps.k4" 
                :step="0.1"
                size="small"
                @blur="emitUpdate"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      
      <el-text type="info" size="small">
        {{ getCompositeDescription(localProps.operator) }}
      </el-text>
    </template>

    <!-- feMerge -->
    <template v-else-if="type === 'feMerge'">
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-gray-700">合并的输入源：</span>
          <el-button type="primary" size="small" @click="addMergeInput">
            <span class="i-carbon-add mr-1"></span>
            添加输入源
          </el-button>
        </div>
        
        <div v-if="!localProps.inputs || localProps.inputs.length === 0" class="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded">
          暂无输入源，点击"添加输入源"按钮添加
        </div>
        
        <div v-else class="space-y-2">
          <div 
            v-for="(input, index) in localProps.inputs" 
            :key="index"
            class="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200"
          >
            <span class="font-semibold text-gray-600 min-w-[30px]">{{ index + 1 }}.</span>
            <el-select 
              v-model="localProps.inputs[index]" 
              @change="emitUpdate"
              :options="getInputOptions()"
              class="flex-1"
              placeholder="选择输入源"
            />
            <el-button 
              type="danger" 
              size="small" 
              @click="removeMergeInput(index)"
              :disabled="localProps.inputs.length === 1"
            >
              <span class="i-carbon-trash-can"></span>
            </el-button>
          </div>
        </div>
        
        <el-text type="info" size="small">
          feMerge 会按顺序将多个输入源叠加合并，后面的层会覆盖在前面的层之上
        </el-text>
      </div>
    </template>

    <!-- 其他过滤器类型暂不在 FilterPropsEditor 中实现 -->
    <template v-else>
      <el-text type="info">该过滤器类型暂未在此组件实现</el-text>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineComponent, h } from 'vue'
import { ElFormItem, ElInput, ElInputNumber, ElRow, ElCol, ElText } from 'element-plus'
import type { ComponentTransferFuncProps, ColorMatrixProps } from '@svg-filter-factory/core'

const props = defineProps<{
  type: string
  modelValue: any
  availableAliases?: string[]
}>()

const emit = defineEmits(['update:modelValue'])

const localProps = ref<any>({})

// 通道函数类型选项
const channelFunctionTypes = [
  { label: 'identity - 保持不变', value: 'identity' },
  { label: 'table - 查找表', value: 'table' },
  { label: 'discrete - 离散值', value: 'discrete' },
  { label: 'linear - 线性函数', value: 'linear' },
  { label: 'gamma - 伽马校正', value: 'gamma' }
]

// 颜色矩阵类型选项
const colorMatrixTypes = [
  { label: '饱和度 (saturate)', value: 'saturate' },
  { label: '色相旋转 (hueRotate)', value: 'hueRotate' },
  { label: '亮度转Alpha (luminanceToAlpha)', value: 'luminanceToAlpha' },
  { label: '自定义矩阵 (matrix)', value: 'matrix' }
]

// 混合模式选项
const blendModes = [
  { label: 'normal - 正常', value: 'normal' },
  { label: 'multiply - 正片叠底', value: 'multiply' },
  { label: 'screen - 滤色', value: 'screen' },
  { label: 'darken - 变暗', value: 'darken' },
  { label: 'lighten - 变亮', value: 'lighten' },
  { label: 'color-dodge - 颜色减淡', value: 'color-dodge' },
  { label: 'color-burn - 颜色加深', value: 'color-burn' },
  { label: 'hard-light - 强光', value: 'hard-light' },
  { label: 'soft-light - 柔光', value: 'soft-light' },
  { label: 'difference - 差值', value: 'difference' },
  { label: 'exclusion - 排除', value: 'exclusion' }
]

// 合成操作选项
const compositeOperators = [
  { label: 'over - 覆盖（in1 在 in2 上方）', value: 'over' },
  { label: 'in - 内部（保留 in1 与 in2 重叠部分）', value: 'in' },
  { label: 'out - 外部（保留 in1 不与 in2 重叠部分）', value: 'out' },
  { label: 'atop - 顶部（in1 覆盖在 in2 上，保留 in2 形状）', value: 'atop' },
  { label: 'xor - 异或（保留不重叠部分）', value: 'xor' },
  { label: 'lighter - 相加', value: 'lighter' },
  { label: 'arithmetic - 算术运算', value: 'arithmetic' }
]

// 获取合成操作的描述
const getCompositeDescription = (operator: string) => {
  const descriptions: Record<string, string> = {
    'over': '将 in1 覆盖在 in2 上方',
    'in': '只保留 in1 与 in2 重叠的部分',
    'out': '只保留 in1 不与 in2 重叠的部分',
    'atop': 'in1 覆盖在 in2 上，但保留 in2 的形状',
    'xor': '只保留 in1 和 in2 不重叠的部分',
    'lighter': '将 in1 和 in2 相加',
    'arithmetic': '使用算术公式进行自定义合成'
  }
  return descriptions[operator] || '将两个输入源进行合成操作'
}

// 合成操作改变时的处理
const onCompositeOperatorChange = () => {
  // 如果切换到 arithmetic，初始化 k 值
  if (localProps.value.operator === 'arithmetic') {
    if (localProps.value.k1 === undefined) localProps.value.k1 = 0
    if (localProps.value.k2 === undefined) localProps.value.k2 = 1
    if (localProps.value.k3 === undefined) localProps.value.k3 = 0
    if (localProps.value.k4 === undefined) localProps.value.k4 = 0
  } else {
    // 切换到其他操作时，删除 k 值
    delete localProps.value.k1
    delete localProps.value.k2
    delete localProps.value.k3
    delete localProps.value.k4
  }
  emitUpdate()
}

// feMerge - 添加输入源
const addMergeInput = () => {
  if (!localProps.value.inputs) {
    localProps.value.inputs = []
  }
  // 默认添加 SourceGraphic
  localProps.value.inputs.push('SourceGraphic')
  emitUpdate()
}

// feMerge - 删除输入源
const removeMergeInput = (index: number) => {
  if (localProps.value.inputs && localProps.value.inputs.length > 1) {
    localProps.value.inputs.splice(index, 1)
    emitUpdate()
  }
}

// 获取输入源选项（包括 SourceGraphic、SourceAlpha 和之前的 result 别名）
const getInputOptions = () => {
  if (!props.availableAliases || props.availableAliases.length === 0) {
    return [
      { label: 'SourceGraphic - 原始图像', value: 'SourceGraphic' },
      { label: 'SourceAlpha - 原始Alpha通道', value: 'SourceAlpha' }
    ]
  }
  
  // 为每个别名添加友好的标签说明
  return props.availableAliases.map(alias => {
    // 内置固定输入源
    if (alias === 'SourceGraphic') return { label: 'SourceGraphic - 原始图像', value: alias }
    if (alias === 'SourceAlpha') return { label: 'SourceAlpha - 原始Alpha通道', value: alias }
    if (alias === 'BackgroundImage') return { label: 'BackgroundImage - 背景图像', value: alias }
    if (alias === 'BackgroundAlpha') return { label: 'BackgroundAlpha - 背景Alpha通道', value: alias }
    if (alias === 'FillPaint') return { label: 'FillPaint - 填充绘制区域', value: alias }
    if (alias === 'StrokePaint') return { label: 'StrokePaint - 描边绘制区域', value: alias }
    
    // 自定义 result 别名（前面子过滤器的输出）
    return { label: `${alias} - 之前的结果`, value: alias }
  })
}

// 形态学操作类型选项
const morphologyOperators = [
  { label: '侵蚀 (erode)', value: 'erode' },
  { label: '膨胀 (dilate)', value: 'dilate' }
]

// 初始化 localProps
watch(() => props.modelValue, (newVal) => {
  localProps.value = { ...newVal }
  
  // 特殊处理 feGaussianBlur 和 feDropShadow 的 stdDeviation
  if (props.type === 'feGaussianBlur' || props.type === 'feDropShadow') {
    const [x, y] = (newVal?.stdDeviation?.toString() || '2,2').split(',')
    localProps.value.stdDeviationX = parseFloat(x)
    localProps.value.stdDeviationY = parseFloat(y)
  }
  
  // 特殊处理 feMorphology 的 radius
  if (props.type === 'feMorphology') {
    const [x, y] = (newVal?.radius?.toString() || '0,0').split(',')
    localProps.value.radiusX = parseFloat(x)
    localProps.value.radiusY = parseFloat(y)
  }
  
  // 特殊处理 feComponentTransfer 的四个通道
  if (props.type === 'feComponentTransfer') {
    localProps.value.funcR = newVal?.funcR || { type: 'identity' }
    localProps.value.funcG = newVal?.funcG || { type: 'identity' }
    localProps.value.funcB = newVal?.funcB || { type: 'identity' }
    localProps.value.funcA = newVal?.funcA || { type: 'identity' }
  }
  
  // 特殊处理 feColorMatrix
  if (props.type === 'feColorMatrix') {
    const matrixType = newVal?.type || 'saturate'
    localProps.value.type = matrixType
    
    if (matrixType === 'matrix') {
      localProps.value.matrixValues = newVal?.values || '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 1 0'
    } else {
      localProps.value.singleValue = newVal?.values || getColorMatrixDefaultValue(matrixType)
    }
  }
}, { immediate: true, deep: true })

// 更新事件
const emitUpdate = () => {
  const updatedProps: any = { ...localProps.value }
  
  // 重构 stdDeviation
  if (props.type === 'feGaussianBlur' || props.type === 'feDropShadow') {
    updatedProps.stdDeviation = `${updatedProps.stdDeviationX || 2},${updatedProps.stdDeviationY || 2}`
    delete updatedProps.stdDeviationX
    delete updatedProps.stdDeviationY
  }
  
  // 重构 radius
  if (props.type === 'feMorphology') {
    updatedProps.radius = `${updatedProps.radiusX || 0},${updatedProps.radiusY || 0}`
    delete updatedProps.radiusX
    delete updatedProps.radiusY
  }
  
  emit('update:modelValue', updatedProps)
}

const updateStdDeviation = () => {
  emitUpdate()
}

const updateRadius = () => {
  emitUpdate()
}

// feColorMatrix 辅助函数
const getColorMatrixDefaultValue = (type: string): string => {
  switch (type) {
    case 'saturate':
      return '1'
    case 'hueRotate':
      return '0'
    case 'luminanceToAlpha':
      return ''
    case 'matrix':
      return '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 1 0'
    default:
      return '1'
  }
}

const getColorMatrixPlaceholder = (type: string): string => {
  switch (type) {
    case 'saturate':
      return '0-2 (0=灰度, 1=原色, 2=增强)'
    case 'hueRotate':
      return '0-360 (度数)'
    case 'luminanceToAlpha':
      return '无需输入值'
    default:
      return ''
  }
}

const getColorMatrixDescription = (type: string): string => {
  switch (type) {
    case 'saturate':
      return '饱和度：0=灰度, 1=原色, >1=增强'
    case 'hueRotate':
      return '色相旋转：0-360度旋转色环'
    case 'luminanceToAlpha':
      return '将图像亮度转换为Alpha透明度通道'
    case 'matrix':
      return '自定义4x5颜色转换矩阵，每行5个数字，控制RGBA通道变换'
    default:
      return ''
  }
}

const onColorMatrixTypeChange = () => {
  const newType = localProps.value.type
  const defaultValue = getColorMatrixDefaultValue(newType)
  
  if (newType === 'matrix') {
    localProps.value.matrixValues = defaultValue
    delete localProps.value.singleValue
  } else if (newType === 'luminanceToAlpha') {
    // luminanceToAlpha 不需要 values，清空所有值输入
    delete localProps.value.singleValue
    delete localProps.value.matrixValues
  } else {
    localProps.value.singleValue = defaultValue
    delete localProps.value.matrixValues
  }
  
  updateColorMatrixValues()
}

const updateColorMatrixValues = () => {
  const updatedProps: any = { ...localProps.value }
  
  if (updatedProps.type === 'matrix') {
    updatedProps.values = updatedProps.matrixValues
    delete updatedProps.matrixValues
    delete updatedProps.singleValue
  } else if (updatedProps.type === 'luminanceToAlpha') {
    // luminanceToAlpha 不需要 values 属性
    delete updatedProps.values
    delete updatedProps.matrixValues
    delete updatedProps.singleValue
  } else {
    updatedProps.values = updatedProps.singleValue
    delete updatedProps.singleValue
    delete updatedProps.matrixValues
  }
  
  emit('update:modelValue', updatedProps)
}

// feComponentTransfer 通道类型切换
const onChannelTypeChange = (channel: 'funcR' | 'funcG' | 'funcB' | 'funcA', newType: string) => {
  // 根据新类型设置默认值
  const defaults: Record<string, Partial<ComponentTransferFuncProps>> = {
    identity: { type: 'identity' },
    table: { type: 'table', tableValues: '0 1' },
    discrete: { type: 'discrete', tableValues: '0 1' },
    linear: { type: 'linear', slope: 1, intercept: 0 },
    gamma: { type: 'gamma', amplitude: 1, exponent: 1, offset: 0 }
  }
  
  localProps.value[channel] = { ...defaults[newType] }
  emitUpdate()
}

// 动态生成通道参数组件
const getChannelParamsComponent = (channel: 'funcR' | 'funcG' | 'funcB' | 'funcA') => {
  return defineComponent({
    props: ['modelValue'],
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const localChannelProps = ref({ ...props.modelValue })
      
      watch(() => props.modelValue, (newVal) => {
        localChannelProps.value = { ...newVal }
      }, { deep: true })
      
      const updateProp = (key: string, value: any) => {
        if (value !== undefined) {
          localChannelProps.value = { ...localChannelProps.value, [key]: value }
        }
      }
      
      const emitChannelUpdate = () => {
        emit('update:modelValue', localChannelProps.value)
      }
      
      return () => {
        const funcType = localChannelProps.value.type
        
        if (funcType === 'identity') {
          return h(ElText, { type: 'info', size: 'small' }, () => '不对该通道进行任何转换')
        }
        
        if (funcType === 'table' || funcType === 'discrete') {
          return h('div', [
            h(ElFormItem, { label: funcType === 'table' ? '查找表值' : '离散值' }, () => [
              h(ElInput, {
                modelValue: localChannelProps.value.tableValues,
                'onUpdate:modelValue': (val: string) => updateProp('tableValues', val),
                onBlur: emitChannelUpdate,
                placeholder: '0 0.5 1',
                size: 'small'
              })
            ]),
            h(ElText, { type: 'info', size: 'small' }, () => 
              funcType === 'table' 
                ? '线性插值的查找表，例如: 0 0.5 1' 
                : '阶跃函数的离散值，例如: 0 0.5 1'
            )
          ])
        }
        
        if (funcType === 'linear') {
          return h('div', [
            h(ElRow, { gutter: 10 }, () => [
              h(ElCol, { span: 12 }, () => [
                h(ElFormItem, { label: '斜率 (slope)' }, () => [
                  h(ElInputNumber, {
                    modelValue: localChannelProps.value.slope,
                    'onUpdate:modelValue': (val: number | undefined) => updateProp('slope', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ]),
              h(ElCol, { span: 12 }, () => [
                h(ElFormItem, { label: '截距 (intercept)' }, () => [
                  h(ElInputNumber, {
                    modelValue: localChannelProps.value.intercept,
                    'onUpdate:modelValue': (val: number | undefined) => updateProp('intercept', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ])
            ]),
            h(ElText, { type: 'info', size: 'small' }, () => '线性函数: C\' = slope * C + intercept')
          ])
        }
        
        if (funcType === 'gamma') {
          return h('div', [
            h(ElRow, { gutter: 10 }, () => [
              h(ElCol, { span: 24 }, () => [
                h(ElFormItem, { label: '振幅 (amplitude)' }, () => [
                  h(ElInputNumber, {
                    modelValue: localChannelProps.value.amplitude,
                    'onUpdate:modelValue': (val: number | undefined) => updateProp('amplitude', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ]),
              h(ElCol, { span: 24 }, () => [
                h(ElFormItem, { label: '指数 (exponent)' }, () => [
                  h(ElInputNumber, {
                    modelValue: localChannelProps.value.exponent,
                    'onUpdate:modelValue': (val: number | undefined) => updateProp('exponent', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ]),
              h(ElCol, { span: 24 }, () => [
                h(ElFormItem, { label: '偏移 (offset)' }, () => [
                  h(ElInputNumber, {
                    modelValue: localChannelProps.value.offset,
                    'onUpdate:modelValue': (val: number | undefined) => updateProp('offset', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ])
            ]),
            h(ElText, { type: 'info', size: 'small' }, () => 'Gamma 函数: C\' = amplitude * pow(C, exponent) + offset')
          ])
        }
        
        return null
      }
    }
  })
}
</script>

