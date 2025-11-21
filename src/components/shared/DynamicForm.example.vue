<template>
  <div class="dynamic-form-example">
    <h2>通用表单组件使用示例</h2>
    
    <DynamicForm
      ref="formRef"
      :config="formConfig"
      v-model="formData"
      @submit="handleSubmit"
      @validate="handleValidate"
    >
      <!-- 自定义插槽示例 -->
      <template #custom-field="{ field, value, update }">
        <el-input v-model="value" @input="update" placeholder="自定义字段" />
      </template>
    </DynamicForm>

    <div class="form-actions">
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSubmitForm">提交</el-button>
    </div>

    <div class="form-data-display">
      <h3>表单数据：</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DynamicForm from './DynamicForm.vue'
import type { DynamicFormConfig } from '@/types/form'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()

const formData = ref({
  name: '',
  email: '',
  gender: '',
  birthday: '',
  age: 0,
  agree: false,
  hobbies: [],
  rating: 0,
})

const formConfig: DynamicFormConfig = {
  labelWidth: '120px',
  labelPosition: 'right',
  fields: [
    {
      type: 'input',
      label: '姓名',
      prop: 'name',
      placeholder: '请输入姓名',
      rules: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
      ],
    },
    {
      type: 'input',
      label: '邮箱',
      prop: 'email',
      placeholder: '请输入邮箱',
      rules: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
      ],
    },
    {
      type: 'select',
      label: '性别',
      prop: 'gender',
      placeholder: '请选择性别',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
      rules: [{ required: true, message: '请选择性别', trigger: 'change' }],
    },
    {
      type: 'date',
      label: '生日',
      prop: 'birthday',
      placeholder: '请选择生日',
      rules: [{ required: true, message: '请选择生日', trigger: 'change' }],
    },
    {
      type: 'number',
      label: '年龄',
      prop: 'age',
      placeholder: '请输入年龄',
      props: {
        min: 0,
        max: 150,
      },
    },
    {
      type: 'switch',
      label: '同意协议',
      prop: 'agree',
      rules: [
        {
          type: 'boolean',
          validator: (_rule, value, callback) => {
            if (!value) {
              callback(new Error('请同意协议'))
            } else {
              callback()
            }
          },
          trigger: 'change',
        },
      ],
    },
    {
      type: 'checkbox-group',
      label: '兴趣爱好',
      prop: 'hobbies',
      options: [
        { label: '阅读', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅行', value: 'travel' },
      ],
    },
    {
      type: 'rate',
      label: '评分',
      prop: 'rating',
      props: {
        max: 5,
      },
    },
  ],
}

const handleSubmit = (data: Record<string, any>) => {
  console.log('表单提交:', data)
}

const handleValidate = (isValid: boolean) => {
  console.log('表单验证:', isValid)
}

const handleSubmitForm = async () => {
  if (formRef.value) {
    const valid = await formRef.value.validate()
    if (valid) {
      const data = formRef.value.getFormData()
      handleSubmit(data)
    }
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.dynamic-form-example {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.form-actions {
  margin-top: 24px;
  text-align: right;
}

.form-data-display {
  margin-top: 32px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;

  h3 {
    margin: 0 0 12px;
  }

  pre {
    margin: 0;
    font-size: 12px;
    color: #606266;
  }
}
</style>

