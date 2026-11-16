(() => {
  'use strict';
  const app = document.getElementById('app');
  if (!app) return;

  const preference = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  const active = new Set();
  let previousPage;

  function animate(element, frames, options) {
    if (!element || preference.matches || typeof element.animate !== 'function') return;
    try {
      const animation = element.animate(frames, options);
      active.add(animation);
      const remove = () => active.delete(animation);
      animation.addEventListener?.('finish', remove, { once: true });
      animation.addEventListener?.('cancel', remove, { once: true });
    } catch (_) {
      // Missing animation support must never interrupt a workspace action.
    }
  }

  function cancel() {
    for (const animation of active) animation.cancel();
    active.clear();
  }

  function enter() {
    const pageId = document.documentElement.dataset.currentPage;
    if (!pageId || pageId === previousPage) return;
    previousPage = pageId;
    cancel();
    if (preference.matches) return;
    animate(app.querySelector('.document'), [
      { opacity: 0, transform: 'translateY(7px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 210, easing: 'cubic-bezier(.2,.7,.25,1)' });
    animate(app.querySelector('.cover img'), [
      { opacity: .7 }, { opacity: 1 }
    ], { duration: 210, easing: 'ease-out' });
  }

  // Only a shell replacement can trigger this observer; block typing and
  // database redraws do not replay a page entrance or disturb the selection.
  const observer = new MutationObserver(enter);
  observer.observe(app, { childList: true });
  preference.addEventListener?.('change', () => {
    if (preference.matches) cancel();
  });
  window.addEventListener('pagehide', event => {
    cancel();
    if (!event.persisted) observer.disconnect();
  });

  window.WorkspaceMotion = Object.freeze({
    enter,
    transition(callback) {
      if (typeof callback !== 'function') throw new TypeError('Expected a transition callback');
      const result = callback();
      enter();
      return result;
    }
  });
  enter();
})();
