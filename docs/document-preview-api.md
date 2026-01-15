# 文档预览接口文档

## 接口说明

文档预览功能基于 MinIO 对象存储，通过预签名 URL 实现文档的安全预览。

## 接口定义

### 获取文档预览地址

**接口**: `GET /api/ai/document/{id}/preview`

**路径参数**:
- `id` (Long, 必填): 文档ID

**请求头**:
- `Authorization: Bearer {token}` - 认证Token

**响应示例**:
```json
{
  "code": "200",
  "message": "success",
  "data": {
    "url": "https://minio.example.com/pet-care-ai/ai/2025/01/06/document.pdf?X-Amz-Algorithm=..."
  },
  "timestamp": 1234567890
}
```

**字段说明**:
- `url` (String): MinIO 预签名URL，有效期通常为1小时

## 后端实现建议

### Spring Boot Controller

```java
@GetMapping("/ai/document/{id}/preview")
public ResponseEntity<Map<String, String>> getDocumentPreviewUrl(@PathVariable Long id) {
    // 1. 查询文档信息
    Document document = documentService.getById(id);
    if (document == null) {
        return ResponseEntity.notFound().build();
    }
    
    // 2. 从 MinIO 生成预签名URL
    String presignedUrl = minioService.generatePresignedUrl(
        document.getFileUrl(), 
        3600 // 1小时有效期
    );
    
    // 3. 返回预签名URL
    Map<String, String> result = new HashMap<>();
    result.put("url", presignedUrl);
    return ResponseEntity.ok(result);
}
```

### MinIO 服务实现

```java
@Service
public class MinioService {
    
    @Value("${minio.endpoint}")
    private String endpoint;
    
    @Value("${minio.bucket}")
    private String bucket;
    
    @Value("${minio.access-key}")
    private String accessKey;
    
    @Value("${minio.secret-key}")
    private String secretKey;
    
    /**
     * 生成预签名URL
     * @param objectName MinIO对象名称（从fileUrl中提取）
     * @param expirySeconds 过期时间（秒）
     * @return 预签名URL
     */
    public String generatePresignedUrl(String objectName, int expirySeconds) {
        try {
            MinioClient minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
            
            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucket)
                    .object(objectName)
                    .expiry(expirySeconds, TimeUnit.SECONDS)
                    .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("生成预签名URL失败", e);
        }
    }
}
```

## 注意事项

1. **安全性**: 预签名URL应设置合理的过期时间（建议1小时）
2. **文件路径**: 从 `document.fileUrl` 中提取 MinIO 对象名称
3. **错误处理**: 文档不存在或 MinIO 服务异常时返回相应错误
4. **权限验证**: 确保用户有权限访问该文档

## 前端使用

```typescript
// 获取预览URL
const res = await getDocumentPreviewUrl(documentId)
const previewUrl = res.data.url

// 在iframe中显示
<iframe :src="previewUrl" />
```

