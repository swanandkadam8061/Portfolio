// Keep the same guide destinations within reach after visitors leave the hero.
const guideMenu = document.querySelector('.portrait-guides');
const picker = document.querySelector('.guide-picker');
const shortcuts = guideMenu.cloneNode(true);
picker.append(shortcuts);
const toggle = picker.querySelector('summary');

new IntersectionObserver(([entry]) => {
  picker.hidden = entry.isIntersecting || entry.boundingClientRect.top > 0;
  if (picker.hidden) picker.open = false;
}).observe(guideMenu);

shortcuts.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  picker.open = false;
  const section = document.querySelector(link.hash);
  section.tabIndex = -1;
  section.focus({ preventScroll: true });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && picker.open) {
    picker.open = false;
    toggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (picker.open && !picker.contains(event.target)) picker.open = false;
});

// On small screens, step out of the way while reading downwards.
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (Math.abs(y - lastY) < 6) return;
  const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
  picker.classList.toggle('tucked', y > lastY && !atEnd && !picker.open);
  lastY = y;
}, { passive: true });
