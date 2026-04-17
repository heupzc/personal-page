/**
 * Tech Blog — 标签页逻辑
 */

(function () {
  'use strict';

  const POSTS_JSON = 'posts/posts.json';
  const tagCloudEl = document.querySelector('.tag-cloud');
  const postsContainerEl = document.querySelector('.tag-posts-container');

  if (!tagCloudEl || !postsContainerEl) return;

  let allPosts = [];
  let activeTag = null;

  async function loadTags() {
    try {
      const res = await fetch(POSTS_JSON);
      allPosts = await res.json();
      renderTagCloud();
      renderAllPosts();
    } catch (err) {
      console.error('加载标签失败:', err);
    }
  }

  function getAllTags() {
    const tagMap = {};
    allPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });
    return Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
  }

  function renderTagCloud() {
    const tags = getAllTags();

    // 添加"全部"标签
    tagCloudEl.innerHTML = `
      <span class="tag-cloud-item ${!activeTag ? 'active' : ''}" data-tag="">全部 (${allPosts.length})</span>
      ${tags.map(([tag, count]) => `
        <span class="tag-cloud-item ${activeTag === tag ? 'active' : ''}" data-tag="${tag}">${tag} (${count})</span>
      `).join('')}
    `;

    // 绑定点击
    tagCloudEl.querySelectorAll('.tag-cloud-item').forEach(el => {
      el.addEventListener('click', () => {
        activeTag = el.dataset.tag || null;
        renderTagCloud();
        renderPosts();
      });
    });
  }

  function renderAllPosts() {
    renderPosts();
  }

  function renderPosts() {
    const filtered = activeTag
      ? allPosts.filter(p => p.tags.includes(activeTag))
      : allPosts;

    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
      postsContainerEl.innerHTML = '<div class="no-results"><div class="emoji">📭</div><p>该标签下暂无文章</p></div>';
      return;
    }

    postsContainerEl.innerHTML = `
      <div class="posts-grid">
        ${sorted.map((post, i) => `
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
        `).join('')}
      </div>
    `;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  loadTags();
})();
