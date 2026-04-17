/**
 * Tech Blog — 文章详情页渲染
 */

(function () {
  'use strict';

  const POSTS_JSON = 'posts/posts.json';
  const POST_DIR = 'posts/';

  const headerEl = document.querySelector('.post-header');
  const contentEl = document.querySelector('.post-content');
  const navEl = document.querySelector('.post-nav');

  if (!headerEl || !contentEl) return;

  // 解析 URL 参数
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    showError('未指定文章');
    return;
  }

  // 加载文章
  async function loadPost() {
    try {
      // 并行加载元数据和内容
      const [postsRes, mdRes] = await Promise.all([
        fetch(POSTS_JSON),
        fetch(POST_DIR + slug + '.md')
      ]);

      if (!mdRes.ok) throw new Error('文章不存在');

      const posts = await postsRes.json();
      const md = await mdRes.text();
      const post = posts.find(p => p.slug === slug);

      if (!post) throw new Error('文章元数据未找到');

      renderPost(post, md, posts);
    } catch (err) {
      console.error('加载文章失败:', err);
      showError('文章加载失败');
    }
  }

  function renderPost(post, md, allPosts) {
    // 设置页面标题
    document.title = `${post.title} — Tech Blog`;

    // 渲染头部
    headerEl.innerHTML = `
      <h1 class="fade-in">${post.title}</h1>
      <div class="post-meta fade-in fade-in-delay-1">
        <span class="post-meta-item">📅 ${formatDate(post.date)}</span>
        <span class="post-meta-item">⏱️ ${estimateReadTime(md)} 分钟</span>
        ${post.tags.map(t => `<span class="post-card-tag">${t}</span>`).join('')}
      </div>
    `;

    // 渲染 Markdown 内容
    if (window.marked) {
      contentEl.innerHTML = window.marked.parse(md);
      contentEl.classList.add('fade-in', 'fade-in-delay-2');

      // 修复图片路径：Markdown 中的 images/xxx.png 实际在 posts/images/ 下
      contentEl.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('/')) {
          img.setAttribute('src', POST_DIR + src);
        }
      });
    } else {
      contentEl.innerHTML = `<pre>${md}</pre>`;
    }

    // 代码高亮
    if (window.Prism) {
      window.Prism.highlightAll();
    }

    // 渲染上下篇导航
    renderNav(post, allPosts);
  }

  function renderNav(currentPost, allPosts) {
    if (!navEl) return;

    const sorted = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const idx = sorted.findIndex(p => p.slug === currentPost.slug);
    const prev = sorted[idx - 1];
    const next = sorted[idx + 1];

    navEl.innerHTML = `
      ${prev ? `<a href="post.html?slug=${prev.slug}"><span class="nav-label">← 上一篇</span><span class="nav-title">${prev.title}</span></a>` : '<span></span>'}
      ${next ? `<a href="post.html?slug=${next.slug}"><span class="nav-label">下一篇 →</span><span class="nav-title">${next.title}</span></a>` : '<span></span>'}
    `;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function estimateReadTime(md) {
    const words = md.replace(/[#*`\[\]()]/g, '').length;
    return Math.max(1, Math.ceil(words / 400));
  }

  function showError(msg) {
    headerEl.innerHTML = `<h1>${msg}</h1>`;
    contentEl.innerHTML = `<p style="text-align:center;"><a href="index.html">返回首页</a></p>`;
    if (navEl) navEl.innerHTML = '';
  }

  // 启动
  loadPost();
})();
