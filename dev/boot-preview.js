/**
 * Dev convenience only. If the unpacked extension isn't loaded, this pulls the
 * same scripts into the demo page so the panel still shows up. When the
 * extension IS loaded its content script wins and this does nothing.
 */
(function () {
  const SCRIPTS = [
    '../dev/chrome-shim.js',
    '../background/service-worker.js',
    '../src/data/ramp-mock.js',
    '../src/engine/detect.js',
    '../src/engine/rules.js',
    '../src/content/panel-style.js',
    '../src/content/panel.js',
    '../src/content/content.js'
  ];

  function load(i) {
    if (i >= SCRIPTS.length) return;
    const s = document.createElement('script');
    s.src = SCRIPTS[i];
    s.onload = () => load(i + 1);
    s.onerror = () => console.warn('[Ramp Escalate preview] could not load', SCRIPTS[i]);
    document.head.appendChild(s);
  }

  // Give the real content script (document_idle) time to claim the page first.
  setTimeout(() => {
    if (window.__RAMP_ESCALATE_ACTIVE) return;
    console.log('[Ramp Escalate] extension not detected — running the preview build');
    load(0);
  }, 1200);
})();
