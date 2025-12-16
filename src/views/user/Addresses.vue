<template>
  <div class="addresses-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>地址管理</h2>
          <el-button type="primary" @click="showAddDialog">添加地址</el-button>
        </div>
      </template>
      <div class="address-list">
        <el-empty v-if="addresses.length === 0" description="暂无地址" />
        <el-card v-for="addr in addresses" :key="addr.id" class="address-item" :class="{ default: addr.isDefault }">
          <div class="address-content">
            <div class="address-header">
              <span class="name">{{ addr.name }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <el-tag v-if="addr.isDefault" type="success" size="small">默认</el-tag>
            </div>
            <p class="address-text">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</p>
          </div>
          <div class="address-actions">
            <el-button type="text" @click="editAddress(addr)">编辑</el-button>
            <el-button v-if="!addr.isDefault" type="text" @click="setDefault(addr.id)">设为默认</el-button>
            <el-button type="text" @click="deleteAddr(addr.id)">删除</el-button>
          </div>
        </el-card>
      </div>
    </el-card>

    <el-dialog v-model="showDialog" :title="editing ? '编辑地址' : '添加地址'" width="500px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.phone" />
        </el-form-item>
        <el-form-item label="省市区">
          <el-cascader v-model="region" :options="regionOptions" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addressForm.detail" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/services/userService'
import type { Address } from '@/services/userService'

const addresses = ref<Address[]>([])
const showDialog = ref(false)
const editing = ref(false)
const currentId = ref('')
const region = ref<string[]>([])
const addressForm = ref<Partial<Address>>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})
const regionOptions = [
  { value: 'beijing', label: '北京市', children: [{ value: 'dongcheng', label: '东城区' }] },
]

const loadAddresses = async () => {
  try {
    const res = await fetchAddresses()
    addresses.value = res.data || []
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

const showAddDialog = () => {
  editing.value = false
  currentId.value = ''
  addressForm.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  }
  region.value = []
  showDialog.value = true
}

const editAddress = (addr: Address) => {
  editing.value = true
  currentId.value = addr.id
  addressForm.value = {
    name: addr.name,
    phone: addr.phone,
    province: addr.province,
    city: addr.city,
    district: addr.district,
    detail: addr.detail,
    isDefault: addr.isDefault,
  }
  region.value = [addr.province, addr.city, addr.district]
  showDialog.value = true
}

const saveAddress = async () => {
  try {
    if (region.value.length >= 3) {
      addressForm.value.province = region.value[0]
      addressForm.value.city = region.value[1]
      addressForm.value.district = region.value[2]
    }
    if (editing.value) {
      await updateAddress(currentId.value, addressForm.value)
    } else {
      await createAddress(addressForm.value)
    }
    showDialog.value = false
    loadAddresses()
  } catch (error) {
    console.error('保存地址失败:', error)
  }
}

const setDefault = async (id: string) => {
  try {
    await setDefaultAddress(id)
    loadAddresses()
  } catch (error) {
    console.error('设置默认地址失败:', error)
  }
}

const deleteAddr = async (id: string) => {
  try {
    await deleteAddress(id)
    loadAddresses()
  } catch (error) {
    console.error('删除地址失败:', error)
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped lang="scss">
.addresses-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
  }
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  &.default {
    border-color: #409eff;
  }
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  .name {
    font-weight: bold;
  }
  .phone {
    color: #666;
  }
}

.address-text {
  margin: 0;
  color: #666;
}

.address-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
