/* ===================================================
   js/main.js — Swanand Kadam Portfolio
   Interactions, Custom Cursor, Scroll Spy & Micro-Interactions
   Lightweight, Smooth & Accessible
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const isFinePointer = matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

  // ---------- 3. Scroll Progress Bar & Navbar Scroll State ----------
  const progressBar = document.getElementById('scrollProgressBar');
  const navbar = document.getElementById('navbar');

  const handleScrollEffects = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && docHeight > 0) {
      progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;
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
      for (const region of document.querySelectorAll('main, footer, .guide-picker')) region.inert = isOpen;
      if (isOpen) mobileMenu.querySelector('a').focus();
    };

    navToggle.addEventListener('click', () => toggleMenu());

    // Close button inside mobile menu
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', () => toggleMenu(false));

    window.matchMedia('(min-width: 1101px)').addEventListener('change', (event) => {
      if (event.matches && mobileMenu.classList.contains('open')) toggleMenu(false);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggleMenu(false);
        if (link.hash) {
          const section = document.querySelector(link.hash);
          section.tabIndex = -1;
          section.focus({preventScroll: true});
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu(false);
        navToggle.focus();
      }
    });
  }

  // ---------- 5. Viewport Scroll Reveal Observer ----------
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  // ---------- 6. Active Nav Spy on Scroll ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const updateActiveNav = () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
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

  // ---------- 9. Journey Timeline Scroll Marker Animation ----------
  const journeySection = document.getElementById('journey');
  const timelineTrack = document.getElementById('timelineTrack');
  const timelineMarker = document.getElementById('timelineMarker');

  if (journeySection && timelineTrack && timelineMarker) {
    const updateTimelineMarker = () => {
      const rect = journeySection.getBoundingClientRect();
      const trackHeight = timelineTrack.offsetHeight;
      const windowHeight = window.innerHeight;

      if (rect.top <= windowHeight * 0.6 && rect.bottom >= windowHeight * 0.4) {
        const progress = Math.min(
          Math.max((windowHeight * 0.6 - rect.top) / rect.height, 0),
          1
        );
        timelineMarker.style.top = `${progress * (trackHeight - 10)}px`;
      }
    };

    window.addEventListener('scroll', updateTimelineMarker, { passive: true });
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
    toastNotification.classList.add('visible');
    toastNotification.setAttribute('aria-hidden', 'false');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('visible');
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
          if (!copied) throw new Error('Clipboard unavailable');
        }

        if (copyEmailText) copyEmailText.textContent = 'Email Copied!';
        if (copyEmailIcon) copyEmailIcon.textContent = '✓';
        showToast(`Copied ${emailToCopy} to clipboard!`);

        setTimeout(() => {
          if (copyEmailText) copyEmailText.textContent = 'Copy Email Address';
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
  let sfxEnabled = localStorage.getItem('swanand_sfx') === 'true';

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
    if (sfxEnabled) {
      sfxToggleBtn.classList.add('active');
      sfxToggleBtn.innerHTML = 'Sound on';
      sfxToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      sfxToggleBtn.classList.remove('active');
      sfxToggleBtn.innerHTML = 'Sound off';
      sfxToggleBtn.setAttribute('aria-pressed', 'false');
    }
  };

  if (sfxToggleBtn) {
    updateSfxBtnState();
    sfxToggleBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      localStorage.setItem('swanand_sfx', sfxEnabled);
      updateSfxBtnState();
      if (sfxEnabled) {
        playSynthesizedSound('toggle');
        showToast('Battlestation Sound FX Enabled');
      } else {
        showToast('Sound FX Muted');
      }
    });
  }

  // Attach sound triggers to interactive targets
  const interactiveElements = document.querySelectorAll('a, button, .filter-btn, .project-card, .beyond-card');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => playSynthesizedSound('hover'), { passive: true });
    el.addEventListener('click', () => playSynthesizedSound('click'), { passive: true });
  });

  // ---------- 12. 3D Perspective Card Tilt & Spotlight Follower ----------
  const tiltCards = document.querySelectorAll('.project-card, .beyond-card, .what-card, .discipline-callout');
  if (isFinePointer) {
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
        card.style.setProperty('--spotlight-x', `${x}px`);
        card.style.setProperty('--spotlight-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

});
