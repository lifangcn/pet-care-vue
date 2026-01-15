# Nginx 链路追踪配置说明

## 配置要点

### 1. 日志格式增强

在 `http` 块中添加追踪日志格式：

```nginx
# 链路追踪日志格式（包含 TraceId、SpanId、请求耗时等）
log_format trace '$remote_addr - $remote_user [$time_local] "$request" '
                 '$status $body_bytes_sent "$http_referer" '
                 '"$http_user_agent" "$http_x_forwarded_for" '
                 'trace_id="$http_x_trace_id" span_id="$http_x_span_id" '
                 'request_id="$request_id" '
                 'upstream_addr="$upstream_addr" '
                 'upstream_response_time="$upstream_response_time" '
                 'request_time="$request_time"';

# 访问日志格式（包含追踪信息）
log_format access_with_trace '$remote_addr - $remote_user [$time_local] "$request" '
                             '$status $body_bytes_sent "$http_referer" '
                             '"$http_user_agent" "$http_x_forwarded_for" '
                             'trace_id="$http_x_trace_id" '
                             'request_id="$request_id" '
                             'request_time="$request_time"';
```

### 2. 追踪 ID 生成和传递

在 `http` 块中添加 map 指令：

```nginx
# 链路追踪 ID 生成和传递
# 生成请求 ID（用于链路追踪）
map $http_x_request_id $request_id {
    default $http_x_request_id;
    "" "${msec}-${request_id}";
}

# 生成 TraceId（如果请求头中没有，则生成）
map $http_x_trace_id $trace_id {
    default $http_x_trace_id;
    "" "${msec}-${request_id}";
}

# 生成 SpanId（如果请求头中没有，则生成）
map $http_x_span_id $span_id {
    default $http_x_span_id;
    "" "${msec}-${request_id}";
}
```

### 3. 在代理配置中传递追踪头

在所有 `location` 块中添加追踪请求头：

```nginx
# 链路追踪请求头（传递给 Gateway 和后端服务）
proxy_set_header X-Request-Id $request_id;
proxy_set_header X-Trace-Id $trace_id;
proxy_set_header X-Span-Id $span_id;
proxy_set_header X-Parent-Span-Id $http_x_span_id;
```

### 4. 使用追踪日志格式

在 `server` 块中：

```nginx
access_log /var/log/nginx/access.log access_with_trace;
```

## 完整配置示例

### http 块配置

```nginx
http {
    # ... 其他配置 ...
    
    # 链路追踪日志格式
    log_format access_with_trace '$remote_addr - $remote_user [$time_local] "$request" '
                                 '$status $body_bytes_sent "$http_referer" '
                                 '"$http_user_agent" "$http_x_forwarded_for" '
                                 'trace_id="$http_x_trace_id" '
                                 'request_id="$request_id" '
                                 'request_time="$request_time"';
    
    # 追踪 ID 生成
    map $http_x_request_id $request_id {
        default $http_x_request_id;
        "" "${msec}-${request_id}";
    }
    
    map $http_x_trace_id $trace_id {
        default $http_x_trace_id;
        "" "${msec}-${request_id}";
    }
    
    map $http_x_span_id $span_id {
        default $http_x_span_id;
        "" "${msec}-${request_id}";
    }
}
```

### location 块配置

```nginx
location /api {
    proxy_pass http://gateway;
    
    # ... 其他配置 ...
    
    # 链路追踪请求头
    proxy_set_header X-Request-Id $request_id;
    proxy_set_header X-Trace-Id $trace_id;
    proxy_set_header X-Span-Id $span_id;
    proxy_set_header X-Parent-Span-Id $http_x_span_id;
}
```

## 与 APM 系统集成

### SkyWalking

SkyWalking 使用 `sw8` 请求头，需要额外配置：

```nginx
proxy_set_header sw8 $http_sw8;
```

### Zipkin/Jaeger

使用标准的追踪头：
- `X-B3-TraceId`
- `X-B3-SpanId`
- `X-B3-ParentSpanId`

可以添加映射：

```nginx
map $http_x_b3_traceid $b3_trace_id {
    default $http_x_b3_traceid;
    "" $trace_id;
}

proxy_set_header X-B3-TraceId $b3_trace_id;
proxy_set_header X-B3-SpanId $span_id;
proxy_set_header X-B3-ParentSpanId $http_x_span_id;
```

## 监控指标

### Prometheus 监控

可以使用 `nginx-prometheus-exporter` 导出指标，包括：
- 请求总数（按状态码）
- 请求耗时（P50/P95/P99）
- 上游响应时间
- 追踪 ID 分布

### 日志分析

使用 ELK 或 Loki 分析追踪日志：
- 按 TraceId 聚合请求链路
- 分析慢请求
- 追踪错误请求

## 注意事项

1. **UUID 生成**：标准 Nginx 不支持 UUID，如需完整 UUID，建议使用 OpenResty 或 Lua 模块
2. **性能影响**：追踪头传递和日志记录会有轻微性能开销，生产环境建议采样
3. **日志轮转**：追踪日志可能较大，需要配置日志轮转
4. **隐私保护**：追踪 ID 可能包含敏感信息，注意日志脱敏

