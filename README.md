# 宠物关怀系统 (Pet Care Vue)

## 项目简介

宠物关怀系统是一个基于 Vue 3 的前端应用，为宠物主人提供全方位的宠物健康管理服务。系统包含宠物管理、健康记录、智能提醒、社区互动、AI健康检查等功能模块。

### 主要功能

- **宠物管理**: 宠物信息管理、健康记录追踪
- **提醒管理**: 自定义提醒事项、执行记录查看
- **社区功能**: 内容广场、活动打卡、动态发布
- **AI助手**: AI健康检查、RAG知识问答、文档管理
- **在线咨询**: 专业咨询服务
- **消息中心**: 系统通知和消息管理

## 技术栈

- **框架**: Vue 3.5.22
- **构建工具**: Vite 7.1.11
- **UI组件库**: Element Plus 2.11.8
- **状态管理**: Pinia 2.3.1
- **路由**: Vue Router 4.6.3
- **HTTP客户端**: Axios 1.7.9
- **图表库**: ECharts 5.5.1 + Vue-ECharts 6.6.9
- **样式预处理**: Sass
- **开发工具**: 
  - unplugin-auto-import (自动导入)
  - unplugin-vue-components (组件自动导入)
  - vite-plugin-vue-devtools (开发调试工具)

## 环境要求

- Node.js: ^20.19.0 || >=22.12.0
- npm 或 yarn

## 快速启动

### 开发环境

1. 安装依赖
```bash
npm install
```

2. 配置环境变量

创建 `.env.development` 文件（开发环境）或 `.env.production` 文件（生产环境）：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

3. 启动开发服务器
```bash
npm run dev
```

### 生产构建

1. 构建项目
```bash
npm run build
```

构建产物将输出到 `dist` 目录。

2. 预览构建结果（可选）
```bash
npm run preview
```

## Nginx 部署

### 1. 构建生产版本

```bash
npm run build
```

### 2. 配置 Nginx

创建或编辑 Nginx 配置文件（如 `/etc/nginx/sites-available/pet-care`）：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP
    
    root /var/www/pet-care/dist;  # 替换为你的实际部署路径
    index index.html;

    # 前端路由支持（Vue Router history 模式）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（可选，如果后端和前端不在同一域名）
    location /api {
        proxy_pass http://localhost:8080;  # 替换为后端API地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### 3. 部署文件

将构建后的 `dist` 目录内容复制到 Nginx 配置的 `root` 路径：

```bash
# 创建部署目录
sudo mkdir -p /var/www/pet-care

# 复制构建产物
sudo cp -r dist/* /var/www/pet-care/

# 设置权限
sudo chown -R www-data:www-data /var/www/pet-care
sudo chmod -R 755 /var/www/pet-care
```

### 4. 启用配置并重启 Nginx

```bash
# 创建软链接（如果使用 sites-available/sites-enabled）
sudo ln -s /etc/nginx/sites-available/pet-care /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 5. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端API基础路径 | `/api` |

## 项目结构

```
pet-care-vue/
├── public/              # 静态资源
├── src/
│   ├── components/      # 公共组件
│   ├── constants/       # 常量定义
│   ├── router/          # 路由配置
│   ├── services/        # API服务
│   ├── store/           # 状态管理
│   ├── styles/          # 样式文件
│   ├── types/           # TypeScript类型定义
│   ├── utils/           # 工具函数
│   └── views/           # 页面组件
├── docs/                # 文档
├── vite.config.js       # Vite配置
└── package.json         # 项目配置
```

## 开发脚本

- `npm run dev`: 构建开发版本
- `npm run build`: 构建生产版本
- `npm run preview`: 预览生产构建结果

## 注意事项

1. 确保后端API服务正常运行
2. 生产环境部署前检查环境变量配置
3. Vue Router 使用 history 模式，需要配置 Nginx 的 `try_files` 指令
4. 如果前后端跨域，需要在后端配置 CORS 或使用 Nginx 代理
