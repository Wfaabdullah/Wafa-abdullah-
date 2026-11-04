document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('projects-grid');

  /* ------------------------------ projects ------------------------------ */
  const visual = (type, title) => {
    const label = type === 'chart' ? 'Featured analysis' : 'Project preview';
    const art = type === 'grid'
      ? '<div class="visual-grid" aria-hidden="true"></div><div class="visual-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'
      : '<div class="visual-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
    return `<div class="project-visual" role="img" aria-label="${title} preview graphic"><span class="mini-label" aria-hidden="true">${label}</span>${art}</div>`;
  };

  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

  const renderProjects = filter => {
    const list = projects.filter(p => filter === 'all' || p.category.includes(filter));

    grid.innerHTML = list.length
      ? list.map(p => {
        const title = escapeHtml(p.title);
        const categories = p.category.map(x => x.replaceAll('-', ' ')).join(' · ');
        const tools = p.tools.map(t => `<span>${escapeHtml(t)}</span>`).join('');
        const link = p.link
          ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer">View project <span aria-hidden="true">→</span></a>`
          : '<a href="#contact">Discuss this project <span aria-hidden="true">→</span></a>';
        return `<article class="project ${p.featured ? 'featured' : ''}">${visual(p.visual, title)}<div class="project-body"><span class="project-category">${escapeHtml(categories)}</span><h3>${title}</h3><p>${escapeHtml(p.description)}</p><div class="project-tools">${tools}</div><div class="project-actions">${link}</div></div></article>`;
      }).join('')
      : '<p class="empty-state">No projects in this category yet.</p>';
  };
  renderProjects('all');

  document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(other => {
        const isActive = other === button;
        other.classList.toggle('active', isActive);
        other.setAttribute('aria-pressed', String(isActive));
      });
      renderProjects(button.dataset.filter);
    });
  });

  /* -------------------------------- menu -------------------------------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const header = document.querySelector('.site-header');

  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };
  const openMenu = () => {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      if (nav.classList.contains('open')) closeMenu(); else openMenu();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
    document.addEventListener('click', event => {
      if (window.innerWidth > 700) return;
      if (!nav.classList.contains('open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 700 && nav.classList.contains('open')) closeMenu();
    }, { passive: true });
  }

  /* ---------------------------- active section --------------------------- */
  const navLinks = [...document.querySelectorAll('#site-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  let ticking = false;

  const syncHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    let current = 'home';
    const marker = window.scrollY + (header ? header.offsetHeight : 0) + 40;
    sections.forEach(section => {
      if (marker >= section.offsetTop) current = section.id;
    });
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(syncHeader);
  }, { passive: true });
  window.addEventListener('resize', syncHeader, { passive: true });
  syncHeader();

  /* ------------------------------ animation ----------------------------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const numberObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count) || 0;
      const duration = 850;
      const start = performance.now();
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * progress);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      numberObserver.unobserve(el);
    }), { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(el => numberObserver.observe(el));
  } else {
    document.querySelectorAll('[data-count]').forEach(el => {
      el.textContent = String(Number(el.dataset.count) || 0);
    });
  }

  /* -------------------------------- misc -------------------------------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll('#site-nav a, .brand').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 700) closeMenu();
    });
  });
});
