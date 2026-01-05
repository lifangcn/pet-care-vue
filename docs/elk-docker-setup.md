# ELK Docker 搭建流程

## 1. 快速部署

```bash
# 创建目录并设置权限
mkdir -p elk/{elasticsearch/data,elasticsearch/logs,logstash/config,logstash/pipeline,kibana/config}
chmod -R 777 elk/elasticsearch/data elk/elasticsearch/logs

# 启动服务
docker-compose up -d
```

## 2. Docker Compose 配置

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # Elasticsearch 配置
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.17.0
    container_name: elk-elasticsearch
    environment:
      # 单节点模式（开发环境）
      - discovery.type=single-node
      # 关闭安全认证（开发环境，生产环境应启用）
      - xpack.security.enabled=false
      # JVM 堆内存配置（根据服务器内存调整）
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      # 数据持久化目录
      - ./elk/elasticsearch/data:/usr/share/elasticsearch/data
    ports:
      # HTTP 接口端口
      - "9200:9200"
      # 节点通信端口
      - "9300:9300"
    networks:
      - elk-network
    restart: unless-stopped

  # Logstash 配置
  logstash:
    image: docker.elastic.co/logstash/logstash:8.17.0
    container_name: elk-logstash
    volumes:
      # Logstash 主配置文件
      - ./elk/logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml
      # Pipeline 配置文件目录
      - ./elk/logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      # TCP 输入端口，Spring Boot 连接此端口
      - "5044:5044"
    environment:
      # Logstash JVM 堆内存配置
      - "LS_JAVA_OPTS=-Xmx256m -Xms256m"
    depends_on:
      - elasticsearch
    networks:
      - elk-network
    restart: unless-stopped

  # Kibana 配置
  kibana:
    image: docker.elastic.co/kibana/kibana:8.17.0
    container_name: elk-kibana
    environment:
      # Elasticsearch 连接地址（使用服务名，在同一网络中）
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      # Kibana Web 界面端口
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - elk-network
    restart: unless-stopped

networks:
  elk-network:
    driver: bridge
```

## 3. Logstash 配置

### 3.1 logstash.yml 主配置文件

**elk/logstash/config/logstash.yml:**
```yaml
# API HTTP 服务监听地址（0.0.0.0 表示监听所有网络接口）
api.http.host: "0.0.0.0"

# X-Pack 监控配置：Elasticsearch 地址（用于监控 Logstash 状态）
# 需与 docker-compose.yml 中 elasticsearch 服务名和端口一致
xpack.monitoring.elasticsearch.hosts: ["http://elasticsearch:9200"]
```

### 3.2 Pipeline 配置文件

**elk/logstash/pipeline/logstash.conf:**
```conf
input {
  # TCP 输入：接收来自 Spring Boot 的日志
  tcp {
    # 监听端口，需与 docker-compose.yml 中 logstash 端口映射一致
    port => 5044
    # JSON 格式解码器（Spring Boot LogstashEncoder 输出为 JSON）
    codec => json
  }
}

filter {
  # 日期过滤器：解析日志中的时间戳
  date {
    # 匹配时间戳字段格式（按优先级尝试）
    # ISO8601: 2024-01-01T12:00:00.000+08:00
    # yyyy-MM-dd HH:mm:ss.SSS: 2024-01-01 12:00:00.000
    # yyyy-MM-dd HH:mm:ss: 2024-01-01 12:00:00
    match => [ "timestamp", "ISO8601", "yyyy-MM-dd HH:mm:ss.SSS", "yyyy-MM-dd HH:mm:ss" ]
    # 目标字段名（Elasticsearch 默认使用 @timestamp 作为时间字段）
    target => "@timestamp"
    # 时区设置（中国时区）
    timezone => "Asia/Shanghai"
  }
}

output {
  # Elasticsearch 输出
  elasticsearch {
    # Elasticsearch 集群地址（使用服务名，在同一 Docker 网络中）
    # 需与 docker-compose.yml 中 elasticsearch 服务名和端口一致
    hosts => ["http://elasticsearch:9200"]
    # 索引名称格式：
    # - logstash: 固定前缀
    # - %{[server_name]}: 从日志中提取 server_name 字段（Spring Boot 中 customFields 配置）
    # - %{+YYYY.MM.dd}: 日期格式，按天分割索引
    # 示例：logstash-petcare-2024.01.01
    index => "logstash-%{[server_name]}-%{+YYYY.MM.dd}"
  }
  
  # 标准输出（调试用，可在 docker-compose logs 中查看）
  stdout {
    codec => rubydebug
  }
}
```

## 4. Spring Boot 配置

### 4.1 添加依赖

**pom.xml:**
```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

### 4.2 Logback 配置

**logback-spring.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Logstash TCP Appender：通过 TCP 连接发送日志到 Logstash -->
    <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <!-- Logstash 服务地址和端口 -->
        <!-- 宿主机运行：使用 localhost:5044 -->
        <!-- Docker 容器运行：使用 logstash:5044（需确保在同一 Docker 网络中） -->
        <!-- 端口需与 logstash.conf 中 input.tcp.port 和 docker-compose.yml 中端口映射一致 -->
        <destination>localhost:5044</destination>
        
        <!-- LogstashEncoder：将日志编码为 JSON 格式 -->
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <!-- 自定义字段：会出现在每条日志中 -->
            <!-- server_name 用于 logstash.conf 中索引命名：logstash-{server_name}-{date} -->
            <!-- 需与 logstash.conf 中 index 配置的字段名一致 -->
            <customFields>{"server_name":"petcare"}</customFields>
            <!-- 时区设置（与 logstash.conf 中 filter.date.timezone 保持一致） -->
            <timeZone>Asia/Shanghai</timeZone>
        </encoder>
        
        <!-- 重连延迟（毫秒）：连接断开后等待 10 秒再重连 -->
        <reconnectionDelay>10000</reconnectionDelay>
        <!-- 连接超时（毫秒）：5 秒内无法建立连接则超时 -->
        <connectionTimeout>5000</connectionTimeout>
    </appender>

    <root level="INFO">
        <appender-ref ref="LOGSTASH"/>
    </root>
</configuration>
```

### 4.3 故障排查

```bash
# 1. 检查 Logstash 服务状态
docker-compose ps
docker-compose logs logstash

# 2. 测试端口连通性
telnet localhost 5044
# 或
nc -zv localhost 5044

# 3. 如果 Spring Boot 运行在 Docker 中
# - 修改 logback-spring.xml 中 destination 为 logstash:5044
# - 确保应用与 Logstash 在同一 Docker 网络中（elk-network）
```

## 5. Kibana 配置

1. 访问 http://localhost:5601，点击 "Explore on my own"
2. **Stack Management** -> **Index Patterns** -> **Create index pattern**
3. 输入索引模式：`logstash-*`（匹配所有 logstash 索引）
4. 选择时间字段：`@timestamp`（Logstash 默认时间字段）
5. 点击 **Create index pattern**
6. 在 **Discover** 中查看日志

**查询示例：**
- `server_name:petcare` - 查看特定应用日志
- `level:ERROR` - 查看错误日志
- `@timestamp:[2024-01-01 TO 2024-01-31]` - 时间范围查询

## 6. 验证服务

```bash
# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 测试 Elasticsearch
curl http://localhost:9200

# 测试 Logstash 配置
docker-compose exec logstash /usr/share/logstash/bin/logstash --config.test_and_exit --path.settings=/usr/share/logstash/config
```

- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601

## 7. 常用命令

```bash
# 查看日志
docker-compose logs -f
docker-compose logs -f logstash

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v

# 重启服务
docker-compose restart
docker-compose restart logstash
```

## 8. 常见问题

1. **Logstash 启动失败（SystemExit 错误）**
   - 检查 `logstash.yml` 配置语法
   - 确认没有使用不支持的配置项（如 `pipeline.timezone`）

2. **Spring Boot 无法连接 Logstash**
   - 确认 Logstash 服务已启动：`docker-compose ps`
   - 测试端口连通性：`telnet localhost 5044`
   - Docker 环境使用服务名：`logstash:5044`

3. **日志未出现在 Kibana**
   - 确认索引模式匹配：`logstash-*`
   - 检查时间字段：`@timestamp`
   - 查看 Logstash 日志确认数据接收正常
