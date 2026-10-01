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

/* ---------- the fix Ramp would make ---------- */
.fix {
  padding: 13px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(180deg, rgba(215,252,81,0.07), rgba(215,252,81,0.025));
}
.fix .ftop {
  display: flex; align-items: center; gap: 6px;
  font-size: 10.5px; font-weight: 650; letter-spacing: .09em; text-transform: uppercase;
  color: #D7FC51;
}
.fix .ftop .spacer { flex: 1; }
.fix .status {
  height: 17px; padding: 0 6px; border-radius: 4px;
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 9.5px; font-weight: 700; letter-spacing: .08em;
  background: rgba(255,184,77,0.18); color: #FFC772;
}
.fix .status .sdot {
  width: 5px; height: 5px; border-radius: 99px; background: #FFB84D;
  animation: blink 1.4s ease-in-out infinite;
}
@keyframes blink { 50% { opacity: .25; } }
.fix h3 { margin-top: 7px; font-size: 14.5px; font-weight: 640; letter-spacing: -.012em; }
.fix .why { margin-top: 3px; font-size: 12.5px; color: #93968F; }
.fix .swap {
  margin-top: 10px; display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
}
.fix .was { font-size: 14px; color: #74776F; text-decoration: line-through; }
.fix .arrow { color: #74776F; font-size: 12px; }
.fix .now { font-size: 23px; font-weight: 640; letter-spacing: -.028em; }
.fix .save {
  margin-left: auto; font-size: 11.5px; font-weight: 600; color: #D7FC51;
  font-variant-numeric: tabular-nums;
}
.fix .acts { margin-top: 11px; }
.fix .btn.hero {
  height: 33px; flex: 1; justify-content: center;
  background: #D7FC51; border-color: #D7FC51; color: #14200A;
  font-size: 12.5px; font-weight: 650;
}
.fix .btn.hero:hover { background: #E2FF78; border-color: #E2FF78; }

.steps { margin-top: 10px; display: grid; gap: 6px; }
.steps li { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; list-style: none; }
.steps .sm {
  width: 13px; height: 13px; flex: none; margin-top: 2px;
  border-radius: 99px; display: grid; place-items: center;
  font-size: 8px; font-weight: 800;
}
.steps .sm.done { background: #D7FC51; color: #14200A; }
.steps .sm.wait { border: 1.5px dashed rgba(255,184,77,0.6); }
.steps li.done span:last-child { color: #D4D7CF; }
.steps li.wait span:last-child { color: #93968F; }

/* show-more */
.more {
  width: 100%; height: 34px; border: 0; background: transparent;
  color: #8A8D86; font: inherit; font-size: 12px; font-weight: 550; cursor: pointer;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.more:hover { background: rgba(255,255,255,0.04); color: #F4F5F2; }

/* ---------- invoice ---------- */
.scrim {
  position: fixed; inset: 0; z-index: 10;
  background: rgba(4,5,4,0.62);
  backdrop-filter: blur(2px);
  display: grid; place-items: center;
  animation: fade .16s ease-out;
}
@keyframes fade { from { opacity: 0; } }
.inv {
  width: 430px; max-height: 84vh; overflow-y: auto;
  background: #FBFBF9; color: #16181A;
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.55);
  animation: rise .2s cubic-bezier(.2,.8,.3,1);
}
.inv .ihead {
  padding: 20px 22px 16px;
  border-bottom: 1px solid #E6E8E4;
  display: flex; align-items: flex-start; gap: 10px;
}
.inv .ilogo {
  width: 26px; height: 26px; border-radius: 7px; background: #0B0C0B;
  display: grid; place-items: center; flex: none;
}
.inv .ilogo svg { width: 16px; height: 16px; }
.inv .ititle { font-size: 15px; font-weight: 680; letter-spacing: -.015em; }
.inv .isub { font-size: 11.5px; color: #6B7280; margin-top: 1px; }
.inv .iclose {
  margin-left: auto; width: 24px; height: 24px; border: 0; border-radius: 7px;
  background: transparent; color: #8A8F98; cursor: pointer; display: grid; place-items: center;
}
.inv .iclose:hover { background: #EFF0ED; color: #16181A; }
.inv .imeta {
  padding: 15px 22px; border-bottom: 1px solid #E6E8E4;
  display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; font-size: 12.5px;
}
.inv .imeta dt { color: #6B7280; }
.inv .imeta dd { text-align: right; font-weight: 550; font-variant-numeric: tabular-nums; }
.inv .ipend {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 1px 7px; border-radius: 5px;
  background: #FFF3DC; color: #9A6309;
  font-size: 10.5px; font-weight: 700; letter-spacing: .05em;
}
.inv .ipend.ok { background: #E4F6E6; color: #226B2B; }
.inv .ilines { padding: 15px 22px; border-bottom: 1px solid #E6E8E4; }
.inv .iline { display: flex; align-items: baseline; gap: 12px; padding: 6px 0; }
.inv .iline .l { flex: 1; }
.inv .iline .l b { font-size: 13px; font-weight: 600; display: block; }
.inv .iline .l span { font-size: 11.5px; color: #6B7280; }
.inv .iline .a { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.inv .itotals { padding: 15px 22px; display: grid; gap: 7px; font-size: 12.5px; }
.inv .itot { display: flex; }
.inv .itot .k { flex: 1; color: #6B7280; }
.inv .itot .v { font-weight: 550; font-variant-numeric: tabular-nums; }
.inv .itot.strike .v { color: #9AA0A6; text-decoration: line-through; }
.inv .itot.saved { color: #2F7A33; font-weight: 650; }
.inv .itot.saved .k { color: #2F7A33; }
.inv .itot.grand {
  margin-top: 4px; padding-top: 10px; border-top: 1px solid #E6E8E4;
  font-size: 16px; font-weight: 700; letter-spacing: -.015em;
}
.inv .inote {
  margin: 0 22px 18px; padding: 10px 12px;
  background: #F0F2EE; border-radius: 8px;
  font-size: 11.5px; color: #4B5563; line-height: 1.5;
}
.inv .ifoot {
  padding: 11px 22px; border-top: 1px solid #E6E8E4;
  font-size: 10.5px; color: #9AA0A6;
  display: flex; align-items: center;
}
.inv .ifoot .spacer { flex: 1; }

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
