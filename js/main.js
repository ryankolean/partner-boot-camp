// Partner Boot Camp: storybook motion. Content is fully readable without this file.
(() => {
  const root = document.documentElement;
  const LILAC = ['#C9B1DE', '#B79BD0', '#D8C6E6', '#A88CC4'];
  const LILAC_FLORET =
    'M12 11 C 9 7, 9 2, 12 2 C 15 2, 15 7, 12 11 Z M13 12 C 17 9, 22 9, 22 12 C 22 15, 17 15, 13 12 Z M12 13 C 15 17, 15 22, 12 22 C 9 22, 9 17, 12 13 Z M11 12 C 7 15, 2 15, 2 12 C 2 9, 7 9, 11 12 Z';
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  initShelf();

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js-motion');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText);

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
    const target = hash === '#top' ? document.getElementById('top') : document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    const land = () => {
      const focusEl = hash === '#join' ? document.getElementById('you-name') : target;
      if (focusEl !== document.getElementById('you-name')) focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
    };
    if (lenis) {
      lenis.scrollTo(hash === '#top' ? 0 : target, { duration: 1.4, onComplete: land });
    } else {
      target.scrollIntoView({ behavior: reduceQuery.matches ? 'auto' : 'smooth' });
      land();
    }
    history.replaceState(null, '', hash);
  });

  const timeline = document.querySelector('[data-timeline]');
  const thread = timeline && timeline.querySelector('[data-thread]');

  // The thread: one hand-drawn line that wanders through every moment of the story.
  function buildThread() {
    if (!thread) return;
    const box = timeline.getBoundingClientRect();
    const dots = [...timeline.querySelectorAll('.moment__dot')].map((dot) => {
      const r = dot.getBoundingClientRect();
      return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
    });
    if (!dots.length) return;
    const x0 = dots[0][0];
    const amp = Math.min(56, Math.max(14, box.width * 0.05));
    let prev = [x0, 0];
    let d = `M ${x0} 0`;
    dots.concat([[x0, box.height]]).forEach((p, i) => {
      const dir = i % 2 ? 1 : -1;
      const dy = (p[1] - prev[1]) / 3;
      const bend = Math.min(amp, dy) * dir;
      d += ` C ${prev[0] + bend} ${prev[1] + dy}, ${p[0] + bend} ${p[1] - dy}, ${p[0]} ${p[1]}`;
      prev = p;
    });
    thread.setAttribute('d', d);
  }

  buildThread();
  ScrollTrigger.addEventListener('refreshInit', buildThread);
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  const mm = gsap.matchMedia();

  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 900px)', tall: '(min-height: 760px)' },
    (ctx) => {
      const { motion, wide, tall } = ctx.conditions;
      if (!motion) return;

      heroIntro();
      petals(wide);
      threadAndMoments(wide);
      spread();
      philosophy();
      shelfArrival();
      promises();
      if (wide) return levelsSpread(tall);
      levelsStacked();
    }
  );

  function heroIntro() {
    const copy = document.querySelector('.opening__copy');
    const art = document.querySelector('[data-draw-hero]');
    gsap.set([copy, art], { visibility: 'visible' });
    const split = SplitText.create('[data-split]', { type: 'words,lines', mask: 'lines' });
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from(split.words, { yPercent: 115, duration: 1.1, stagger: 0.07, onComplete: () => split.revert() })
      .from('[data-rise]', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 0.55)
      .from(art.children, { drawSVG: 0, duration: 1.8, stagger: 0.09, ease: 'power2.inOut' }, 0.2)
      .from('.opening__scroll', { autoAlpha: 0, duration: 0.8 }, 1.4);

    gsap.to(art, {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: { trigger: '.opening', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  function petals(wide) {
    const host = document.querySelector('[data-petals]');
    if (!host) return;
    const count = wide ? 14 : 6;
    host.innerHTML = lilacs(count);
    const tweens = [];
    host.querySelectorAll('.petal').forEach((el, i) => {
      gsap.set(el, {
        fill: LILAC[i % LILAC.length],
        left: `${gsap.utils.random(2, 98)}%`,
        scale: gsap.utils.random(0.6, 1.35),
        rotation: gsap.utils.random(0, 360),
      });
      const fall = gsap.to(el, {
        y: () => host.offsetHeight + 80,
        duration: gsap.utils.random(10, 18),
        ease: 'none',
        repeat: -1,
      });
      fall.progress(Math.random());
      const sway = gsap.to(el, {
        x: gsap.utils.random(-70, 70),
        rotation: `+=${gsap.utils.random(90, 240)}`,
        duration: gsap.utils.random(2.5, 4.5),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      tweens.push(fall, sway);
    });
    // Keep them falling whenever any part of the hero is on screen, including scroll position 0.
    ScrollTrigger.create({
      trigger: '.opening',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
    });
    gsap.to(host, {
      yPercent: 22,
      ease: 'none',
      scrollTrigger: { trigger: '.opening', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  function threadAndMoments(wide) {
    if (!thread) return;
    gsap.fromTo(
      thread,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: timeline,
          start: 'top 68%',
          end: 'bottom 68%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      }
    );

    timeline.querySelectorAll('.moment').forEach((moment, i) => {
      const fromSide = wide && i % 2 === 0 ? 36 : -28;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: moment, start: 'top 70%', toggleActions: 'play none none reverse' },
      })
        .from(moment.querySelector('.moment__dot'), { scale: 0, duration: 0.5, ease: 'back.out(3)' })
        .from(moment.querySelectorAll('.moment__art path, .moment__art circle'), { drawSVG: 0, duration: 1.2, stagger: 0.08, ease: 'power2.inOut' }, 0)
        .from(moment.querySelector('.moment__text'), { autoAlpha: 0, x: fromSide, duration: 0.8, ease: 'power3.out' }, 0.15);
      const badge = moment.querySelectorAll('.moment__art text');
      if (badge.length) tl.from(badge, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, 0.9);
    });
  }

  function spread() {
    gsap.from('.spread', {
      y: 70,
      rotation: -1.5,
      transformOrigin: '0% 100%',
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.spread', start: 'top 88%' },
    });
    gsap.from('.spread__art path, .spread__art circle', {
      drawSVG: 0,
      stagger: 0.04,
      ease: 'none',
      scrollTrigger: { trigger: '.spread', start: 'top 75%', end: 'center 50%', scrub: 0.6 },
    });
  }

  function levelsSpread(pinWhole) {
    const section = document.querySelector('[data-levels]');
    const viewport = section.querySelector('.levels__viewport');
    const track = section.querySelector('[data-levels-track]');
    section.classList.add('is-horizontal');
    if (pinWhole) section.classList.add('is-pinned-whole');
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinWhole ? section : viewport,
        start: pinWhole ? 'top top' : 'center center',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    section.querySelectorAll('.level').forEach((level) => {
      gsap.from(level.querySelectorAll('.level__art > *'), {
        drawSVG: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: level,
          containerAnimation: slide,
          start: 'left 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => section.classList.remove('is-horizontal', 'is-pinned-whole');
  }

  function levelsStacked() {
    document.querySelectorAll('.level').forEach((level) => {
      gsap.from(level.querySelectorAll('.level__art > *'), {
        drawSVG: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: level, start: 'top 78%', toggleActions: 'play none none reverse' },
      });
    });
  }

  function philosophy() {
    const board = document.querySelector('.scoreboard');
    if (!board) return;
    gsap.timeline({
      scrollTrigger: { trigger: board, start: 'top 70%', toggleActions: 'play none none reverse' },
    })
      .from(board.querySelectorAll('svg > path:not([data-scribble]), [data-tally] path'), {
        drawSVG: 0,
        duration: 0.45,
        stagger: 0.12,
        ease: 'power1.inOut',
      })
      .from('[data-scribble]', { drawSVG: 0, duration: 1.1, ease: 'power2.inOut' }, '+=0.25')
      .from('[data-result]', { autoAlpha: 0, scale: 0.6, rotation: -8, duration: 0.8, ease: 'back.out(2)' }, '-=0.35');
  }

  function shelfArrival() {
    gsap.from('[data-book]', {
      yPercent: -130,
      rotation: () => gsap.utils.random(-14, 14),
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.07,
      ease: 'bounce.out',
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.shelf', start: 'top 75%' },
    });
  }

  function promises() {
    gsap.from('.promises span', {
      backgroundSize: '0% 0.35em',
      duration: 0.9,
      stagger: 0.25,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.promises', start: 'top 78%' },
    });
  }

  // Krysta's favorite flower: falling lilac florets, some single, some in small clusters.
  function lilacs(count) {
    const floret = (x, y, k) =>
      `<g transform="translate(${x} ${y}) scale(${k})"><path d="${LILAC_FLORET}"/><circle class="lilac__eye" cx="12" cy="12" r="1.6"/></g>`;
    const single = `<svg class="petal" viewBox="0 0 24 24">${floret(0, 0, 1)}</svg>`;
    const cluster = `<svg class="petal petal--cluster" viewBox="0 0 44 42">${floret(0, 9, 0.9)}${floret(18, 0, 1)}${floret(13, 19, 0.85)}</svg>`;
    return Array.from({ length: count }, (_, i) => (i % 3 === 0 ? cluster : single)).join('');
  }

  // Reading list: hovering, focusing, or tapping a spine shows its note.
  function initShelf() {
    const books = [...document.querySelectorAll('[data-book]')];
    const note = document.querySelector('[data-book-note]');
    if (!books.length || !note) return;
    const show = (book) => {
      books.forEach((b) => b.setAttribute('aria-pressed', String(b === book)));
      const [title, author, body] = note.children;
      title.textContent = book.dataset.title;
      author.textContent = book.dataset.author;
      body.textContent = book.dataset.note;
    };
    books.forEach((book) => {
      book.addEventListener('click', () => show(book));
      book.addEventListener('focus', () => show(book));
      book.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') show(book);
      });
    });
    show(books[0]);
  }
})();
