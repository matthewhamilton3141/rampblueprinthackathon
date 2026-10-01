/**
 * Stands in for the Ramp API. Issuance, approvals and seat claims land in
 * chrome.storage.local so the popup has a real activity log, and the toolbar
 * badge mirrors whatever the active tab detected.
 */

const contextByTab = new Map();

const usd = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
const pad = n => String(n).padStart(2, '0');

function cardNumber() {
  // Deliberately a documentation-range PAN: simulated, never routable.
  const grp = () => pad(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `4762 ${grp()} ${grp()} ${grp()}`;
}

function refId(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function expiry() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 3);
  return `${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
}

async function log(entry) {
  const { escalations = [] } = await chrome.storage.local.get('escalations');
  escalations.unshift({ ...entry, ts: Date.now() });
  await chrome.storage.local.set({ escalations: escalations.slice(0, 60) });
}

function handleAction(action, ctx) {
  const amount = Math.round(action.amount || ctx.monthly || ctx.total || 0);
  const vendor = action.vendor || ctx.vendor || ctx.host;

  switch (action.type) {
    case 'issue_card': {
      const id = refId('CARD');
      log({ type: 'card', vendor, amount, id, detail: `Virtual card capped at ${usd(amount)}/mo` });
      return {
        title: 'Virtual card issued',
        detail: `Locked to ${vendor}. Declines anything over the cap, no exceptions.`,
        fields: {
          'Card number': cardNumber(),
          'Expires': expiry(),
          'CVC': String(Math.floor(100 + Math.random() * 900)),
          'Limit': `${usd(amount)} / month`,
          'Merchant lock': vendor,
          'Reference': id
        },
        toast: `Card issued · ${usd(amount)} cap`
      };
    }

    case 'request_approval': {
      const id = refId('APR');
      const approvers = action.approvers && action.approvers.length ? action.approvers.join(', ') : 'Engineering Manager';
      log({ type: 'approval', vendor, amount, id, detail: `Approval requested from ${approvers}` });
      return {
        title: 'Approval request sent',
        detail: `${vendor} · ${usd(amount)}/mo. Routed with the page context and the budget snapshot attached.`,
        fields: {
          'Requested by': 'Infrastructure Engineer',
          'Approvers': approvers,
          'Amount': `${usd(amount)} / month`,
          'Annualized': usd(amount * 12),
          'SLA': '1 business day',
          'Reference': id
        },
        toast: 'Approval request sent'
      };
    }

    case 'reuse_license': {
      const id = refId('SEAT');
      log({ type: 'seat', vendor, amount: 0, id, detail: `Seat claimed on existing ${vendor} contract` });
      return {
        title: 'Seat assigned from existing contract',
        detail: `No new spend. ${vendor} already has idle capacity on the current term.`,
        fields: {
          'Vendor': vendor,
          'Assigned to': 'infra-eng@northwind.io',
          'Incremental cost': '$0',
          'Provisioned by': `${vendor} workspace admin`,
          'Reference': id
        },
        toast: 'Seat claimed · $0'
      };
    }

    default:
      return { title: 'Unknown action', detail: action.type, toast: 'Nothing to do' };
  }
}

function paintBadge(tabId, context) {
  if (!context || !context.insights || !context.insights.length) {
    chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
    return;
  }
  const block = context.insights.filter(i => i.severity === 'block').length;
  const warn = context.insights.filter(i => i.severity === 'warn').length;
  const n = block || warn || context.insights.length;
  const color = block ? '#FF6B5A' : warn ? '#FFB84D' : '#D7FC51';
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(() => {});
  chrome.action.setBadgeTextColor?.({ tabId, color: '#14200A' }).catch(() => {});
  chrome.action.setBadgeText({ tabId, text: String(n) }).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, sender, send) => {
  if (msg.kind === 'ramp:action') {
    // A beat of latency so the UI reads like a real round-trip.
    setTimeout(() => send(handleAction(msg.action, msg.ctx || {})), 420);
    return true;
  }

  if (msg.kind === 'ramp:context') {
    const tabId = sender.tab && sender.tab.id;
    if (tabId != null) {
      if (msg.context) contextByTab.set(tabId, msg.context);
      else contextByTab.delete(tabId);
      paintBadge(tabId, msg.context);
    }
    send({ ok: true });
    return true;
  }

  if (msg.kind === 'ramp:getContext') {
    send({ context: contextByTab.get(msg.tabId) || null });
    return true;
  }

  return false;
});

chrome.tabs.onRemoved.addListener(id => contextByTab.delete(id));

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('escalations').then(({ escalations }) => {
    if (!escalations) chrome.storage.local.set({ escalations: [] });
  });
});
