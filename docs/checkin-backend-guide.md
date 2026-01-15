# 打卡功能后端开发指南

## 概述

打卡功能使用 Redis Bitmap 存储用户的打卡状态，结合提醒执行记录，提供日历视图展示打卡和提醒状态。

## 技术方案

### 1. Redis Bitmap 存储设计

#### Key 设计
- 用户打卡 Bitmap: `checkin:user:{userId}:pet:{petId}:{year}-{month}`
- 示例: `checkin:user:1:pet:2:2025-01`

#### Bitmap 位映射
- 每个月的每一天对应 Bitmap 的一个位（bit）
- 位索引 = 日期 - 1（1号对应索引0，2号对应索引1，以此类推）
- 值为 1 表示已打卡，0 表示未打卡

#### 优势
- 存储空间小：一个月最多31天，只需31位（约4字节）
- 查询效率高：O(1) 时间复杂度
- 支持位运算：可快速计算连续打卡天数

### 2. API 接口设计

#### 2.1 创建打卡记录

**接口**: `POST /api/checkin`

**请求体**:
```json
{
  "petId": 1,
  "checkinDate": "2025-01-15"
}
```

**处理逻辑**:
1. 验证用户是否已在该日期打卡（防止重复打卡）
2. 更新 Redis Bitmap：
   ```java
   String key = String.format("checkin:user:%d:pet:%d:%s", userId, petId, yearMonth);
   int dayIndex = day - 1; // 日期转索引
   redisTemplate.setBit(key, dayIndex, true);
   ```
3. 设置 Key 过期时间（13个月）

**响应**:
```json
{
  "code": "200",
  "message": "success",
  "data": {
    "userId": 1,
    "petId": 1,
    "checkinDate": "2025-01-15"
  }
}
```

#### 2.2 获取打卡统计

**接口**: `GET /api/checkin/stats?petId=1&year=2025&month=1`

**处理逻辑**:
1. 从 Redis Bitmap 读取当月打卡数据
2. 计算本月打卡次数：统计 Bitmap 中值为 1 的位数
   ```java
   String key = String.format("checkin:user:%d:pet:%d:%s", userId, petId, yearMonth);
   Long count = redisTemplate.bitCount(key);
   ```
3. 计算连续打卡天数：
   - 从今天往前遍历，找到第一个未打卡的日期
   - 或使用 Bitmap 位运算优化
4. 获取最后打卡日期：查找 Bitmap 中最后一个为 1 的位

**响应**:
```json
{
  "code": "200",
  "message": "success",
  "data": {
    "monthCheckinCount": 15,
    "continuousDays": 5,
    "lastCheckinDate": "2025-01-15"
  }
}
```

#### 2.3 获取日历数据

**接口**: `GET /api/checkin/calendar?petId=1&year=2025&month=1`

**处理逻辑**:
1. 从 Redis Bitmap 读取当月打卡状态
2. 查询当月提醒执行记录（关联提醒表）
3. 合并数据返回

**响应**:
```json
{
  "code": "200",
  "message": "success",
  "data": [
    {
      "date": "2025-01-01",
      "isCheckin": true,
      "reminderExecutions": [
        {
          "id": 1,
          "reminderId": 1,
          "petId": 1,
          "scheduleTime": "2025-01-01T08:00:00",
          "status": "COMPLETED",
          "isRead": true
        }
      ]
    },
    {
      "date": "2025-01-02",
      "isCheckin": false,
      "reminderExecutions": []
    }
  ]
}
```

### 3. 核心代码示例

#### 3.1 Java Spring Boot 实现

```java
@Service
public class CheckinService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 创建打卡记录
     */
    public void createCheckin(Long userId, CreateCheckinDTO dto) {
        // 1. 检查是否已打卡
        String dateStr = dto.getCheckinDate();
        LocalDate checkinDate = LocalDate.parse(dateStr);
        String yearMonth = checkinDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String key = String.format("checkin:user:%d:pet:%d:%s", userId, dto.getPetId(), yearMonth);
        int dayIndex = checkinDate.getDayOfMonth() - 1;
        
        Boolean exists = redisTemplate.opsForValue().getBit(key, dayIndex);
        if (Boolean.TRUE.equals(exists)) {
            throw new BusinessException("该日期已打卡");
        }
        
        // 2. 更新 Redis Bitmap
        redisTemplate.opsForValue().setBit(key, dayIndex, true);
        
        // 3. 设置过期时间（13个月）
        redisTemplate.expire(key, Duration.ofDays(390));
    }
    
    /**
     * 获取打卡统计
     */
    public CheckinStats getStats(Long userId, Long petId, Integer year, Integer month) {
        String yearMonth = String.format("%d-%02d", year, month);
        String key = String.format("checkin:user:%d:pet:%d:%s", userId, petId, yearMonth);
        
        // 计算本月打卡次数
        Long count = redisTemplate.opsForValue().bitCount(key);
        
        // 计算连续打卡天数
        int continuousDays = calculateContinuousDays(key, year, month);
        
        // 获取最后打卡日期
        String lastCheckinDate = getLastCheckinDate(key, year, month);
        
        CheckinStats stats = new CheckinStats();
        stats.setMonthCheckinCount(count != null ? count.intValue() : 0);
        stats.setContinuousDays(continuousDays);
        stats.setLastCheckinDate(lastCheckinDate);
        
        return stats;
    }
    
    /**
     * 计算连续打卡天数
     */
    private int calculateContinuousDays(String key, Integer year, Integer month) {
        LocalDate today = LocalDate.now();
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        
        int days = 0;
        LocalDate current = today.isAfter(lastDay) ? lastDay : today;
        
        // 从今天往前查找连续打卡天数
        while (!current.isBefore(firstDay)) {
            int dayIndex = current.getDayOfMonth() - 1;
            Boolean isChecked = redisTemplate.opsForValue().getBit(key, dayIndex);
            if (Boolean.TRUE.equals(isChecked)) {
                days++;
                current = current.minusDays(1);
            } else {
                break;
            }
        }
        
        return days;
    }
    
    /**
     * 获取最后打卡日期
     */
    private String getLastCheckinDate(String key, Integer year, Integer month) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        
        // 从最后一天往前查找
        for (LocalDate date = lastDay; !date.isBefore(firstDay); date = date.minusDays(1)) {
            int dayIndex = date.getDayOfMonth() - 1;
            Boolean isChecked = redisTemplate.opsForValue().getBit(key, dayIndex);
            if (Boolean.TRUE.equals(isChecked)) {
                return date.toString();
            }
        }
        
        return null;
    }
    
    /**
     * 获取日历数据
     */
    public List<CalendarDayData> getCalendarData(Long userId, Long petId, Integer year, Integer month) {
        String yearMonth = String.format("%d-%02d", year, month);
        String key = String.format("checkin:user:%d:pet:%d:%s", userId, petId, yearMonth);
        
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        
        // 获取当月所有提醒执行记录
        List<ReminderExecution> executions = reminderExecutionService.getByMonth(userId, petId, year, month);
        Map<String, List<ReminderExecution>> executionMap = executions.stream()
            .collect(Collectors.groupingBy(e -> e.getScheduleTime().toLocalDate().toString()));
        
        // 构建日历数据
        List<CalendarDayData> result = new ArrayList<>();
        for (LocalDate date = firstDay; !date.isAfter(lastDay); date = date.plusDays(1)) {
            String dateStr = date.toString();
            int dayIndex = date.getDayOfMonth() - 1;
            Boolean isCheckin = redisTemplate.opsForValue().getBit(key, dayIndex);
            
            CalendarDayData data = new CalendarDayData();
            data.setDate(dateStr);
            data.setCheckin(Boolean.TRUE.equals(isCheckin));
            data.setReminderExecutions(executionMap.getOrDefault(dateStr, Collections.emptyList()));
            result.add(data);
        }
        
        return result;
    }
}
```

#### 3.2 Controller 实现

```java
@RestController
@RequestMapping("/api/checkin")
public class CheckinController {
    
    @Autowired
    private CheckinService checkinService;
    
    @PostMapping
    public Result<Void> createCheckin(@RequestBody CreateCheckinDTO dto) {
        Long userId = getCurrentUserId(); // 从 Token 获取
        checkinService.createCheckin(userId, dto);
        return Result.success();
    }
    
    @GetMapping("/stats")
    public Result<CheckinStats> getStats(
            @RequestParam Long petId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        if (year == null || month == null) {
            LocalDate now = LocalDate.now();
            year = now.getYear();
            month = now.getMonthValue();
        }
        Long userId = getCurrentUserId();
        CheckinStats stats = checkinService.getStats(userId, petId, year, month);
        return Result.success(stats);
    }
    
    @GetMapping("/calendar")
    public Result<List<CalendarDayData>> getCalendar(
            @RequestParam Long petId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        if (year == null || month == null) {
            LocalDate now = LocalDate.now();
            year = now.getYear();
            month = now.getMonthValue();
        }
        Long userId = getCurrentUserId();
        List<CalendarDayData> data = checkinService.getCalendarData(userId, petId, year, month);
        return Result.success(data);
    }
}
```

### 4. 性能优化建议

1. **Bitmap 过期策略**:
   - 设置 Bitmap Key 过期时间为 13 个月（保留历史数据）
   - 使用 `EXPIRE` 命令：`EXPIRE key 3888000` (13个月秒数)

2. **批量操作优化**:
   - 使用 Pipeline 批量读取 Bitmap 数据
   - 缓存统计结果，避免频繁计算

3. **连续打卡计算优化**:
   - 可维护一个连续打卡天数字段，每次打卡时更新
   - 避免每次都重新计算

### 5. 注意事项

1. **时区处理**: 确保打卡日期使用用户时区，避免跨时区问题
2. **重复打卡**: 同一用户同一宠物同一天只能打卡一次
3. **数据过期**: Bitmap Key 设置 13 个月过期时间，自动清理历史数据

## 总结

使用 Redis Bitmap 存储打卡状态，通过合理的 Key 设计和位运算，可以高效地实现打卡统计和连续打卡计算。所有功能均基于 Redis 实现，无需数据库支持。
