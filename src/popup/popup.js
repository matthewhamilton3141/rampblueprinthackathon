const D = window.__RAMP_DATA;
const usd = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
const $ = id => document.getElementById(id);

const DEMOS = [
  { file: 'datadog-upgrade.html', title: 'Datadog Pro → Enterprise', sub: 'Redundant vendor + budget overshoot' },
  { file: 'aws-instance.html',    title: 'AWS EC2 launch config',    sub: 'Graviton swap + Savings Plan gap' },
  { file: 'monday-checkout.html', title: 'monday.com checkout',      sub: 'Already covered by Linear' },
  { file: 'travel-booking.html',  title: 'NYC hotel booking',        sub: 'Over the nightly lodging cap' }
];
const DEMO_BASE = 'http://localhost:8787/demo/';

function renderWho() {
  $('who-name').textContent = D.user.role;
  $('who-role').textContent = `${D.user.department} · ${D.company.name}`;
}

function renderBudgets() {
  const mine = D.budgets.filter(b => b.department === D.user.department);
  $('budgets').innerHTML = mine.map(b => {
    const committed = b.spent + b.pending;
    const p = (committed / b.limit) * 100;
    const cls = p >= 100 ? 'over' : p >= 80 ? 'hot' : '';
    return `
      <div class="b">
        <div class="b-top">
          <span class="nm">${b.category}</span>
          <span class="sp">${usd(committed)} / ${usd(b.limit)}</span>
        </div>
        <div class="b-bar"><div class="b-fill ${cls}" style="width:${Math.min(100, p)}%"></div></div>
      </div>`;
  }).join('');
}

function renderDemos() {
  $('demos').innerHTML = DEMOS.map((d, i) => `
    <button class="demo" data-i="${i}">
      <span class="col"><span class="d-t">${d.title}</span><span class="d-s">${d.sub}</span></span>
      <span class="arrow">→</span>
    </button>`).join('');
  $('demos').querySelectorAll('.demo').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = DEMOS[Number(btn.dataset.i)];
      chrome.tabs.create({ url: DEMO_BASE + d.file });
    });
  });
}

function renderNow(ctx) {
  const el = $('now-body');
  if (!ctx) {
    el.className = 'now-body empty';
    el.textContent = 'Nothing to escalate here.';
    return;
  }
  const amt = ctx.category === 'Travel'
    ? `${usd(ctx.total || ctx.nightly)} <span>trip total</span>`
    : `${usd(ctx.incremental || ctx.monthly)} <span>/mo incremental · ${usd((ctx.incremental || ctx.monthly) * 12)}/yr</span>`;
  el.className = 'now-body live';
  el.innerHTML = `
    <div class="now-head">
      <strong>${ctx.vendor || ctx.host}</strong>
      <span class="tag ${ctx.verdict.level}">${ctx.verdict.label}</span>
    </div>
    <div class="now-amt">${amt}</div>
    ${ctx.insights.slice(0, 4).map(i => `
      <div class="signal"><span class="bullet ${i.severity}"></span><span>${i.title}</span></div>`).join('')}`;
}

function renderLog(rows) {
  const el = $('log');
  if (!rows || !rows.length) {
    el.className = 'log empty';
    el.textContent = 'No cards issued or approvals requested yet.';
    return;
  }
  const label = { card: 'Card', approval: 'Approval', seat: 'Seat' };
  el.className = 'log live';
  el.innerHTML = rows.slice(0, 6).map(r => `
    <div class="row">
      <span class="k ${r.type}">${label[r.type] || r.type}</span>
      <span class="t">${r.vendor}</span>
      <span class="a">${r.amount ? usd(r.amount) + '/mo' : '$0'}</span>
    </div>`).join('');
}

async function init() {
  renderWho();
  renderBudgets();
  renderDemos();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.runtime.sendMessage({ kind: 'ramp:getContext', tabId: tab.id }, r => renderNow(r && r.context));
  }

  const { escalations = [] } = await chrome.storage.local.get('escalations');
  renderLog(escalations);

  $('rescan').addEventListener('click', async () => {
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!t) return;
    chrome.tabs.sendMessage(t.id, { kind: 'ramp:rescan' }, () => {
      setTimeout(() => {
        chrome.runtime.sendMessage({ kind: 'ramp:getContext', tabId: t.id }, r => renderNow(r && r.context));
      }, 700);
    });
  });
}

init();
