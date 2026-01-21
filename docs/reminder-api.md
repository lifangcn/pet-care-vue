# 提醒管理 API 文档

## 基础信息

- **Base URL**: `/api/reminder`
- **认证方式**: Bearer Token (在请求头中携带 `Authorization: Bearer {token}`)
- **响应格式**: 统一使用 `Result<T>` 包装

### 统一响应结构

```json
{
  "code": "200",
  "message": "success",
  "data": { ... },
  "timestamp": 1234567890
}
```

### 分页响应结构

```json
{
  "code": "200",
  "message": "success",
  "data": {
    "records": [ ... ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalRow": 100,
    "totalPage": 10,
    "hasPrevious": false,
    "hasNext": true,
    "isFirst": true,
    "isLast": false
  },
  "timestamp": 1234567890
}
```

---

## 提醒管理接口

### 1. 创建提醒

**接口**: `POST /api/reminder`

**请求体**:
```json
{
  "petId": 1,
  "sourceType": "manual",
  "sourceId": null,
  "title": "喂食提醒",
  "description": "每天上午8点喂食",
  "recordTime": "2025-01-01 08:00:00",
  "scheduleTime": "2025-01-01 08:00:00",
  "remindBeforeMinutes": 30,
  "repeatType": "daily",
  "repeatConfig": null,
  "isActive": true
}
```

**字段说明**:
- `petId` (Long, 必填): 宠物ID
- `sourceType` (String): 来源类型，可选值: `"manual"` | `"health_record"` | `"system"`
- `sourceId` (Long, 可选): 来源ID，如健康记录ID
- `title` (String, 必填): 提醒标题
- `description` (String, 可选): 提醒描述
- `recordTime` (String, 可选): 记录时间，格式: `yyyy-MM-dd HH:mm:ss`
- `scheduleTime` (String, 必填): 计划执行时间，格式: `yyyy-MM-dd HH:mm:ss`
- `remindBeforeMinutes` (Integer, 可选): 提前提醒时间(分钟)
- `repeatType` (String, 可选): 重复类型，可选值: `"none"` | `"daily"` | `"weekly"` | `"monthly"` | `"custom"`
- `repeatConfig` (String, 可选): 重复配置(自定义重复规则)
- `isActive` (Boolean, 可选): 是否激活，默认 `true`

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": true,
  "timestamp": 1234567890
}
```

---

### 2. 删除提醒

**接口**: `DELETE /api/reminder/{id}`

**路径参数**:
- `id` (Long): 提醒ID

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": true,
  "timestamp": 1234567890
}
```

---

### 3. 停用提醒

**接口**: `PUT /api/reminder/{id}/deactivate`

**路径参数**:
- `id` (Long): 提醒ID

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": true,
  "timestamp": 1234567890
}
```

---

### 4. 启用提醒

**接口**: `PUT /api/reminder/{id}/activate`

**路径参数**:
- `id` (Long): 提醒ID

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": true,
  "timestamp": 1234567890
}
```

---

### 5. 更新提醒

**接口**: `PUT /api/reminder/{id}`

**路径参数**:
- `id` (Long): 提醒ID

**请求体**: 同创建提醒接口，但 `id` 字段会被路径参数覆盖

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": true,
  "timestamp": 1234567890
}
```

---

### 6. 分页查询提醒

**接口**: `GET /api/reminder/page`

**查询参数** (所有参数均为可选):
- `petId` (Long): 宠物ID
- `sourceType` (String): 来源类型
- `startTime` (String): 查询开始时间，格式: `yyyy-MM-dd HH:mm:ss`
- `endTime` (String): 查询结束时间，格式: `yyyy-MM-dd HH:mm:ss`
- `pageNumber` (Long): 页码，默认 `1`
- `pageSize` (Long): 每页数量

**请求示例**:
```
GET /api/reminder/page?petId=1&pageNumber=1&pageSize=10
```

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "petId": 1,
        "userId": 1,
        "sourceType": "manual",
        "sourceId": null,
        "title": "喂食提醒",
        "description": "每天上午8点喂食",
        "recordTime": "2025-01-01 08:00:00",
        "scheduleTime": "2025-01-01 08:00:00",
        "nextTriggerTime": "2025-01-01 08:00:00",
        "remindBeforeMinutes": 30,
        "repeatType": "daily",
        "repeatConfig": null,
        "isActive": true,
        "reminderExecutionId": null,
        "createdAt": "2025-01-01 08:00:00",
        "updatedAt": "2025-01-01 08:00:00"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalRow": 1,
    "totalPage": 1,
    "hasPrevious": false,
    "hasNext": false,
    "isFirst": true,
    "isLast": true
  },
  "timestamp": 1234567890
}
```

**注意**: `userId` 会自动从 Token 中获取，无需传递

---

## 提醒执行记录接口

### 7. 完成提醒执行记录

**接口**: `PUT /api/reminder/execution/{id}/complete`

**路径参数**:
- `id` (Long): 执行记录ID

**请求体** (可选):
```json
{
  "completionNotes": "已完成喂食"
}
```

**字段说明**:
- `completionNotes` (String, 可选): 完成备注

**请求示例**:

1. **带备注的请求**:
```http
PUT /api/reminder/execution/123/complete
Content-Type: application/json
Authorization: Bearer {token}

{
  "completionNotes": "已完成喂食"
}
```

2. **不带备注的请求**（请求体可为空或 null）:
```http
PUT /api/reminder/execution/123/complete
Content-Type: application/json
Authorization: Bearer {token}

{}
```

或者直接不传请求体（前端可能发送 `null` 或 `undefined`）。

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": {
    "id": 123,
    "reminderId": 456,
    "petId": 789,
    "scheduleTime": "2025-01-15T10:00:00",
    "actualTime": "2025-01-15T10:05:00",
    "status": "COMPLETED",
    "completionNotes": "已完成喂食",
    "notificationTime": "2025-01-15T09:30:00",
    "isRead": false,
    "createdAt": "2025-01-15T09:00:00"
  },
  "timestamp": 1234567890
}
```

**后端实现要点**:

1. **Spring Boot Controller 实现**:
```java
@PutMapping("/execution/{id}/complete")
public Result<ReminderExecution> completeExecution(
        @PathVariable Long id,
        @RequestBody(required = false) CompleteExecutionRequest request) {
    // 获取当前用户ID（从Token中解析）
    Long userId = getCurrentUserId();
    
    // 如果请求体为null，创建空对象
    if (request == null) {
        request = new CompleteExecutionRequest();
    }
    
    // 更新执行记录
    ReminderExecution execution = reminderExecutionService.completeExecution(
        id, 
        userId, 
        request.getCompletionNotes()
    );
    
    return Result.success(execution);
}
```

2. **请求DTO类**:
```java
public class CompleteExecutionRequest {
    private String completionNotes;
    
    // getter 和 setter
    public String getCompletionNotes() {
        return completionNotes;
    }
    
    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }
}
```

3. **关键点**:
   - `@RequestBody(required = false)`: 允许请求体为空
   - 如果请求体为 `null`，需要手动创建空对象或使用 `Optional`
   - `completionNotes` 可以为 `null` 或空字符串
   - 更新时设置 `status = "COMPLETED"`，`actualTime` 为当前时间

4. **Service 层实现示例**:
```java
public ReminderExecution completeExecution(Long id, Long userId, String completionNotes) {
    ReminderExecution execution = reminderExecutionRepository.findById(id)
        .orElseThrow(() -> new BusinessException("执行记录不存在"));
    
    // 验证权限（只能完成自己的提醒）
    if (!execution.getUserId().equals(userId)) {
        throw new BusinessException("无权操作此记录");
    }
    
    // 更新状态
    execution.setStatus(ReminderExecutionStatus.COMPLETED);
    execution.setActualTime(LocalDateTime.now());
    if (completionNotes != null && !completionNotes.trim().isEmpty()) {
        execution.setCompletionNotes(completionNotes.trim());
    }
    
    return reminderExecutionRepository.save(execution);
}
```

---

### 8. 标记提醒执行记录为已读

**接口**: `PUT /api/reminder/execution/{id}/read`

**路径参数**:
- `id` (Long): 执行记录ID

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": true,
  "timestamp": 1234567890
}
```

---

### 9. 分页查询提醒执行记录

**接口**: `GET /api/reminder/execution/page`

**查询参数** (所有参数均为可选):
- `petId` (Long): 宠物ID
- `status` (String): 执行状态
- `startTime` (String): 查询开始时间，格式: `yyyy-MM-dd HH:mm:ss`
- `endTime` (String): 查询结束时间，格式: `yyyy-MM-dd HH:mm:ss`
- `pageNumber` (Long): 页码，默认 `1`
- `pageSize` (Long): 每页数量

**请求示例**:
```
GET /api/reminder/execution/page?petId=1&status=PENDING&pageNumber=1&pageSize=10
```

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "reminderId": 1,
        "petId": 1,
        "userId": 1,
        "scheduleTime": "2025-01-01 08:00:00",
        "actualTime": null,
        "status": "PENDING",
        "completionNotes": null,
        "notificationTime": "2025-01-01 07:30:00",
        "isRead": false,
        "isSent": true,
        "sentAt": "2025-01-01 07:30:00",
        "readAt": null,
        "createdAt": "2025-01-01 08:00:00"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalRow": 1,
    "totalPage": 1,
    "hasPrevious": false,
    "hasNext": false,
    "isFirst": true,
    "isLast": true
  },
  "timestamp": 1234567890
}
```

**注意**: `userId` 会自动从 Token 中获取，无需传递

---

## 数据模型

### Reminder (提醒)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键ID |
| petId | Long | 宠物ID |
| userId | Long | 用户ID (自动填充) |
| sourceType | String | 来源类型: `manual`, `health_record`, `system` |
| sourceId | Long | 来源ID |
| title | String | 标题 |
| description | String | 描述 |
| recordTime | LocalDateTime | 记录时间 |
| scheduleTime | LocalDateTime | 计划执行时间 |
| nextTriggerTime | LocalDateTime | 下次触发时间 |
| remindBeforeMinutes | Integer | 提前提醒时间(分钟) |
| repeatType | String | 重复类型: `none`, `daily`, `weekly`, `monthly`, `custom` |
| repeatConfig | String | 重复配置 |
| isActive | Boolean | 是否激活 |
| reminderExecutionId | Long | 提醒执行记录ID |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |

### ReminderExecution (提醒执行记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键ID |
| reminderId | Long | 提醒ID |
| petId | Long | 宠物ID |
| userId | Long | 用户ID |
| scheduleTime | LocalDateTime | 计划执行时间 |
| actualTime | LocalDateTime | 实际执行时间 |
| status | String | 执行状态 |
| completionNotes | String | 完成说明 |
| notificationTime | LocalDateTime | 通知时间 |
| isRead | Boolean | 是否已读 |
| isSent | Boolean | 是否已发送 |
| sentAt | LocalDateTime | 发送时间 |
| readAt | LocalDateTime | 阅读时间 |
| createdAt | LocalDateTime | 创建时间 |

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 401 | 未授权，Token 无效或过期 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. 所有接口都需要在请求头中携带 `Authorization: Bearer {token}`
2. `userId` 会自动从 Token 中解析，无需在请求中传递
3. 时间格式统一使用: `yyyy-MM-dd HH:mm:ss`
4. 分页查询中，`pageNumber` 从 1 开始
5. 所有时间字段均为 `LocalDateTime` 类型，JSON 序列化格式为 `yyyy-MM-dd HH:mm:ss`

