/* ---------- Collagia Attributes prototype · Oct 17 ----------
   One live app. The dark bar on top is the prototype's own navigation: it jumps between the
   steps of the customer journey. No iframes: every screen is rendered into this document. */

const store = {
  get: (k, d) => { try { const v = localStorage.getItem("o17:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem("o17:" + k, JSON.stringify(v)); } catch {} },
};
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const $ = s => document.querySelector(s);

/* ---------- Icons ---------- */
const sv = (d, extra = "") => `<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ic = {
  back: sv('<path d="M10 3.5 5.5 8l4.5 4.5"/>'),
  chev: sv('<path d="m4.5 6.5 3.5 3.5 3.5-3.5"/>'),
  chevR: sv('<path d="m6.5 4.5 3.5 3.5-3.5 3.5"/>'),
  sort: sv('<path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7"/>'),
  close: sv('<path d="m4 4 8 8M12 4l-8 8"/>'),
  check: sv('<path d="m3.5 8.5 3 3 6-7"/>', 'stroke-width="2"'),
  minus: sv('<path d="M4 8h8"/>', 'stroke-width="2"'),
  plus: sv('<path d="M8 3v10M3 8h10"/>', 'stroke-width="1.8"'),
  grid: sv('<rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" fill="currentColor" stroke="none"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1" fill="currentColor" stroke="none"/>'),
  list: sv('<rect x="2" y="3" width="12" height="4" rx="1" fill="currentColor" stroke="none"/><path d="M2.5 10.5h11M2.5 13h11"/>'),
  importStudy: sv('<rect x="2" y="2.5" width="12" height="7" rx="1"/><path d="M5 7.5V6M8 7.5V5M11 7.5V4.5M8 10.5v4M6 12.5l2 2 2-2"/>'),
  csv: sv('<path d="M4 1.5h5.5L13 5v9.5H4z"/><path d="M9.5 1.5V5H13"/><path d="M6 8.5h5M6 11h5"/>'),
  exportCsv: sv('<path d="M2.5 9.5v4h11v-4"/><path d="M8 2v8M5 7l3 3 3-3"/>'),
  search: sv('<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/>'),
  info: sv('<circle cx="8" cy="8" r="6.25"/><path d="M8 7.25V11"/><circle cx="8" cy="5" r=".8" fill="currentColor" stroke="none"/>', 'stroke-width="1.4"'),
  pencil: sv('<path d="M10.5 2.5 13.5 5.5 6 13H3v-3z"/>', 'stroke-width="1.4"'),
  eye: sv('<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2" fill="currentColor" stroke="none"/>', 'stroke-width="1.4"'),
  send: sv('<path d="M14 2 7 9M14 2l-4.5 12L7 9 2 6.5z"/>', 'stroke-width="1.4"'),
  share: sv('<path d="M9.5 2.5h4v4M13.5 2.5 8 8M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3"/>'),
  user: sv('<circle cx="8" cy="5.5" r="2.8" fill="currentColor" stroke="none"/><path d="M2.5 14a5.5 5.5 0 0 1 11 0z" fill="currentColor" stroke="none"/>'),
  admin: sv('<circle cx="8" cy="8" r="6"/><circle cx="8" cy="7" r="2"/><path d="M4.5 12.3a4 4 0 0 1 7 0"/>', 'stroke-width="1.4"'),
  trash: sv('<path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9"/>', 'stroke-width="1.4"'),
  more: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="7.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="16.5" r="1.4"/></svg>',
  open: sv('<path d="M2.5 8S5 3.5 8 3.5 13.5 8 13.5 8 11 12.5 8 12.5 2.5 8 2.5 8z"/><circle cx="8" cy="8" r="1.8"/>', 'stroke-width="1.4"'),
  people: sv('<circle cx="6" cy="5.5" r="2.3"/><path d="M1.8 13.5a4.2 4.2 0 0 1 8.4 0M10.5 3.4a2.3 2.3 0 0 1 0 4.4M12 9.6a4.2 4.2 0 0 1 2.2 3.9"/>', 'stroke-width="1.4"'),
  upload: '<svg class="i" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 10.5h1.5V4.31l2.22 2.22 1.06-1.06L8 1.44 3.97 5.47l1.06 1.06 2.22-2.22zM2 10h1.5v2.5h9V10H14v4H2z"/></svg>',
  studies: sv('<path d="M6 2h4M6.5 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9.5 6V2"/>', 'stroke-width="1.4"'),
  clock: sv('<circle cx="8" cy="8" r="6.25"/><path d="M8 4.75V8l2.25 1.5"/>', 'stroke-width="1.4"'),
  history: sv('<path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9"/><path d="M2.5 2.5v2.75h2.75M8 5v3l2 1.25"/>'),
  arrowR: sv('<path d="M3 8h9.5M9 4.5 12.5 8 9 11.5"/>'),
  arrowL: sv('<path d="M13 8H3.5M7 4.5 3.5 8 7 11.5"/>'),
  swap: sv('<path d="M3 5.5h9M9.5 3 12 5.5 9.5 8M13 10.5H4M6.5 8 4 10.5 6.5 13"/>'),
  tag: sv('<path d="M2 2.5h5.5L14 9l-5 5-6.5-6.5z"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/>'),
  box: sv('<path d="M8 1.75 14 5v6l-6 3.25L2 11V5z"/><path d="M2 5l6 3.25L14 5M8 8.25v6"/>'),
  sortI: sv('<path d="M4.5 3v10M2.5 11l2 2 2-2M11.5 13V3M9.5 5l2-2 2 2"/>'),
  lock: sv('<rect x="3.5" y="7" width="9" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>', 'stroke-width="1.4"'),
  warn: sv('<path d="M8 2.5 14 13H2z"/><path d="M8 6.5v3M8 11.5v.5"/>', 'stroke-width="1.4"'),
  download: sv('<path d="M8 2v8M5 7l3 3 3-3M2.5 11.5v2h11v-2"/>'),
  table: sv('<rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 7h12M6.5 3v10"/>', 'stroke-width="1.4"'),
  filter: sv('<path d="M2 3.5h12L9.5 9v4l-3 1.5V9z"/>', 'stroke-width="1.4"'),
  group: sv('<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>', 'stroke-width="1.4"'),
  select: sv('<path d="M3 2l9 5-4 1.2L6.8 12z" fill="currentColor" stroke="none"/>'),
  frame: sv('<path d="M2.5 5.5v-3h3M10.5 2.5h3v3M13.5 10.5v3h-3M5.5 13.5h-3v-3"/>', 'stroke-width="1.4"'),
  chart: sv('<path d="M3 13V8M8 13V3M13 13V6"/>', 'stroke-width="2.2"'),
  collage: sv('<rect x="2" y="2" width="5" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="9" y="2" width="5" height="4" rx="1" fill="currentColor" stroke="none"/><rect x="2" y="11" width="5" height="3" rx="1" fill="currentColor" stroke="none"/><rect x="9" y="8" width="5" height="6" rx="1" fill="currentColor" stroke="none"/>'),
};

/* ---------- Toast ---------- */
let toastTimer, toastUndo = null;
const toast = (msg, undo) => {
  const t = $("#toast");
  toastUndo = undo || null;
  t.innerHTML = esc(msg) + (undo ? ` <button class="toast-undo" data-a="undo">Undo</button>` : "");
  t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; toastUndo = null; }, undo ? 6000 : 2800);
};

/* ---------- The journey, and the floating guide that hosts it ---------- */
const FLOWS = [
  { id: "board", label: "Study board", hint: "Where attributes are made" },
  { id: "home", label: "Attributes", hint: "The page being redesigned" },
  { id: "create", label: "New collection", hint: "Save a study's attributes" },
  { id: "card", label: "Inside a collection", hint: "What it holds, who has it" },
  { id: "compare", label: "Compare with a study", hint: "Optional, before applying", subs: [["changes", "Changes + removals"], ["noshared", "No shared products"], ["loading", "Loading"], ["error", "Error"], ["noattrs", "No attributes"], ["many", "Many studies"], ["search", "Search a product"]] },
  { id: "edge", label: "Collection edge states", hint: "Empty, partial and missing data", subs: [["nomatch", "No match"], ["novalue", "No value"], ["single", "One product"], ["nophotos", "Photos loading"], ["empty", "No products"]] },
  { id: "study", label: "Apply to a study", hint: "Preview, then replace", subs: [["pick", "Choose a study"], ["done", "Applied"]] },
  { id: "access", label: "Share", hint: "Private until shared" },
  { id: "settings", label: "Settings", hint: "Profile, security, access" },
];
const flowById = id => FLOWS.find(f => f.id === id);
const App = { flow: "board", page: "board", modal: null, menu: null, menuAt: null, zoom: 1 };
/* Screen sizes: the layout is designed at 1440px. Above 1600px the whole interface scales up with the screen
   (up to 4×) so it keeps its proportions. Viewport units and anything positioned from a measurement go through
   --vh100 / --vw100 and uz(), because CSS zoom multiplies them too. */
const uz = () => App.zoom || 1;
const fitUI = () => {
  const z = Math.min(4, Math.max(1, innerWidth / 1600)), root = document.documentElement;
  App.zoom = z; root.style.zoom = z === 1 ? "" : String(z);
  root.style.setProperty("--vh100", innerHeight / z + "px"); root.style.setProperty("--vw100", innerWidth / z + "px");
};
fitUI(); addEventListener("resize", fitUI);
const setFlow = id => { App.flow = id; };
const G = { open: store.get("guideOpen", false) };

const ACTIONS = {}, INPUTS = {}, RENDER = {}, JUMP = {};

RENDER.guide = () => {
  const el = $("#o-guide"); if (!el) return;
  if (!G.open) { el.innerHTML = `<button class="g-pill" data-a="guideToggle" title="Open the prototype guide (⌘K or ⌘J)">${ic.info}Guide<kbd>⌘K</kbd></button>`; return; }
  el.innerHTML = `<aside class="g-card" aria-label="Prototype guide">
    <div class="g-h"><b>Prototype guide</b><span class="sp"></span><kbd>⌘K</kbd><button class="icon-btn" data-a="guideToggle" aria-label="Minimise">${ic.minus}</button></div>
    <ol class="g-steps">${FLOWS.map((f, i) => `<li><button class="${App.flow === f.id ? "on" : ""}" data-a="flow" data-v="${f.id}"><span class="g-n">${i + 1}</span><span class="g-t"><b>${f.label}</b><small>${f.hint}</small></span></button>${f.subs && App.flow === f.id ? `<div class="g-subs">${f.subs.map(([v, l]) => `<button data-a="guideSub" data-v="${f.id}|${v}">${l}</button>`).join("")}</div>` : ""}</li>`).join("")}</ol>
    <div class="g-f"><button class="btn primary" data-a="guideTour">${ic.open}Take the tour</button><span class="g-note">Click a step to jump there. The tour explains each screen.</span></div>
  </aside>`;
};
ACTIONS.guideSub = el => { const [f, v] = el.dataset.v.split("|"); setFlow(f); JUMP[f](v); return false; };
ACTIONS.guideToggle = () => { G.open = !G.open; store.set("guideOpen", G.open); };
ACTIONS.guideTour = () => { if (window.PrototypeTour) { G.open = false; store.set("guideOpen", false); PrototypeTour.start(0); } return true; };
// ⌘K toggles the guide; ⌘J does too, for browsers where an extension already owns ⌘K
document.addEventListener("keydown", e => { if ((e.metaKey || e.ctrlKey) && ["k", "j"].includes(e.key.toLowerCase())) { e.preventDefault(); e.stopPropagation(); G.open = !G.open; store.set("guideOpen", G.open); render(); } }, true);

const render = () => {
  const ae = document.activeElement, fid = ae && ae.id && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA") ? ae.id : null;
  const pos = fid ? ae.selectionStart : null;
  RENDER.guide();
  $("#app").hidden = App.page === "board";
  document.body.classList.toggle("on-board", App.page === "board");
  $("#board").hidden = App.page !== "board";
  if (App.page === "board") RENDER.board(); else if (App.page === "studies") RENDER.studies(); else if (App.page === "settings") RENDER.settings(); else RENDER.home();
  RENDER.modal();
  RENDER.float();
  if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch {} } }
};

ACTIONS.flow = el => { setFlow(el.dataset.v); JUMP[el.dataset.v](null); };

/* One menu open at a time */
ACTIONS.menu = el => {
  const id = el.dataset.v;
  App.menu = App.menu === id ? null : id;
  const r = el.getBoundingClientRect(), z = uz();
  App.menuAt = { left: r.left / z, right: r.right / z, top: r.top / z, bottom: r.bottom / z };
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]");
  const inMenu = e.target.closest(".o-menu");
  let dirty = false;
  if (App.menu && !(el && el.dataset.a === "menu") && (!inMenu || (el && !el.closest("[data-keep]")))) { App.menu = null; dirty = true; }
  if (el && !el.disabled && ACTIONS[el.dataset.a]) {
    if (el.tagName === "A") e.preventDefault();
    if (ACTIONS[el.dataset.a](el, e) !== false) dirty = true;
  }
  if (dirty) render();
});
addEventListener("resize", () => { if (App.menu) { App.menu = null; render(); } });
document.addEventListener("input", e => {
  const k = e.target.dataset && e.target.dataset.in; if (!k || !INPUTS[k]) return;
  if (INPUTS[k](e.target, e) !== false) render();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (App.menu) { App.menu = null; render(); return; }
    if (RENDER.escape && RENDER.escape()) render();
    return;
  }
  if (e.key === "Enter" && e.target.dataset && e.target.dataset.enter) {
    e.preventDefault();
    const fn = ACTIONS[e.target.dataset.enter]; if (fn && fn(e.target, e) !== false) render();
  }
});
ACTIONS.undo = () => { const fn = toastUndo; toastUndo = null; $("#toast").hidden = true; if (fn) fn(); };
