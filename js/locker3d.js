/* ===================================================
   js/locker3d.js — Swanand Kadam Portfolio
   3D CSS Perspective Locker: Mouse Parallax + Glare + Badge Float
   Also handles: copy email button → toast
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- 3D Locker Parallax ----------
  const wrapper = document.getElementById('locker3dWrapper');
  const scene   = document.getElementById('lockerScene');
  const glare   = document.getElementById('lockerGlare');

  if (!wrapper || !scene) return;

  // Respect reduced motion
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Lerp state
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let mouseOver = false;
  let rafId = null;

  const MAX_TILT_X = 11;   // degrees vertical tilt (rotateX)
  const MAX_TILT_Y = 9;    // degrees horizontal tilt (rotateY)
  const LERP = 0.075;      // smoothing factor (lower = smoother)

  // Calculate mouse position relative to viewport centre → −1..+1 range
  function getMouseNorm(e) {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    return {
      nx: (e.clientX - cx) / cx,  // −1 (left) … +1 (right)
      ny: (e.clientY - cy) / cy   // −1 (top)  … +1 (bottom)
    };
  }

  // Update glare overlay position (follows mouse across scene)
  function updateGlare(nx, ny) {
    if (!glare) return;
    // Convert −1…+1 to 0%…100%
    const gx = ((nx + 1) / 2 * 100).toFixed(1);
    const gy = ((ny + 1) / 2 * 100).toFixed(1);
    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 50%, transparent 70%)`;
    glare.style.opacity = '1';
  }

  // Apply 3D transform to the scene
  function applyTransform(rx, ry) {
    scene.style.transform = `perspective(900px) rotateX(${(-ry * MAX_TILT_X).toFixed(2)}deg) rotateY(${(rx * MAX_TILT_Y).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  // Animation loop
  function tick() {
    if (mouseOver) {
      currentX += (targetX - currentX) * LERP;
      currentY += (targetY - currentY) * LERP;
    } else {
      // Return to neutral
      currentX += (0 - currentX) * LERP;
      currentY += (0 - currentY) * LERP;
    }

    applyTransform(currentX, currentY);

    // Keep looping while there's visible movement
    const stillMoving = Math.abs(currentX) > 0.001 || Math.abs(currentY) > 0.001 || mouseOver;
    if (stillMoving) {
      rafId = requestAnimationFrame(tick);
    } else {
      scene.style.transform = '';
      rafId = null;
    }
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  // Mouse events on the WRAPPER (larger hit area)
  wrapper.addEventListener('mousemove', (e) => {
    const { nx, ny } = getMouseNorm(e);
    targetX = nx;
    targetY = ny;
    mouseOver = true;
    updateGlare(nx, ny);
    startLoop();
  }, { passive: true });

  wrapper.addEventListener('mouseenter', () => {
    mouseOver = true;
    if (glare) glare.style.opacity = '1';
    startLoop();
  });

  wrapper.addEventListener('mouseleave', () => {
    mouseOver = false;
    if (glare) {
      glare.style.background = '';
      glare.style.opacity = '0';
    }
    startLoop(); // let it ease back to neutral
  });

  // Touch support — single touch parallax
  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const { nx, ny } = getMouseNorm(touch);
    targetX = nx * 0.6;  // soften on mobile
    targetY = ny * 0.6;
    mouseOver = true;
    updateGlare(nx, ny);
    startLoop();
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    mouseOver = false;
    if (glare) { glare.style.opacity = '0'; }
    startLoop();
  }, { passive: true });

  // Wrapper depth shadow on hover
  wrapper.addEventListener('mouseenter', () => {
    wrapper.style.filter = 'drop-shadow(0 32px 60px rgba(0,0,0,0.75))';
  });
  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.filter = '';
  });

});
