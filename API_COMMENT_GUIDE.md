# API调用注释规范

## 注释格式

在所有调用后端API的地方，需要添加统一的注释格式，方便识别和维护。

## 注释规范

### 1. 服务层（services/*.ts）

在API服务函数上方添加JSDoc注释：

```typescript
/**
 * [API调用] GET /pets
 * 获取宠物列表
 * @returns {Promise} 返回宠物列表数据
 */
export const fetchPets = () => {
  return apiClient.get<Pet[]>('/pets')
}
```

### 2. Store层（store/*.ts）

在actions方法上方和API调用处添加注释：

```typescript
/**
 * [API调用] 加载宠物列表
 * 调用 GET /pets 接口获取所有宠物数据
 */
async loadPets() {
  try {
    this.loading = true
    // [API调用] GET /pets - 获取宠物列表
    const { data } = await fetchPets()
    this.pets = data
  } catch (error) {
    // 错误处理
  }
}
```

### 3. 视图层（views/**/*.vue）

在函数上方和API调用处添加注释：

```typescript
/**
 * [API调用] GET /pets/:id
 * 加载宠物详情信息
 */
const loadPet = async () => {
  try {
    // [API调用] GET /pets/:id - 获取宠物详情
    const { data } = await fetchPetById(petId)
    // 处理数据
  } catch (error) {
    // 错误处理
  }
}
```

## 注释模板

### 服务层模板
```typescript
/**
 * [API调用] {METHOD} {PATH}
 * {功能描述}
 * @param {类型} 参数名 - 参数说明
 * @returns {Promise} 返回数据说明
 */
```

### Store层模板
```typescript
/**
 * [API调用] {功能描述}
 * 调用 {METHOD} {PATH} 接口{操作描述}
 * @param {类型} 参数名 - 参数说明
 */
async methodName() {
  // [API调用] {METHOD} {PATH} - {简要说明}
  const { data } = await apiMethod()
}
```

### 视图层模板
```typescript
/**
 * [API调用] {METHOD} {PATH}
 * {功能描述}
 */
const methodName = async () => {
  // [API调用] {METHOD} {PATH} - {简要说明}
  await apiMethod()
}
```

## 注意事项

1. **统一格式**：所有API调用注释必须以 `[API调用]` 开头
2. **包含路径**：注释中必须包含HTTP方法和API路径
3. **简要说明**：在调用处添加简要说明，说明该调用的作用
4. **完整文档**：在函数/方法上方添加完整的JSDoc注释
5. **保持更新**：当API路径或方法改变时，及时更新注释

## 示例

### GET请求
```typescript
// [API调用] GET /pets - 获取宠物列表
const { data } = await fetchPets()
```

### POST请求
```typescript
// [API调用] POST /pets - 创建新宠物
const { data } = await createPet(payload)
```

### PUT请求
```typescript
// [API调用] PUT /pets/:id - 更新宠物信息
await updatePet(id, payload)
```

### DELETE请求
```typescript
// [API调用] DELETE /pets/:id - 删除宠物
await removePet(id)
```

## 后续代码生成要求

在生成新代码时，请遵循以下规则：

1. **所有API调用必须添加注释**
2. **注释格式必须统一**
3. **包含HTTP方法和完整路径**
4. **在函数上方和调用处都要添加注释**

