# Docker 容器化部署最佳实践

Docker 已经成为现代应用部署的标准工具。但写出一个能跑的 Dockerfile 很容易，写出一个**安全、高效、可维护**的生产级 Dockerfile 却需要深入理解其背后的原理。

## 基础原则

### 1. 选择合适的基础镜像

```dockerfile
# ❌ 不推荐：完整 Ubuntu 镜像（~400MB）
FROM ubuntu:22.04

# ✅ 推荐：Alpine 版本（~50MB）
FROM node:20-alpine

# ✅ 最佳：Distroless（~20MB，无 shell）
FROM gcr.io/distroless/nodejs20
```

选择基础镜像的核心逻辑：

- **开发环境**：用完整镜像，方便调试
- **生产环境**：用 Alpine 或 Distroless，减少攻击面

### 2. 多阶段构建

多阶段构建是镜像瘦身的利器：

```dockerfile
# 阶段一：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段二：运行
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nextjs
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

> 多阶段构建确保最终镜像只包含运行所需文件，构建工具链不会泄露到生产环境。

## 镜像优化策略

### 3. 层缓存优化

Docker 的每一行指令都会创建一个新层。合理利用缓存可以大幅加速构建：

```dockerfile
# ✅ 先复制依赖文件，利用缓存
COPY package.json package-lock.json ./
RUN npm ci

# 依赖不变时，这层缓存有效
COPY . .
```

**核心原则**：变化频率低的指令放前面，变化频率高的放后面。

### 4. .dockerignore

```text
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.env
dist
coverage
```

不忽略 `node_modules` 是最常见的错误之一——会导致 COPY 指令将本地 `node_modules` 复制到镜像中，覆盖 `npm ci` 的结果。

## 安全加固

### 5. 非 Root 用户运行

```dockerfile
# 创建专用用户
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

容器以 root 运行意味着一旦被攻破，攻击者拥有容器内的完全控制权。

### 6. 只读文件系统

```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/logs
```

### 7. 镜像扫描

```bash
# 使用 Trivy 扫描漏洞
trivy image myapp:latest

# CI 中集成
trivy image --exit-code 1 --severity CRITICAL myapp:latest
```

## Docker Compose 编排

### 8. 开发环境 Compose 配置

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: devpassword
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

## 总结

| 维度 | 关键实践 |
|------|---------|
| 体积 | 多阶段构建、Alpine 基础镜像、.dockerignore |
| 安全 | 非 Root 用户、只读文件系统、镜像扫描 |
| 效率 | 层缓存优化、构建上下文最小化 |
| 可靠 | 健康检查、合理的重启策略 |

容器化不是简单的"打包运行"，而是一套完整的方法论。掌握这些最佳实践，才能让 Docker 真正发挥价值。
