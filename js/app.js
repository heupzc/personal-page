/**
 * Tech Blog — 核心逻辑
 * 主题切换、搜索、移动端菜单、回到顶部
 */

(function () {
  'use strict';

  // ===== 主题系统 =====
  const ThemeManager = {
    key: 'tech-blog-theme',

    init() {
      const saved = localStorage.getItem(this.key);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      this.apply(theme);

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.key)) {
          this.apply(e.matches ? 'dark' : 'light');
        }
      });
    },

    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.updateIcon(theme);
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      this.apply(next);
      localStorage.setItem(this.key, next);
    },

    updateIcon(theme) {
      const btn = document.querySelector('.theme-toggle');
      if (!btn) return;
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? '切换亮色主题' : '切换暗色主题');
    }
  };

  // ===== 搜索系统 =====
  const SearchManager = {
    init() {
      const wrapper = document.querySelector('.search-wrapper');
      const input = document.querySelector('.search-input');
      const btn = document.querySelector('.search-btn');
      if (!wrapper || !input || !btn) return;

      btn.addEventListener('click', () => {
        wrapper.classList.toggle('active');
        if (wrapper.classList.contains('active')) {
          input.focus();
        } else {
          input.value = '';
          this.filterPosts('');
        }
      });

      input.addEventListener('input', (e) => {
        this.filterPosts(e.target.value.trim().toLowerCase());
      });

      // 点击外部关闭
      document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
          wrapper.classList.remove('active');
        }
      });
    },

    filterPosts(query) {
      const cards = document.querySelectorAll('.post-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const excerpt = (card.dataset.excerpt || '').toLowerCase();

        const match = !query || title.includes(query) || tags.includes(query) || excerpt.includes(query);
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      // 无结果提示
      const noResults = document.querySelector('.no-results');
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? '' : 'none';
      }
    }
  };

  // ===== 移动端菜单 =====
  const MobileMenu = {
    init() {
      const btn = document.querySelector('.mobile-menu-btn');
      const links = document.querySelector('.nav-links');
      if (!btn || !links) return;

      btn.addEventListener('click', () => {
        links.classList.toggle('open');
        btn.textContent = links.classList.contains('open') ? '✕' : '☰';
      });

      // 点击链接后关闭
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('open');
          btn.textContent = '☰';
        });
      });
    }
  };

  // ===== 回到顶部 =====
  const BackToTop = {
    init() {
      const btn = document.querySelector('.back-to-top');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 300);
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  // ===== 页面淡入 =====
  const PageTransition = {
    init() {
      document.body.classList.add('fade-in');
    }
  };

  // ===== 初始化 =====
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    SearchManager.init();
    MobileMenu.init();
    BackToTop.init();
    PageTransition.init();

    // 绑定主题切换按钮
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => ThemeManager.toggle());
    }
  });

  // 暴露给全局（供其他脚本使用）
  window.ThemeManager = ThemeManager;
})();
