/** Orchestrator: watch the page, analyze, mount/refresh the panel. */
(function () {
  if (window.__RAMP_ESCALATE_ACTIVE) return;
  window.__RAMP_ESCALATE_ACTIVE = true;

  const SKIP_HOSTS = [/^chrome\./, /^localhost:0$/];
  if (SKIP_HOSTS.some(r => r.test(location.hostname))) return;

  let panel = null;
  let lastKey = null;

  const api = {
    /** Every button in the panel routes through here to the "Ramp API". */
    run(action, ctx) {
      // Script/memo generation is local; card + approval go through the worker
      // so the issuance log and badge survive navigation.
      if (action.type === 'negotiation_script') {
        return Promise.resolve({
          title: 'Negotiation script',
          detail: `Built from ${window.__RAMP_DATA.spendWith(action.vendor).count} invoices and Ramp network benchmarks.`,
          text: window.__RAMP_RULES.negotiationScript(action.vendor),
          toast: 'Script ready'
        });
      }
      if (action.type === 'consolidate') {
        return Promise.resolve({
          title: 'Consolidation memo',
          text: window.__RAMP_RULES.consolidationMemo(ctx),
          toast: 'Memo drafted'
        });
      }
      if (action.type === 'copy') {
        return navigator.clipboard.writeText(action.text).then(
          () => ({ title: 'Copied', fields: { Value: action.text }, toast: 'Copied ' + action.text }),
          () => ({ title: 'Copy it manually', fields: { Value: action.text }, toast: action.text })
        );
      }
      return new Promise(resolve => {
        chrome.runtime.sendMessage(
          { kind: 'ramp:action', action, ctx: slim(ctx) },
          r => resolve(r || { title: 'No response from Ramp', toast: 'Failed' })
        );
      });
    }
  };

  function slim(ctx) {
    const { vendor, category, intent, plan, monthly, annual, seats, instance, nights, nightly, total, host, url } = ctx;
    return { vendor, category, intent, plan, monthly, annual, seats, instance, nights, nightly, total, host, url };
  }

  function keyOf(a) {
    if (!a) return 'none';
    const c = a.ctx;
    return [c.vendor, c.intent, c.category, c.monthly, c.instance, c.nightly, a.insights.length].join('|');
  }

  function tick() {
    let analysis = null;
    try {
      analysis = window.__RAMP_RULES.analyze(window.__RAMP_DETECT.detect());
    } catch (e) {
      console.warn('[Ramp Escalate]', e);
      return;
    }

    if (!analysis || !analysis.insights.length) {
      if (panel) { panel.destroy(); panel = null; lastKey = null; }
      chrome.runtime.sendMessage({ kind: 'ramp:context', context: null });
      return;
    }

    const key = keyOf(analysis);
    if (key === lastKey) return;
    lastKey = key;

    if (panel) panel.update(analysis);
    else panel = new window.__RAMP_PANEL(analysis, api);

    chrome.runtime.sendMessage({
      kind: 'ramp:context',
      context: {
        ...slim(analysis.ctx),
        verdict: analysis.verdict,
        incremental: analysis.summary.incrementalMonthly,
        insights: analysis.insights.map(i => ({ severity: i.severity, title: i.title }))
      }
    });
  }

  let timer = null;
  const schedule = (wait = 450) => {
    clearTimeout(timer);
    timer = setTimeout(tick, wait);
  };

  schedule(600);

  // SPA pricing/checkout flows swap content without a navigation.
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.target && m.target.id === '__ramp_escalate_host') return;
      if ([...m.addedNodes].some(n => n.id === '__ramp_escalate_host')) return;
    }
    schedule();
  });
  if (document.body) mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  let href = location.href;
  setInterval(() => {
    if (location.href !== href) { href = location.href; lastKey = null; schedule(500); }
  }, 900);

  chrome.runtime.onMessage.addListener((msg, _s, send) => {
    if (msg.kind === 'ramp:rescan') { lastKey = null; tick(); send({ ok: true }); }
    if (msg.kind === 'ramp:open') {
      if (panel) { panel.dismissed = false; panel.expanded = true; panel.render(); }
      send({ ok: !!panel });
    }
    return true;
  });
})();
