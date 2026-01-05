# pom.xml 依赖
```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

# application.yml
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      acks: all
      retries: 3
      batch-size: 16384
      linger-ms: 10
      buffer-memory: 33554432
      compression-type: snappy
    consumer:
      group-id: petcare-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      auto-offset-reset: earliest
      enable-auto-commit: false
      max-poll-records: 500
      properties:
        spring.json.trusted.packages: "*"
    listener:
      ack-mode: manual_immediate
      concurrency: 3
      type: batch
```

# KafkaConfig.java
```java
@Configuration
@EnableKafka
public class KafkaConfig {
    
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 1);
        return new DefaultKafkaProducerFactory<>(config);
    }
    
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
    
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "petcare-group");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        config.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        return new DefaultKafkaConsumerFactory<>(config);
    }
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setBatchListener(true);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        factory.setConcurrency(3);
        return factory;
    }
}
```

# KafkaProducerService.java
```java
@Service
@Slf4j
public class KafkaProducerService {
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    public void send(String topic, Object message) {
        kafkaTemplate.send(topic, message)
            .addCallback(
                result -> log.info("消息发送成功: topic={}, offset={}", topic, 
                    result != null ? result.getRecordMetadata().offset() : null),
                failure -> log.error("消息发送失败: topic={}, error={}", topic, failure.getMessage())
            );
    }
    
    public void send(String topic, String key, Object message) {
        kafkaTemplate.send(topic, key, message)
            .addCallback(
                result -> log.info("消息发送成功: topic={}, key={}, offset={}", topic, key,
                    result != null ? result.getRecordMetadata().offset() : null),
                failure -> log.error("消息发送失败: topic={}, key={}, error={}", topic, key, failure.getMessage())
            );
    }
    
    @Async
    public CompletableFuture<SendResult<String, Object>> sendAsync(String topic, Object message) {
        return kafkaTemplate.send(topic, message).completable();
    }
}
```

# KafkaConsumerService.java
```java
@Service
@Slf4j
public class KafkaConsumerService {
    
    @KafkaListener(topics = "petcare-events", groupId = "petcare-group")
    public void consume(ConsumerRecord<String, Object> record, Acknowledgment ack) {
        try {
            log.info("收到消息: topic={}, partition={}, offset={}, key={}, value={}",
                record.topic(), record.partition(), record.offset(), record.key(), record.value());
            
            // 处理业务逻辑
            
            ack.acknowledge();
        } catch (Exception e) {
            log.error("消息处理失败: topic={}, offset={}, error={}", 
                record.topic(), record.offset(), e.getMessage(), e);
        }
    }
    
    @KafkaListener(topics = "petcare-events", groupId = "petcare-group", 
                   containerFactory = "kafkaListenerContainerFactory")
    public void consumeBatch(List<ConsumerRecord<String, Object>> records, Acknowledgment ack) {
        try {
            log.info("批量收到消息: count={}", records.size());
            
            for (ConsumerRecord<String, Object> record : records) {
                // 处理业务逻辑
            }
            
            ack.acknowledge();
        } catch (Exception e) {
            log.error("批量消息处理失败: error={}", e.getMessage(), e);
        }
    }
}
```

# 使用示例
```java
@RestController
@RequestMapping("/api/kafka")
public class KafkaController {
    
    @Autowired
    private KafkaProducerService kafkaProducerService;
    
    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody Map<String, Object> message) {
        kafkaProducerService.send("petcare-events", message);
        return ResponseEntity.ok("消息已发送");
    }
}
```

# 直接使用 Low-level API (KafkaConsumer/KafkaProducer)
```java
@Service
@Slf4j
public class LowLevelKafkaService {
    
    private KafkaConsumer<String, String> consumer;
    private KafkaProducer<String, String> producer;
    
    @PostConstruct
    public void init() {
        Properties consumerProps = new Properties();
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "petcare-group");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        consumer = new KafkaConsumer<>(consumerProps);
        
        Properties producerProps = new Properties();
        producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        producerProps.put(ProducerConfig.ACKS_CONFIG, "all");
        producer = new KafkaProducer<>(producerProps);
    }
    
    public void send(String topic, String key, String value) {
        ProducerRecord<String, String> record = new ProducerRecord<>(topic, key, value);
        producer.send(record, (metadata, exception) -> {
            if (exception != null) {
                log.error("发送失败: {}", exception.getMessage());
            } else {
                log.info("发送成功: topic={}, partition={}, offset={}", 
                    metadata.topic(), metadata.partition(), metadata.offset());
            }
        });
    }
    
    @Async
    public void consume(String topic) {
        consumer.subscribe(Collections.singletonList(topic));
        while (true) {
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
            for (ConsumerRecord<String, String> record : records) {
                try {
                    log.info("收到消息: topic={}, partition={}, offset={}, key={}, value={}",
                        record.topic(), record.partition(), record.offset(), record.key(), record.value());
                    
                    // 处理业务逻辑
                    
                    consumer.commitSync();
                } catch (Exception e) {
                    log.error("处理失败: {}", e.getMessage(), e);
                }
            }
        }
    }
    
    @PreDestroy
    public void close() {
        if (consumer != null) consumer.close();
        if (producer != null) producer.close();
    }
}
```

# 对比说明
Spring Kafka 优势：
- 自动管理生命周期（启动/停止）
- 声明式消费（@KafkaListener）
- 事务支持
- 错误处理和重试机制
- 与 Spring 生态集成（事务、监控等）
- 批量处理支持
- 并发控制

Low-level API 适用场景：
- 需要精确控制消费位置（seek）
- 需要跨多个 topic/partition 的复杂逻辑
- 需要自定义分区分配策略
- 需要手动管理 offset
- 性能极致优化场景
