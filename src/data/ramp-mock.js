/**
 * Stand-in for the Ramp API. Everything the real integration would fetch from
 * /developer/v1 (transactions, limits, spend programs, vendors) is modelled here
 * with the same shapes so swapping in live calls is a data-layer change only.
 */
(function () {
  const MONTH = '2026-10';

  const RAMP = {
    month: MONTH,

    user: {
      name: 'Alex Chen',
      email: 'alex.chen@northwind.io',
      title: 'Senior Infrastructure Engineer',
      department: 'Engineering',
      manager: 'Priya Raman',
      cardLast4: '4417',
      // what this employee personally can put through without review
      discretionaryMonthly: 1500
    },

    company: {
      name: 'Northwind Labs',
      headcount: 340,
      fiscalYearEnd: '2027-01-31'
    },

    /** Spend programs / department limits. amounts in USD, monthly. */
    budgets: [
      { department: 'Engineering',  category: 'Software',       limit: 42000, spent: 38900, pending: 1800 },
      { department: 'Engineering',  category: 'Cloud',          limit: 95000, spent: 71240, pending: 4100 },
      { department: 'Engineering',  category: 'Travel',         limit: 12000, spent: 3150,  pending: 0 },
      { department: 'Marketing',    category: 'Software',       limit: 26000, spent: 19400, pending: 900 },
      { department: 'Sales',        category: 'Software',       limit: 31000, spent: 28750, pending: 2400 },
      { department: 'Operations',   category: 'Software',       limit: 15000, spent: 6100,  pending: 0 }
    ],

    /** Active subscriptions Ramp has reconciled from card + bill pay. */
    subscriptions: [
      {
        vendor: 'Datadog', category: 'Observability', plan: 'Pro',
        monthly: 8400, seats: 120, activeSeats: 71, owner: 'Platform',
        renewal: '2027-01-14', contract: 'annual', department: 'Engineering',
        notes: 'Committed annual spend $100,800. Overage billed monthly.'
      },
      {
        vendor: 'New Relic', category: 'Observability', plan: 'Data Plus',
        monthly: 3100, seats: 25, activeSeats: 4, owner: 'SRE',
        renewal: '2026-11-30', contract: 'monthly', department: 'Engineering',
        notes: 'Added during 2025 incident review. 4 of 25 seats active in 90d.'
      },
      {
        vendor: 'Figma', category: 'Design', plan: 'Organization',
        monthly: 2250, seats: 150, activeSeats: 138, owner: 'Design',
        renewal: '2027-03-01', contract: 'annual', department: 'Marketing'
      },
      {
        vendor: 'Notion', category: 'Docs & Wiki', plan: 'Business',
        monthly: 2720, seats: 340, activeSeats: 290, owner: 'Operations',
        renewal: '2026-12-01', contract: 'annual', department: 'Operations'
      },
      {
        vendor: 'Linear', category: 'Project Tracking', plan: 'Business',
        monthly: 1680, seats: 120, activeSeats: 115, owner: 'Engineering',
        renewal: '2027-02-10', contract: 'annual', department: 'Engineering'
      },
      {
        vendor: 'Vercel', category: 'Hosting', plan: 'Enterprise',
        monthly: 5600, seats: 60, activeSeats: 52, owner: 'Web',
        renewal: '2027-04-01', contract: 'annual', department: 'Engineering'
      },
      {
        vendor: 'Sentry', category: 'Error Monitoring', plan: 'Business',
        monthly: 960, seats: 90, activeSeats: 77, owner: 'Engineering',
        renewal: '2026-10-28', contract: 'monthly', department: 'Engineering'
      },
      {
        vendor: 'Amazon Web Services', category: 'Cloud', plan: 'Enterprise Support',
        monthly: 68000, seats: null, activeSeats: null, owner: 'Platform',
        renewal: '2027-06-30', contract: 'annual', department: 'Engineering',
        notes: 'EDP commitment $780k/yr. Savings Plan coverage 64%.'
      },
      {
        vendor: 'Salesforce', category: 'CRM', plan: 'Enterprise',
        monthly: 11200, seats: 80, activeSeats: 74, owner: 'Sales',
        renewal: '2027-01-31', contract: 'annual', department: 'Sales'
      },
      {
        vendor: 'Zoom', category: 'Video Conferencing', plan: 'Business Plus',
        monthly: 2890, seats: 300, activeSeats: 211, owner: 'Operations',
        renewal: '2026-12-15', contract: 'annual', department: 'Operations'
      }
    ],

    /** Recent card + bill-pay transactions, newest first. */
    transactions: [
      { date: '2026-09-28', vendor: 'Datadog',     amount: 8400,  department: 'Engineering', category: 'Software', memo: 'Pro tier — Sept' },
      { date: '2026-09-27', vendor: 'New Relic',   amount: 3100,  department: 'Engineering', category: 'Software', memo: 'Data Plus — Sept' },
      { date: '2026-09-24', vendor: 'Amazon Web Services', amount: 71240, department: 'Engineering', category: 'Cloud', memo: 'Sept usage to date' },
      { date: '2026-09-22', vendor: 'Grafana Labs', amount: 450,  department: 'Engineering', category: 'Software', memo: 'Trial — K. Osei' },
      { date: '2026-09-19', vendor: 'Sentry',      amount: 960,   department: 'Engineering', category: 'Software', memo: 'Business — Sept' },
      { date: '2026-09-16', vendor: 'Linear',      amount: 1680,  department: 'Engineering', category: 'Software', memo: 'Business — Sept' },
      { date: '2026-09-12', vendor: 'Vercel',      amount: 5600,  department: 'Engineering', category: 'Software', memo: 'Enterprise — Sept' },
      { date: '2026-09-09', vendor: 'Datadog',     amount: 2180,  department: 'Engineering', category: 'Software', memo: 'Log ingest overage' },
      { date: '2026-08-28', vendor: 'Datadog',     amount: 8400,  department: 'Engineering', category: 'Software', memo: 'Pro tier — Aug' },
      { date: '2026-08-27', vendor: 'New Relic',   amount: 3100,  department: 'Engineering', category: 'Software', memo: 'Data Plus — Aug' },
      { date: '2026-08-14', vendor: 'Datadog',     amount: 1640,  department: 'Engineering', category: 'Software', memo: 'Log ingest overage' },
      { date: '2026-07-28', vendor: 'Datadog',     amount: 8400,  department: 'Engineering', category: 'Software', memo: 'Pro tier — Jul' },
      { date: '2026-09-21', vendor: 'Delta Air Lines', amount: 612, department: 'Engineering', category: 'Travel', memo: 'SFO-JFK — offsite' },
      { date: '2026-09-21', vendor: 'Marriott',    amount: 1340,  department: 'Engineering', category: 'Travel', memo: '4 nights NYC' }
    ],

    /** Written policy, the part a copilot can actually evaluate. */
    policies: [
      { id: 'POL-SW-01', title: 'Software purchases over $1,000/mo need manager approval',
        scope: 'Software', threshold: 1000, approver: 'Manager' },
      { id: 'POL-SW-02', title: 'New vendor in an already-covered category needs Procurement review',
        scope: 'Software', threshold: 0, approver: 'Procurement' },
      { id: 'POL-SW-03', title: 'Annual commitments over $25,000 require Finance + Legal sign-off',
        scope: 'Software', threshold: 25000, approver: 'Finance', basis: 'annual' },
      { id: 'POL-SEC-01', title: 'Vendors touching customer data need a SOC 2 Type II on file',
        scope: 'Software', threshold: 0, approver: 'Security' },
      { id: 'POL-CLD-01', title: 'Non-prod instances must be Graviton or Spot where supported',
        scope: 'Cloud', threshold: 0, approver: 'Platform' },
      { id: 'POL-TRV-01', title: 'Lodging capped at $350/night in tier-1 metros',
        scope: 'Travel', threshold: 350, approver: 'Manager', basis: 'nightly' },
      { id: 'POL-TRV-02', title: 'Book through the preferred carrier for domestic routes',
        scope: 'Travel', threshold: 0, approver: 'Manager' }
    ],

    /** Category overlap map — what counts as "we already pay for this". */
    categoryAliases: {
      'Observability': ['observability', 'apm', 'monitoring', 'tracing', 'metrics', 'log management'],
      'Error Monitoring': ['error monitoring', 'crash reporting', 'exception tracking'],
      'Docs & Wiki': ['wiki', 'docs', 'knowledge base', 'notes'],
      'Project Tracking': ['project management', 'issue tracking', 'sprint', 'kanban'],
      'Video Conferencing': ['video conferencing', 'meetings', 'webinar'],
      'Design': ['design', 'prototyping', 'whiteboard'],
      'CRM': ['crm', 'sales pipeline'],
      'Hosting': ['hosting', 'deploy', 'edge network', 'cdn']
    },

    /** What Ramp knows about vendors across its network, plus our own leverage. */
    vendorIntel: {
      'datadog': {
        category: 'Observability',
        benchmarkNote: 'Companies your size pay 22–31% below list on annual Pro commitments.',
        leverage: [
          'You renew 2027-01-14 — inside the vendor Q4 push.',
          '49 of 120 seats are idle; a true-up would be a seat reduction, not an increase.',
          'Log ingest overage has run $1,640–$2,180/mo for 3 months — bundle it into the commit.'
        ],
        alternativesCovered: ['New Relic (active)', 'Sentry (active)']
      },
      'new relic': {
        category: 'Observability',
        benchmarkNote: 'Month-to-month pricing runs ~40% above annual equivalents.',
        leverage: ['Only 4 of 25 seats active in 90 days.'],
        alternativesCovered: ['Datadog (active)']
      },
      'grafana labs': {
        category: 'Observability',
        benchmarkNote: 'Third observability vendor in the stack this quarter.',
        leverage: [],
        alternativesCovered: ['Datadog (active)', 'New Relic (active)']
      },
      'amazon web services': {
        category: 'Cloud',
        benchmarkNote: 'Savings Plan coverage is 64%; the last 36% is on-demand rate.',
        leverage: ['EDP renewal 2027-06-30.'],
        alternativesCovered: []
      },
      'notion': { category: 'Docs & Wiki', benchmarkNote: '', leverage: [], alternativesCovered: [] },
      'linear': { category: 'Project Tracking', benchmarkNote: '', leverage: [], alternativesCovered: [] },
      'figma': { category: 'Design', benchmarkNote: '', leverage: [], alternativesCovered: [] },
      'sentry': { category: 'Error Monitoring', benchmarkNote: '', leverage: [], alternativesCovered: [] },
      'monday.com': {
        category: 'Project Tracking',
        benchmarkNote: 'Overlaps an active Linear Business contract.',
        leverage: [], alternativesCovered: ['Linear (active)']
      },
      'asana': {
        category: 'Project Tracking',
        benchmarkNote: 'Overlaps an active Linear Business contract.',
        leverage: [], alternativesCovered: ['Linear (active)']
      },
      'confluence': {
        category: 'Docs & Wiki',
        benchmarkNote: 'Overlaps an active Notion Business contract (340 seats).',
        leverage: [], alternativesCovered: ['Notion (active)']
      },
      'miro': {
        category: 'Design',
        benchmarkNote: 'Figma Organization already includes FigJam for 150 seats.',
        leverage: [], alternativesCovered: ['Figma (active)']
      },
      'marriott':  { category: 'Travel', benchmarkNote: '', leverage: [], alternativesCovered: [] },
      'hilton':    { category: 'Travel', benchmarkNote: '', leverage: [], alternativesCovered: [] },
      'delta air lines': { category: 'Travel', benchmarkNote: 'Preferred domestic carrier.', leverage: [], alternativesCovered: [], preferred: true },
      'united airlines': { category: 'Travel', benchmarkNote: 'Not the preferred domestic carrier.', leverage: [], alternativesCovered: [] }
    },

    /** EC2 reference pricing, enough to reason about a console selection. */
    instancePricing: {
      'm7i.4xlarge':   { hourly: 0.8064, vcpu: 16, mem: 64,  graviton: false, swap: 'm7g.4xlarge' },
      'm7g.4xlarge':   { hourly: 0.6528, vcpu: 16, mem: 64,  graviton: true },
      'm7i.8xlarge':   { hourly: 1.6128, vcpu: 32, mem: 128, graviton: false, swap: 'm7g.8xlarge' },
      'm7g.8xlarge':   { hourly: 1.3056, vcpu: 32, mem: 128, graviton: true },
      'r7i.8xlarge':   { hourly: 2.1168, vcpu: 32, mem: 256, graviton: false, swap: 'r7g.8xlarge' },
      'r7g.8xlarge':   { hourly: 1.7136, vcpu: 32, mem: 256, graviton: true },
      'p4d.24xlarge':  { hourly: 32.7726, vcpu: 96, mem: 1152, graviton: false },
      'c7i.12xlarge':  { hourly: 2.142,  vcpu: 48, mem: 96,  graviton: false, swap: 'c7g.12xlarge' },
      'c7g.12xlarge':  { hourly: 1.74,   vcpu: 48, mem: 96,  graviton: true }
    },

    // ---- derived helpers -------------------------------------------------

    budgetFor(department, category) {
      return this.budgets.find(b => b.department === department && b.category === category) || null;
    },

    subscriptionFor(vendor) {
      if (!vendor) return null;
      const v = vendor.toLowerCase();
      return this.subscriptions.find(s => s.vendor.toLowerCase() === v) || null;
    },

    intelFor(vendor) {
      if (!vendor) return null;
      return this.vendorIntel[vendor.toLowerCase()] || null;
    },

    /** Active subscriptions in the same category as `category`, excluding `vendor`. */
    overlapping(category, vendor) {
      if (!category) return [];
      const v = (vendor || '').toLowerCase();
      return this.subscriptions.filter(
        s => s.category === category && s.vendor.toLowerCase() !== v
      );
    },

    spendWith(vendor, months = 12) {
      if (!vendor) return { total: 0, count: 0 };
      const v = vendor.toLowerCase();
      const rows = this.transactions.filter(t => t.vendor.toLowerCase() === v);
      return {
        total: rows.reduce((a, t) => a + t.amount, 0),
        count: rows.length,
        rows
      };
    }
  };

  window.__RAMP_DATA = RAMP;
})();
