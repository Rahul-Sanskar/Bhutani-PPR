(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); document.body.classList.remove('menu-open');
    }));
  }
  // Static contact page: prefill project enquiries and show the PHP handler result.
  const formPanel = document.querySelector('.form-panel');
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
  const search = document.querySelector('#property-search');
  const type = document.querySelector('#property-type');
  const cards = [...document.querySelectorAll('#property-grid .property-card')];
  if (search && type && cards.length) {
    const count = document.querySelector('#result-count'); const empty = document.querySelector('#empty-state');
    const filter = () => {
      const q = search.value.trim().toLowerCase(); const category = type.value;
      let visible = 0;
      cards.forEach(card => { const matches = card.dataset.name.includes(q) && (category === 'all' || card.dataset.category === category); card.hidden = !matches; if(matches) visible++; });
      if (count) count.textContent = `${visible} ${visible === 1 ? 'project opportunity' : 'project opportunities'}`;
      if (empty) empty.hidden = visible !== 0;
    };
    search.addEventListener('input', filter); type.addEventListener('change', filter);
  }
  const reveal = document.querySelectorAll('.property-card, .value-grid article, .service-row, .process-grid > div');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), {threshold: .08});
    reveal.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  }
})();
