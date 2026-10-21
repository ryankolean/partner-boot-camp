// Partner Boot Camp: email-only Kit waitlist signup.
// Posts to Kit's public form endpoint. No API keys live here.
(() => {
  const KIT = 'https://app.kit.com/forms/';
  const WAITLIST_FORM = '10077301';
  const TAG_WAITLIST = '24868778';
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PETAL = 'M10 0 C 17 6, 17 16, 10 24 C 3 16, 3 6, 10 0 Z';

  const form = document.querySelector('[data-signup-form]');
  if (!form) return;

  const $ = (sel) => form.querySelector(sel);
  const panels = [...form.querySelectorAll('[data-panel]')];
  const errorBox = $('[data-signup-error]');
  const email = $('#you-email');
  const trap = $('#you-website');
  const button = $('button[type="submit"]');
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  email.addEventListener('input', () => email.removeAttribute('aria-invalid'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    const value = email.value.trim();
    if (!EMAIL.test(value)) {
      email.setAttribute('aria-invalid', 'true');
      showError('That email looks incomplete. Check it and try again.');
      email.focus();
      return;
    }

    const origin = button.getBoundingClientRect();
    if (trap.value) return celebrate(origin, null);

    setBusy(true);
    try {
      const params = new URLSearchParams();
      params.set('email_address', value);
      params.append('tags[]', TAG_WAITLIST);
      const res = await fetch(`${KIT}${WAITLIST_FORM}/subscriptions`, {
        method: 'POST',
        body: params,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Kit responded ${res.status}`);
      const data = await res.json().catch(() => ({}));
      if (data.status && !['success', 'quarantined'].includes(data.status)) throw new Error(`Kit status ${data.status}`);
      // Kit's bot guard can hold a signup until the visitor passes a quick check on kit.com.
      celebrate(origin, data.status === 'quarantined' && data.url ? data.url : null);
    } catch (err) {
      showError("Your spot isn't saved yet. Check your connection, then try again.");
    } finally {
      setBusy(false);
    }
  });

  // After signing up, pass the page along to a partner: native share sheet, or copy the link.
  form.querySelector('[data-share]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const url = location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Partner Boot Camp', text: 'Want to do this together?', url });
      } else {
        await navigator.clipboard.writeText(url);
        btn.textContent = 'Link copied';
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') btn.textContent = url;
    }
  });

  function celebrate(origin, checkUrl) {
    form.querySelector('[data-done-title]').textContent = checkUrl ? 'Almost there.' : "You're in.";
    form.querySelector('[data-done-ok]').hidden = Boolean(checkUrl);
    const checkBox = form.querySelector('[data-done-check]');
    const links = checkBox.querySelector('[data-check-links]');
    links.replaceChildren();
    if (checkUrl) {
      const a = document.createElement('a');
      a.className = 'btn';
      a.href = checkUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Finish my signup';
      links.append(a);
    }
    checkBox.hidden = !checkUrl;
    show(panels[1]);
    burst(origin);
  }

  function show(next) {
    const current = panels.find((p) => !p.hidden);
    const swap = () => {
      current.hidden = true;
      next.hidden = false;
      next.focus({ preventScroll: true });
    };
    if (!window.gsap || reduceMotion()) return swap();
    gsap.to(current, {
      autoAlpha: 0,
      y: -12,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        swap();
        gsap.set(current, { clearProps: 'all' });
        gsap.from(next.querySelectorAll(':scope > svg, :scope > h3, [data-done-ok] > *, [data-done-check]:not([hidden])'), {
          autoAlpha: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'all',
        });
      },
    });
  }

  function burst(origin) {
    if (!window.gsap || reduceMotion()) return;
    const cx = origin.left + origin.width / 2;
    const cy = origin.top + origin.height / 2;
    const colors = ['#E8C4B8', '#C96F4A', '#7A7D5C', '#B79BD0', '#FBF8F3'];
    for (let i = 0; i < 40; i++) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.setAttribute('viewBox', '0 0 20 24');
      svg.setAttribute('class', 'burst');
      svg.setAttribute('aria-hidden', 'true');
      path.setAttribute('d', PETAL);
      svg.style.fill = colors[i % colors.length];
      svg.style.left = `${cx}px`;
      svg.style.top = `${cy}px`;
      svg.appendChild(path);
      document.body.appendChild(svg);
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 240;
      gsap.timeline({ onComplete: () => svg.remove() })
        .fromTo(svg, { scale: 0.4 }, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 70,
          scale: gsap.utils.random(0.7, 1.4),
          rotation: gsap.utils.random(-360, 360),
          duration: 0.9,
          ease: 'power3.out',
        })
        .to(svg, { y: `+=${gsap.utils.random(140, 280)}`, autoAlpha: 0, duration: 1.5, ease: 'power1.in' }, 0.55);
    }
  }

  function setBusy(busy) {
    button.disabled = busy;
    button.textContent = busy ? 'Saving...' : 'Join the waitlist';
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }
})();
