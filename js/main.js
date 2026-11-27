/* ===================================================
   js/main.js — Swanand Kadam Portfolio
   Interactions, Custom Cursor, Scroll Spy & Micro-Interactions
   Lightweight, Smooth & Accessible
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Let the page show as soon as it has loaded; the 3D scene continues in the background.
  const portfolioLoader = document.getElementById('portfolioLoader');
  if (portfolioLoader) {
    let loaderDismissed = false;
    let hardWaitTimer;

    const dismissLoader = () => {
      if (loaderDismissed) return;
      loaderDismissed = true;
      clearTimeout(hardWaitTimer);
      portfolioLoader.classList.add('is-leaving');
      portfolioLoader.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('portfolio-loading');
      setTimeout(() => portfolioLoader.remove(), 380);
    };

    const finishIntro = () => setTimeout(dismissLoader, 160);
    window.addEventListener('load', finishIntro, { once: true });
    if (document.readyState === 'complete') finishIntro();

    // Keep slow fonts or other optional assets from extending the intro.
    hardWaitTimer = setTimeout(dismissLoader, 1500);
  }

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 2. Custom Magnetic Cursor Follower ----------
  const customCursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('cursorDot');

  if (customCursor && cursorDot && isFinePointer && !reduceMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        customCursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
        isVisible = true;
      }

      // Cursor dot moves instantly
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    // Smooth lerp for outer cursor ring
    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.16;
      cursorY += (mouseY - cursorY) * 0.16;
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.addEventListener('mouseleave', () => {
      customCursor.style.opacity = '0';
      cursorDot.style.opacity = '0';
      isVisible = false;
    });

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, summary'
    );

    hoverTargets.forEach((target) => {
      target.addEventListener('mouseenter', () => customCursor.classList.add('hovered'));
      target.addEventListener('mouseleave', () => customCursor.classList.remove('hovered'));
    });
  }

  // ---------- 3. Scroll Progress Bar & Navbar Scroll State ----------
  const progressBar = document.getElementById('scrollProgressBar');
  const navbar = document.getElementById('navbar');

  const handleScrollEffects = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar
    if (progressBar && docHeight > 0) {
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // Navbar scrolled class
    if (navbar) {
      if (scrollTop > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleScrollEffects, { passive: true });
  handleScrollEffects();

  // ---------- 4. Mobile Navigation Drawer ----------
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', isOpen);
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      mobileMenu.inert = !isOpen;
      document.body.style.overflow = isOpen ? 'hidden' : '';
      document.querySelector('main').inert = isOpen;
      navbar.classList.toggle('menu-open', isOpen);
    };

    navToggle.addEventListener('click', () => toggleMenu());
    window.matchMedia('(min-width: 1101px)').addEventListener('change', (event) => {
      if (event.matches && mobileMenu.classList.contains('open')) toggleMenu(false);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu(false);
        navToggle.focus();
      }
    });
  }

  // ---------- 5. Moment: the About statement lights up word by word ----------
  const statement = document.querySelector('[data-words]');
  if (statement && !reduceMotion) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    const spans = words.map((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      statement.append(span, i < words.length - 1 ? ' ' : '');
      return span;
    });
    const light = () => {
      const top = statement.getBoundingClientRect().top;
      const progress = (window.innerHeight * 0.92 - top) / (window.innerHeight * 0.42);
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      spans.forEach((span, i) => span.classList.toggle('lit', atEnd || progress * spans.length > i));
    };
    window.addEventListener('scroll', light, { passive: true });
    window.addEventListener('resize', light, { passive: true });
    light();
  }

  // ---------- VoiceKhata preview: layers follow the pointer ----------
  const depth = document.querySelector('[data-depth]');
  if (depth && isFinePointer && !reduceMotion) {
    const stage = depth.parentElement;
    stage.addEventListener('pointermove', (e) => {
      const box = stage.getBoundingClientRect();
      depth.style.setProperty('--rx', `${((e.clientY - box.top) / box.height - 0.5) * -14}deg`);
      depth.style.setProperty('--ry', `${((e.clientX - box.left) / box.width - 0.5) * 22}deg`);
    }, { passive: true });
    stage.addEventListener('pointerleave', () => {
      depth.style.removeProperty('--rx');
      depth.style.removeProperty('--ry');
    });
  }

  // ---------- 6. Active Nav Spy on Scroll ----------
  const sections = document.querySelectorAll('main > section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const updateActiveNav = () => {
    let currentId = '';
    const line = window.innerHeight * 0.35;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) currentId = section.id;
    });
    const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atEnd && sections.length) currentId = sections[sections.length - 1].id;

    navLinks.forEach((link) => {
      const on = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // Section links use native fragment navigation and the CSS scroll offset.
  const filterButtons = document.querySelectorAll('#projectFilters .filter-btn');
  const projects = document.querySelectorAll('#projects [data-category]');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((option) => {
        const selected = option === button;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      const filter = button.dataset.filter;
      projects.forEach((project) => {
        project.hidden = filter !== 'all' && project.dataset.category !== filter;
      });
    });
  });

  // ---------- 9. Moment: journey line fills as you read ----------
  const timelineTrack = document.getElementById('timelineTrack');
  const timelineMarker = document.getElementById('timelineMarker');

  if (timelineTrack && timelineMarker) {
    const updateTimelineMarker = () => {
      const rect = timelineTrack.getBoundingClientRect();
      const progress = Math.min(Math.max((window.innerHeight * 0.65 - rect.top) / rect.height, 0), 1);
      timelineTrack.style.setProperty('--progress', progress.toFixed(4));
      timelineMarker.style.top = `${progress * (rect.height - 10)}px`;
    };

    window.addEventListener('scroll', updateTimelineMarker, { passive: true });
    window.addEventListener('resize', updateTimelineMarker, { passive: true });
    updateTimelineMarker();
  }

  // ---------- 10. Copy Email to Clipboard & Toast Notification ----------
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');
  const copyEmailIcon = document.getElementById('copyEmailIcon');
  const copyEmailText = document.getElementById('copyEmailText');

  let toastTimeout;

  const showToast = (message) => {
    if (!toastNotification) return;
    if (toastMsg) toastMsg.textContent = message;
    toastNotification.classList.add('show');
    toastNotification.setAttribute('aria-hidden', 'false');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
      toastNotification.setAttribute('aria-hidden', 'true');
    }, 2800);
  };

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const emailToCopy = copyEmailBtn.getAttribute('data-email') || 'swanandkadam8061@gmail.com';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(emailToCopy);
        } else {
          // Fallback for non-https or older browsers
          const textArea = document.createElement('textarea');
          textArea.value = emailToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const copied = document.execCommand('copy');
          textArea.remove();
          if (!copied) throw new Error('copy failed');
        }

        if (copyEmailText) copyEmailText.textContent = 'Email copied';
        if (copyEmailIcon) copyEmailIcon.textContent = '✓';
        showToast(`Copied ${emailToCopy} to clipboard!`);

        setTimeout(() => {
          if (copyEmailText) copyEmailText.textContent = 'Copy email address';
          if (copyEmailIcon) copyEmailIcon.textContent = '⧉';
        }, 2500);
      } catch (err) {
        showToast(`Email: ${emailToCopy}`);
      }
    });
  }

  // ---------- 11. Battlestation Web Audio Sound Effects ----------
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  let audioCtx = null;
  let sfxEnabled = false;
  try { sfxEnabled = localStorage.getItem('swanand_sfx') === 'true'; } catch (e) {}

  const getAudioContext = () => {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    return audioCtx;
  };

  const playSynthesizedSound = (type = 'click') => {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.035);
        gain.gain.setValueAtTime(0.012, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'toggle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {}
  };

  const updateSfxBtnState = () => {
    if (!sfxToggleBtn) return;
    sfxToggleBtn.classList.toggle('active', sfxEnabled);
    sfxToggleBtn.setAttribute('aria-pressed', String(sfxEnabled));
    const label = sfxToggleBtn.querySelector('.sfx-text');
    if (label) label.textContent = sfxEnabled ? 'SFX on' : 'SFX';
  };

  if (sfxToggleBtn) {
    updateSfxBtnState();
    sfxToggleBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      try { localStorage.setItem('swanand_sfx', sfxEnabled); } catch (e) {}
      updateSfxBtnState();
      if (sfxEnabled) {
        playSynthesizedSound('toggle');
        showToast('Sound effects on');
      } else {
        showToast('Sound effects off');
      }
    });
  }

  // Attach sound triggers to interactive targets
  const interactiveElements = document.querySelectorAll('a, button, .project-card, .beyond-card');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => playSynthesizedSound('hover'), { passive: true });
    el.addEventListener('click', () => playSynthesizedSound('click'), { passive: true });
  });

  // ---------- 12. 3D Perspective Card Tilt & Spotlight Follower ----------
  const tiltCards = document.querySelectorAll('.project-card, .beyond-card, .what-card');
  if (isFinePointer && !reduceMotion) {
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -2.5;
        const rotateY = ((x - centerX) / centerX) * 2.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        card.style.setProperty('--spotlight-x', `${x}px`);
        card.style.setProperty('--spotlight-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

});
