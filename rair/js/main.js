(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- nav: scrolled state, scroll-spy, mobile menu ---------- */
  const nav = $('#nav');
  const toggle = $('#nav-toggle');
  const links = $$('#nav-links a[href^="#"]:not(.btn)');
  const spied = links
    .map(link => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter(item => item.section);

  function updateActiveLink() {
    const mid = window.innerHeight * 0.45;
    let current = null;
    spied.forEach(item => { if (item.section.getBoundingClientRect().top <= mid) current = item; });
    spied.forEach(item => item.link.classList.toggle('is-active', item === current));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
      updateActiveLink();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- count-up stat ---------- */
  const counter = $('[data-count]');
  if (counter) {
    const target = Number(counter.dataset.count);
    const format = n => n.toLocaleString('en-US');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counter.textContent = format(target);
    } else {
      counter.textContent = '0';
      const co = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        co.disconnect();
        const start = performance.now();
        const duration = 1600;
        const tick = now => {
          const t = Math.min((now - start) / duration, 1);
          counter.textContent = format(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 });
      co.observe(counter);
    }
  }

  /* ---------- RAIR panels ---------- */
  const rairItems = $$('.rair__item');
  function activateRair(item) {
    rairItems.forEach(it => {
      const on = it === item;
      it.classList.toggle('is-active', on);
      $('.rair__head', it).setAttribute('aria-expanded', String(on));
    });
  }
  rairItems.forEach(item => {
    $('.rair__head', item).addEventListener('click', () => activateRair(item));
    if (finePointer) item.addEventListener('pointerenter', () => activateRair(item));
  });

  /* ---------- challenges checklist ---------- */
  const chalItems = $$('.chal__item');
  const chalMsg = $('#chal-msg');
  const chalMessages = [
    'Select any that apply. If so, we can help!',
    'Common, and very fixable. Let\'s talk it through.',
    'Common, and very fixable. Let\'s talk it through.',
    'That\'s a lot to carry. You don\'t have to do it alone.',
    'That\'s a lot to carry. You don\'t have to do it alone.',
    'You are not alone. Let\'s build a plan together.'
  ];
  chalItems.forEach(item => item.addEventListener('click', () => {
    item.setAttribute('aria-pressed', String(item.getAttribute('aria-pressed') !== 'true'));
    const n = chalItems.filter(i => i.getAttribute('aria-pressed') === 'true').length;
    chalMsg.textContent = chalMessages[n];
  }));

  /* ---------- newsletter form ---------- */
  const form = $('#newsletter-form');
  const msg = $('#form-msg');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const first = form.elements.first_name;
      const email = form.elements.email;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      first.classList.toggle('is-invalid', !first.value.trim());
      email.classList.toggle('is-invalid', !emailOk);

      if (!first.value.trim() || !emailOk) {
        msg.className = 'form__msg is-error';
        msg.textContent = 'Please add your first name and a valid email address.';
        return;
      }

      // TODO: connect to the newsletter provider (e.g. GoHighLevel form endpoint) here.
      msg.className = 'form__msg';
      msg.textContent = `Thank you, ${first.value.trim()}. You're on the list.`;
      form.reset();
    });
    form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
  }

  /* ---------- footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
