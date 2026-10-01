/**
 * Dev-only shim. Lets the real service worker and the real content scripts run
 * on an ordinary web page, so the panel can be worked on without reloading the
 * unpacked extension. Not shipped behaviour — the extension never loads this.
 */
(function () {
  const listeners = [];
  const store = {};

  window.chrome = {
    runtime: {
      id: 'dev-preview',
      onMessage: { addListener: fn => listeners.push(fn) },
      onInstalled: { addListener: fn => setTimeout(fn, 0) },
      sendMessage(msg, cb) {
        let done = false;
        const send = r => { if (done) return; done = true; cb && cb(r); };
        for (const fn of listeners) {
          try { if (fn(msg, { tab: { id: 1 } }, send)) { /* async */ } } catch (e) { console.error(e); }
        }
      },
      getURL: p => p
    },
    storage: {
      local: {
        get(key) {
          const k = typeof key === 'string' ? [key] : Object.keys(key || store);
          const out = {};
          k.forEach(n => { if (n in store) out[n] = store[n]; });
          return Promise.resolve(out);
        },
        set(obj) { Object.assign(store, obj); return Promise.resolve(); }
      }
    },
    action: {
      setBadgeText: () => Promise.resolve(),
      setBadgeBackgroundColor: () => Promise.resolve(),
      setBadgeTextColor: () => Promise.resolve()
    },
    tabs: {
      onRemoved: { addListener() {} },
      query: () => Promise.resolve([{ id: 1, url: location.href }]),
      create: ({ url }) => window.open(url, '_blank'),
      sendMessage(_id, msg, cb) { window.chrome.runtime.sendMessage(msg, cb); }
    }
  };
})();
