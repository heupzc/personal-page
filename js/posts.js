/**
 * Tech Blog — 首页文章列表渲染
 */

(function () {
  'use strict';

  const POSTS_JSON = 'posts/posts.json';
  const container = document.querySelector('.posts-grid');

  if (!container) return;

  // 加载文章数据并渲染
  async function loadPosts() {
    try {
      const res = await fetch(POSTS_JSON);
      const posts = await res.json();
      renderPosts(posts);
    } catch (err) {
      console.error('加载文章失败:', err);
      container.innerHTML = '<div class="no-results"><div class="emoji">😵</div><p>文章加载失败，请刷新重试</p></div>';
    }
  }

  function renderPosts(posts) {
    if (posts.length === 0) {
      container.innerHTML = '<div class="no-results"><div class="emoji">📝</div><p>暂无文章</p></div>';
      return;
    }

    // 按日期降序
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = posts.map((post, i) => `
      <a href="post.html?slug=${post.slug}" class="post-card fade-in fade-in-delay-${Math.min(i + 1, 4)}"
         data-title="${post.title}"
         data-tags="${post.tags.join(',')}"
         data-excerpt="${post.excerpt}">
        <div class="post-card-meta">
          <span class="post-card-date">📅 ${formatDate(post.date)}</span>
          ${post.tags.map(t => `<span class="post-card-tag">${t}</span>`).join('')}
        </div>
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
      </a>
    `).join('');
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // 启动
  loadPosts();
})();
