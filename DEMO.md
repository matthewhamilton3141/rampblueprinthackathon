# 45-second demo script

One page. Two scenarios. Datadog only.

## Before you start

- [ ] `python3 -m http.server 8787` running from the repo root
- [ ] `localhost:8787/demo/datadog-upgrade.html` open, **panel already expanded**, scrolled to top
- [ ] The override question **already typed** into the Ask Ramp box, not sent — you just hit Enter
- [ ] Browser zoom at 100%, window wide enough that the panel doesn't cover the page

---

## Scenario 1 — Ramp makes the better purchase (0:00–0:27)

| Time | Say | Do |
|---|---|---|
| **0:00** | "An engineer is upgrading Datadog. Fourteen thousand four hundred a month." | point at the page total |
| **0:05** | "Nobody opened anything. Ramp just showed up." | point at the panel |
| **0:09** | "It read the page. It also read our card ledger. We're over budget — and 49 of those 120 servers haven't sent a metric in 90 days." | |
| **0:16** | "So Ramp buys the tier they asked for. For the 71 servers that still exist." | click **Let Ramp do it instead** |
| **0:21** | *(let the steps tick)* "Card issued, capped, locked to Datadog." | click **View invoice** |
| **0:24** | **"That's a hundred and twenty dollars more than they already pay. Not six thousand. It fits the budget."** | close the invoice |

That bolded line is the whole first half. If you only land one sentence, land that one.

## Scenario 2 — The override (0:27–0:45)

| Time | Say | Do |
|---|---|---|
| **0:27** | "Now the objection every tool like this gets." | hit **Enter** on the pre-typed question |
| **0:31** | "Ramp checks the host tags and backs down — 31 of those dark servers belong to a project that started 18 days ago." | |
| **0:37** | "So it doesn't say no. It says yes, for 90 days, reverting on its own. Routed to Finance." | click **Route the 90-day override** |
| **0:42** | **"Ramp isn't a blocker. It's a negotiator with an expiry date."** | stop |

---

## The pre-typed question

```
the platform sub-team needs all 120 hosts for the Q4 migration project
```

## If you're running long

Cut in this order:

1. The 0:21 line — the steps are self-explanatory on screen
2. The 0:05 line — merge into 0:00
3. The invoice entirely — click **Let Ramp do it instead**, say the $120 line over the pending state, go straight to the override

## If you're running short

Say *"and it works the same on an AWS console or a hotel booking"* and open `demo/index.html`.
Don't start a second scenario you can't finish.

## Questions you'll get

| Question | Answer |
|---|---|
| "Is this real data?" | "Mocked ledger, real engine. The detection, rules and panel are a working extension — point it at datadoghq.com and it reads it." |
| "How does it know 71?" | "The page says 120 provisioned, 71 reporting. Everything else comes from the contract and transactions on file." |
| "Won't engineers hate this?" | That's scenario 2. Show it. |
| "Doesn't a card extension already do this?" | "Those wake up at the checkout field, after the decision. This one is upstream of it." |
