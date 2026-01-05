# Spring Boot WebSocket 提醒推送集成指南

## 1. 依赖配置

在 `pom.xml` 中添加 WebSocket 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

## 2. WebSocket 配置类（原生 WebSocket）

创建 `WebSocketConfig.java`：

```java
package com.petcare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket 配置类
 * 配置原生 WebSocket 端点和处理器
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ReminderWebSocketHandler reminderWebSocketHandler;
    private final WebSocketAuthInterceptor authInterceptor;

    public WebSocketConfig(ReminderWebSocketHandler reminderWebSocketHandler,
                          WebSocketAuthInterceptor authInterceptor) {
        this.reminderWebSocketHandler = reminderWebSocketHandler;
        this.authInterceptor = authInterceptor;
    }

    /**
     * 注册 WebSocket 处理器
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 注册 /ws/reminders 端点
        // 添加认证拦截器
        // 允许跨域
        registry.addHandler(reminderWebSocketHandler, "/ws/reminders")
                .addInterceptors(authInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
```

## 3. WebSocket 认证拦截器

创建 `WebSocketAuthInterceptor.java`：

```java
package com.petcare.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * WebSocket 认证拦截器
 * 在建立连接前验证用户 token
 */
@Component
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    // 注入你的 JWT 工具类或用户服务
    // private final JwtUtil jwtUtil;
    // private final UserService userService;

    /**
     * 握手前拦截，验证 token
     */
    @Override
    public boolean beforeHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @NonNull Map<String, Object> attributes) throws Exception {
        
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            
            // 从查询参数获取 token
            String token = httpRequest.getParameter("token");
            
            if (token == null || token.isEmpty()) {
                // token 为空，拒绝连接
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            
            // 验证 token 并获取用户信息
            Long userId = validateTokenAndGetUserId(token);
            
            if (userId == null) {
                // token 无效，拒绝连接
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            
            // 将用户ID存储到 attributes 中，供后续使用
            attributes.put("userId", userId);
            attributes.put("token", token);
            
            return true;
        }
        
        return false;
    }

    /**
     * 握手后处理
     */
    @Override
    public void afterHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            Exception exception) {
        // 握手后的处理逻辑（可选）
    }

    /**
     * 验证 token 并获取用户ID
     * 需要根据你的 JWT 工具类实现
     */
    private Long validateTokenAndGetUserId(String token) {
        try {
            // 示例：使用 JWT 工具类解析 token
            // return jwtUtil.getUserIdFromToken(token);
            
            // 或者调用用户服务验证 token
            // return userService.validateTokenAndGetUserId(token);
            
            // 临时实现：实际项目中应该调用你的 JWT 服务
            // 这里需要替换为真实的 token 验证逻辑
            return 1L; // 示例返回
        } catch (Exception e) {
            return null;
        }
    }
}
```

## 4. WebSocket 处理器

创建 `ReminderWebSocketHandler.java`：

```java
package com.petcare.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 提醒 WebSocket 处理器
 * 管理 WebSocket 连接和消息发送
 */
@Component
public class ReminderWebSocketHandler extends TextWebSocketHandler {

    // 存储用户ID和WebSocket会话的映射
    private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 连接建立后调用
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 从 session 的 attributes 中获取用户ID
        Long userId = (Long) session.getAttributes().get("userId");
        
        if (userId != null) {
            // 如果用户已有连接，关闭旧连接
            WebSocketSession oldSession = userSessions.get(userId);
            if (oldSession != null && oldSession.isOpen()) {
                oldSession.close();
            }
            
            // 存储新连接
            userSessions.put(userId, session);
            System.out.println("用户 " + userId + " WebSocket 连接已建立");
        }
    }

    /**
     * 收到客户端消息时调用
     * 前端可能发送心跳消息保持连接
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 可以处理客户端发送的消息，如心跳检测
        String payload = message.getPayload();
        System.out.println("收到消息: " + payload);
        
        // 如果是心跳消息，可以回复
        if ("ping".equals(payload)) {
            session.sendMessage(new TextMessage("pong"));
        }
    }

    /**
     * 连接关闭后调用
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        
        if (userId != null) {
            userSessions.remove(userId);
            System.out.println("用户 " + userId + " WebSocket 连接已关闭");
        }
    }

    /**
     * 向指定用户发送提醒消息
     */
    public void sendReminderToUser(Long userId, Object message) throws IOException {
        WebSocketSession session = userSessions.get(userId);
        
        if (session != null && session.isOpen()) {
            String jsonMessage = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(jsonMessage));
        } else {
            System.out.println("用户 " + userId + " 的 WebSocket 连接不存在或已关闭");
        }
    }

    /**
     * 获取所有在线用户ID
     */
    public java.util.Set<Long> getOnlineUsers() {
        return userSessions.keySet();
    }
}
```

## 5. 提醒消息实体类

创建 `ReminderNotificationMessage.java`：

```java
package com.petcare.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 提醒通知消息实体
 * 用于 WebSocket 推送提醒消息
 */
@Data
public class ReminderNotificationMessage implements Serializable {
    
    /**
     * 消息类型，固定为 REMINDER
     */
    private String type = "REMINDER";
    
    /**
     * 提醒执行记录ID
     */
    private Long id;
    
    /**
     * 提醒ID
     */
    private Long reminderId;
    
    /**
     * 宠物ID
     */
    private Long petId;
    
    /**
     * 宠物名称
     */
    private String petName;
    
    /**
     * 提醒标题
     */
    private String title;
    
    /**
     * 提醒描述
     */
    private String description;
    
    /**
     * 计划执行时间
     */
    private LocalDateTime scheduleTime;
    
    /**
     * 通知时间
     */
    private LocalDateTime notificationTime;
}
```

## 6. WebSocket 消息推送服务

创建 `ReminderNotificationService.java`：

```java
package com.petcare.service;

import com.petcare.config.ReminderWebSocketHandler;
import com.petcare.dto.ReminderNotificationMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * 提醒通知推送服务
 * 负责向客户端推送提醒消息
 */
@Service
public class ReminderNotificationService {

    @Autowired
    private ReminderWebSocketHandler webSocketHandler;

    /**
     * 向指定用户推送提醒消息
     * 
     * @param userId 用户ID
     * @param message 提醒消息
     */
    public void sendReminderToUser(Long userId, ReminderNotificationMessage message) {
        try {
            webSocketHandler.sendReminderToUser(userId, message);
        } catch (IOException e) {
            System.err.println("推送提醒消息失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 向所有在线用户广播提醒消息
     * 
     * @param message 提醒消息
     */
    public void broadcastReminder(ReminderNotificationMessage message) {
        var onlineUsers = webSocketHandler.getOnlineUsers();
        for (Long userId : onlineUsers) {
            sendReminderToUser(userId, message);
        }
    }
}
```

## 7. 提醒定时检查服务

创建 `ReminderSchedulerService.java`：

```java
package com.petcare.service;

import com.petcare.dto.ReminderNotificationMessage;
import com.petcare.entity.ReminderExecution;
import com.petcare.mapper.ReminderExecutionMapper;
import com.petcare.mapper.ReminderMapper;
import com.petcare.mapper.PetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 提醒定时检查服务
 * 定时检查需要推送的提醒，并发送 WebSocket 消息
 */
@Service
public class ReminderSchedulerService {

    @Autowired
    private ReminderExecutionMapper reminderExecutionMapper;
    
    @Autowired
    private ReminderMapper reminderMapper;
    
    @Autowired
    private PetMapper petMapper;
    
    @Autowired
    private ReminderNotificationService notificationService;

    /**
     * 每分钟检查一次需要推送的提醒
     * cron 表达式：秒 分 时 日 月 周
     */
    @Scheduled(cron = "0 * * * * ?")
    public void checkAndSendReminders() {
        // 获取当前时间
        LocalDateTime now = LocalDateTime.now();
        
        // 查询需要推送的提醒执行记录
        // 条件：状态为 PENDING，通知时间 <= 当前时间，且未发送（is_sent = false）
        // 注意：notification_time 应该在创建执行记录时计算
        // notification_time = schedule_time - remind_before_minutes
        List<ReminderExecution> executions = reminderExecutionMapper.selectPendingNotifications(now);
        
        for (ReminderExecution execution : executions) {
            try {
                // 构建提醒消息
                ReminderNotificationMessage message = buildNotificationMessage(execution);
                
                // 获取用户ID（从提醒记录中获取）
                Long userId = execution.getUserId();
                
                // 推送消息
                notificationService.sendReminderToUser(userId, message);
                
                // 更新执行记录状态为已发送
                execution.setIsSent(true);
                execution.setSentAt(now);
                reminderExecutionMapper.updateById(execution);
                
            } catch (Exception e) {
                // 记录错误日志
                System.err.println("推送提醒失败: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    
    /**
     * 创建提醒执行记录时，计算通知时间
     * 通知时间 = 计划执行时间 - 提前提醒分钟数
     */
    public LocalDateTime calculateNotificationTime(LocalDateTime scheduleTime, Integer remindBeforeMinutes) {
        if (remindBeforeMinutes == null || remindBeforeMinutes <= 0) {
            return scheduleTime;
        }
        return scheduleTime.minusMinutes(remindBeforeMinutes);
    }

    /**
     * 构建提醒通知消息
     */
    private ReminderNotificationMessage buildNotificationMessage(ReminderExecution execution) {
        ReminderNotificationMessage message = new ReminderNotificationMessage();
        
        message.setId(execution.getId());
        message.setReminderId(execution.getReminderId());
        message.setPetId(execution.getPetId());
        
        // 获取提醒信息
        var reminder = reminderMapper.selectById(execution.getReminderId());
        if (reminder != null) {
            message.setTitle(reminder.getTitle());
            message.setDescription(reminder.getDescription());
        }
        
        // 获取宠物信息
        var pet = petMapper.selectById(execution.getPetId());
        if (pet != null) {
            message.setPetName(pet.getName());
        }
        
        message.setScheduleTime(execution.getScheduleTime());
        message.setNotificationTime(execution.getNotificationTime());
        
        return message;
    }
}
```

## 8. Mapper 接口方法

在 `ReminderExecutionMapper.java` 中添加查询方法：

```java
package com.petcare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petcare.entity.ReminderExecution;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ReminderExecutionMapper extends BaseMapper<ReminderExecution> {

    /**
     * 查询需要推送的提醒执行记录
     * 
     * @param now 当前时间
     * @return 需要推送的执行记录列表
     */
    @Select("SELECT * FROM tb_reminder_execution " +
            "WHERE status = 'PENDING' " +
            "AND notification_time <= #{now} " +
            "AND (is_sent IS NULL OR is_sent = false) " +
            "ORDER BY notification_time ASC")
    List<ReminderExecution> selectPendingNotifications(LocalDateTime now);
}
```

## 9. 启用定时任务

在启动类或配置类上添加 `@EnableScheduling` 注解：

```java
package com.petcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // 启用定时任务
public class PetCareApplication {
    public static void main(String[] args) {
        SpringApplication.run(PetCareApplication.class, args);
    }
}
```

## 10. 前端连接说明

前端已实现原生 WebSocket 连接，连接地址为：`ws://localhost:8080/ws/reminders?token={accessToken}`

前端会在以下情况自动连接：
- 应用启动时（如果已登录）
- 用户登录成功后
- Token 刷新后

前端会在以下情况断开连接：
- 用户登出时

## 11. 错误处理和日志

建议在关键位置添加日志记录：

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ReminderSchedulerService {
    private static final Logger logger = LoggerFactory.getLogger(ReminderSchedulerService.class);
    
    @Scheduled(cron = "0 * * * * ?")
    public void checkAndSendReminders() {
        logger.info("开始检查待推送的提醒");
        // ... 实现代码
    }
}
```

## 12. 测试 WebSocket 连接

可以使用在线工具或命令行测试 WebSocket 连接：

```bash
# 使用 wscat 工具测试（需要先安装：npm install -g wscat）
wscat -c "ws://localhost:8080/ws/reminders?token=YOUR_TOKEN"
```

## 注意事项

1. **Token 验证**：必须在 `WebSocketAuthInterceptor` 中实现真实的 JWT token 验证逻辑，替换示例代码
2. **用户会话管理**：使用 `ConcurrentHashMap` 存储用户会话，支持同一用户多设备登录（可选：限制单用户单连接）
3. **定时任务频率**：可以根据实际需求调整 `@Scheduled` 的 cron 表达式
   - 每分钟：`0 * * * * ?`
   - 每30秒：`0/30 * * * * ?`
   - 每10秒：`0/10 * * * * ?`
4. **错误处理**：建议添加完善的日志记录和错误处理机制
5. **性能优化**：
   - 如果提醒数量很大，可以考虑使用消息队列（如 RabbitMQ、Kafka）来处理推送
   - 批量查询待推送提醒，避免频繁查询数据库
   - 使用线程池处理推送任务
6. **连接管理**：
   - 定期清理无效连接
   - 实现心跳检测机制
   - 处理网络异常断开的情况

## 数据库字段说明

确保 `tb_reminder_execution` 表包含以下字段：
- `id`: 执行记录ID
- `reminder_id`: 提醒ID
- `pet_id`: 宠物ID
- `user_id`: 用户ID
- `schedule_time`: 计划执行时间
- `notification_time`: 通知时间（提醒时间 = schedule_time - remind_before_minutes）
- `status`: 状态（PENDING/COMPLETED/OVERDUE）
- `is_sent`: 是否已发送（布尔值，默认 false）
- `sent_at`: 发送时间（可为空）

## 消息格式

后端推送的消息格式必须与前端 `ReminderNotification` 接口匹配：

```json
{
  "type": "REMINDER",
  "id": 123,
  "reminderId": 456,
  "petId": 789,
  "petName": "憨憨",
  "title": "喂食提醒",
  "description": "记得给憨憨喂食",
  "scheduleTime": "2025-01-20T10:00:00",
  "notificationTime": "2025-01-20T10:00:00"
}
```

注意：时间格式使用 ISO 8601 格式（`yyyy-MM-ddTHH:mm:ss`），前端会自动转换为本地时间显示。

## Nginx 配置

如果使用 Nginx 作为反向代理，需要为 WebSocket 连接单独配置 location。配置示例：

```nginx
# WebSocket 代理配置（必须在 /api 之前，避免被 /api 规则匹配）
location /ws/ {
    proxy_pass http://gateway;
    
    # WebSocket 必需的头部设置
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # 保留原始请求头
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket 超时设置（重要：需要设置较长的超时时间）
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
    
    # 禁用缓冲，确保实时推送
    proxy_buffering off;
}
```

**关键配置说明：**

1. **`proxy_http_version 1.1`**：必须使用 HTTP/1.1，WebSocket 需要 HTTP/1.1 的 Upgrade 机制
2. **`Upgrade` 和 `Connection` 头部**：用于协议升级，从 HTTP 升级到 WebSocket
3. **超时时间**：设置为 7 天（`7d`），因为 WebSocket 是长连接，需要保持较长时间
4. **`proxy_buffering off`**：禁用缓冲，确保消息实时推送，不延迟
5. **位置顺序**：`/ws/` location 必须在 `/api` location 之前，避免被 `/api` 规则匹配

**如果使用 Spring Cloud Gateway：**

确保 Gateway 也配置了 WebSocket 支持，在 Gateway 的路由配置中添加：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: websocket-route
          uri: lb://pet-care-core
          predicates:
            - Path=/ws/**
          filters:
            - StripPrefix=0
```

或者如果 Gateway 直接转发到后端服务，确保后端服务的 WebSocket 端点路径正确。

