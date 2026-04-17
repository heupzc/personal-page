# 前端性能优化实战指南

性能是用户体验的基石。一个加载缓慢的页面，再精美的设计也会失去意义。本文将从**加载性能**和**运行时性能**两个维度，系统性地梳理前端优化的核心策略。

## 加载性能优化

### 1. 资源压缩与合并

一切从减少传输体积开始：

- **Gzip / Brotli 压缩**：服务器开启压缩，通常可减少 60-80% 的传输体积
- **代码压缩**：JS 用 Terser，CSS 用 cssnano，HTML 用 html-minifier
- **Tree Shaking**：确保 ES Module 模式，让打包工具消除无用代码

```javascript
// vite.config.js — 开启 Tree Shaking
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash-es']
        }
      }
    }
  }
}
```

### 2. 图片优化

图片通常占页面体积的 50% 以上：

| 格式 | 适用场景 | 压缩率 |
|------|---------|--------|
| WebP | 通用场景 | 比 JPEG 小 25-35% |
| AVIF | 追求极致压缩 | 比 WebP 再小 20% |
| SVG | 图标/插画 | 矢量无损 |

> 使用 `<picture>` 标签实现格式降级，确保兼容性。

### 3. 懒加载与预加载

```html
<!-- 图片懒加载 -->
<img loading="lazy" src="hero.webp" alt="Hero">

<!-- 关键资源预加载 -->
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin>
<link rel="prefetch" href="/next-page.js">
```

## 运行时性能优化

### 4. 减少 DOM 操作

DOM 操作是性能瓶颈的常见来源：

- 使用 `DocumentFragment` 批量插入
- 虚拟列表处理长列表（如 `react-window`）
- 避免频繁触发回流（使用 `transform` 代替 `top/left`）

### 5. Web Workers 处理计算密集任务

```javascript
// main.js
const worker = new Worker('heavy-compute.js');
worker.postMessage({ data: largeDataset });
worker.onmessage = (e) => {
  console.log('计算结果:', e.data);
};
```

### 6. 性能监控

使用 Performance API 建立性能基线：

```javascript
// 监控 LCP (Largest Contentful Paint)
new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

## 性能指标目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| LCP | < 2.5s | 最大内容绘制 |
| FID | < 100ms | 首次输入延迟 |
| CLS | < 0.1 | 累积布局偏移 |
| TTI | < 3.5s | 可交互时间 |

## 总结

性能优化不是一次性工作，而是持续的过程。建立性能监控体系，设定明确的指标目标，在每次迭代中持续改进。记住：**可度量的才能改进**。
