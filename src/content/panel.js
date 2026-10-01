/** Renders the Escalate panel into a shadow root and wires up its actions. */
(function () {
  const usd = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
  // Invoices show cents; the panel doesn't.
  const usd2 = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const ICONS = {
    mark: '<svg viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="22" height="22" rx="6" fill="#D7FC51"/><path d="M7 16.5V7.5h5.4a2.8 2.8 0 0 1 0 5.6H9.4l4.3 3.4" stroke="#0B0C0B" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    alert: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 7v7M12 17.5v.5"/><circle cx="12" cy="12" r="9.5" stroke-width="1.8"/></svg>',
    copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A3.5 3.5 0 0 0 3 6.5v6A2.5 2.5 0 0 0 5.5 15"/></svg>',
    gauge: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3.5 17a9 9 0 1 1 17 0"/><path d="M12 17l4-5"/></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    shield: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l7.5 3v6c0 4.3-3 7.8-7.5 9-4.5-1.2-7.5-4.7-7.5-9V6L12 3z"/></svg>',
    trend: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l5-5 3.5 3.5L20 7"/><path d="M20 12V7h-5"/></svg>',
    users: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9.5" cy="9" r="3.5"/><path d="M3.5 19.5a6 6 0 0 1 12 0"/><path d="M16.5 6.2a3.5 3.5 0 0 1 0 6.6M18 19.5a6 6 0 0 0-1.6-4.1"/></svg>',
    scale: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v16M6 20h12M4 9h7L7.5 15.5A3.6 3.6 0 0 1 4 9z" /><path d="M13 9h7l-3.5 6.5A3.6 3.6 0 0 1 13 9z"/><path d="M12 5l-5 2.5M12 5l5 2.5"/></svg>',
    calendar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/></svg>',
    swap: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>',
    lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
    bolt: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2L4 13.5h6.2L9.5 22 20 10.5h-6.4L13.5 2z"/></svg>',
    close: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    min: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 13h12"/></svg>'
  };

  const INTENT_LABEL = {
    upgrade: 'Tier upgrade', pricing: 'Pricing page', checkout: 'Checkout',
    cloud: 'Cloud config', travel: 'Travel booking'
  };

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  class Panel {
    constructor(analysis, api) {
      this.analysis = analysis;
      this.api = api;             // { run(action, ctx) -> Promise<result> }
      this.expanded = false;
      this.dismissed = false;
      this.fixState = 'offered';   // offered → pending
      this.showAll = false;
      this.mount();
    }

    mount() {
      this.hostEl = document.createElement('div');
      this.hostEl.id = '__ramp_escalate_host';
      this.hostEl.style.cssText = 'all:initial;position:static';
      this.shadow = this.hostEl.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = window.__RAMP_CSS;
      this.shadow.appendChild(style);
      this.root = el('<div class="root"></div>');
      this.shadow.appendChild(this.root);
      document.documentElement.appendChild(this.hostEl);
      this.render();
    }

    counts() {
      const i = this.analysis.insights;
      return {
        total: i.length,
        block: i.filter(x => x.severity === 'block').length,
        warn: i.filter(x => x.severity === 'warn').length
      };
    }

    render() {
      this.root.innerHTML = '';
      if (this.dismissed) return;
      this.root.appendChild(this.expanded ? this.card() : this.pill());
    }

    pill() {
      const c = this.counts();
      const lvl = c.block ? 'block' : c.warn ? 'warn' : 'ok';
      const n = c.block || c.warn || c.total;
      const p = el(`
        <div class="pill ${lvl === 'block' ? 'pulse' : ''}" role="button" tabindex="0">
          <span class="mark">${ICONS.mark}</span>
          <span class="label">Escalate</span>
          <span class="count ${lvl}">${n}</span>
        </div>`);
      p.addEventListener('click', () => { this.expanded = true; this.render(); });
      p.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.expanded = true; this.render(); }
      });
      return p;
    }

    /** Skip the category chip when the intent label already says it. */
    showCategoryChip(ctx) {
      if (!ctx.category) return false;
      const label = (INTENT_LABEL[ctx.intent] || '').toLowerCase();
      return !label.startsWith(ctx.category.toLowerCase());
    }

    card() {
      const { ctx, verdict, summary } = this.analysis;
      const card = el('<div class="card"></div>');

      card.appendChild(el(`
        <div class="head">
          <span class="mark">${ICONS.mark}</span>
          <span class="name">Ramp Escalate</span>
          <span class="spacer"></span>
          <button class="iconbtn" data-act="min" title="Minimize">${ICONS.min}</button>
          <button class="iconbtn" data-act="close" title="Dismiss on this page">${ICONS.close}</button>
        </div>`));

      const amountLine = ctx.category === 'Travel'
        ? `<div class="amount"><span class="big">${usd(ctx.total || ctx.nightly)}</span>
             <span class="per">${ctx.nights ? `trip · ${usd(ctx.nightly)}/night × ${ctx.nights}` : 'total'}</span></div>`
        // Show the number the page itself shows — the audience can check it.
        : `<div class="amount">
             <span class="big">${usd(ctx.monthly)}</span>
             <span class="per">/mo</span>
             <span class="ann">· ${usd(ctx.monthly * 12)}/yr</span>
           </div>`;

      card.appendChild(el(`
        <div class="ctx">
          <div class="vendor">
            <h2>${esc(ctx.vendor || ctx.host)}</h2>
            <span class="chip">${esc(INTENT_LABEL[ctx.intent] || ctx.intent)}</span>
            ${this.showCategoryChip(ctx) ? `<span class="chip">${esc(ctx.category)}</span>` : ''}
          </div>
          ${amountLine}
          <div class="evidence">
            ${ctx.evidence.slice(0, 2).map(e => `<span class="chip">${esc(e)}</span>`).join('')}
          </div>
        </div>`));

      card.appendChild(el(`
        <div class="verdict ${verdict.level}">
          <span class="dot"></span><span>${esc(verdict.label)}</span>
          <span class="sub">${this.counts().total} signals</span>
        </div>`));

      if (this.analysis.plan) card.appendChild(this.fix(this.analysis.plan));

      // 45 seconds of attention: lead with two signals, keep the rest a click away.
      const all = this.analysis.insights;
      const shown = this.showAll ? all : all.slice(0, 2);
      const list = el('<div class="list"></div>');
      shown.forEach((ins, idx) => list.appendChild(this.insight(ins, idx)));
      if (all.length > shown.length) {
        const more = el(`<button class="more">Show ${all.length - shown.length} more signals</button>`);
        more.addEventListener('click', () => { this.showAll = true; this.render(); });
        list.appendChild(more);
      }
      card.appendChild(list);

      card.appendChild(el(`
        <div class="foot">
          <span class="live"></span>
          <span>Reading this page · ${esc(window.__RAMP_DATA.user.name)}</span>
          <span class="spacer"></span>
          <span>mock data</span>
        </div>`));

      card.querySelector('[data-act="min"]').addEventListener('click', () => { this.expanded = false; this.render(); });
      card.querySelector('[data-act="close"]').addEventListener('click', () => { this.dismissed = true; this.render(); });
      return card;
    }

    /** What Ramp would buy instead — the offer, then the pending execution. */
    fix(plan) {
      if (this.fixState === 'pending') return this.fixPending(plan);

      const node = el(`
        <div class="fix">
          <div class="ftop">${ICONS.bolt}<span>Ramp can handle this</span></div>
          <h3>${esc(plan.headline)}</h3>
          <div class="why">${esc(plan.rationale)}</div>
          <div class="swap">
            <span class="was">${usd(plan.was)}</span>
            <span class="arrow">→</span>
            <span class="now">${plan.newMonthly ? usd(plan.newMonthly) + '/mo' : 'No charge'}</span>
            <span class="save">saves ${usd(plan.saved)}/mo</span>
          </div>
          <div class="acts"><button class="btn hero">Let Ramp do it instead</button></div>
        </div>`);
      node.querySelector('.hero').addEventListener('click', () => this.execute(plan));
      return node;
    }

    fixPending(plan) {
      const node = el(`
        <div class="fix">
          <div class="ftop">
            ${ICONS.bolt}<span>Ramp is handling this</span>
            <span class="spacer"></span>
            <span class="status"><span class="sdot"></span>PENDING</span>
          </div>
          <h3>${esc(plan.headline)}</h3>
          <ul class="steps">
            ${plan.steps.map(st => `
              <li class="${st.done ? 'done' : 'wait'}">
                <span class="sm ${st.done ? 'done' : 'wait'}">${st.done ? '✓' : ''}</span>
                <span>${esc(st.text)}</span>
              </li>`).join('')}
          </ul>
          <div class="acts"><button class="btn hero">View invoice</button></div>
        </div>`);
      node.querySelector('.hero').addEventListener('click', () => this.openInvoice(plan));
      return node;
    }

    execute(plan) {
      this.fixState = 'pending';
      this.render();
      this.toast(plan.newMonthly ? `Rerouted · ${usd(plan.saved)}/mo saved` : `Avoided ${usd(plan.saved)}/mo`);
    }

    insight(ins, idx) {
      const node = el(`
        <div class="insight ${ins.severity}">
          <span class="ico">${ICONS[ins.icon] || ICONS.alert}</span>
          <div class="body">
            <h3>${esc(ins.title)}</h3>
            ${ins.detail ? `<p>${esc(ins.detail)}</p>` : ''}
          </div>
        </div>`);
      const body = node.querySelector('.body');

      if (ins.meter) body.appendChild(this.meter(ins.meter));

      if (ins.actions && ins.actions.length) {
        const acts = el('<div class="acts"></div>');
        ins.actions.forEach((a, i) => {
          const btn = el(`<button class="btn ${i === 0 && ins.severity !== 'info' ? 'primary' : ''}">${esc(a.label)}</button>`);
          btn.addEventListener('click', () => this.runAction(a, btn, body));
          acts.appendChild(btn);
        });
        body.appendChild(acts);
      }
      return node;
    }

    meter(m) {
      const over = m.used + m.add > m.limit;
      const usedW = Math.min(100, (m.used / m.limit) * 100);
      const addW = Math.min(100 - usedW, (m.add / m.limit) * 100);
      return el(`
        <div class="meter">
          <div class="bar">
            <div class="used" style="width:${usedW}%"></div>
            <div class="add ${over ? 'over' : ''}" style="width:${addW}%"></div>
          </div>
          <div class="legend">
            <span>${esc(m.label)}</span>
            <span><b>${usd(m.used)}</b> committed</span>
            <span><b>${over ? '+' : ''}${usd(m.add)}</b> this purchase</span>
            <span>of <b>${usd(m.limit)}</b></span>
          </div>
        </div>`);
    }

    async runAction(action, btn, body) {
      const prev = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Working…';
      let res;
      try {
        res = await this.api.run(action, this.analysis.ctx);
      } catch (e) {
        res = { kind: 'error', title: 'Action failed', detail: String(e) };
      }
      btn.disabled = false;
      btn.textContent = prev;

      const old = body.querySelector('.result');
      if (old) old.remove();
      body.appendChild(this.result(res));
      this.toast(res.toast || 'Done');
    }

    result(res) {
      const rows = Object.entries(res.fields || {})
        .map(([k, v]) => `<dt>${esc(k)}</dt><dd class="${/card number|id/i.test(k) ? 'mono' : ''}">${esc(v)}</dd>`)
        .join('');
      const node = el(`
        <div class="result">
          <div class="rtitle">${ICONS.check}<span>${esc(res.title)}</span></div>
          ${res.detail ? `<p style="margin-top:6px;font-size:12px;color:#93968F">${esc(res.detail)}</p>` : ''}
          ${rows ? `<dl>${rows}</dl>` : ''}
          ${res.text ? `<pre>${esc(res.text)}</pre>` : ''}
          ${res.text ? `<div class="rfoot"><button class="btn" data-copy="1">Copy to clipboard</button></div>` : ''}
        </div>`);
      const copy = node.querySelector('[data-copy]');
      if (copy) copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(res.text); copy.textContent = 'Copied'; }
        catch { copy.textContent = 'Select and copy'; }
      });
      return node;
    }

    /** The receipt for what Ramp actually bought. */
    openInvoice(plan) {
      const d = window.__RAMP_DATA;
      const lines = plan.invoice.lines;
      const total = lines.reduce((a, l) => a + l.amount, 0);
      const ref = 'INV-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      // A zero-dollar reroute has no card and nothing to approve — say so.
      const charged = total > 0;
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const scrim = el(`
        <div class="scrim">
          <div class="inv" role="dialog" aria-label="Invoice">
            <div class="ihead">
              <span class="ilogo">${ICONS.mark}</span>
              <div>
                <div class="ititle">Invoice ${esc(ref)}</div>
                <div class="isub">${esc(d.company.name)} · ${esc(d.user.department)}</div>
              </div>
              <button class="iclose" aria-label="Close">${ICONS.close}</button>
            </div>

            <dl class="imeta">
              <dt>Billed to</dt><dd>${esc(d.user.name)}</dd>
              <dt>Card</dt><dd>${charged ? `Visa ···· ${esc(d.user.cardLast4)} · merchant-locked` : 'None issued'}</dd>
              <dt>Issued</dt><dd>${esc(today)}</dd>
              <dt>Status</dt><dd><span class="ipend ${charged ? '' : 'ok'}">${charged ? 'PENDING APPROVAL' : 'NO CHARGE'}</span></dd>
            </dl>

            <div class="ilines">
              ${lines.map(l => `
                <div class="iline">
                  <span class="l"><b>${esc(l.label)}</b>${l.sub ? `<span>${esc(l.sub)}</span>` : ''}</span>
                  <span class="a">${usd2(l.amount)}</span>
                </div>`).join('')}
            </div>

            <div class="itotals">
              <div class="itot strike"><span class="k">Originally requested</span><span class="v">${usd2(plan.was)}</span></div>
              <div class="itot saved"><span class="k">Ramp avoided</span><span class="v">${usd2(plan.saved)}</span></div>
              <div class="itot grand"><span class="k" style="color:inherit">Total due</span><span class="v">${usd2(total)}</span></div>
            </div>

            ${plan.invoice.note ? `<div class="inote">${esc(plan.invoice.note)}</div>` : ''}

            <div class="ifoot">
              <span>${charged ? `Approver: ${esc(d.user.manager)}` : 'No approval required'}</span>
              <span class="spacer"></span>
              <span>Simulated · mock data</span>
            </div>
          </div>
        </div>`);

      const close = () => scrim.remove();
      scrim.querySelector('.iclose').addEventListener('click', close);
      scrim.addEventListener('click', e => { if (e.target === scrim) close(); });
      this.root.appendChild(scrim);
    }

    toast(msg) {
      const old = this.root.querySelector('.toast');
      if (old) old.remove();
      const t = el(`<div class="toast">${esc(msg)}</div>`);
      this.root.appendChild(t);
      setTimeout(() => t.remove(), 2600);
    }

    update(analysis) {
      this.analysis = analysis;
      this.render();
    }

    destroy() { this.hostEl.remove(); }
  }

  window.__RAMP_PANEL = Panel;
})();
