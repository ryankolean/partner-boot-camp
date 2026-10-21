// Partner Boot Camp: two-step Kit signup with an optional partner invite.
// Posts to Kit's public form endpoints. No API keys live here.
(() => {
  const KIT = 'https://app.kit.com/forms/';
  const WAITLIST_FORM = '10077301';
  const PARTNER_FORM = '10077317';
  const TAG_WAITLIST = '24868778';
  const TAG_INVITED = '24868779';
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PETAL = 'M10 0 C 17 6, 17 16, 10 24 C 3 16, 3 6, 10 0 Z';

  const form = document.querySelector('[data-signup-form]');
  if (!form) return;

  const $ = (sel) => form.querySelector(sel);
  const panels = [...form.querySelectorAll('[data-panel]')];
  const errorBox = $('[data-signup-error]');
  const you = { name: $('#you-name'), email: $('#you-email') };
  const partner = { name: $('#partner-name'), email: $('#partner-email'), note: $('#partner-note') };
  const trap = $('#you-website');
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let step = 1;
  let waitlistSent = false;
  let finished = false;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (step === 1) return toStepTwo();
    const button = e.submitter || $('[data-action="invite"]');
    finish(button.dataset.action === 'invite', button);
  });

  [you.name, partner.name, partner.note].forEach((el) => el.addEventListener('input', updatePreview));
  [you.name, you.email, partner.name, partner.email].forEach((el) =>
    el.addEventListener('input', () => el.removeAttribute('aria-invalid'))
  );

  form.querySelectorAll('[data-nudge]').forEach((btn) =>
    btn.addEventListener('click', () => {
      partner.note.value = btn.dataset.nudge;
      updatePreview();
      partner.note.focus();
    })
  );

  // If someone leaves during step two, still save their spot.
  window.addEventListener('pagehide', () => {
    if (step === 2 && !waitlistSent && !finished && !trap.value && navigator.sendBeacon) {
      navigator.sendBeacon(`${KIT}${WAITLIST_FORM}/subscriptions`, waitlistPayload(false));
    }
  });

  function toStepTwo() {
    hideError();
    if (!check(you.name, you.name.value.trim().length > 0, 'Add your first name so we know what to call you.')) return;
    if (!check(you.email, EMAIL.test(you.email.value.trim()), 'That email looks incomplete. Check it and try again.')) return;
    step = 2;
    updatePreview();
    show(2, partner.name);
  }

  async function finish(withPartner, button) {
    hideError();
    if (withPartner) {
      const ownEmail = you.email.value.trim().toLowerCase();
      const theirEmail = partner.email.value.trim().toLowerCase();
      if (!check(partner.name, partner.name.value.trim().length > 0, "Add your partner's first name so the invite feels personal.")) return;
      if (!check(partner.email, EMAIL.test(theirEmail), "Your partner's email looks incomplete. Check it and try again.")) return;
      if (!check(partner.email, theirEmail !== ownEmail, "That's your email. Add your partner's own address so the invite reaches them.")) return;
    }

    const origin = button.getBoundingClientRect();
    if (trap.value) return celebrate(withPartner, origin);

    setBusy(true, button);
    try {
      if (!waitlistSent) {
        await send(WAITLIST_FORM, waitlistPayload(withPartner));
        waitlistSent = true;
      }
      if (withPartner) await send(PARTNER_FORM, partnerPayload());
      finished = true;
      celebrate(withPartner, origin);
    } catch (err) {
      showError(
        withPartner && waitlistSent
          ? "Your spot is saved, but the invite didn't go out. Check your connection, then press Send the invite again."
          : "Your spot isn't saved yet. Check your connection, then try again."
      );
    } finally {
      setBusy(false, button);
    }
  }

  function waitlistPayload(withPartner) {
    const p = new URLSearchParams();
    p.set('email_address', you.email.value.trim());
    p.set('fields[first_name]', you.name.value.trim());
    p.append('tags[]', TAG_WAITLIST);
    if (withPartner) {
      p.set('fields[partner_name]', partner.name.value.trim());
      p.set('fields[partner_email]', partner.email.value.trim());
      const note = partner.note.value.trim();
      if (note) p.set('fields[partner_note]', note);
    }
    return p;
  }

  // On the partner's record, the partner_* fields describe the person who invited them.
  function partnerPayload() {
    const p = new URLSearchParams();
    p.set('email_address', partner.email.value.trim());
    p.set('fields[first_name]', partner.name.value.trim());
    p.set('fields[partner_name]', you.name.value.trim());
    p.set('fields[partner_email]', you.email.value.trim());
    const note = partner.note.value.trim();
    if (note) p.set('fields[partner_note]', note);
    p.append('tags[]', TAG_INVITED);
    return p;
  }

  async function send(formId, params) {
    const res = await fetch(`${KIT}${formId}/subscriptions`, {
      method: 'POST',
      body: params,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Kit responded ${res.status}`);
    const data = await res.json().catch(() => ({}));
    if (data.status && data.status !== 'success') throw new Error(`Kit status ${data.status}`);
    return data;
  }

  function updatePreview() {
    form.querySelector('[data-preview="partner"]').textContent = partner.name.value.trim() || 'there';
    form.querySelector('[data-preview="you"]').textContent = you.name.value.trim() || 'Your partner';
    const note = partner.note.value.trim();
    form.querySelector('[data-preview="note"]').textContent = note;
    form.querySelector('[data-preview-note]').hidden = !note;
  }

  function celebrate(withPartner, origin) {
    step = 3;
    form.querySelector('[data-done-name]').textContent = you.name.value.trim() || 'friend';
    form.querySelector('[data-done-partner]').textContent = partner.name.value.trim() || 'your partner';
    form.querySelector('[data-done-solo]').hidden = withPartner;
    form.querySelector('[data-done-invite]').hidden = !withPartner;
    show(3, panels[2]);
    burst(origin);
  }

  function show(n, focusEl) {
    const current = panels.find((p) => !p.hidden);
    const next = panels[n - 1];
    const swap = () => {
      current.hidden = true;
      next.hidden = false;
      if (focusEl) focusEl.focus({ preventScroll: true });
    };
    if (!window.gsap || reduceMotion()) return swap();
    gsap.to(current, {
      autoAlpha: 0,
      x: -28,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        swap();
        gsap.set(current, { clearProps: 'all' });
        const parts = next.querySelectorAll(':scope > h3, :scope > p, :scope > svg, .field, .invite-preview, .signup__actions');
        gsap.from(parts, { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.06, ease: 'power3.out', clearProps: 'all' });
      },
    });
  }

  function burst(origin) {
    if (!window.gsap || reduceMotion()) return;
    const cx = origin.left + origin.width / 2;
    const cy = origin.top + origin.height / 2;
    const colors = ['#E8C4B8', '#C96F4A', '#7A7D5C', '#E8C4B8', '#FBF8F3'];
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

  function check(input, ok, message) {
    if (ok) return true;
    input.setAttribute('aria-invalid', 'true');
    showError(message);
    input.focus();
    return false;
  }

  function setBusy(busy, button) {
    form.querySelectorAll('button[type="submit"]').forEach((b) => (b.disabled = busy));
    if (busy) {
      button.dataset.label = button.textContent;
      button.textContent = 'Sending...';
    } else if (button.dataset.label) {
      button.textContent = button.dataset.label;
    }
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
