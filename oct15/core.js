/* ---------- Collagia prototype · Oct 15 ----------
   Built from Figma "🖼️ Collagia - App" › Phase 3: Attributes Portal - v1 (node 4316:626).
   One live app; the dark bar on top jumps between the Figma flows and their options. */

const store = {
  get: (k, d) => { try { const v = localStorage.getItem("o15:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem("o15:" + k, JSON.stringify(v)); } catch {} },
};
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const $ = s => document.querySelector(s);

/* ---------- Icons ---------- */
const sv = (d, extra = "") => `<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ic = {
  back: sv('<path d="M10 3.5 5.5 8l4.5 4.5"/>'),
  chev: sv('<path d="m4.5 6.5 3.5 3.5 3.5-3.5"/>'),
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
  tag: sv('<path d="M2 2.5h5.5L14 9l-5 5-6.5-6.5z"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/>'),
  box: sv('<path d="M8 1.75 14 5v6l-6 3.25L2 11V5z"/><path d="M2 5l6 3.25L14 5M8 8.25v6"/>'),
  sortI: sv('<path d="M4.5 3v10M2.5 11l2 2 2-2M11.5 13V3M9.5 5l2-2 2 2"/>'),
};

/* ---------- Toast ---------- */
let toastTimer;
// Optional undo: the toast shows an Undo button and stays up a little longer
let toastUndo = null;
const toast = (msg, undo) => {
  const t = $("#toast");
  toastUndo = undo || null;
  t.innerHTML = esc(msg) + (undo ? ` <button class="toast-undo" data-a="undo">Undo</button>` : "");
  t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; toastUndo = null; }, undo ? 6000 : 2600);
};

/* ---------- Flows (one per Figma column) and their options ---------- */
// Ordered as the customer journey: land on Attributes → create a collection → review it → import it to a study → share it.
// The Collage Board is a separate way in, so it comes last. `figma` keeps the Figma column name for reference.
const FLOWS = [
  { id: "home", label: "Attributes Homepage", figma: "Flow 1: Attributes Homepage",
    opts: { "1": "Option 1 · Collection cards", emptyA: "Option 2 · Empty, preview cards", emptyB: "Option 3 · Empty, + New menu" } },
  { id: "create", label: "Create a Collection", figma: "Flow 3: Creating a new Attribute Collection",
    opts: { i3: "Option 1 · Side rail", i4: "Option 2 · Header dropdowns", i5: "Option 3 · Filter bar", chips: "Option 4 · Chips", i7: "Option 5 · Attribute multi-select" } },
  { id: "card", label: "Review a Collection", figma: "Flow 2: Clicking on an Attribute Card",
    opts: { "1": "Option 1 · Side rail", "2": "Option 2 · Rail + preview", "3": "Option 3 · Tabs", "4": "Option 4 · Use panel" } },
  { id: "study", label: "Import to a Study", figma: "Flow 4: Adding Attributes to a Study",
    opts: { pick: "Choose a study", p1: "Preview · Option 1 · Impact summary", p3: "Preview · Option 2 · Review by tabs", p4: "Preview · Option 3 · Summary list", p5: "Preview · Option 4 · Attribute cards", p6: "Preview · Option 5 · Drill-in review", done: "Imported" } },
  { id: "access", label: "Share & Access", figma: "Flow 1: Access Management",
    opts: { "2": "Option 1 · Share", "3": "Option 2 · Side panel", "4": "Option 3 · Roles explained", "5": "Option 4 · Floating panel", "6": "Option 5 · Requests & activity" } },
  { id: "board", label: "Collage Board", figma: "Flow 1: Collage Board",
    opts: { board: "Option 1 · Board", tag: "Option 2 · New attribute on the board" } },
];
const flowById = id => FLOWS.find(f => f.id === id);

/* Recommended option per step (UX rationale in the chat log):
   Create · Iteration 3: every attribute and value visible at once with checkboxes, the clearest way to choose.
   Review · Option 1: items take the space, the rail ticks values, one main action.
   Import · Step 1 then Summary list: pick a study first; the preview leads with totals and opens per attribute.
   Share · Option 6: people, pending invites, requests and history in one modal. */
const BEST = { home: "1", create: "i3", card: "1", study: "pick", access: "6", board: "board" };
const BEST_PILLS = new Set(["home:1", "create:i3", "card:1", "study:pick", "study:p4", "access:6"]);
const App = {
  flow: "home",     // every visit starts on the Attributes homepage
  opt: { ...BEST },   // every visit starts each step on its recommended option
  previewIter: "4",
  page: "home",    // home | board
  modal: null,     // card | access | chooser | create | chips | studyPick | import
};

// A saved option that no longer exists (e.g. Flow 2 · Option 4 moved to Flow 3) falls back to the first one
FLOWS.forEach(f => { if (!(App.opt[f.id] in f.opts)) App.opt[f.id] = Object.keys(f.opts)[0]; });
const setOpt = (flow, v) => { App.opt[flow] = v; store.set("opt", App.opt); };
const setFlow = id => { App.flow = id; store.set("flow", id); };

/* ---------- Actions: any element with data-a="name" runs ACTIONS[name] ---------- */
const ACTIONS = {}, INPUTS = {}, RENDER = {}, JUMP = {};

// Top row = the customer journey: numbered steps joined by arrows (earlier steps show a check), then the board as a separate way in
const JOURNEY = ["home", "create", "card", "study", "access"];
const journey = () => {
  const at = JOURNEY.indexOf(App.flow);
  const step = (x, i) => { const on = x.id === App.flow, done = at > i;
    return `<button role="tab" aria-selected="${on}" class="${on ? "on" : ""}${done ? " done" : ""}" data-a="flow" data-v="${x.id}"><span>${done ? ic.check : i + 1}</span>${x.label}</button>`; };
  const steps = JOURNEY.map((id, i) => step(flowById(id), i)).join(`<i class="o-jsep" aria-hidden="true">${ic.chev}</i>`);
  const b = flowById("board");
  return `${steps}<span class="o-jdiv" aria-hidden="true"></span><span class="o-jalso">Also</span>
    <button role="tab" aria-selected="${App.flow === "board"}" class="o-jside${App.flow === "board" ? " on" : ""}" data-a="flow" data-v="board">${typeof SB !== "undefined" ? SB.collages : ""}${b.label}</button>`;
};
const renderNav = () => {
  const f = flowById(App.flow);
  const active = RENDER.navActive ? RENDER.navActive() : App.opt[App.flow];
  $("#o-nav").innerHTML = `
    <div class="o-brand"><b>Collagia</b><span>Prototype · Oct 15</span></div>
    <div class="o-tabs o-journey" role="tablist" aria-label="Customer journey">${journey()}</div>`;
  $("#o-opts").innerHTML = `
    <span class="o-olab" title="${esc(f.figma)}">${f.id === "study" ? "Screens" : "Options"}</span>
    <div class="o-pills">${Object.entries(f.opts).map(([k, l]) =>
      `<button class="${k === active ? "on" : ""}" data-a="opt" data-v="${k}">${esc(l)}${BEST_PILLS.has(f.id + ":" + k) ? `<span class="o-best" title="Recommended">Best</span>` : ""}</button>`).join("")}</div>`;
  // Long option lists scroll sideways; keep the current one visible
  const on = $("#o-opts .on"); if (on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
};

const render = () => {
  // Keep focus and caret in a text field across re-renders
  const ae = document.activeElement, fid = ae && ae.id && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA") ? ae.id : null;
  const pos = fid ? ae.selectionStart : null;
  renderNav();
  // "studies" shares the app shell with the Attributes homepage; the sidebar marks which one is open
  $("#app").hidden = App.page === "board";
  $("#board").hidden = App.page !== "board";
  if (App.page === "board") RENDER.board(); else if (App.page === "studies") RENDER.studies(); else RENDER.home();
  RENDER.modal();
  RENDER.float();
  if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch {} } }
};

ACTIONS.flow = el => { setFlow(el.dataset.v); JUMP[el.dataset.v](null); };
ACTIONS.opt = el => { JUMP[App.flow](el.dataset.v); };

// One menu can be open at a time (App.menu = its id). A click outside it, or on one of its items, closes it.
App.menu = null; App.menuAt = null;
ACTIONS.menu = el => {
  const id = el.dataset.v;
  App.menu = App.menu === id ? null : id;
  const r = el.getBoundingClientRect();
  App.menuAt = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
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
