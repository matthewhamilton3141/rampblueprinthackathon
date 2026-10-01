/**
 * Turns a detected purchase context + Ramp's ledger into ranked insights.
 * Each rule is independent and returns 0..n insights; the panel renders
 * whatever comes back, sorted by severity.
 */
(function () {
  const D = () => window.__RAMP_DATA;

  const SEV = { block: 3, warn: 2, info: 1 };

  /**
   * What this purchase actually adds to the monthly run rate. Swapping a seat
   * tier replaces the old line; cloud usage and a hotel night stack on top of
   * whatever the vendor already bills, so those never net out.
   */
  function incrementalOf(ctx) {
    if (!ctx.monthly) return 0;
    if (ctx.category === 'Cloud' || ctx.category === 'Travel') return ctx.monthly;
    const existing = D().subscriptionFor(ctx.vendor);
    return existing ? Math.max(0, ctx.monthly - existing.monthly) : ctx.monthly;
  }

  const plural = (n, one, many) => (n === 1 ? one : many);
  const usd = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
  const pct = n => Math.round(n) + '%';

  // ---- rules -----------------------------------------------------------

  /** We already pay somebody for this. */
  function ruleRedundantSoftware(ctx) {
    if (ctx.category === 'Cloud' || ctx.category === 'Travel') return [];
    const existing = D().subscriptionFor(ctx.vendor);
    const overlap = D().overlapping(ctx.category, ctx.vendor);
    if (!overlap.length) return [];

    const top = overlap.slice().sort((a, b) => b.monthly - a.monthly)[0];
    const idle = top.seats && top.activeSeats != null ? top.seats - top.activeSeats : null;

    // Upgrading a tool you already own isn't redundancy, but a sibling tool is.
    const verb = existing ? 'You already run two tools in' : 'Northwind already pays for';

    const utilization = idle == null ? null
      : idle / top.seats >= 0.15
        ? `${top.vendor} has ${idle} of ${top.seats} seats idle — capacity you've already bought.`
        : `${top.vendor} is in real use: ${top.activeSeats} of ${top.seats} seats active in the last 90 days.`;

    const detail = [
      `${verb} ${ctx.category}: ${overlap.map(s => `${s.vendor} ${s.plan} (${usd(s.monthly)}/mo)`).join(', ')}.`,
      utilization
    ].filter(Boolean).join(' ');

    return [{
      id: 'redundant',
      severity: existing ? 'warn' : 'block',
      icon: 'copy',
      title: existing
        ? `Overlapping ${ctx.category.toLowerCase()} spend: ${usd(overlap.reduce((a, s) => a + s.monthly, 0))}/mo`
        : `Already covered — ${top.vendor} ${top.plan}`,
      detail,
      // Claiming a seat only makes sense when you don't already hold this vendor.
      actions: [
        ...(existing ? [] : [{ type: 'reuse_license', label: `Claim a ${top.vendor} seat`, vendor: top.vendor }]),
        { type: 'consolidate', label: 'Draft consolidation memo' }
      ]
    }];
  }

  /** The budget math. */
  function ruleBudget(ctx) {
    const dept = D().user.department;
    const budget = D().budgetFor(dept, ctx.category) || D().budgetFor(dept, 'Software');
    if (!budget || !ctx.monthly) return [];

    const incremental = incrementalOf(ctx);
    // Only a tier swap has a "current" line to compare against.
    const replaces = (ctx.category !== 'Cloud' && ctx.category !== 'Travel')
      ? D().subscriptionFor(ctx.vendor) : null;

    const committed = budget.spent + budget.pending;
    const remaining = budget.limit - committed;
    const after = remaining - incremental;
    const usedPct = (committed / budget.limit) * 100;

    const out = [];

    if (after < 0) {
      out.push({
        id: 'budget-over',
        severity: 'block',
        icon: 'alert',
        title: `Overshoots ${dept} ${budget.category} by ${usd(-after)}`,
        detail: `${usd(committed)} of ${usd(budget.limit)} is already committed this month (${pct(usedPct)}). ` +
          `This adds ${usd(incremental)}${replaces ? ` on top of your current ${usd(replaces.monthly)}/mo` : ''}, leaving you ${usd(-after)} short.`,
        meter: { used: committed, add: incremental, limit: budget.limit, label: `${dept} · ${budget.category}` },
        actions: [
          { type: 'request_approval', label: 'Request limit increase', amount: incremental },
          ...(remaining > 0
            ? [{ type: 'issue_card', label: `Issue card capped at ${usd(remaining)}`, amount: remaining }]
            : [])
        ]
      });
    } else if (usedPct > 80 || incremental > remaining * 0.5) {
      out.push({
        id: 'budget-tight',
        severity: 'warn',
        icon: 'gauge',
        title: `Leaves ${usd(after)} in ${dept} ${budget.category}`,
        detail: `${pct(usedPct)} of the ${usd(budget.limit)} monthly limit is committed. ` +
          `This purchase takes ${pct((incremental / budget.limit) * 100)} of the limit.`,
        meter: { used: committed, add: incremental, limit: budget.limit, label: `${dept} · ${budget.category}` },
        actions: [
          { type: 'issue_card', label: `Issue card capped at ${usd(incremental)}`, amount: incremental }
        ]
      });
    } else {
      out.push({
        id: 'budget-ok',
        severity: 'info',
        icon: 'check',
        title: `Fits budget — ${usd(after)} would remain`,
        detail: `${dept} ${budget.category} is at ${pct(usedPct)} of ${usd(budget.limit)}.`,
        meter: { used: committed, add: incremental, limit: budget.limit, label: `${dept} · ${budget.category}` },
        actions: [
          { type: 'issue_card', label: `Issue card capped at ${usd(incremental)}`, amount: incremental }
        ]
      });
    }

    // Personal discretionary ceiling is a separate gate from the department's.
    if (incremental > D().user.discretionaryMonthly) {
      out.push({
        id: 'discretionary',
        severity: 'warn',
        icon: 'lock',
        title: `Above your ${usd(D().user.discretionaryMonthly)}/mo discretionary limit`,
        detail: `${usd(incremental)} needs ${D().user.manager}'s approval before the card will authorize.`,
        actions: [{ type: 'request_approval', label: `Ask ${D().user.manager.split(' ')[0]} to approve`, amount: incremental }]
      });
    }

    return out;
  }

  /** Written policy that actually trips on these numbers. */
  function rulePolicy(ctx) {
    const scope = ctx.category === 'Cloud' ? 'Cloud' : ctx.category === 'Travel' ? 'Travel' : 'Software';
    const annual = ctx.annual || (ctx.monthly ? ctx.monthly * 12 : 0);
    const hits = [];

    for (const p of D().policies) {
      if (p.scope !== scope) continue;
      if (p.basis === 'annual' && annual >= p.threshold) hits.push(p);
      else if (p.basis === 'nightly' && ctx.nightly && ctx.nightly > p.threshold) hits.push(p);
      else if (!p.basis && p.threshold > 0 && ctx.monthly >= p.threshold) hits.push(p);
      else if (p.id === 'POL-SW-02' && D().overlapping(ctx.category, ctx.vendor).length) hits.push(p);
      else if (p.id === 'POL-CLD-01' && ctx.instance && !D().instancePricing[ctx.instance]?.graviton) hits.push(p);
      else if (p.id === 'POL-TRV-02' && ctx.vendor && D().intelFor(ctx.vendor) && D().intelFor(ctx.vendor).preferred === undefined && scope === 'Travel' && /airlines?/i.test(ctx.vendor)) hits.push(p);
    }

    if (!hits.length) return [];

    const approvers = [...new Set(hits.map(h => h.approver))];
    return [{
      id: 'policy',
      severity: hits.some(h => h.approver === 'Finance' || h.approver === 'Security') ? 'warn' : 'info',
      icon: 'shield',
      title: `${hits.length} ${plural(hits.length, 'policy applies', 'policies apply')} — ${approvers.join(' + ')} sign-off`,
      detail: hits.map(h => `${h.id} · ${h.title}`).join('\n'),
      actions: [{ type: 'request_approval', label: `Open approval (${approvers.join(', ')})`, amount: ctx.monthly, approvers }]
    }];
  }

  /** What Ramp's history says about the price itself. */
  function rulePricing(ctx) {
    const out = [];
    const intel = D().intelFor(ctx.vendor);
    const existing = D().subscriptionFor(ctx.vendor);
    const hist = D().spendWith(ctx.vendor);

    if (existing && ctx.monthly && ctx.monthly > existing.monthly) {
      const delta = ctx.monthly - existing.monthly;
      out.push({
        id: 'delta',
        severity: 'info',
        icon: 'trend',
        title: `+${usd(delta)}/mo over your current ${existing.plan} plan`,
        detail: `You pay ${usd(existing.monthly)}/mo today (${existing.contract} contract, renews ${existing.renewal}). ` +
          `Annualized, this upgrade is ${usd(delta * 12)} of new commitment.`,
        actions: []
      });
    }

    if (existing && existing.seats && existing.activeSeats != null) {
      const idle = existing.seats - existing.activeSeats;
      if (idle > 0 && idle / existing.seats >= 0.2) {
        const perSeat = existing.monthly / existing.seats;
        out.push({
          id: 'idle-seats',
          severity: 'warn',
          icon: 'users',
          title: `${idle} idle ${ctx.vendor} seats — ${usd(idle * perSeat)}/mo of nothing`,
          detail: `${existing.activeSeats} of ${existing.seats} seats were active in the last 90 days. ` +
            `Right-sizing before you upgrade cuts the new tier's base by ${usd(idle * perSeat)}/mo.`,
          actions: [{ type: 'negotiation_script', label: 'Script the seat reduction', vendor: ctx.vendor }]
        });
      }
    }

    if (intel && intel.benchmarkNote) {
      out.push({
        id: 'benchmark',
        severity: 'info',
        icon: 'scale',
        title: 'Ramp network benchmark',
        detail: intel.benchmarkNote + (hist.count
          ? ` You've sent ${ctx.vendor} ${usd(hist.total)} across ${hist.count} ${plural(hist.count, 'charge', 'charges')} on file.`
          : ''),
        actions: intel.leverage.length
          ? [{ type: 'negotiation_script', label: 'Build negotiation script', vendor: ctx.vendor }]
          : []
      });
    }

    if (ctx.monthly && ctx.annual && existing && existing.contract === 'monthly') {
      out.push({
        id: 'term',
        severity: 'info',
        icon: 'calendar',
        title: 'Month-to-month premium',
        detail: `This vendor is billed monthly. Annual terms at your volume typically land 15–25% lower — ` +
          `roughly ${usd(ctx.annual * 0.2)}/yr.`,
        actions: []
      });
    }

    return out;
  }

  /** Cloud-specific: the swap and the commitment coverage. */
  function ruleCloud(ctx) {
    if (ctx.category !== 'Cloud' || !ctx.instance) return [];
    const p = D().instancePricing[ctx.instance];
    if (!p) return [];
    const out = [];

    if (p.swap) {
      const alt = D().instancePricing[p.swap];
      const saveMo = Math.round((p.hourly - alt.hourly) * 730 * (ctx.qty || 1));
      out.push({
        id: 'graviton',
        severity: 'warn',
        icon: 'swap',
        title: `${p.swap} is the same shape for ${usd(saveMo)}/mo less`,
        detail: `${ctx.instance} and ${p.swap} are both ${p.vcpu} vCPU / ${p.mem} GiB. ` +
          `Graviton saves ${usd(saveMo)}/mo (${usd(saveMo * 12)}/yr) at ${ctx.qty || 1}× — and POL-CLD-01 asks for it on non-prod.`,
        actions: [{ type: 'copy', label: `Copy "${p.swap}"`, text: p.swap }]
      });
    }

    const aws = D().subscriptionFor('Amazon Web Services');
    if (aws) {
      out.push({
        id: 'savings-plan',
        severity: 'info',
        icon: 'gauge',
        title: 'Savings Plan coverage is 64%',
        detail: `${aws.notes} New steady-state capacity at on-demand rates widens the uncovered slice. ` +
          `A 1-year compute plan on this workload would cut ~28% off ${usd(ctx.monthly)}/mo.`,
        actions: [{ type: 'request_approval', label: 'Flag to Platform for SP coverage', amount: ctx.monthly }]
      });
    }

    return out;
  }

  /** Travel-specific. */
  function ruleTravel(ctx) {
    if (ctx.category !== 'Travel') return [];
    const out = [];
    const cap = D().policies.find(p => p.id === 'POL-TRV-01');

    if (ctx.nightly && cap && ctx.nightly > cap.threshold) {
      const nights = ctx.nights || 1;
      out.push({
        id: 'lodging-cap',
        severity: 'block',
        icon: 'alert',
        title: `${usd(ctx.nightly)}/night is ${usd(ctx.nightly - cap.threshold)} over the ${usd(cap.threshold)} cap`,
        detail: `${cap.id} caps tier-1 lodging at ${usd(cap.threshold)}/night. ` +
          `Over ${nights} night${nights === 1 ? '' : 's'} that's ${usd((ctx.nightly - cap.threshold) * nights)} out of policy.`,
        actions: [
          { type: 'issue_card', label: `Issue card capped at ${usd(cap.threshold * nights)}`, amount: cap.threshold * nights },
          { type: 'request_approval', label: 'Request exception', amount: ctx.nightly * nights }
        ]
      });
    }

    const intel = D().intelFor(ctx.vendor);
    if (intel && /airlines?/i.test(ctx.vendor || '') && !intel.preferred) {
      out.push({
        id: 'preferred-carrier',
        severity: 'warn',
        icon: 'shield',
        title: 'Not the preferred domestic carrier',
        detail: `POL-TRV-02 routes domestic travel through Delta Air Lines, where Northwind holds a negotiated discount. ` +
          `Engineering has ${usd(D().budgetFor('Engineering', 'Travel').limit - D().budgetFor('Engineering', 'Travel').spent)} left in travel this month.`,
        actions: []
      });
    }

    return out;
  }

  // ---- orchestration ---------------------------------------------------

  const RULES = [ruleRedundantSoftware, ruleBudget, rulePolicy, rulePricing, ruleCloud, ruleTravel];

  /** Headline read on the whole purchase. */
  function verdict(insights) {
    if (insights.some(i => i.severity === 'block')) return { level: 'block', label: "Don't buy yet" };
    if (insights.some(i => i.severity === 'warn')) return { level: 'warn', label: 'Worth a second look' };
    return { level: 'ok', label: 'Clear to spend' };
  }

  function analyze(ctx) {
    if (!ctx) return null;
    let insights = [];
    for (const rule of RULES) {
      try { insights = insights.concat(rule(ctx) || []); }
      catch (e) { console.warn('[Ramp Escalate] rule failed', rule.name, e); }
    }
    insights.sort((a, b) => SEV[b.severity] - SEV[a.severity]);

    const existing = D().subscriptionFor(ctx.vendor);
    const incremental = incrementalOf(ctx);

    return {
      ctx,
      insights,
      verdict: verdict(insights),
      // The purchase Ramp would make instead, when there is a better one.
      plan: D().betterBuyFor(ctx),
      summary: {
        incrementalMonthly: incremental,
        annualized: incremental ? incremental * 12 : null,
        existing
      }
    };
  }

  /** Negotiation script, assembled from the ledger rather than templated. */
  function negotiationScript(vendor) {
    const d = D();
    const sub = d.subscriptionFor(vendor);
    const intel = d.intelFor(vendor);
    const hist = d.spendWith(vendor);
    const lines = [];

    lines.push(`Subject: ${d.company.name} — ${vendor} renewal terms`);
    lines.push('');
    lines.push(`Hi — ahead of our ${sub ? sub.renewal : 'upcoming'} renewal I want to align on terms.`);
    lines.push('');
    lines.push('Where we are today:');
    if (sub) {
      lines.push(`• ${sub.plan} plan, ${sub.monthly ? '$' + sub.monthly.toLocaleString() : '—'}/mo on an ${sub.contract} contract.`);
      if (sub.seats) lines.push(`• ${sub.seats} licensed seats, ${sub.activeSeats} active in the last 90 days.`);
    }
    if (hist.count) lines.push(`• $${hist.total.toLocaleString()} paid across ${hist.count} invoices on record.`);
    lines.push('');
    lines.push('What we are asking for:');
    (intel && intel.leverage.length ? intel.leverage : ['Pricing that reflects our actual utilization.'])
      .forEach(l => lines.push(`• ${l}`));
    if (intel && intel.benchmarkNote) {
      lines.push('');
      lines.push(`Market context: ${intel.benchmarkNote}`);
    }
    if (intel && intel.alternativesCovered.length) {
      lines.push(`Alternatives already deployed internally: ${intel.alternativesCovered.join(', ')}.`);
    }
    lines.push('');
    lines.push(`Happy to sign early for the right number.`);
    lines.push(`— ${d.user.name}, ${d.user.title}, ${d.company.name}`);
    return lines.join('\n');
  }

  /**
   * Consolidation memo. Picks the vendor to standardize on from actual usage,
   * not from whichever one happens to be biggest, and treats the purchase on
   * screen as spend to avoid rather than as another line to keep.
   */
  function consolidationMemo(ctx) {
    const d = D();
    const incumbents = d.subscriptions.filter(s => s.category === ctx.category);
    if (!incumbents.length) return 'No existing contracts in this category.';

    // The keeper is the one people actually use; spend breaks a tie.
    const keep = incumbents.slice().sort((a, b) =>
      (b.activeSeats || 0) - (a.activeSeats || 0) || b.monthly - a.monthly)[0];
    const sunset = incumbents.filter(s => s.vendor !== keep.vendor);
    const isNewVendor = !d.subscriptionFor(ctx.vendor);

    const money = n => '$' + Math.round(n).toLocaleString();
    const L = [];

    L.push(`Consolidation proposal — ${ctx.category}`);
    L.push(`Prepared by ${d.user.name} · ${new Date().toISOString().slice(0, 10)}`);
    L.push('');

    const footprint = incumbents.reduce((a, s) => a + s.monthly, 0);
    L.push(`Today: ${incumbents.length} ${plural(incumbents.length, 'contract', 'contracts')}, ${money(footprint)}/mo (${money(footprint * 12)}/yr).`);
    incumbents.forEach(s => L.push(
      `  - ${s.vendor} ${s.plan} — ${money(s.monthly)}/mo` +
      (s.seats ? `, ${s.activeSeats}/${s.seats} seats active` : '') +
      `, renews ${s.renewal} (${s.owner})`));

    if (isNewVendor && ctx.monthly) {
      L.push('');
      L.push(`On the table: ${ctx.vendor}${ctx.plan ? ' ' + ctx.plan : ''} at ${money(ctx.monthly)}/mo (${money(ctx.monthly * 12)}/yr).`);
    }
    L.push('');
    L.push(`Recommendation: standardize on ${keep.vendor} ${keep.plan}.`);

    let recovered = 0;
    if (isNewVendor && ctx.monthly) {
      L.push(`  - Decline ${ctx.vendor}. ${keep.vendor} covers this and is in active use` +
        (keep.seats ? ` (${keep.activeSeats} of ${keep.seats} seats).` : '.'));
      L.push(`    Avoids ${money(ctx.monthly * 12)}/yr of new commitment.`);
      recovered += ctx.monthly * 12;
    }
    sunset.forEach(s => {
      L.push(`  - Sunset ${s.vendor} at ${s.renewal}` +
        (s.seats ? ` — ${s.seats - s.activeSeats} of ${s.seats} seats sat idle.` : '.'));
      L.push(`    Recovers ${money(s.monthly * 12)}/yr.`);
      recovered += s.monthly * 12;
    });
    if (!sunset.length && !isNewVendor) {
      L.push('  - Single vendor in this category already. No consolidation available.');
    }

    if (recovered) {
      L.push('');
      L.push(`Total annualized impact: ${money(recovered)}.`);
    }
    return L.join('\n');
  }

  window.__RAMP_RULES = { analyze, negotiationScript, consolidationMemo, usd };
})();
