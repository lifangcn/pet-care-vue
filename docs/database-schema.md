# 数据库表结构设计

## 1. 用户表 (user)

```sql
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
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

## 2. 宠物表 (pet)

```sql
CREATE TABLE `pet` (
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
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物表';
```

## 3. 健康记录表 (health_record)

```sql
CREATE TABLE `health_record` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `pet_id` BIGINT NOT NULL COMMENT '宠物ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `record_type` VARCHAR(20) NOT NULL COMMENT '记录类型: weight(体重), temperature(体温), medical(用药), reminder(提醒)',
  `title` VARCHAR(200) COMMENT '标题',
  `description` TEXT COMMENT '描述',
  `record_time` DATETIME NOT NULL COMMENT '记录时间',
  `schedule_time` DATETIME COMMENT '计划时间(用于提醒)',
  `remind_before_minutes` INT DEFAULT 0 COMMENT '提前提醒时间(分钟)',
  `repeat_type` VARCHAR(20) DEFAULT 'none' COMMENT '重复类型: none(不重复), daily(每天), weekly(每周), monthly(每月), custom(自定义)',
  `repeat_config` JSON COMMENT '重复配置(自定义重复规则)',
  `value` DECIMAL(10,2) COMMENT '数值(体重/体温等)',
  `medication_info` VARCHAR(500) COMMENT '用药信息',
  `is_completed` TINYINT(1) DEFAULT 0 COMMENT '是否完成(用于提醒)',
  `completed_time` DATETIME COMMENT '完成时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_pet_id` (`pet_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_record_type` (`record_type`),
  INDEX `idx_schedule_time` (`schedule_time`),
  INDEX `idx_record_time` (`record_time`),
  FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康记录表';
```

## 2. 提醒通知表 (reminder_notification)

```sql
CREATE TABLE `reminder_notification` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `health_record_id` BIGINT NOT NULL COMMENT '健康记录ID',
  `pet_id` BIGINT NOT NULL COMMENT '宠物ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `notification_time` DATETIME NOT NULL COMMENT '通知时间',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  `is_sent` TINYINT(1) DEFAULT 0 COMMENT '是否已发送',
  `sent_at` DATETIME COMMENT '发送时间',
  `read_at` DATETIME COMMENT '阅读时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_health_record_id` (`health_record_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_notification_time` (`notification_time`),
  INDEX `idx_is_read` (`is_read`),
  FOREIGN KEY (`health_record_id`) REFERENCES `health_record`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提醒通知表';
```
