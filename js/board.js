/* ===================================================
   js/board.js — movement on the board
   Opening sections, paper settling into place, and a
   little parallax on the handwritten notes.
   Everything is readable without this file.
   =================================================== */

(() => {
  'use strict';

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let arrivingTimer;

  // Flash the destination so it is clear where a jump landed
  function arrive(target) {
    const section = target.closest('section') || target;
    document.querySelectorAll('.arriving').forEach((el) => el.classList.remove('arriving'));
    document.querySelectorAll('.spotlit').forEach((el) => el.classList.remove('spotlit'));
    void section.offsetWidth;                     // restart the animation
    section.classList.add('arriving');
    if (target !== section) target.classList.add('spotlit');
    clearTimeout(arrivingTimer);
    arrivingTimer = setTimeout(() => {
      section.classList.remove('arriving');
      target.classList.remove('spotlit');
    }, 2600);
  }

  function open(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: target.matches('section') ? 'start' : 'center' });
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    try { history.replaceState(null, '', `#${id}`); } catch (e) { /* file:// in some browsers */ }
    arrive(target);
  }

  // Taps on objects inside the 3D locker
  document.addEventListener('portfolio:open', (event) => open(event.detail.id));

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hash.length < 2 || link.classList.contains('skip-link')) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target || target.id === 'hero') return;
    if (link.dataset.open) {
      event.preventDefault();
      open(link.dataset.open);
    } else {
      arrive(target);
    }
  });

  if (calm) return;

  // Paper drops into place as it scrolls into view. Only things still below the
  // screen are prepared, so nothing already visible ever blinks out.
  if ('IntersectionObserver' in window) {
    const drop = new IntersectionObserver((entries) => {
      let order = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        entry.target.style.setProperty('--drop-delay', `${Math.min(order++, 4) * 70}ms`);
        entry.target.classList.add('dropped');
        drop.unobserve(entry.target);
        entry.target.addEventListener('animationend', function done(e) {
          if (e.target !== entry.target || e.animationName !== 'paper-drop') return;
          entry.target.classList.remove('will-drop', 'dropped');
          entry.target.removeEventListener('animationend', done);
        });
      });
    }, { rootMargin: '0px 0px -6% 0px' });

    document.querySelectorAll('[data-drop]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('will-drop');
      drop.observe(el);
    });
  }

  // Parallax: the pencil notes drift a few pixels against the page
  const floaters = [...document.querySelectorAll('[data-float]')];
  let queued = false;
  const drift = () => {
    queued = false;
    const middle = window.innerHeight / 2;
    floaters.forEach((el) => {
      const top = el.parentElement.getBoundingClientRect().top;
      const offset = Math.max(-14, Math.min(14, (top - middle) * 0.045));
      el.style.setProperty('--par', `${offset.toFixed(1)}px`);
    });
  };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(drift); }
  }, { passive: true });
  drift();
})();
