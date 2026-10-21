// Welcome page: draw the rings and let a few petals fall.
(() => {
  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(DrawSVGPlugin);

  gsap.from('[data-draw] > *', { drawSVG: 0, duration: 1.6, stagger: 0.15, ease: 'power2.inOut' });
  gsap.from('.welcome h1, .welcome p, .welcome .btn', { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.12, delay: 0.5, ease: 'power3.out' });

  // Falling lilac florets, Krysta's favorite flower.
  const LILAC = ['#C9B1DE', '#B79BD0', '#D8C6E6', '#A88CC4'];
  const FLORET = 'M12 11 C 9 7, 9 2, 12 2 C 15 2, 15 7, 12 11 Z M13 12 C 17 9, 22 9, 22 12 C 22 15, 17 15, 13 12 Z M12 13 C 15 17, 15 22, 12 22 C 9 22, 9 17, 12 13 Z M11 12 C 7 15, 2 15, 2 12 C 2 9, 7 9, 11 12 Z';
  const floret = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="${FLORET}"/><circle class="lilac__eye" cx="12" cy="12" r="1.6"/></g>`;
  const single = `<svg class="petal" viewBox="0 0 24 24">${floret(0, 0, 1)}</svg>`;
  const cluster = `<svg class="petal petal--cluster" viewBox="0 0 44 42">${floret(0, 9, 0.9)}${floret(18, 0, 1)}${floret(13, 19, 0.85)}</svg>`;
  const host = document.querySelector('[data-petals]');
  host.innerHTML = Array.from({ length: 12 }, (_, i) => (i % 3 === 0 ? cluster : single)).join('');
  host.querySelectorAll('.petal').forEach((el, i) => {
    gsap.set(el, { fill: LILAC[i % LILAC.length], left: `${gsap.utils.random(2, 98)}%`, scale: gsap.utils.random(0.6, 1.3), rotation: gsap.utils.random(0, 360) });
    gsap.to(el, { y: () => host.offsetHeight + 80, duration: gsap.utils.random(9, 16), ease: 'none', repeat: -1 }).progress(Math.random());
    gsap.to(el, { x: gsap.utils.random(-60, 60), rotation: `+=${gsap.utils.random(90, 220)}`, duration: gsap.utils.random(2.5, 4.5), ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
})();
