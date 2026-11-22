// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });
}

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// ===== ANIMATED SLIDING NAV INDICATOR =====
(function initNavIndicator() {
  const linksContainer = document.getElementById('navLinks');
  if (!linksContainer) return;

  const isDesktop = () => window.innerWidth > 768;

  let indicator = linksContainer.querySelector('.nav-indicator');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    linksContainer.prepend(indicator);
  }

  function moveIndicator(targetLink, animate) {
    if (!isDesktop() || !targetLink) {
      indicator.classList.remove('visible');
      linksContainer.classList.remove('has-indicator');
      return;
    }

    // Prefer offsetLeft (relative to offsetParent / container)
    // fallback to getBoundingClientRect if needed
    let left = targetLink.offsetLeft;
    let width = targetLink.offsetWidth;

    // offsetParent may not be the flex container in some browsers —
    // cross-check with bounding rect
    const containerRect = linksContainer.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();
    const rectLeft = linkRect.left - containerRect.left;
    if (Math.abs(rectLeft - left) > 2) {
      left = rectLeft;
      width = linkRect.width;
    }

    if (!animate) {
      indicator.style.transition = 'none';
    } else {
      indicator.style.transition = '';
    }

    indicator.style.width = width + 'px';
    indicator.style.transform = 'translateX(' + left + 'px)';
    indicator.classList.add('visible');
    linksContainer.classList.add('has-indicator');

    if (!animate) {
      void indicator.offsetHeight; // reflow
      indicator.style.transition = '';
    }
  }

  function updateActiveIndicator(animate) {
    const active = linksContainer.querySelector('.nav-link.active');
    if (active) {
      moveIndicator(active, animate !== false);
    } else {
      indicator.classList.remove('visible');
      linksContainer.classList.remove('has-indicator');
    }
  }

  // Wait for layout + entrance animation + fonts
  function scheduleInit() {
    updateActiveIndicator(false);
    // second pass after fonts/paint settle
    setTimeout(function () { updateActiveIndicator(false); }, 400);
    setTimeout(function () { updateActiveIndicator(false); }, 1000);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleInit);
  } else {
    window.addEventListener('load', scheduleInit);
    scheduleInit();
  }

  // Hover: slide to hovered link, return to active on leave
  const links = linksContainer.querySelectorAll('.nav-link');
  links.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      if (isDesktop()) moveIndicator(link, true);
    });
  });

  linksContainer.addEventListener('mouseleave', function () {
    updateActiveIndicator(true);
  });

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      updateActiveIndicator(false);
    }, 120);
  });

  // Theme toggle can slightly change metrics
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTimeout(function () { updateActiveIndicator(false); }, 60);
    });
  }
})();

// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  localStorage.setItem('ebd-theme', theme);
}

// Load saved theme or system preference
const savedTheme = localStorage.getItem('ebd-theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

// ===== UNIQUE SOCIAL BAR ENTRANCE ANIMATION =====
function runSocialBarAnimation() {
  const socialBar = document.querySelector('.social-bar');
  if (!socialBar) return;

  // Play unique entrance, then keep bar permanently visible with soft float
  setTimeout(() => {
    socialBar.classList.add('sb-animate');

    setTimeout(() => {
      socialBar.classList.remove('sb-animate');
      socialBar.classList.add('sb-ready');
    }, 1500);
  }, 120);
}

// ===== PAGE OPEN TYPING ANIMATION =====
function getPlainText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function typeText(element, originalHTML, speed = 50) {
  return new Promise((resolve) => {
    const plain = getPlainText(originalHTML);
    element.classList.add('typing');
    element.textContent = '';

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    let i = 0;

    function type() {
      if (i < plain.length) {
        cursor.insertAdjacentText('beforebegin', plain[i]);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => {
          element.innerHTML = originalHTML;
          element.classList.remove('typing');
          element.classList.add('typed');
          resolve();
        }, 320);
      }
    }
    type();
  });
}

async function runPageTypingAnimation() {
  const selectors = [
    '.hero-tag',
    '.hero-content h1',
    '.hero-desc',
    '.section-header h2',
    '.section-header p',
    '.about-intro p'
  ];

  const elements = [];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.dataset.typed) {
        elements.push(el);
        el.dataset.typed = '1';
      }
    });
  });

  const revealSelectors = [
    '.hero-buttons',
    '.hero-stats',
    '.players-grid',
    '.download-grid',
    '.news-grid',
    '.stories-grid',
    '.stories-rings',
    '.game-download-box',
    '.player-card',
    '.download-card',
    '.news-card',
    '.story-card',
    '.story-ring'
  ];

  const revealEls = [];
  revealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      revealEls.push(el);
    });
  });

  for (const el of elements) {
    const originalHTML = el.innerHTML.trim();
    if (!originalHTML) continue;

    const isHeading = el.tagName === 'H1' || el.tagName === 'H2';
    await typeText(el, originalHTML, isHeading ? 34 : 18);
  }

  revealEls.forEach((el, idx) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 65 * idx);
  });
}

// Run all page-open animations
function startPageAnimations() {
  runSocialBarAnimation();
  runPageTypingAnimation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPageAnimations);
} else {
  startPageAnimations();
}

// Safety: force content visible if animation stalls
setTimeout(() => {
  document.querySelectorAll('.hero-tag, .hero-content h1, .hero-desc, .section-header h2, .section-header p, .about-intro p').forEach(el => {
    el.classList.add('typed');
  });
  document.querySelectorAll('.hero-buttons, .hero-stats, .players-grid, .download-grid, .news-grid, .stories-grid, .stories-rings, .game-download-box, .player-card, .download-card, .news-card, .story-card, .story-ring').forEach(el => {
    el.classList.add('visible');
  });
  // Ensure social bar is always visible
  const sb = document.querySelector('.social-bar');
  if (sb) {
    sb.classList.remove('sb-animate');
    sb.classList.add('sb-ready');
  }
}, 5000);

// ===== EBD STORIES SYSTEM =====
(function () {
  // HOW TO CHANGE / ADD IMAGES:
  // 1. Put your image in  images/stories/  (jpg, png, gif, webp)
  // 2. Set  image: 'images/stories/yourfile.jpg'  on the story
  // 3. Save this file and refresh the browser
  // Optional: emoji + color are used only when image is missing
  const STORIES = [
    {
      id: 's1',
      name: 'EBD Official',
      short: 'EBD',
      time: '2h ago',
      date: 'Nov 18, 2026',
      image: 'images/stories/01.png',
      title: 'EBD NEW ROAD',
      caption: 'Fresh coach just rolled out. Clean lines, powerful presence — this one is ready for the Bangladesh roads.'
    },
    {
      id: 's2',
      name: 'EBD Official',
      short: 'EBD',
      time: '2h ago',
      date: 'Nov 18, 2026',
      image: 'images/stories/02.png',
      title: 'EBD NEW ROAD',
      caption: 'Fresh coach just rolled out. Clean lines, powerful presence — this one is ready for the Bangladesh roads.'
    },
    {
      id: 's3',
      name: 'EBD Official',
      short: 'EBD',
      time: '2h ago',
      date: 'Nov 18, 2026',
      image: 'images/stories/03.png',
      title: 'EBD NEW ROAD',
      caption: 'Fresh coach just rolled out. Clean lines, powerful presence — this one is ready for the Bangladesh roads.'
    },
    {
      id: 's4',
      name: 'EBD Official',
      short: 'EBD',
      time: '2h ago',
      date: 'Nov 18, 2026',
      image: 'images/stories/04.png',
      title: 'EBD NEW ROAD',
      caption: 'Fresh coach just rolled out. Clean lines, powerful presence — this one is ready for the Bangladesh roads.'
    },
    {
      id: 's5',
      name: 'EBD Official',
      short: 'EBD',
      time: '2h ago',
      date: 'Nov 18, 2026',
      image: 'images/stories/05.png',
      title: 'EBD NEW ROAD',
      caption: 'Fresh coach just rolled out. Clean lines, powerful presence — this one is ready for the Bangladesh roads.'
    },
    {
      id: 's6',
      name: 'EBD Official',
      short: 'EBD',
      time: '2h ago',
      date: 'Nov 18, 2026',
      image: 'images/stories/06.png',
      title: 'EBD NEW ROAD',
      caption: 'Fresh coach just rolled out. Clean lines, powerful presence — this one is ready for the Bangladesh roads.'
    }
  ];

  const ringsEl = document.getElementById('storiesRings');
  const gridEl = document.getElementById('storiesGrid');
  const viewer = document.getElementById('storyViewer');
  if (!ringsEl || !gridEl || !viewer) return;

  const seenKey = 'ebd-stories-seen';
  let seen = new Set();
  try {
    const raw = localStorage.getItem(seenKey);
    if (raw) seen = new Set(JSON.parse(raw));
  } catch (_) {}

  function saveSeen() {
    try { localStorage.setItem(seenKey, JSON.stringify([...seen])); } catch (_) {}
  }

  // Build rings
  STORIES.forEach((s, idx) => {
    const ring = document.createElement('button');
    ring.type = 'button';
    ring.className = 'story-ring';
    ring.setAttribute('aria-label', `View story: ${s.title}`);

    let avatarInner = '';
    if (s.image) {
      avatarInner = `<div class="story-ring-avatar-inner" style="background-image:url('${s.image}');background-size:cover;background-position:center;"></div>`;
    } else {
      avatarInner = `<div class="story-ring-avatar-inner"><span>${s.short || s.emoji || '?'}</span></div>`;
    }

    ring.innerHTML = `
      <div class="story-ring-avatar ${seen.has(s.id) ? 'seen' : ''}">
        ${avatarInner}
      </div>
      <span class="story-ring-label">${s.name}</span>
    `;
    ring.addEventListener('click', () => openStory(idx));
    ringsEl.appendChild(ring);
  });

  // Build archive cards
  STORIES.forEach((s, idx) => {
    const card = document.createElement('article');
    card.className = 'story-card';

    let mediaStyle = '';
    let mediaContent = '';
    if (s.image) {
      mediaStyle = `background-image:url('${s.image}');background-size:cover;background-position:center;`;
      mediaContent = ''; // real photo, no emoji
    } else {
      mediaStyle = `background:${s.color || 'linear-gradient(160deg,#1a1a2e,#16213e)'}`;
      mediaContent = `<span style="position:relative;z-index:1;font-size:2.6rem">${s.emoji || '📷'}</span>`;
    }

    card.innerHTML = `
      <div class="story-card-media" style="${mediaStyle}">
        ${mediaContent}
      </div>
      <div class="story-card-body">
        <div class="story-card-date">${s.date}</div>
        <h4>${s.title}</h4>
        <p>${s.caption.slice(0, 90)}${s.caption.length > 90 ? '…' : ''}</p>
        <div class="story-card-footer">
          <span>${s.name}</span>
          <span>•</span>
          <span>${s.time}</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openStory(idx));
    gridEl.appendChild(card);
  });

  // Viewer state
  let currentIndex = 0;
  let progressTimer = null;
  let progressStart = 0;
  let progressElapsed = 0;
  const STORY_DURATION = 5500; // ms per story

  const progressEl = document.getElementById('storyProgress');
  const avatarEl = document.getElementById('storyAvatar');
  const nameEl = document.getElementById('storyName');
  const timeEl = document.getElementById('storyTime');
  const mediaEl = document.getElementById('storyMedia');
  const captionEl = document.getElementById('storyCaption');
  const closeBtn = document.getElementById('storyClose');
  const prevBtn = document.getElementById('storyPrev');
  const nextBtn = document.getElementById('storyNext');

  function buildProgressBars() {
    progressEl.innerHTML = '';
    STORIES.forEach((_, i) => {
      const bar = document.createElement('div');
      bar.className = 'story-progress-bar';
      bar.innerHTML = '<span></span>';
      progressEl.appendChild(bar);
    });
  }

  function updateProgressVisual(activeIdx, pct) {
    const bars = progressEl.querySelectorAll('.story-progress-bar > span');
    bars.forEach((span, i) => {
      if (i < activeIdx) span.style.width = '100%';
      else if (i === activeIdx) span.style.width = pct + '%';
      else span.style.width = '0%';
    });
  }

  function stopTimer() {
    if (progressTimer) {
      cancelAnimationFrame(progressTimer);
      progressTimer = null;
    }
  }

  function startTimer() {
    stopTimer();
    progressStart = performance.now() - progressElapsed;
    function tick(now) {
      progressElapsed = now - progressStart;
      const pct = Math.min(100, (progressElapsed / STORY_DURATION) * 100);
      updateProgressVisual(currentIndex, pct);
      if (pct >= 100) {
        nextStory();
        return;
      }
      progressTimer = requestAnimationFrame(tick);
    }
    progressTimer = requestAnimationFrame(tick);
  }

  function renderStory(idx) {
    const s = STORIES[idx];
    if (!s) return;
    currentIndex = idx;
    progressElapsed = 0;

    // Avatar in viewer header
    if (s.image) {
      avatarEl.style.backgroundImage = `url('${s.image}')`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
      avatarEl.textContent = '';
    } else {
      avatarEl.style.backgroundImage = '';
      avatarEl.textContent = s.short || s.emoji || '?';
    }

    nameEl.textContent = s.name;
    timeEl.textContent = s.time;

    // Main media: prefer real image, otherwise color + emoji
    if (s.image) {
      mediaEl.style.background = 'none';
      mediaEl.style.backgroundImage = `url('${s.image}')`;
      mediaEl.style.backgroundSize = 'cover';
      mediaEl.style.backgroundPosition = 'center';
      mediaEl.innerHTML = '';
    } else {
      mediaEl.style.backgroundImage = '';
      mediaEl.style.background = s.color || 'linear-gradient(160deg,#1a1a2e,#16213e)';
      mediaEl.innerHTML = `<span class="story-emoji">${s.emoji || '📷'}</span>`;
    }

    captionEl.innerHTML = `<strong>${s.title}</strong>${s.caption}`;

    // mark seen
    seen.add(s.id);
    saveSeen();
    const ringAvatars = ringsEl.querySelectorAll('.story-ring-avatar');
    if (ringAvatars[idx]) ringAvatars[idx].classList.add('seen');

    updateProgressVisual(idx, 0);
    startTimer();
  }

  function openStory(idx) {
    buildProgressBars();
    renderStory(idx);
    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('story-open');
  }

  function closeStory() {
    stopTimer();
    viewer.classList.remove('open');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('story-open');
  }

  function nextStory() {
    if (currentIndex < STORIES.length - 1) {
      renderStory(currentIndex + 1);
    } else {
      closeStory();
    }
  }

  function prevStory() {
    if (currentIndex > 0) {
      renderStory(currentIndex - 1);
    } else {
      progressElapsed = 0;
      updateProgressVisual(0, 0);
      startTimer();
    }
  }

  closeBtn.addEventListener('click', closeStory);
  nextBtn.addEventListener('click', nextStory);
  prevBtn.addEventListener('click', prevStory);

  // click left/right half of media to navigate
  mediaEl.addEventListener('click', (e) => {
    const rect = mediaEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.35) prevStory();
    else nextStory();
  });

  // keyboard
  document.addEventListener('keydown', (e) => {
    if (!viewer.classList.contains('open')) return;
    if (e.key === 'Escape') closeStory();
    if (e.key === 'ArrowRight') nextStory();
    if (e.key === 'ArrowLeft') prevStory();
  });

  // pause on hover / touch hold
  let holding = false;
  function pause() {
    if (!viewer.classList.contains('open')) return;
    holding = true;
    stopTimer();
  }
  function resume() {
    if (!holding) return;
    holding = false;
    if (viewer.classList.contains('open')) startTimer();
  }
  mediaEl.addEventListener('mousedown', pause);
  mediaEl.addEventListener('mouseup', resume);
  mediaEl.addEventListener('mouseleave', resume);
  mediaEl.addEventListener('touchstart', pause, { passive: true });
  mediaEl.addEventListener('touchend', resume);

  // close when clicking backdrop
  viewer.querySelector('.story-viewer-bg').addEventListener('click', closeStory);
})();
