import type { FormRules } from 'element-plus'

export type FormFieldType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'date'
  | 'datetime'
  | 'time'
  | 'number'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'checkbox-group'
  | 'radio-group'
  | 'upload'
  | 'slider'
  | 'rate'

export interface FormFieldOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export interface FormFieldConfig {
  type: FormFieldType
  label: string
  prop: string
  placeholder?: string
  rules?: FormRules[string]
  options?: FormFieldOption[]
  props?: Record<string, any>
  slot?: string
  span?: number
  disabled?: boolean
  readonly?: boolean
  show?: (formData: Record<string, any>) => boolean
}

export interface DynamicFormConfig {
  fields: FormFieldConfig[]
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  inline?: boolean
  size?: 'large' | 'default' | 'small'
}

