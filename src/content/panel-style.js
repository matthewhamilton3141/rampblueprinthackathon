window.__RAMP_CSS = `
:host { all: initial; }
* { box-sizing: border-box; margin: 0; padding: 0; }

.root {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483000;
  font-family: "Inter", ui-sans-serif, -apple-system, "Segoe UI", system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.45;
  color: #F4F5F2;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "tnum" 1, "cv05" 1;
}

/* ---------- collapsed pill ---------- */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 14px 0 12px;
  background: #0B0C0B;
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 999px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.42), 0 1px 0 rgba(255,255,255,0.05) inset;
  cursor: pointer;
  user-select: none;
  transition: transform .16s cubic-bezier(.2,.8,.3,1), border-color .16s;
}
.pill:hover { transform: translateY(-1px); border-color: rgba(215,252,81,0.5); }
.pill .mark { width: 16px; height: 16px; flex: none; }
.pill .label {
  font-size: 11px; font-weight: 650; letter-spacing: .09em; text-transform: uppercase;
  color: #C9CCC4;
}
.pill .count {
  min-width: 18px; height: 18px; padding: 0 5px;
  display: grid; place-items: center;
  border-radius: 999px;
  font-size: 11px; font-weight: 700; letter-spacing: 0;
}
.count.block { background: #FF6B5A; color: #2A0A06; }
.count.warn  { background: #FFB84D; color: #2A1A04; }
.count.ok    { background: #D7FC51; color: #16200A; }
.pulse { animation: pulse 2.4s ease-in-out infinite; }
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,107,90,0); }
  50%     { box-shadow: 0 0 0 5px rgba(255,107,90,0.16); }
}

/* ---------- expanded card ---------- */
.card {
  width: 384px;
  max-height: min(78vh, 760px);
  display: flex;
  flex-direction: column;
  background: #0B0C0B;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.06) inset;
  overflow: hidden;
  animation: rise .2s cubic-bezier(.2,.8,.3,1);
}
@keyframes rise { from { opacity: 0; transform: translateY(8px) scale(.985); } }

.head {
  display: flex; align-items: center; gap: 8px;
  padding: 13px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.head .mark { width: 15px; height: 15px; flex: none; }
.head .name {
  font-size: 11px; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; color: #C9CCC4;
}
.head .spacer { flex: 1; }
.iconbtn {
  width: 24px; height: 24px; display: grid; place-items: center;
  border: 0; border-radius: 7px; background: transparent; color: #8A8D86;
  cursor: pointer;
}
.iconbtn:hover { background: rgba(255,255,255,0.07); color: #F4F5F2; }

/* context */
.ctx { padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.ctx .vendor {
  display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
}
.ctx .vendor h2 { font-size: 17px; font-weight: 640; letter-spacing: -0.01em; }
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  height: 19px; padding: 0 7px;
  border-radius: 5px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.07);
  font-size: 10.5px; font-weight: 550; letter-spacing: .04em; text-transform: uppercase;
  color: #A8ABA3;
  white-space: nowrap;
}
.amount {
  margin-top: 9px;
  display: flex; align-items: baseline; gap: 7px;
}
.amount .big { font-size: 27px; font-weight: 600; letter-spacing: -0.025em; }
.amount .per { font-size: 12px; color: #8A8D86; }
.amount .ann { font-size: 11.5px; color: #8A8D86; margin-left: 2px; }
.evidence { margin-top: 9px; display: flex; gap: 5px; flex-wrap: wrap; }
.evidence .chip { text-transform: none; letter-spacing: 0; font-size: 10.5px; color: #8A8D86; background: transparent; }

/* verdict */
.verdict {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  font-size: 12.5px; font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.verdict .dot { width: 7px; height: 7px; border-radius: 999px; flex: none; }
.verdict.block { background: rgba(255,107,90,0.1);  color: #FF8F80; }
.verdict.block .dot { background: #FF6B5A; }
.verdict.warn  { background: rgba(255,184,77,0.09); color: #FFC772; }
.verdict.warn .dot { background: #FFB84D; }
.verdict.ok    { background: rgba(215,252,81,0.09); color: #D7FC51; }
.verdict.ok .dot { background: #D7FC51; }
.verdict .sub { margin-left: auto; font-weight: 450; color: #8A8D86; font-size: 11.5px; }

/* insight list */
.list { overflow-y: auto; flex: 1; padding: 4px 0 0; scrollbar-width: thin; }
.list::-webkit-scrollbar { width: 8px; }
.list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; border: 2px solid transparent; background-clip: content-box; }

.insight {
  display: grid; grid-template-columns: 22px 1fr; gap: 10px;
  padding: 13px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.insight:last-child { border-bottom: 0; }
.insight .ico {
  width: 22px; height: 22px; display: grid; place-items: center;
  border-radius: 6px; flex: none; margin-top: 1px;
}
.insight.block .ico { background: rgba(255,107,90,0.14); color: #FF8F80; }
.insight.warn  .ico { background: rgba(255,184,77,0.13); color: #FFC772; }
.insight.info  .ico { background: rgba(255,255,255,0.07); color: #A8ABA3; }
.insight h3 { font-size: 13.5px; font-weight: 620; letter-spacing: -0.005em; }
.insight p {
  margin-top: 4px; font-size: 12.5px; color: #93968F; white-space: pre-line;
}

/* budget meter */
.meter { margin-top: 10px; }
.meter .bar {
  height: 6px; border-radius: 99px; background: rgba(255,255,255,0.08);
  display: flex; overflow: hidden;
}
.meter .used { background: #6E7268; }
.meter .add  { background: #D7FC51; }
.meter .add.over { background: #FF6B5A; }
.meter .legend {
  margin-top: 6px; display: flex; gap: 10px; flex-wrap: wrap;
  font-size: 10.5px; color: #7E817A;
}
.meter .legend b { color: #C9CCC4; font-weight: 550; }

/* actions */
.acts { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
.btn {
  height: 27px; padding: 0 10px;
  display: inline-flex; align-items: center; gap: 5px;
  border-radius: 7px; border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.045); color: #E7E9E4;
  font: inherit; font-size: 12px; font-weight: 550;
  cursor: pointer; white-space: nowrap;
  transition: background .13s, border-color .13s, transform .13s;
}
.btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.24); }
.btn:active { transform: scale(.975); }
.btn.primary {
  background: #D7FC51; border-color: #D7FC51; color: #14200A; font-weight: 620;
}
.btn.primary:hover { background: #E2FF78; border-color: #E2FF78; }
.btn[disabled] { opacity: .5; cursor: default; }

/* action result slab */
.result {
  margin-top: 10px; padding: 11px;
  border-radius: 9px;
  background: rgba(215,252,81,0.055);
  border: 1px solid rgba(215,252,81,0.22);
  animation: rise .18s ease-out;
}
.result .rtitle {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 650; letter-spacing: .07em; text-transform: uppercase; color: #D7FC51;
}
.result dl { margin-top: 8px; display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; font-size: 12px; }
.result dt { color: #8A8D86; }
.result dd { color: #F4F5F2; text-align: right; font-variant-numeric: tabular-nums; }
.result .mono {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  letter-spacing: .04em;
}
.result pre {
  margin-top: 8px; max-height: 190px; overflow: auto;
  padding: 9px; border-radius: 7px;
  background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.07);
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px; line-height: 1.55; color: #D4D7CF; white-space: pre-wrap;
}
.result .rfoot { margin-top: 8px; display: flex; gap: 6px; }

/* footer */
.foot {
  padding: 9px 14px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; gap: 7px;
  font-size: 10.5px; color: #6E726A;
}
.foot .live { width: 5px; height: 5px; border-radius: 99px; background: #D7FC51; flex: none; }
.foot .spacer { flex: 1; }
.foot a { color: #8A8D86; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.14); }
.foot a:hover { color: #D7FC51; }

.toast {
  /* sits above whatever the root currently holds, pill or card */
  position: absolute; right: 0; bottom: 100%; margin-bottom: 10px;
  white-space: nowrap;
  padding: 9px 13px; border-radius: 9px;
  background: #D7FC51; color: #14200A;
  font-size: 12px; font-weight: 620;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  animation: rise .18s ease-out;
}
`;
