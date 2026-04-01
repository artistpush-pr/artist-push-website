/* ── Anchor Navigation – smooth scroll + active highlight ── */
(function () {
  const nav = document.getElementById('anchorNav');
  if (!nav) return;

  const links = nav.querySelectorAll('.anchor-link');
  const sections = [];

  // Collect target sections
  links.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ id, el, link });
  });

  // Smooth scroll on click
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      // Calculate offset: navbar + promo bar + anchor nav height
      const navbarH = document.querySelector('.navbar')?.offsetHeight || 72;
      const promoBar = document.querySelector('.promo-bar');
      const promoH = (promoBar && !promoBar.classList.contains('hidden')) ? promoBar.offsetHeight : 0;
      const anchorH = nav.offsetHeight || 44;
      const offset = navbarH + promoH + anchorH + 12;

      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });

      // Update active state immediately
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Scroll the anchor nav to show the active link
      link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  // Highlight active section on scroll
  let ticking = false;
  function updateActive() {
    const navbarH = document.querySelector('.navbar')?.offsetHeight || 72;
    const promoBar = document.querySelector('.promo-bar');
    const promoH = (promoBar && !promoBar.classList.contains('hidden')) ? promoBar.offsetHeight : 0;
    const anchorH = nav.offsetHeight || 44;
    const offset = navbarH + promoH + anchorH + 40;

    let current = sections[0]?.id;
    for (const s of sections) {
      const rect = s.el.getBoundingClientRect();
      if (rect.top <= offset) current = s.id;
    }

    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });

    // Auto-scroll anchor nav to keep active link visible
    const activeLink = nav.querySelector('.anchor-link.active');
    if (activeLink) {
      activeLink.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateActive);
      ticking = true;
    }
  }, { passive: true });

  // Initial highlight
  updateActive();

  // Add smooth scroll behavior to html
  document.documentElement.style.scrollBehavior = 'smooth';

  // Offset scroll targets so they don't hide behind sticky headers
  // Using scroll-margin-top on all sections with IDs
  sections.forEach(s => {
    s.el.style.scrollMarginTop = '180px';
  });
})();
