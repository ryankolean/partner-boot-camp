// Runs before first paint: hide the hero copy only when the intro animation will reveal it.
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  document.documentElement.classList.add('js-motion');
}
