document.addEventListener('DOMContentLoaded', () => {

  /* ---- AOS ---- */
  if (window.AOS) AOS.init({ duration: 700, once: true, offset: 60 });

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Navbar scroll state + scroll progress bar ---- */
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scanProgress');

  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('is-scrolled', y > 40);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('burger');
  const navlinks = document.getElementById('navlinks');

  if (burger) {
    burger.addEventListener('click', () => {
      const open = navbar.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
    });

    navlinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('is-open');
        burger.classList.remove('is-open');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 800) {
        navbar.classList.remove('is-open');
        burger.classList.remove('is-open');
      }
    });
  }

  /* ---- Active section highlight ---- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.navlinks__link');

  if (sections.length && navAnchors.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('is-active'));
          const active = document.querySelector(`.navlinks__link[href="#${entry.target.id}"]`);
          if (active) active.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(sec => spy.observe(sec));
  }

  /* ---- Animated stat counters ---- */
  const counters = document.querySelectorAll('.stat-card__value[data-count]');

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ---- Hero cube parallax on pointer move ---- */
  const heroScan = document.querySelector('.hero__scan');
  const cubes = document.querySelectorAll('.hero__cube');

  if (heroScan && cubes.length && window.matchMedia('(pointer: fine)').matches) {
    heroScan.addEventListener('mousemove', (e) => {
      const rect = heroScan.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      cubes.forEach((cube, i) => {
        const strength = (i + 1) * 14;
        cube.style.transform = `translate(${px * strength}px, ${py * strength}px)`;
      });
    });

    heroScan.addEventListener('mouseleave', () => {
      cubes.forEach(cube => { cube.style.transform = ''; });
    });
  }

  /* ---- GSAP ScrollTrigger: subtle hero parallax on scroll ---- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to('.hero__glow--a', {
      y: 120, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__glow--b', {
      y: -100, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('is-open');

      item.parentElement.querySelectorAll('.faq__item.is-open').forEach(open => {
        if (open !== item) {
          open.classList.remove('is-open');
          open.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---- Book form -> pre-filled WhatsApp message ---- */
  const bookForm = document.getElementById('bookForm');

  const translate = (key) => {
    const lang = document.documentElement.getAttribute('lang') || 'en';
    if (typeof I18N === 'undefined') return key;
    return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  };

  if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = bookForm.name.value.trim();
      const phone = bookForm.phone.value.trim();
      const serviceSelect = bookForm.service;
      const service = serviceSelect.options[serviceSelect.selectedIndex].text;
      const date = bookForm.date.value;
      const message = bookForm.message.value.trim();

      const lines = [
        translate('book.waGreeting'),
        `${translate('book.waName')}: ${name}`,
        `${translate('book.waPhone')}: ${phone}`,
        `${translate('book.waService')}: ${service}`
      ];
      if (date) lines.push(`${translate('book.waDate')}: ${date}`);
      if (message) lines.push(`${translate('book.waMessage')}: ${message}`);

      const text = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/37499600032?text=${text}`, '_blank', 'noopener');
    });
  }
});
