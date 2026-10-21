(() => {
  'use strict';

  const doc = document;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => [...scope.querySelectorAll(selector)];

  /* ---------------------------------------------------------
     Header background / shadow on scroll (avoids layout shift)
     --------------------------------------------------------- */
  const header = $('.site-header');
  if (header) {
    let queued = false;
    const syncHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      queued = false;
    };
    syncHeader();
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(syncHeader);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Mobile navigation: toggle, Escape, click-outside, resize
     --------------------------------------------------------- */
  const toggle = $('.menu-toggle');
  const nav = $('#primary-nav');
  if (toggle && nav) {
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      doc.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setOpen(!isOpen()));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
    doc.addEventListener('click', (event) => {
      if (!isOpen()) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && isOpen()) setOpen(false);
    });
  }

  /* ---------------------------------------------------------
     Scroll reveals (IntersectionObserver + staggered children)
     --------------------------------------------------------- */
  const revealTargets = $$('[data-reveal]');
  if (revealTargets.length) {
    $$('[data-stagger]').forEach((group) => {
      const step = Number(group.dataset.stagger) || 70;
      [...group.children]
        .filter((child) => child.hasAttribute('data-reveal'))
        .forEach((child, index) => {
          if (index > 0) child.style.setProperty('--reveal-delay', `${Math.min(index * step, 640)}ms`);
        });
    });

    const reveal = (element) => element.classList.add('is-visible');
    if ('IntersectionObserver' in window && !reduceMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      revealTargets.forEach((element) => observer.observe(element));
    } else {
      revealTargets.forEach(reveal);
    }
  }

  /* ---------------------------------------------------------
     Gentle parallax for hero imagery (transform only)
     --------------------------------------------------------- */
  const parallaxTargets = $$('[data-parallax]');
  if (parallaxTargets.length && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let frame = null;
    const render = () => {
      const viewport = window.innerHeight;
      parallaxTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < -240 || rect.top > viewport + 240) return;
        const speed = Number(element.dataset.parallax) || 0.12;
        const offset = (rect.top + rect.height / 2 - viewport / 2) * -speed;
        element.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.08)`;
      });
      frame = null;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(render);
    };
    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ---------------------------------------------------------
     Contact page: prefill project enquiries + show handler result
     --------------------------------------------------------- */
  const formPanel = $('.form-panel');
  if (formPanel) {
    const params = new URLSearchParams(window.location.search);
    const sent = params.get('sent') === '1';
    const error = params.get('error') === '1';
    if (sent) {
      formPanel.innerHTML = '<div class="form-success"><span class="success-mark">✓</span><h2>Thank you for reaching out.</h2><p>Your enquiry has been submitted to our email system. If you do not hear back, please contact us directly by phone or email.</p><a class="text-link" href="properties.html">Continue exploring <span aria-hidden="true">→</span></a></div>';
    } else {
      if (error) {
        const message = document.createElement('p');
        message.className = 'form-error';
        message.setAttribute('role', 'alert');
        message.textContent = 'We couldn’t submit that enquiry. Please check your details and try again, or contact us directly.';
        const form = formPanel.querySelector('form');
        if (form) form.before(message);
      }
      const project = params.get('project');
      const textarea = formPanel.querySelector('#message');
      const interest = formPanel.querySelector('#interest');
      if (project && textarea) {
        const cleanProject = project.trim().slice(0, 120);
        textarea.value = `I would like to know more about ${cleanProject}. `;
        if (interest) {
          const option = [...interest.options].find(item => item.value.toLowerCase() === cleanProject.toLowerCase());
          if (option) interest.value = option.value;
          else if (/ace hive/i.test(cleanProject)) interest.value = 'ACE Hive — Business Suites';
          else if (/ace edit/i.test(cleanProject)) interest.value = 'ACE EDIT';
          else if (/cyberthum/i.test(cleanProject)) interest.value = 'Cyberthum';
        }
      }
    }
  }

  /* ---------------------------------------------------------
     Enquiry form: visible pending state without touching the
     backend contract (action, method, field names all unchanged)
     --------------------------------------------------------- */
  const enquiryForm = $('.enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', () => {
      if (!enquiryForm.checkValidity()) return;
      const button = enquiryForm.querySelector('button[type="submit"]');
      if (!button) return;
      button.classList.add('is-pending');
      button.setAttribute('aria-busy', 'true');
      const label = button.querySelector('.btn-label');
      if (label) label.textContent = 'Sending…';
    });
  }

  /* ---------------------------------------------------------
     Property listing: search + category filter
     --------------------------------------------------------- */
  const search = $('#property-search');
  const type = $('#property-type');
  const cards = [...$$('#property-grid .property-card')];
  if (search && type && cards.length) {
    const count = $('#result-count');
    const empty = $('#empty-state');
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      const category = type.value;
      let visible = 0;
      cards.forEach((card) => {
        const matches = card.dataset.name.includes(query) && (category === 'all' || card.dataset.category === category);
        card.hidden = !matches;
        if (matches) visible++;
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? 'project opportunity' : 'project opportunities'}`;
      if (empty) empty.hidden = visible !== 0;
    };
    search.addEventListener('input', filter);
    type.addEventListener('change', filter);
  }
})();
