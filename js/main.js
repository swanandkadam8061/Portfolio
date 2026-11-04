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
  const guideLinks = document.querySelectorAll('.guide-link');
  if (isFinePointer) {
    guideLinks.forEach((link) => {
      const avatar = link.querySelector('.guide-avatar');
      if (!avatar) return;

      link.addEventListener('pointermove', (event) => {
        const bounds = link.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        avatar.style.transform = `translateZ(9px) rotateX(${-y * 18}deg) rotateY(${x * 22}deg)`;
      }, { passive: true });

      link.addEventListener('pointerleave', () => {
        avatar.style.transform = '';
      }, { passive: true });
    });
  }

  // ---------- 1. Interactive Ambient Glow Follower ----------
  const ambientGlow = document.getElementById('ambientGlow');

  if (ambientGlow && isFinePointer) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    const animateGlow = () => {
      currentX += (mouseX - currentX) * 0.07;
      currentY += (mouseY - currentY) * 0.07;

      ambientGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateGlow);
    };

    animateGlow();
  }

  // ---------- 2. Custom Magnetic Cursor Follower ----------
  const customCursor = document.getElementById('customCursor');
  const cursorDot = document.getElementById('cursorDot');

  if (customCursor && cursorDot && isFinePointer) {
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
      'a, button, .project-card, .what-card, .beyond-card, .skill-tag, .float-card, .filter-btn'
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
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => toggleMenu());

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu(false);
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
        threshold: 0.12,
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

  // ---------- 7. Smooth Anchor Link Scrolling with Offset ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // ---------- 8. Interactive Project Filters ----------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('#projectsGrid .project-card');

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

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
          document.execCommand('copy');
          textArea.remove();
        }

        if (copyEmailText) copyEmailText.textContent = 'Email Copied!';
        if (copyEmailIcon) copyEmailIcon.textContent = '✓';
        showToast(`Copied ${emailToCopy} to clipboard!`);

        setTimeout(() => {
          if (copyEmailText) copyEmailText.textContent = 'Copy Email Address';
          if (copyEmailIcon) copyEmailIcon.textContent = '📋';
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
      sfxToggleBtn.innerHTML = '<span class="sfx-icon">🔊</span> <span class="sfx-text">SFX ON</span>';
      sfxToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      sfxToggleBtn.classList.remove('active');
      sfxToggleBtn.innerHTML = '<span class="sfx-icon">🔇</span> <span class="sfx-text">SFX</span>';
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
  const tiltCards = document.querySelectorAll('.project-card, .beyond-card, .what-card, .about-attributes-card, .discipline-callout');
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

  // ---------- 13. Developer Attributes Matrix Animate on Viewport ----------
  const attrCard = document.querySelector('.about-attributes-card');
  const attrFills = document.querySelectorAll('.attr-bar-fill');
  if (attrCard && attrFills.length && 'IntersectionObserver' in window) {
    const attrObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            attrFills.forEach((fill) => {
              const targetWidth = fill.style.width;
              fill.style.width = '0%';
              setTimeout(() => {
                fill.style.width = targetWidth;
              }, 120);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    attrObserver.observe(attrCard);
  }
});
