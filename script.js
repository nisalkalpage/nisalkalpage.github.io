(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const savedTheme = localStorage.getItem('nisal-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.dataset.theme = savedTheme;
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.dataset.theme = 'light';
  }

  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('nisal-theme', root.dataset.theme);
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeMobileNav = () => {
    mobileNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const open = mobileNav?.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
    body.classList.toggle('menu-open', Boolean(open));
  });
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));

  const updateScrollState = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${docHeight > 0 ? (scrollTop / docHeight) * 100 : 0}%`;
    header?.classList.toggle('scrolled', scrollTop > 24);
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.setProperty('--delay', `${el.dataset.delay}ms`);
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || '';
      const duration = reduceMotion ? 0 : 1300;
      const start = performance.now();
      const tick = now => {
        const progressValue = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .7 });
  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const activeObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -55% 0px' });
  sections.forEach(section => activeObserver.observe(section));

  const applyFilter = (buttons, cards, attribute) => {
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset[attribute];
        buttons.forEach(item => item.classList.toggle('active', item === button));
        cards.forEach(card => {
          const categories = (card.dataset.category || '').split(' ');
          const show = filter === 'all' || categories.includes(filter);
          card.classList.toggle('hidden', !show);
        });
      });
    });
  };

  applyFilter(
    [...document.querySelectorAll('[data-publication-filter]')],
    [...document.querySelectorAll('.publication-item')],
    'publicationFilter'
  );
  applyFilter(
    [...document.querySelectorAll('[data-project-filter]')],
    [...document.querySelectorAll('.project-card')],
    'projectFilter'
  );

  document.querySelectorAll('.publication-expand').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.publication-item');
      const open = item?.classList.toggle('open');
      button.setAttribute('aria-expanded', String(Boolean(open)));
    });
  });

  const tabs = [...document.querySelectorAll('.tab-button')];
  const panels = [...document.querySelectorAll('.timeline-panel')];
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      panels.forEach(panel => {
        const active = panel.dataset.panel === tab.dataset.tab;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    });
  });

  const showAwards = document.querySelector('.show-awards');
  const awardsGrid = document.querySelector('.awards-grid');
  showAwards?.addEventListener('click', () => {
    const showAll = awardsGrid?.classList.toggle('show-all');
    showAwards.innerHTML = showAll ? 'Show fewer awards <span>↑</span>' : 'Show all awards <span>↓</span>';
  });

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 7}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    document.querySelectorAll('.magnetic').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .08}px, ${(event.clientY - rect.top - rect.height / 2) * .11}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  const dialog = document.querySelector('.command-palette');
  const commandButton = document.querySelector('.command-button');
  const commandInput = document.querySelector('#command-search');
  const commandClose = document.querySelector('.command-close');
  const allCommands = [...document.querySelectorAll('.command-results > *')];
  let selectedIndex = 0;

  const updateSelection = () => {
    const visible = allCommands.filter(item => !item.hidden);
    visible.forEach((item, index) => item.classList.toggle('selected', index === selectedIndex));
  };
  const openCommand = () => {
    if (!dialog?.open) dialog?.showModal();
    commandInput?.focus();
    selectedIndex = 0;
    updateSelection();
  };
  const closeCommand = () => dialog?.close();

  commandButton?.addEventListener('click', openCommand);
  commandClose?.addEventListener('click', closeCommand);
  document.addEventListener('keydown', event => {
    const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (shortcut) { event.preventDefault(); dialog?.open ? closeCommand() : openCommand(); }
    if (event.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName || '')) { event.preventDefault(); openCommand(); }
    if (!dialog?.open) return;
    const visible = allCommands.filter(item => !item.hidden);
    if (event.key === 'ArrowDown') { event.preventDefault(); selectedIndex = (selectedIndex + 1) % visible.length; updateSelection(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); selectedIndex = (selectedIndex - 1 + visible.length) % visible.length; updateSelection(); }
    if (event.key === 'Enter' && document.activeElement === commandInput) { event.preventDefault(); visible[selectedIndex]?.click(); }
  });
  commandInput?.addEventListener('input', () => {
    const query = commandInput.value.trim().toLowerCase();
    allCommands.forEach(item => { item.hidden = query && !item.textContent.toLowerCase().includes(query); });
    selectedIndex = 0;
    updateSelection();
  });
  allCommands.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      if (target) document.querySelector(target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      closeCommand();
    });
  });

  document.querySelector('#year').textContent = new Date().getFullYear();

  const canvas = document.querySelector('#network-canvas');
  const context = canvas?.getContext('2d');
  if (canvas && context && !reduceMotion) {
    let width = 0;
    let height = 0;
    let points = [];
    const pointer = { x: -9999, y: -9999 };

    const colour = () => getComputedStyle(root).getPropertyValue('--primary').trim() || '#5ae5c4';
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(24, Math.min(72, Math.floor(width / 22)));
      points = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18 }));
    };
    const render = () => {
      context.clearRect(0, 0, width, height);
      const c = colour();
      points.forEach((point, index) => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        const dxPointer = point.x - pointer.x;
        const dyPointer = point.y - pointer.y;
        const distPointer = Math.hypot(dxPointer, dyPointer);
        if (distPointer < 130) {
          point.x += dxPointer / Math.max(distPointer, 1) * .16;
          point.y += dyPointer / Math.max(distPointer, 1) * .16;
        }
        context.beginPath();
        context.arc(point.x, point.y, 1.4, 0, Math.PI * 2);
        context.fillStyle = c;
        context.globalAlpha = .35;
        context.fill();
        for (let j = index + 1; j < points.length; j += 1) {
          const other = points[j];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 125) {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = c;
            context.globalAlpha = (1 - distance / 125) * .13;
            context.lineWidth = .6;
            context.stroke();
          }
        }
      });
      context.globalAlpha = 1;
      requestAnimationFrame(render);
    };
    resize();
    render();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });
  }
})();
