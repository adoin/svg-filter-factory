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

    <!-- 其他过滤器类型暂不在 FilterPropsEditor 中实现 -->
    <template v-else>
      <el-text type="info">该过滤器类型暂未在此组件实现</el-text>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineComponent, h } from 'vue'
import type { ComponentTransferFuncProps } from '@svg-filter-factory/core'

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

// 初始化 localProps
watch(() => props.modelValue, (newVal) => {
  localProps.value = { ...newVal }
  
  // 特殊处理 feGaussianBlur 和 feDropShadow 的 stdDeviation
  if (props.type === 'feGaussianBlur' || props.type === 'feDropShadow') {
    const [x, y] = (newVal?.stdDeviation?.toString() || '2,2').split(',')
    localProps.value.stdDeviationX = parseFloat(x)
    localProps.value.stdDeviationY = parseFloat(y)
  }
  
  // 特殊处理 feComponentTransfer 的四个通道
  if (props.type === 'feComponentTransfer') {
    localProps.value.funcR = newVal?.funcR || { type: 'identity' }
    localProps.value.funcG = newVal?.funcG || { type: 'identity' }
    localProps.value.funcB = newVal?.funcB || { type: 'identity' }
    localProps.value.funcA = newVal?.funcA || { type: 'identity' }
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
  
  emit('update:modelValue', updatedProps)
}

const updateStdDeviation = () => {
  emitUpdate()
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
        localChannelProps.value = { ...localChannelProps.value, [key]: value }
      }
      
      const emitChannelUpdate = () => {
        emit('update:modelValue', localChannelProps.value)
      }
      
      return () => {
        const funcType = localChannelProps.value.type
        
        if (funcType === 'identity') {
          return h('el-text', { type: 'info', size: 'small' }, '不对该通道进行任何转换')
        }
        
        if (funcType === 'table' || funcType === 'discrete') {
          return h('div', [
            h('el-form-item', { label: funcType === 'table' ? '查找表值' : '离散值' }, [
              h('el-input', {
                modelValue: localChannelProps.value.tableValues,
                'onUpdate:modelValue': (val: string) => updateProp('tableValues', val),
                onBlur: emitChannelUpdate,
                placeholder: '0 0.5 1',
                size: 'small'
              })
            ]),
            h('el-text', { type: 'info', size: 'small' }, 
              funcType === 'table' 
                ? '线性插值的查找表，例如: 0 0.5 1' 
                : '阶跃函数的离散值，例如: 0 0.5 1'
            )
          ])
        }
        
        if (funcType === 'linear') {
          return h('div', [
            h('el-row', { gutter: 10 }, [
              h('el-col', { span: 12 }, [
                h('el-form-item', { label: '斜率 (slope)' }, [
                  h('el-input-number', {
                    modelValue: localChannelProps.value.slope,
                    'onUpdate:modelValue': (val: number) => updateProp('slope', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ]),
              h('el-col', { span: 12 }, [
                h('el-form-item', { label: '截距 (intercept)' }, [
                  h('el-input-number', {
                    modelValue: localChannelProps.value.intercept,
                    'onUpdate:modelValue': (val: number) => updateProp('intercept', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ])
            ]),
            h('el-text', { type: 'info', size: 'small' }, '线性函数: C\' = slope * C + intercept')
          ])
        }
        
        if (funcType === 'gamma') {
          return h('div', [
            h('el-row', { gutter: 10 }, [
              h('el-col', { span: 8 }, [
                h('el-form-item', { label: '振幅 (amplitude)' }, [
                  h('el-input-number', {
                    modelValue: localChannelProps.value.amplitude,
                    'onUpdate:modelValue': (val: number) => updateProp('amplitude', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ]),
              h('el-col', { span: 8 }, [
                h('el-form-item', { label: '指数 (exponent)' }, [
                  h('el-input-number', {
                    modelValue: localChannelProps.value.exponent,
                    'onUpdate:modelValue': (val: number) => updateProp('exponent', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ]),
              h('el-col', { span: 8 }, [
                h('el-form-item', { label: '偏移 (offset)' }, [
                  h('el-input-number', {
                    modelValue: localChannelProps.value.offset,
                    'onUpdate:modelValue': (val: number) => updateProp('offset', val),
                    onBlur: emitChannelUpdate,
                    step: 0.1,
                    size: 'small'
                  })
                ])
              ])
            ]),
            h('el-text', { type: 'info', size: 'small' }, 'Gamma 函数: C\' = amplitude * pow(C, exponent) + offset')
          ])
        }
        
        return null
      }
    }
  })
}
</script>

