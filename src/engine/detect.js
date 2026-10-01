/**
 * Reads the live page and decides whether the user is about to spend money,
 * on what, and how much. Nothing here is site-specific beyond a vendor-name
 * catalog — prices, tiers and seats come out of ordinary page text, so the
 * same code works on a real pricing page and on the bundled demos.
 */
(function () {
  const VENDOR_BY_HOST = {
    'datadoghq.com': 'Datadog',
    'newrelic.com': 'New Relic',
    'grafana.com': 'Grafana Labs',
    'notion.so': 'Notion', 'notion.com': 'Notion',
    'linear.app': 'Linear',
    'figma.com': 'Figma',
    'miro.com': 'Miro',
    'monday.com': 'monday.com',
    'asana.com': 'Asana',
    'atlassian.com': 'Confluence',
    'sentry.io': 'Sentry',
    'vercel.com': 'Vercel',
    'salesforce.com': 'Salesforce',
    'zoom.us': 'Zoom', 'zoom.com': 'Zoom',
    'aws.amazon.com': 'Amazon Web Services',
    'console.aws.amazon.com': 'Amazon Web Services',
    'delta.com': 'Delta Air Lines',
    'united.com': 'United Airlines',
    'marriott.com': 'Marriott',
    'hilton.com': 'Hilton'
  };

  // Names we can also spot in body text when the hostname tells us nothing.
  const VENDOR_NAMES = [
    'Datadog', 'New Relic', 'Grafana Labs', 'Grafana Cloud', 'Notion', 'Linear',
    'Figma', 'Miro', 'monday.com', 'Asana', 'Confluence', 'Sentry', 'Vercel',
    'Salesforce', 'Zoom', 'Amazon Web Services', 'Delta Air Lines', 'United Airlines',
    'Marriott', 'Hilton'
  ];

  const CATEGORY_HINTS = [
    ['Observability', /\b(observability|apm|application performance|distributed tracing|log management|infrastructure monitoring)\b/i],
    ['Error Monitoring', /\b(error monitoring|crash reporting|exception tracking|session replay)\b/i],
    ['Project Tracking', /\b(issue tracking|project management|sprint planning|kanban board|work management)\b/i],
    ['Docs & Wiki', /\b(wiki|knowledge base|team docs|documentation workspace)\b/i],
    ['Design', /\b(prototyping|design system|whiteboard|collaborative canvas)\b/i],
    ['Video Conferencing', /\b(video conferencing|webinar|meeting rooms)\b/i],
    ['Hosting', /\b(edge network|serverless hosting|preview deployments|cdn)\b/i],
    ['CRM', /\b(crm|sales pipeline|opportunity management)\b/i],
    ['Cloud', /\b(ec2|instance type|vcpu|availability zone|on-demand pricing|launch instance)\b/i],
    ['Travel', /\b(check-in date|checkout date|per night|round trip|one way|economy|business class|nights?\b.*\broom)\b/i]
  ];

  const TIER_WORDS = /\b(free|starter|basic|standard|team|teams|plus|pro|professional|business|growth|advanced|premium|enterprise|organization|scale|ultimate|data plus)\b/i;

  const MONEY = /\$\s?([\d]{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/;

  function host() {
    return location.hostname.replace(/^www\./, '');
  }

  function vendorFromHost() {
    const h = host();
    for (const key of Object.keys(VENDOR_BY_HOST)) {
      if (h === key || h.endsWith('.' + key)) return VENDOR_BY_HOST[key];
    }
    return null;
  }

  function visibleText(limit = 24000) {
    const el = document.body;
    if (!el) return '';
    return (el.innerText || '').slice(0, limit);
  }

  function vendorFromText(text) {
    // The brand named in <title> or an <h1> beats one mentioned in a footer.
    const strong = [document.title, ...[...document.querySelectorAll('h1, h2')].slice(0, 6).map(n => n.innerText || '')].join(' \n ');
    for (const name of VENDOR_NAMES) if (new RegExp('\\b' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(strong)) return name;
    for (const name of VENDOR_NAMES) if (new RegExp('\\b' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(text)) return name;
    return null;
  }

  function num(s) { return parseFloat(String(s).replace(/,/g, '')); }

  /** Monthly, annual and per-seat prices stated anywhere on the page. */
  function extractPrices(text) {
    const out = { monthly: [], annual: [], perSeat: [], oneTime: [], hourly: [] };
    const src = text.replace(/ /g, ' ');

    const patterns = [
      [/\$\s?([\d,]+(?:\.\d{1,2})?)\s*(?:\/|\s+per\s+)\s*(?:mo|month|month(?:ly)?)\b/gi, 'monthly'],
      [/\$\s?([\d,]+(?:\.\d{1,2})?)\s*(?:\/|\s+per\s+)\s*(?:yr|year|annum|annually)\b/gi, 'annual'],
      [/\$\s?([\d,]+(?:\.\d{1,2})?)\s*(?:\/|\s+per\s+)\s*(?:user|seat|member|host|license)\b/gi, 'perSeat'],
      [/\$\s?([\d,]+(?:\.\d{1,2})?)\s*(?:\/|\s+per\s+)\s*(?:hr|hour)\b/gi, 'hourly'],
      [/\$\s?([\d,]+(?:\.\d{1,2})?)\s*(?:\/|\s+per\s+)\s*night\b/gi, 'nightly']
    ];

    for (const [re, bucket] of patterns) {
      let m;
      while ((m = re.exec(src))) {
        const v = num(m[1]);
        if (!isFinite(v)) continue;
        (out[bucket] || (out[bucket] = [])).push(v);
      }
    }

    // Totals near a checkout word — "Total $2,400", "Order total: $980.00"
    const totalRe = /\b(?:order\s+)?total(?:\s+due)?(?:\s+today)?\s*[:\-]?\s*\$\s?([\d,]+(?:\.\d{1,2})?)/gi;
    let t;
    while ((t = totalRe.exec(src))) out.oneTime.push(num(t[1]));

    return out;
  }

  function extractSeats(text) {
    const re = /\b([\d,]{1,6})\s*(?:seats?|users?|licen[cs]es?|members?|hosts?)\b/gi;
    const vals = [];
    let m;
    while ((m = re.exec(text))) {
      const v = num(m[1]);
      if (isFinite(v) && v > 0 && v < 100000) vals.push(v);
    }
    return vals.length ? Math.max(...vals) : null;
  }

  function extractTier(text) {
    // Prefer a tier word sitting next to a selection cue.
    const cue = /\b(selected|current plan|upgrade to|you'?re upgrading to|switch to|chosen plan|new plan)\b[^.\n]{0,60}/gi;
    let m;
    while ((m = cue.exec(text))) {
      const t = m[0].match(TIER_WORDS);
      if (t) return titleCase(t[1]);
    }
    const heads = [...document.querySelectorAll('h1, h2, h3, [class*="plan"], [class*="tier"]')]
      .slice(0, 40).map(n => n.innerText || '').join(' \n ');
    const h = heads.match(TIER_WORDS);
    return h ? titleCase(h[1]) : null;
  }

  function titleCase(s) {
    return String(s).replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
  }

  function detectCategory(text, vendor) {
    const intel = window.__RAMP_DATA.intelFor(vendor);
    if (intel && intel.category) return intel.category;
    for (const [cat, re] of CATEGORY_HINTS) if (re.test(text)) return cat;
    return null;
  }

  function hasCheckoutFields() {
    const sel = [
      'input[autocomplete="cc-number"]', 'input[autocomplete="cc-exp"]',
      'input[name*="card" i]', 'input[id*="card" i]',
      'input[placeholder*="card number" i]', 'iframe[src*="stripe" i]'
    ].join(',');
    return !!document.querySelector(sel);
  }

  function detectIntent(text, vendor) {
    const t = text.toLowerCase();
    if (/\b(instance type|launch instance|vcpu|availability zone)\b/.test(t)) return 'cloud';
    if (/\b(check-?in|per night|round trip|passenger|flight|hotel|nights?)\b/.test(t) &&
        /\$/.test(t)) return 'travel';
    if (hasCheckoutFields() || /\b(place order|complete purchase|pay now|checkout|billing information)\b/.test(t)) return 'checkout';
    if (/\b(upgrade|change plan|choose a plan|compare plans|start trial|add seats|billing)\b/.test(t)) return 'upgrade';
    if (vendor && /\$/.test(t)) return 'pricing';
    return null;
  }

  /** EC2 instance selection, read off the page like a human would. */
  function detectInstance(text) {
    const pricing = window.__RAMP_DATA.instancePricing;
    const names = Object.keys(pricing);
    // "Selected: m7i.8xlarge" wins over a type merely listed in a table.
    const selectedBlock = (text.match(/\b(selected|chosen|instance type)\b[^\n]{0,80}/gi) || []).join(' ');
    for (const n of names) if (selectedBlock.includes(n)) return n;
    const found = names.filter(n => text.includes(n));
    if (!found.length) return null;
    // Fall back to the priciest type on the page — the one worth flagging.
    return found.sort((a, b) => pricing[b].hourly - pricing[a].hourly)[0];
  }

  function detectQuantity(text, word) {
    const re = new RegExp('\\b([\\d,]{1,5})\\s*' + word, 'i');
    const m = text.match(re);
    return m ? num(m[1]) : null;
  }

  /**
   * @returns {null|{vendor,category,intent,plan,seats,monthly,annual,instance,
   *                 nights,nightly,total,evidence:string[]}}
   */
  function detect() {
    const text = visibleText();
    if (!text || text.length < 40) return null;

    const vendor = vendorFromHost() || vendorFromText(text);
    const intent = detectIntent(text, vendor);
    if (!intent) return null;

    const prices = extractPrices(text);
    const category = detectCategory(text, vendor);
    const evidence = [];

    const ctx = {
      vendor, category, intent,
      plan: null, seats: null,
      monthly: null, annual: null, perSeat: null,
      instance: null, hourly: null, qty: null,
      nights: null, nightly: null, total: null,
      url: location.href, host: host(),
      evidence
    };

    if (vendorFromHost()) evidence.push(`domain ${host()}`);
    else if (vendor) evidence.push(`page names ${vendor}`);

    if (intent === 'cloud') {
      ctx.category = 'Cloud';
      ctx.instance = detectInstance(text);
      ctx.qty = detectQuantity(text, '(?:instances?|nodes?)') || 1;
      const p = ctx.instance && window.__RAMP_DATA.instancePricing[ctx.instance];
      if (p) {
        ctx.hourly = p.hourly * ctx.qty;
        ctx.monthly = Math.round(ctx.hourly * 730);
        evidence.push(`${ctx.qty}× ${ctx.instance} @ $${p.hourly}/hr`);
      } else if (prices.hourly.length) {
        ctx.hourly = Math.max(...prices.hourly);
        ctx.monthly = Math.round(ctx.hourly * 730);
        evidence.push(`$${ctx.hourly}/hr on page`);
      }
      return ctx.monthly ? ctx : null;
    }

    if (intent === 'travel') {
      ctx.category = 'Travel';
      ctx.nightly = prices.nightly && prices.nightly.length ? Math.max(...prices.nightly) : null;
      ctx.nights = detectQuantity(text, 'nights?');
      ctx.total = prices.oneTime.length ? Math.max(...prices.oneTime)
                : (ctx.nightly && ctx.nights ? ctx.nightly * ctx.nights : null);
      if (ctx.nightly) evidence.push(`$${ctx.nightly}/night`);
      if (ctx.nights) evidence.push(`${ctx.nights} nights`);
      if (!ctx.total && prices.monthly.length) ctx.total = Math.max(...prices.monthly);
      // Budget and policy rules reason in monthly terms; a trip is one hit on it.
      ctx.monthly = ctx.total || (ctx.nightly && ctx.nights ? ctx.nightly * ctx.nights : ctx.nightly);
      return (ctx.total || ctx.nightly) ? ctx : null;
    }

    // Software: upgrade / pricing / checkout
    ctx.plan = extractTier(text);
    ctx.seats = extractSeats(text);
    ctx.perSeat = prices.perSeat.length ? Math.max(...prices.perSeat) : null;

    if (prices.monthly.length) ctx.monthly = Math.max(...prices.monthly);
    if (prices.annual.length) ctx.annual = Math.max(...prices.annual);
    if (!ctx.monthly && ctx.perSeat && ctx.seats) ctx.monthly = ctx.perSeat * ctx.seats;
    if (!ctx.monthly && ctx.annual) ctx.monthly = Math.round(ctx.annual / 12);
    if (!ctx.monthly && prices.oneTime.length) {
      ctx.total = Math.max(...prices.oneTime);
      ctx.monthly = ctx.total;
    }
    if (!ctx.annual && ctx.monthly) ctx.annual = ctx.monthly * 12;

    if (ctx.plan) evidence.push(`${ctx.plan} tier`);
    if (ctx.perSeat && ctx.seats) evidence.push(`${ctx.seats} × $${ctx.perSeat}/seat`);
    else if (ctx.monthly) evidence.push(`$${ctx.monthly.toLocaleString()}/mo on page`);

    if (!ctx.monthly) return null;
    return ctx;
  }

  window.__RAMP_DETECT = { detect, extractPrices, visibleText };
})();
