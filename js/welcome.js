// Welcome page: draw the rings and let a few petals fall.
(() => {
  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(DrawSVGPlugin);

  gsap.from('[data-draw] > *', { drawSVG: 0, duration: 1.6, stagger: 0.15, ease: 'power2.inOut' });
  gsap.from('.welcome h1, .welcome p, .welcome .btn', { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.12, delay: 0.5, ease: 'power3.out' });

  const host = document.querySelector('[data-petals]');
  host.innerHTML = '<svg class="petal" viewBox="0 0 20 24"><path d="M10 0 C 17 6, 17 16, 10 24 C 3 16, 3 6, 10 0 Z"/></svg>'.repeat(12);
  host.querySelectorAll('.petal').forEach((el) => {
    gsap.set(el, { left: `${gsap.utils.random(2, 98)}%`, scale: gsap.utils.random(0.6, 1.3), rotation: gsap.utils.random(0, 360) });
    gsap.to(el, { y: () => host.offsetHeight + 80, duration: gsap.utils.random(9, 16), ease: 'none', repeat: -1 }).progress(Math.random());
    gsap.to(el, { x: gsap.utils.random(-60, 60), rotation: `+=${gsap.utils.random(90, 220)}`, duration: gsap.utils.random(2.5, 4.5), ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
})();
