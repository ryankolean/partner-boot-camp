// Partner Boot Camp: capsule page motion. Content is fully readable without this file.
(() => {
  const root = document.documentElement;
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js-motion');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

  // Bloom starts where the pointer enters the button.
  document.addEventListener('pointerover', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--x', `${e.clientX - r.left}px`);
    btn.style.setProperty('--y', `${e.clientY - r.top}px`);
  });

  // Smooth scroll, driven by the GSAP ticker so there is one animation loop.
  let lenis = null;
  if (!reduceQuery.matches && window.Lenis) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // In-page links: scroll there, then move focus so keyboard users land in the right place.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    const land = () => {
      const email = document.getElementById('you-email');
      const focusEl = hash === '#join' && email ? email : target;
      if (focusEl !== email) focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
    };
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4, onComplete: land });
    } else {
      target.scrollIntoView({ behavior: reduceQuery.matches ? 'auto' : 'smooth' });
      land();
    }
    history.replaceState(null, '', hash);
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  const mm = gsap.matchMedia();

  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 640px)', tall: '(min-height: 720px)' },
    (ctx) => {
      const { motion, wide, tall } = ctx.conditions;
      if (!motion) return;
      heroArt();
      loop(wide, tall);
      findings();
      swaps();
    }
  );

  function heroArt() {
    const art = document.querySelector('.capsule-hero__art');
    if (!art) return;
    gsap.set(art, { visibility: 'visible' });
    gsap.timeline()
      .from(art.querySelectorAll('path'), { drawSVG: 0, duration: 1.4, stagger: 0.09, ease: 'power2.inOut' })
      .from(art.querySelectorAll('text'), { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, '-=0.5');
  }

  // The signature moment: the loop draws itself one step at a time as the reader scrolls, then the ways out.
  function loop(wide, tall) {
    const art = document.querySelector(`[data-loop="${wide ? 'wide' : 'tall'}"]`);
    if (!art) return;
    // A refresh resets scrubbed timelines and only re-renders the first step. Visiting the end and
    // coming back puts every step in its correct state for the current scroll.
    const onRefresh = (self) => {
      const tl = self.animation;
      const t = tl.time();
      tl.time(tl.duration(), true).time(t, true);
    };
    const tl = gsap.timeline({
      defaults: { immediateRender: true },
      scrollTrigger:
        wide && tall
          ? { trigger: '.loop', start: 'center center', end: '+=160%', pin: true, scrub: 0.6, anticipatePin: 1, onRefresh }
          : { trigger: art, start: 'top 72%', end: 'bottom 85%', scrub: 0.6, onRefresh },
    });
    art.querySelectorAll('[data-step]').forEach((step) => {
      if (step.hasAttribute('data-pause')) tl.to({}, { duration: 0.8 });
      const lines = step.querySelectorAll('path:not(.loop__tint)');
      const words = step.querySelectorAll('text, .loop__tint');
      // Staggered so an arrowhead, its own path, lands as its line arrives.
      tl.fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, stagger: 0.5, ease: 'power1.inOut' });
      if (words.length) tl.fromTo(words, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' }, '-=0.25');
    });
    tl.to({}, { duration: 0.6 });
  }

  function findings() {
    const list = document.querySelector('.findings');
    if (!list) return;
    gsap.from(list.querySelectorAll('h3 span'), {
      backgroundSize: '0% 0.35em',
      duration: 0.9,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: { trigger: list, start: 'top 78%' },
    });
  }

  function swaps() {
    document.querySelectorAll('.swap').forEach((swap) => {
      gsap.from(swap.querySelector('.swap__old span'), {
        backgroundSize: '0% 2px',
        duration: 0.7,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: swap, start: 'top 82%' },
      });
    });
  }
})();
