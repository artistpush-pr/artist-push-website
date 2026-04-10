/* ============================================
   Breakout — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Load shared policy modals if not already present ───
  if (!document.getElementById('modal-terms')) {
    fetch('policy-modals.html')
      .then(r => r.text())
      .then(html => {
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
        // Re-bind overlay click-to-close for new modals
        div.querySelectorAll('.modal-overlay').forEach(overlay => {
          overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
              overlay.classList.remove('active');
              document.body.style.overflow = '';
            }
          });
        });
      })
      .catch(() => {}); // Silently fail if file not found (index.html has inline modals)
  }

  // ─── Scroll Animations ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ─── Mobile Navigation ───
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavClose = document.querySelector('.mobile-nav-close');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => mobileNav.classList.add('active'));
    if (mobileNavClose) mobileNavClose.addEventListener('click', () => mobileNav.classList.remove('active'));
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileNav.classList.remove('active'));
    });
  }

  // ─── Navbar scroll effect ───
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.borderBottomColor = window.scrollY > 50
        ? 'rgba(0,255,133,0.1)'
        : 'var(--dark-border)';
    });
  }

  // ─── Scroll-to-Top Button ───
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── FAQ Accordion ───
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('active');
      // Close all in same parent
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
    });
  });

  // ─── Carousel ───
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const track = wrapper.querySelector('.carousel-track');
    const prevBtn = wrapper.querySelector('.carousel-prev');
    const nextBtn = wrapper.querySelector('.carousel-next');
    if (!track) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile: use native horizontal scroll (swipeable)
      wrapper.style.overflow = 'visible';
      track.style.overflowX = 'auto';
      track.style.WebkitOverflowScrolling = 'touch';
      track.style.scrollSnapType = 'x mandatory';
      track.style.transition = 'none';
      track.querySelectorAll('.service-card').forEach(card => {
        card.style.scrollSnapAlign = 'start';
      });
      // Hide nav buttons on mobile — swipe instead
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    // Desktop: transform-based carousel with buttons
    let pos = 0;
    const cards = track.querySelectorAll('.service-card');
    const cardWidth = cards[0] ? (cards[0].offsetWidth + 16) : 280; // card + gap

    function getMaxPos() {
      const visibleWidth = wrapper.offsetWidth;
      return Math.max(0, track.scrollWidth - visibleWidth);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => {
      pos = Math.min(pos + cardWidth, getMaxPos());
      track.style.transform = `translateX(-${pos}px)`;
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
      pos = Math.max(pos - cardWidth, 0);
      track.style.transform = `translateX(-${pos}px)`;
    });
  });

  // ─── Quantity Pill Selection ───
  document.querySelectorAll('.qty-pills').forEach(pillGroup => {
    pillGroup.querySelectorAll('.qty-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        pillGroup.querySelectorAll('.qty-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        updatePrice(pill.closest('.selector-card') || pill.closest('.modal'));
      });
    });
  });

  // ─── Custom Select Change ───
  document.querySelectorAll('.custom-select').forEach(select => {
    select.addEventListener('change', () => {
      updatePrice(select.closest('.selector-card') || select.closest('.modal'));
      // Update service description
      const descEl = select.parentElement ? select.parentElement.querySelector('.select-desc') : null;
      if (descEl) {
        const opt = select.options[select.selectedIndex];
        const desc = opt ? opt.getAttribute('data-desc') : '';
        descEl.classList.add('fade');
        setTimeout(() => {
          descEl.textContent = desc || '';
          descEl.classList.remove('fade');
        }, 200);
      }
    });
  });

  // ─── Dynamic Price Update ───
  function updatePrice(container) {
    if (!container) return;
    const activeQty = container.querySelector('.qty-pill.active');
    const select = container.querySelector('.custom-select');
    const priceEl = container.querySelector('.price-current');
    const oldPriceEl = container.querySelector('.price-old');

    if (!priceEl) return;

    // Get base price from active qty pill
    let basePrice = activeQty ? parseFloat(activeQty.dataset.price || 0) : 0;

    // Multiply by service type modifier if exists
    if (select && select.selectedIndex >= 0) {
      const option = select.options[select.selectedIndex];
      if (option) {
        const mod = parseFloat(option.dataset.modifier || 1);
        basePrice = basePrice * mod;
      }
    }

    if (basePrice > 0) {
      priceEl.textContent = '$' + basePrice.toFixed(2);
      if (oldPriceEl) oldPriceEl.textContent = '$' + (basePrice * 2).toFixed(2);
    }
  }

  // ─── Quantity +/- buttons ───
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.qty-input');
      if (!input) return;
      let val = parseInt(input.value) || 1;
      if (btn.dataset.action === 'minus') val = Math.max(1, val - 1);
      if (btn.dataset.action === 'plus') val = Math.min(100, val + 1);
      input.value = val;
      updatePrice(btn.closest('.selector-card') || btn.closest('.modal'));
    });
  });

  // ─── Modal System ───
  window.openModal = function(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(o => {
        o.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });

  // ─── Stat Counter Animation ───
  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statObserver.observe(el));

  function animateCounter(el) {
    const target = el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const num = parseInt(target);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      const current = Math.floor(eased * num);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ─── Testimonials Carousel (1 slide at a time) ───
  const testimonialsCarousel = document.querySelector('.testimonials-carousel');
  if (testimonialsCarousel) {
    const track = testimonialsCarousel.querySelector('.testimonials-track');
    const cards = track.querySelectorAll('.testimonial-card');
    const prevBtn = testimonialsCarousel.querySelector('.testimonials-prev');
    const nextBtn = testimonialsCarousel.querySelector('.testimonials-next');
    const dotsContainer = testimonialsCarousel.querySelector('.testimonials-dots');
    const total = cards.length;
    let current = 0;
    let autoplayTimer = null;

    function buildDots() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.classList.add('testimonials-dot');
        if (i === current) dot.classList.add('active');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      dotsContainer.querySelectorAll('.testimonials-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => goTo(current + 1), 5000);
    }

    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

    testimonialsCarousel.addEventListener('mouseenter', stopAutoplay);
    testimonialsCarousel.addEventListener('mouseleave', startAutoplay);

    // Touch/swipe
    let touchStartX = 0;
    testimonialsCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });
    testimonialsCarousel.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
      startAutoplay();
    }, { passive: true });

    buildDots();
    goTo(0);
    startAutoplay();
  }

  // ─── Smooth Scroll for anchor links (skip if anchor-nav.js handles them) ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.classList.contains('anchor-link')) return; // handled by anchor-nav.js
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
