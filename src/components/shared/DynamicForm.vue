<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :label-width="config.labelWidth || '120px'"
    :label-position="config.labelPosition || 'right'"
    :inline="config.inline"
    :size="config.size || 'default'"
  >
    <el-row :gutter="20">
      <el-col
        v-for="field in visibleFields"
        :key="field.prop"
        :span="field.span || 24"
      >
        <el-form-item
          :label="field.label"
          :prop="field.prop"
          :rules="field.rules"
        >
          <!-- Custom Slot (优先) -->
          <slot
            v-if="field.slot"
            :name="field.slot"
            :field="field"
            :value="formData[field.prop]"
            :update="(val: any) => updateField(field.prop, val)"
          />

          <!-- Input -->
          <el-input
            v-else-if="field.type === 'input'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || isDisabled"
            :readonly="field.readonly"
            v-bind="field.props"
          />

          <!-- Textarea -->
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.prop]"
            type="textarea"
            :placeholder="field.placeholder"
            :disabled="field.disabled || isDisabled"
            :readonly="field.readonly"
            v-bind="field.props"
          />

          <!-- Select -->
          <el-select
            v-else-if="field.type === 'select'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || isDisabled"
            style="width: 100%"
            v-bind="field.props"
          >
            <el-option
              v-for="option in field.options"
              :key="String(option.value)"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </el-select>

          <!-- Date Picker -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="formData[field.prop]"
            type="date"
            :placeholder="field.placeholder"
            :disabled="field.disabled || isDisabled"
            style="width: 100%"
            v-bind="field.props"
          />

          <!-- DateTime Picker -->
          <el-date-picker
            v-else-if="field.type === 'datetime'"
            v-model="formData[field.prop]"
            type="datetime"
            :placeholder="field.placeholder"
            :disabled="field.disabled || isDisabled"
            style="width: 100%"
            v-bind="field.props"
          />

          <!-- Time Picker -->
          <el-time-picker
            v-else-if="field.type === 'time'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || isDisabled"
            style="width: 100%"
            v-bind="field.props"
          />

          <!-- Number Input -->
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled || isDisabled"
            style="width: 100%"
            v-bind="field.props"
          />

          <!-- Switch -->
          <el-switch
            v-else-if="field.type === 'switch'"
            v-model="formData[field.prop]"
            :disabled="field.disabled || isDisabled"
            v-bind="field.props"
          />

          <!-- Radio Group -->
          <el-radio-group
            v-else-if="field.type === 'radio-group'"
            v-model="formData[field.prop]"
            :disabled="field.disabled || isDisabled"
            v-bind="field.props"
          >
            <el-radio
              v-for="option in field.options"
              :key="String(option.value)"
              :label="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>

          <!-- Checkbox Group -->
          <el-checkbox-group
            v-else-if="field.type === 'checkbox-group'"
            v-model="formData[field.prop]"
            :disabled="field.disabled || isDisabled"
            v-bind="field.props"
          >
            <el-checkbox
              v-for="option in field.options"
              :key="String(option.value)"
              :label="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>

          <!-- Upload -->
          <el-upload
            v-else-if="field.type === 'upload'"
            v-model:file-list="formData[field.prop]"
            :disabled="field.disabled || isDisabled"
            v-bind="field.props"
          >
            <template v-if="field.slot" #default>
              <slot :name="field.slot" :field="field" />
            </template>
          </el-upload>

          <!-- Slider -->
          <el-slider
            v-else-if="field.type === 'slider'"
            v-model="formData[field.prop]"
            :disabled="field.disabled || isDisabled"
            v-bind="field.props"
          />

          <!-- Rate -->
          <el-rate
            v-else-if="field.type === 'rate'"
            v-model="formData[field.prop]"
            :disabled="field.disabled || isDisabled"
            v-bind="field.props"
          />

        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DynamicFormConfig, FormFieldConfig } from '@/types/form'

interface Props {
  config: DynamicFormConfig
  modelValue?: Record<string, any>
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit', value: Record<string, any>): void
  (e: 'validate', isValid: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  disabled: false,
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = reactive<Record<string, any>>({})
const isDisabled = computed(() => props.disabled)

// 初始化表单数据
const initFormData = () => {
  props.config.fields.forEach((field) => {
    if (props.modelValue && props.modelValue[field.prop] !== undefined) {
      formData[field.prop] = props.modelValue[field.prop]
    } else {
      // 根据字段类型设置默认值
      switch (field.type) {
        case 'switch':
          formData[field.prop] = false
          break
        case 'checkbox-group':
        case 'select':
          formData[field.prop] = field.props?.multiple ? [] : undefined
          break
        case 'number':
          formData[field.prop] = 0
          break
        case 'rate':
          formData[field.prop] = 0
          break
        case 'slider':
          formData[field.prop] = field.props?.min || 0
          break
        default:
          formData[field.prop] = ''
      }
    }
  })
}

// 构建验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  props.config.fields.forEach((field) => {
    if (field.rules) {
      rules[field.prop] = field.rules
    }
  })
  return rules
})

// 过滤可见字段
const visibleFields = computed<FormFieldConfig[]>(() => {
  return props.config.fields.filter((field) => {
    if (field.show) {
      return field.show(formData)
    }
    return true
  })
})

// 更新字段值
const updateField = (prop: string, value: any) => {
  formData[prop] = value
  emit('update:modelValue', { ...formData })
}

// 监听外部数据变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.keys(newValue).forEach((key) => {
        if (formData[key] !== newValue[key]) {
          formData[key] = newValue[key]
        }
      })
    }
  },
  { deep: true, immediate: true },
)

// 监听表单数据变化
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', { ...newValue })
  },
  { deep: true },
)

// 验证表单
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    emit('validate', true)
    return true
  } catch {
    emit('validate', false)
    return false
  }
}

// 重置表单
const resetFields = () => {
  formRef.value?.resetFields()
  initFormData()
}

// 清除验证
const clearValidate = (props?: string | string[]) => {
  formRef.value?.clearValidate(props)
}

// 获取表单数据
const getFormData = (): Record<string, any> => {
  return { ...formData }
}

// 设置表单数据
const setFormData = (data: Record<string, any>) => {
  Object.keys(data).forEach((key) => {
    if (formData.hasOwnProperty(key)) {
      formData[key] = data[key]
    }
  })
}

// 暴露方法
defineExpose({
  validate,
  resetFields,
  clearValidate,
  getFormData,
  setFormData,
  formRef,
})

// 初始化
initFormData()
</script>

<style scoped lang="scss">
:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>

