# 宠物关怀系统功能文档

## 目录
1. [用户管理功能](#用户管理功能)
2. [宠物管理功能](#宠物管理功能)
3. [健康记录功能](#健康记录功能)
4. [提醒功能](#提醒功能)

---

## 用户管理功能

### 功能概述
- 用户信息管理（昵称、头像、地址）
- 用户头像上传
- 用户资料完善

### 前端页面

#### 1. 完善个人信息页面
**文件**: `src/views/profile/UserProfile.vue`

**功能**:
- 上传用户头像
- 编辑昵称
- 编辑地址
- 保存用户信息

**主要组件**:
- 头像上传组件（支持预览、移除）
- 用户信息表单

### 后端表结构

#### tb_user 表
```sql
CREATE TABLE `tb_user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) COMMENT '用户名',
  `phone` VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(500) COMMENT '头像URL',
  `address` VARCHAR(500) COMMENT '地址',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 后端接口

#### 1. 获取当前用户信息
```
GET /user/me

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "小明",
    "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
    "address": "北京市朝阳区",
    "status": 1,
    "created_at": "2025-01-15 10:00:00"
  }
}
```

#### 2. 更新用户信息
```
PUT /user/update
请求体:
{
  "nickname": "小明",
  "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
  "address": "北京市朝阳区",
  "status": 1
}

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "小明",
    "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
    "address": "北京市朝阳区",
    "status": 1
  }
}
```

#### 3. 上传用户头像
```
POST /user/avatar
Content-Type: multipart/form-data
请求体:
  file: File

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
    "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg"
  }
}
```

### 前端服务方法

**文件**: `src/services/userService.ts`

已实现的方法:
- `getCurrentUser()` - 获取当前用户信息
- `updateUserProfile()` - 更新用户信息
- `uploadUserAvatar()` - 上传用户头像

### 类型定义

**文件**: `src/types/auth.ts`

已定义的类型:
- `UserInfo`: 用户信息接口

---

## 宠物管理功能

### 功能概述
- 宠物信息管理（名称、类型、品种、性别、生日、体重、头像、健康备注）
- 宠物头像上传
- 宠物列表展示
- 宠物详情查看
- 宠物信息编辑

### 前端页面

#### 1. 宠物列表页面
**文件**: `src/views/pet/PetList.vue`

**功能**:
- 宠物列表展示（卡片式）
- 添加宠物
- 编辑宠物信息
- 删除宠物
- 搜索宠物
- 查看宠物详情

**主要组件**:
- 宠物卡片组件
- 添加/编辑宠物对话框
- 宠物头像上传组件

#### 2. 宠物详情页面
**文件**: `src/views/pet/PetDetail.vue`

**功能**:
- 宠物基本信息展示和编辑
- 健康记录管理
- 健康图表展示

**主要组件**:
- 宠物基本信息表单
- 健康记录时间线
- ECharts 图表组件

### 后端表结构

#### tb_pet 表
```sql
CREATE TABLE `tb_pet` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '宠物名称',
  `type` VARCHAR(20) COMMENT '类型: dog(狗), cat(猫), other(其他)',
  `breed` VARCHAR(50) COMMENT '品种',
  `gender` TINYINT(1) COMMENT '性别: 0-母, 1-公',
  `birthday` DATE COMMENT '生日',
  `weight` DECIMAL(5,2) COMMENT '体重(kg)',
  `avatar` VARCHAR(500) COMMENT '头像URL',
  `health_notes` TEXT COMMENT '健康备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `tb_user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物表';
```

### 后端接口

#### 1. 获取宠物列表
```
POST /pet/list

响应:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "憨憨",
      "type": "dog",
      "breed": "柴犬",
      "gender": 1,
      "birthday": "2020-01-15",
      "weight": 12.5,
      "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
      "health_notes": "健康",
      "created_at": "2025-01-15 10:00:00"
    }
  ]
}
```

#### 2. 获取宠物详情
```
GET /pet/info/{id}

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "憨憨",
    "type": "dog",
    "breed": "柴犬",
    "gender": 1,
    "birthday": "2020-01-15",
    "weight": 12.5,
    "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
    "health_notes": "健康",
    "created_at": "2025-01-15 10:00:00"
  }
}
```

#### 3. 保存宠物信息（新增或更新）
```
POST /pet/save
请求体:
{
  "id": 1,  // 有id则为更新，无id则为新增
  "name": "憨憨",
  "type": "dog",
  "breed": "柴犬",
  "gender": 1,
  "birthday": "2020-01-15",
  "weight": 12.5,
  "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
  "health_notes": "健康"
}

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "憨憨",
    ...
  }
}
```

#### 4. 删除宠物
```
POST /pet/remove/{id}

响应:
{
  "code": 200,
  "message": "success"
}
```

#### 5. 上传宠物头像
```
POST /pet/{petId}/avatar
Content-Type: multipart/form-data
请求体:
  file: File

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg",
    "avatar": "http://petcare.com/pet-care-core/avatars/1/2025/12/18/xxx.jpg"
  }
}
```

### 前端服务方法

**文件**: `src/services/petService.ts`

已实现的方法:
- `fetchPets()` - 获取宠物列表
- `fetchPetById()` - 获取宠物详情
- `savePet()` - 保存宠物信息（新增或更新）
- `removePet()` - 删除宠物
- `uploadPetAvatar()` - 上传宠物头像

### 类型定义

**文件**: `src/types/pet.ts`

已定义的类型:
- `Pet`: 宠物接口
- `CreatePetPayload`: 创建宠物载荷
- `PetGender`: 0 | 1

---

## 健康记录功能

### 功能概述
- 支持记录类型：体重(WEIGHT)、体温(TEMPERATURE)、用药(MEDICAL)
- 支持添加、编辑、删除健康记录
- 支持时间线展示
- 支持图表展示（体重、体温趋势）

### 前端页面

#### 1. 宠物详情页 - 健康记录标签页
**文件**: `src/views/pet/PetDetail.vue`

**功能**:
- 时间线展示健康记录
- 添加健康记录（支持3种类型：体重、体温、用药）
- 编辑健康记录
- 删除健康记录
- 图表展示（体重、体温趋势）

**主要组件**:
- 健康记录时间线
- 添加/编辑健康记录对话框
- ECharts 图表组件

### 后端表结构

#### tb_health_record 表
```sql
CREATE TABLE `tb_health_record` (
    `id`                    BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `pet_id`                BIGINT      NOT NULL COMMENT '宠物ID',
    `user_id`               BIGINT      NOT NULL COMMENT '用户ID',
    `record_type`           VARCHAR(20) NOT NULL COMMENT '记录类型: 体重(WEIGHT)、体温(TEMPERATURE)、用药(MEDICAL)',
    `title`                 VARCHAR(200) COMMENT '标题',
    `description`           TEXT COMMENT '描述',
    `record_time`           DATETIME    NOT NULL COMMENT '记录时间',
    `value`                 DECIMAL(10, 2) COMMENT '数值(体重/体温等)',
    `symptom`               VARCHAR(500) COMMENT '症状信息',
    `medication_info`       VARCHAR(500) COMMENT '用药信息',
    `created_at`            DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`            DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_pet_id` (`pet_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_record_type` (`record_type`),
    INDEX `idx_record_time` (`record_time`),
    FOREIGN KEY (`pet_id`) REFERENCES `tb_pet`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `tb_user`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='健康记录表';
```

### 后端接口

#### 1. 获取宠物健康记录列表
```
GET /healthRecord/list
Query参数:
  - petId: 宠物ID
  - record_type: 记录类型(可选): WEIGHT、TEMPERATURE、MEDICAL
  - pageNumber: 页码(默认1)
  - pageSize: 每页数量(默认20)
  - startDate: 开始日期(可选)
  - endDate: 结束日期(可选)

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "pet_id": 1,
        "user_id": 1,
        "record_type": "weight",
        "title": "体重记录",
        "description": "定期测量",
        "record_time": "2025-01-15 10:00:00",
        "value": 12.5,
        "symptom": null,
        "medication_info": null,
        "created_at": "2025-01-15 10:00:00",
        "updated_at": "2025-01-15 10:00:00"
      }
    ],
    "total": 100,
    "pageNumber": 1,
    "pageSize": 20
  }
}
```

#### 2. 创建健康记录
```
POST /healthRecord/save
请求体:
{
  "pet_id": 1,
  "record_type": "weight",
  "title": "体重记录",
  "description": "定期测量",
  "record_time": "2025-01-15 10:00:00",
  "value": 12.5,
  "symptom": null,
  "medication_info": null
}

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "pet_id": 1,
    "record_type": "weight",
    ...
  }
}
```

#### 3. 更新健康记录
```
PUT /healthRecord/update
请求体: 同创建接口

响应:
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

#### 4. 删除健康记录
```
DELETE /healthRecord/remove/{id}

响应:
{
  "code": 200,
  "message": "success"
}
```


### 前端服务方法

**文件**: `src/services/petService.ts`

已实现的方法:
- `fetchHealthRecords()` - 获取健康记录列表
- `createHealthRecord()` - 创建健康记录
- `updateHealthRecord()` - 更新健康记录
- `deleteHealthRecord()` - 删除健康记录

### 类型定义

**文件**: `src/types/pet.ts`

已定义的类型:
- `HealthRecordType`: 'WEIGHT' | 'temperature' | 'medical'
- `HealthRecord`: 健康记录接口
- `CreateHealthRecordPayload`: 创建健康记录载荷

---

## 提醒功能

### 功能概述
- 支持创建提醒（标题、描述、计划时间、提前提醒时间、重复规则）
- 支持编辑、删除、完成提醒
- 支持重复类型：不重复、每天、每周、每月、自定义
- 支持提醒通知管理

### 前端页面

#### 1. 提醒管理页面
**文件**: `src/views/pet/Reminders.vue`

**功能**:
- 选择宠物查看提醒列表
- 添加提醒
- 编辑提醒
- 删除提醒
- 标记提醒为已完成
- 显示提醒状态（待办/已完成）

### 后端表结构

#### tb_reminder 表
```sql
CREATE TABLE `tb_reminder` (
    `id`                    BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `pet_id`                BIGINT      NOT NULL COMMENT '宠物ID',
    `user_id`               BIGINT      NOT NULL COMMENT '用户ID',
    `source_type`           VARCHAR(20) NOT NULL COMMENT '记录来源：manual, health_record, system',
    `source_id`             BIGINT COMMENT '来源ID（如健康记录ID）',
    `title`                 VARCHAR(200) COMMENT '标题',
    `description`           TEXT COMMENT '描述',
    `record_time`           DATETIME    NOT NULL COMMENT '记录时间',
    `next_trigger_time`     DATETIME COMMENT '下一次触发时间（内部调度使用，用户不可见）',
    `schedule_time`         DATETIME COMMENT '计划时间(用于提醒)',
    `remind_before_minutes` INT         DEFAULT 0 COMMENT '提前提醒时间(分钟)',
    `repeat_type`           VARCHAR(20) DEFAULT 'none' COMMENT '重复类型: none(不重复), daily(每天), weekly(每周), monthly(每月), custom(自定义)',
    `repeat_config`         JSON COMMENT '重复配置(自定义重复规则)',
    `is_active`             BOOLEAN     DEFAULT TRUE COMMENT '是否激活',
    `reminder_execution_id` BIGINT COMMENT '提醒执行记录ID，当前提醒和执行记录关联,标识当前最新的一条记录信息',
    `created_at`            DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`            DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_pet_id` (`pet_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_schedule_time` (`schedule_time`),
    INDEX `idx_is_active` (`is_active`),
    FOREIGN KEY (`pet_id`) REFERENCES `tb_pet`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `tb_user`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='提醒事件表';

#### tb_reminder_execution 表
```sql
CREATE TABLE `tb_reminder_execution` (
    `id`                BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `reminder_id`       BIGINT   NOT NULL COMMENT '提醒ID',
    `pet_id`            BIGINT   NOT NULL COMMENT '宠物ID',
    `user_id`           BIGINT   NOT NULL COMMENT '用户ID',
    `schedule_time`    DATETIME NOT NULL COMMENT '计划执行时间',
    `actual_time`       DATETIME COMMENT '实际执行时间',
    `status`            ENUM('pending', 'completed', 'overdue') DEFAULT 'pending' COMMENT '执行状态',
    `completion_notes`  TEXT COMMENT '完成说明',
    `notification_time` DATETIME NOT NULL COMMENT '通知时间',
    `is_read`           TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    `is_sent`           TINYINT(1) DEFAULT 0 COMMENT '是否已发送',
    `sent_at`           DATETIME COMMENT '发送时间',
    `read_at`           DATETIME COMMENT '阅读时间',
    `created_at`        DATETIME   DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_reminder_id` (`reminder_id`),
    INDEX `idx_pet_id` (`pet_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_schedule_time` (`schedule_time`),
    INDEX `idx_status` (`status`),
    INDEX `idx_notification_time` (`notification_time`),
    FOREIGN KEY (`reminder_id`) REFERENCES `tb_reminder`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`pet_id`) REFERENCES `tb_pet`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `tb_user`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='提醒执行记录表';
```

### 后端接口

#### 1. 获取用户待办提醒列表
```
GET /reminder
Query参数:
  - petId: 宠物ID(可选)
  - status: 状态(可选): pending(待办), completed(已完成), all(全部)
  - pageNumber: 页码(默认1)
  - pageSize: 每页数量(默认20)

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "pet_id": 1,
        "pet_name": "憨憨",
        "source_type": "manual",
        "source_id": 0,
        "title": "打疫苗",
        "description": "第三针疫苗",
        "record_time": "2025-01-20 14:00:00",
        "schedule_time": "2025-01-20 14:00:00",
        "remind_before_minutes": 30,
        "repeat_type": "none",
        "is_active": true,
        "total_occurrences": 0,
        "completed_count": 0,
        "completed_time": null
      }
    ],
    "total": 10,
    "pageNumber": 1,
    "pageSize": 20
  }
}
```

#### 2. 获取提醒通知列表
```
GET /reminder/notifications
Query参数:
  - isRead: 是否已读(可选): true, false
  - pageNumber: 页码(默认1)
  - pageSize: 每页数量(默认20)

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "reminder_id": 1,
        "pet_id": 1,
        "pet_name": "憨憨",
        "title": "打疫苗",
        "schedule_time": "2025-01-20 14:00:00",
        "actual_time": null,
        "status": "pending",
        "notification_time": "2025-01-20 13:30:00",
        "is_read": false,
        "is_sent": true,
        "sent_at": "2025-01-20 13:30:00",
        "read_at": null
      }
    ],
    "total": 5,
    "pageNumber": 1,
    "pageSize": 20
  }
}
```

#### 3. 标记通知为已读
```
PUT /reminder/notifications/{id}/read

响应:
{
  "code": 200,
  "message": "success"
}
```

#### 4. 批量标记通知为已读
```
PUT /reminder/notifications/read-all

响应:
{
  "code": 200,
  "message": "success"
}
```

### 前端服务方法

**文件**: `src/services/petService.ts`

已实现的方法:
- `fetchReminders()` - 获取提醒列表
- `fetchReminderNotifications()` - 获取通知列表
- `markNotificationAsRead()` - 标记通知已读
- `markAllNotificationsAsRead()` - 批量标记已读

### 类型定义

**文件**: `src/types/pet.ts`

已定义的类型:
- `RepeatType`: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
- `ReminderSourceType`: 'manual' | 'health_record' | 'system'
- `ReminderExecutionStatus`: 'pending' | 'completed' | 'overdue'
- `Reminder`: 提醒接口
- `CreateReminderPayload`: 创建提醒载荷
- `ReminderExecution`: 提醒执行记录接口

---

## 使用说明

### 用户管理

#### 完善个人信息
1. 进入"完善个人信息"页面（路由: `/profile`）
2. 上传头像（可选）
3. 填写昵称（可选）
4. 填写地址（可选）
5. 点击"保存信息"

### 宠物管理

#### 添加宠物
1. 进入"宠物管理"页面（路由: `/pets`）
2. 点击"添加宠物"按钮
3. 填写宠物信息（名称、类型、品种、性别等）
4. 上传宠物头像（可选）
5. 保存

#### 编辑宠物
1. 在宠物列表中点击"编辑"按钮
2. 修改宠物信息
3. 可以重新上传头像
4. 保存

#### 查看宠物详情
1. 在宠物列表中点击"查看详情"
2. 查看宠物基本信息、健康记录、健康图表

### 健康记录

#### 添加健康记录
1. 进入宠物详情页
2. 点击"健康记录"标签
3. 点击"添加记录"按钮
4. 选择记录类型（体重/体温/用药）
5. 填写相关信息
6. 保存

#### 编辑/删除健康记录
1. 在健康记录时间线中点击"编辑"或"删除"按钮
2. 完成相应操作

### 提醒管理

#### 添加提醒
1. 进入"提醒管理"页面（路由: `/reminder`）
2. 选择宠物
3. 点击"添加提醒"按钮
4. 填写提醒信息（标题、描述、计划时间、提前提醒时间、重复规则）
5. 保存

#### 完成提醒
1. 在提醒列表中点击"完成"按钮
2. 提醒状态更新为已完成
