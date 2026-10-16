/* ---------- Flow 2: Clicking on an Attribute Card ----------
   Option 1 · Side rail: List = columns table, Grid = row cards
   Option 2 · Side rail: List = list + preview, Grid = photo grid
   Option 3 · Tabs:      List = columns table, Grid = photo grid
   Empty state: Option 1 with Solid: Cool colors (0 products) selected
   Flow 2 is for reviewing, so it opens on every product and the rail browses (no checkboxes);
   checkboxes and selection counts are kept for Flow 3, where picking is the job. */

// Option 3 lets people pick several attributes (tabAttrs) and several values ("attr:value" in tabVals)
const CD = { name: "Apparel by Pattern Style", view: "list", sel: new Set(), tabAttrs: new Set(), tabVals: new Set(), dir: 1, peek: null };
const cardOpt = () => App.opt.card === "empty" ? "1" : App.opt.card;
const resetCard = () => {
  useCollection(CD.name);   // load this collection's own attributes and items
  Object.assign(CD, { view: "list", dir: 1, peek: null, editing: false, showVals: true, viewV: null, histOpen: false });
  // Opens on all products; only the Empty state option starts on a value with no products
  CD.sel = new Set(App.opt.card === "empty" ? ["solid:Cool colors"] : []);
  CD.tabAttrs = new Set(App.opt.card === "empty" ? ["solid"] : []); CD.tabVals = new Set(App.opt.card === "empty" ? ["solid:Cool colors"] : []);
};
const attrLabel = a => a.label === "Graphic print" ? "Graphic Print" : a.label;
const valsOf = k => [...CD.tabVals].filter(s => s.startsWith(k + ":"));
const openCard = name => { CD.name = name || CD.name; resetCard(); App.modal = "card"; App.menu = null; };

const sorted = list => [...list].sort((a, b) => a.name.localeCompare(b.name) * CD.dir);
const cardShown = () => {
  if (cardOpt() === "3") {
    // No attribute picked = everything; an attribute with no values picked = all of that attribute's products
    if (!CD.tabAttrs.size) return sorted(COLL_PRODUCTS);
    return sorted(COLL_PRODUCTS.filter(p => CD.tabAttrs.has(p.attr) && (!valsOf(p.attr).length || CD.tabVals.has(p.attr + ":" + p.value))));
  }
  if (!CD.sel.size) return sorted(COLL_PRODUCTS);
  return sorted(COLL_PRODUCTS.filter(p => CD.sel.has(p.attr + ":" + p.value)));
};
const filterName = () => {
  if (cardOpt() === "3") return COLL_ATTRS.filter(a => CD.tabAttrs.has(a.k)).map(a => {
    const v = valsOf(a.k).map(s => s.slice(a.k.length + 1));
    return v.length ? `${a.label}: ${v.join(", ")}` : a.label;
  }).join("; ") || "All";
  return [...CD.sel].map(s => { const [k, v] = s.split(":"); return `${COLL_ATTRS.find(a => a.k === k).label}: ${v}`; }).join(", ");
};

/* ---------- Pieces ---------- */
const cbox = (state, attrs = "") => `<span class="o-cb ${state}" ${attrs}>${state === "on" ? ic.check : state === "some" ? ic.minus : ""}</span>`;
// Rail: tick any number of values to see their products; nothing ticked = every product. The attribute box ticks all its values.
const rail = () => `<aside class="o-rail checks" aria-label="Show products by value"><div class="o-rail-h"><span>Attributes</span>${CD.sel.size ? `<button class="o-clear" data-a="cardClear">Clear</button>` : ""}</div>
  ${COLL_ATTRS.map(a => {
  const vals = Object.entries(a.values), on = vals.filter(([v]) => CD.sel.has(a.k + ":" + v)).length;
  return `<div class="o-rg">
    <button class="o-rrow attr" data-a="railAttr" data-v="${a.k}" role="checkbox" aria-checked="${on === 0 ? "false" : on === vals.length ? "true" : "mixed"}">${cbox(on === 0 ? "" : on === vals.length ? "on" : "some")}<b>${a.label}</b></button>
    ${vals.map(([v, n]) => { const sel = CD.sel.has(a.k + ":" + v); return `<button class="o-rrow${n ? "" : " zero"}" data-a="railVal" data-v="${a.k}:${esc(v)}" role="checkbox" aria-checked="${sel}">${cbox(sel ? "on" : "")}<span>${esc(v)}</span></button>`; }).join("")}
  </div>`;
}).join("")}</aside>`;

// Option 3: attribute tabs are always visible (one at a time); values sit behind a "Values" toggle so the items stay the focus
const tabsBar = () => {
  const k = [...CD.tabAttrs][0], a = COLL_ATTRS.find(x => x.k === k), nv = valsOf(k || "").length;
  const tab = (on, act, v, label, n) => `<button class="o-utab${on ? " on" : ""}" role="tab" aria-selected="${on}" data-a="${act}" data-v="${esc(v)}">${label}<span class="n">${n}</span></button>`;
  const total = x => Object.values(x.values).reduce((s, n) => s + n, 0);
  return `<div class="o-tabsbar v2">
    <div class="o-utabs" role="tablist" aria-label="Attributes">
      ${tab(!a, "tabAll", "all", "All", COLL_PRODUCTS.length)}
      ${COLL_ATTRS.map(x => tab(x.k === k, "tabAttr", x.k, attrLabel(x), total(x))).join("")}
      <span class="sp"></span>
      <button class="o-toggle o-valsw${CD.showVals && a ? " on" : ""}" data-a="tabShowVals" role="switch" aria-checked="${!!(CD.showVals && a)}"${a ? "" : ' aria-disabled="true" aria-describedby="vals-tip"'}><span class="o-knob"></span>Values${nv ? `<span class="o-badge">${nv}</span>` : ""}${a ? "" : `<span class="o-tip" role="tooltip" id="vals-tip">Select an attribute first</span>`}</button>
    </div>
    ${a && CD.showVals ? `<div class="o-vrow" role="group" aria-label="${esc(attrLabel(a))} values">
      ${Object.entries(a.values).map(([v, n]) => { const on = CD.tabVals.has(k + ":" + v); return `<button class="o-tgl${on ? " on" : ""}${n ? "" : " zero"}" data-a="tabVal" data-v="${esc(k + ":" + v)}" role="checkbox" aria-checked="${on}">${cbox(on ? "on" : "")}${esc(v)}</button>`; }).join("")}
      ${nv ? `<button class="o-clear" data-a="tabClearVals">Clear</button>` : ""}
    </div>` : ""}
  </div>`;
};

const pHead = `<div class="o-thd"><button data-a="sortDir">Product ${CD.dir > 0 ? ic.sort : `<span class="flip">${ic.sort}</span>`}</button><span>ID</span></div>`;
const pRow = (p, on = false) => `<div class="o-trw${on ? " on" : ""}" data-a="peek" data-v="${p.id}">${thumb(p, "s36")}<span class="nm">${esc(p.name)}</span><span class="o-id">${p.id}</span></div>`;
const VIEWS2 = {
  columns: list => {
    // Two columns when a side panel (history / use panel) takes room on the right
    const n = CD.histOpen || cardOpt() === "4" ? 2 : 3, rows = Math.ceil(list.length / n);
    return `<div class="o-cols c${n}">${[...Array(n).keys()].map(c => `<div class="o-col">${pHead}${list.slice(c * rows, (c + 1) * rows).map(p => pRow(p)).join("")}</div>`).join("")}</div>`;
  },
  cards: list => `<div class="o-rcards">${list.map(p => `<div class="o-rcard">${thumb(p, "s56")}<div><div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}</div></div></div>`).join("")}</div>`,
  preview: list => {
    const p = list.find(x => x.id === CD.peek) || list.find(x => x.id === "HOD_129") || list[0];
    return `<div class="o-prev"><div class="o-col">${pHead}${list.map(x => pRow(x, x === p)).join("")}</div>
      <div class="o-peek">${p ? `${thumb(p, "s300")}<b>${esc(p.name)}</b><span class="o-id">${p.id}</span>` : ""}</div></div>`;
  },
  grid: list => `<div class="o-pgrid${cardOpt() === "3" ? " six" : ""}">${list.map(p => `<div class="o-pcard">${thumb(p, "sq")}<div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}</div></div>`).join("")}</div>`,
};
const viewName = () => ({ "1": { list: "columns", grid: "cards" }, "2": { list: "preview", grid: "grid" }, "3": { list: "columns", grid: "grid" }, "4": { list: "cards", grid: "grid" } })[cardOpt()][CD.view];

// This screen is for reviewing; the only side action is taking a copy. Updating the collection lives on the homepage card menu.
const exportBtn = () => `<button class="icon-btn" data-a="exportCsv" aria-label="Export as CSV" title="Export as CSV">${ic.exportCsv}</button>`;
/* ---------- Guidance built into the UI ----------
   A step indicator shows this screen is the first step (review), that a study and a preview come next,
   and nothing changes until the end. The facts sit beside it instead of a sentence of instructions. */
const collFacts = () => {
  const c = COLLECTIONS.find(x => x.name === CD.name) || {};
  const vals = COLL_ATTRS.reduce((n, a) => n + Object.keys(a.values).length, 0);
  return { vals, edited: c.edited, v: c.v || "v1", text: `${COLL_ATTRS.length} attributes · ${vals} values · ${COLL_PRODUCTS.length} products${c.edited ? ` · Updated ${c.edited}` : ""}` };
};
const IMPORT_STEPS = ["Review Attributes", "Choose study", "Preview & import"];
// `right` puts a control (e.g. search) on the same row, at the far end
const steps = (at, right = "") => `<div class="o-steps${right ? " with-right" : ""}" aria-label="Import steps">
  <ol>${IMPORT_STEPS.map((l, i) => `<li class="${i < at ? "done" : i === at ? "now" : ""}"${i === at ? ' aria-current="step"' : ""}><span class="o-stepn">${i < at ? ic.check : i + 1}</span>${l}</li>`).join("")}</ol>${right ? `<span class="sp"></span>${right}` : ""}</div>`;
// The main button names what it imports
const ctaBtn = (cls = "") => {
  return `<span class="o-ctawrap ${cls}"><button class="btn primary o-cta" data-a="toStudyPick">${ic.importStudy}Import ${COLL_ATTRS.length} Attributes to Study</button></span>`;
};
// Footer: the collection's size, or how much of it is in view plus a reminder that all of it is imported
const footNote = (n, total) => n < total
  ? `<span class="o-showing">Showing <b>${n} of ${total}</b> products</span>`
  : `<span class="o-showing">${CD.viewV ? collFacts().text.replace(/ · Updated .*/, ` · Saved ${verHistory(curColl()).find(h => h.v === CD.viewV).date}`) : collFacts().text}</span>`;

/* Option 4 · Use panel: browse on the left, a sticky "Use this collection" panel on the right */
const usePanel = () => {
  const f = collFacts(), older = STUDIES.filter(s => s.applied && s.applied !== f.v);
  return `<aside class="o-use" aria-label="Use this collection">
    <div class="o-use-h"><b>Use this collection</b><span>Import its attributes into a study to tag that study’s matching products.</span></div>
    <dl class="o-use-facts"><div><dt>Attributes</dt><dd>${COLL_ATTRS.length}</dd></div><div><dt>Values</dt><dd>${f.vals}</dd></div><div><dt>Products</dt><dd>${COLL_PRODUCTS.length}</dd></div></dl>
    <div class="o-use-sec">What gets imported</div>
    <div class="o-use-chips">${COLL_ATTRS.map(a => `<span class="o-use-chip">${esc(attrLabel(a))}</span>`).join("")}</div>
    ${older.length ? `<div class="o-use-note">${ic.info}<span><b>${older.length} ${older.length === 1 ? "study uses" : "studies use"} an older version.</b> ${older.map(s => `${esc(s.name)} is on ${s.applied}`).join(", ")}; importing again updates it to ${f.v}.</span></div>` : ""}
    <span class="sp"></span>
    ${ctaBtn("block")}
  </aside>`;
};

/* ---------- Versions ----------
   Every update (from a study or a CSV) saves a new version; nothing is overwritten. Studies remember the version
   they imported (STUDIES[].applied), so the menu can say which studies are behind. Opening an older version is
   read-only; "Restore as vN" copies it forward as a new latest version, so every earlier and later version is kept. */
const curColl = () => COLLECTIONS.find(x => x.name === CD.name) || COLLECTIONS[0];
const verHistory = c => c.hist || (c.hist = Array.from({ length: +c.v.slice(1) }, (_, i) => i === 0
  ? { v: "v1", date: c.created, note: "Created from a study", by: "Helen Brooms" }
  : { v: "v" + (i + 1), date: c.edited, note: i % 2 ? "Updated from a CSV" : "Updated from a study", by: "Jamie McArdle" }).reverse());
const nextV = () => "v" + (verHistory(curColl()).length + 1);
const usedBy = v => STUDIES.filter(s => s.applied === v).map(s => s.name);
// Header button: shows the version on screen; opens the History panel on the right of the modal
const verBtn = () => {
  const c = curColl(), shown = CD.viewV || c.v;
  return `<button class="o-histbtn${CD.histOpen ? " on" : ""}${shown !== c.v ? " old" : ""}" data-a="histToggle" aria-pressed="${!!CD.histOpen}" title="Version history">${ic.history}<span>${shown}</span></button>`;
};
/* History panel (Figma / Linear style): "Current version" on top, then "Earlier versions". Each row is one click target
   that opens that version; a ⋯ on hover holds Restore and Export. The open row is filled, like a selected list item. */
const histPanel = () => {
  const c = curColl(), shown = CD.viewV || c.v, [latest, ...older] = verHistory(c);
  const ini = n => n === "You" ? "Y" : n.split(" ").map(w => w[0]).join("").slice(0, 2);
  const row = (h, isLatest) => {
    const u = usedBy(h.v), cur = h.v === shown, mid = "vrow:" + h.v;
    return `<li class="o-vr${cur ? " cur" : ""}">
      <button class="o-vr-main" data-a="verView" data-v="${h.v}" aria-current="${cur}">
        <span class="o-vr-av" title="${esc(h.by)}">${ini(h.by)}</span>
        <span class="o-vr-txt"><b>${esc(h.note)}</b><small>${esc(h.by)} · ${h.date}</small>
          ${u.length ? `<span class="o-vr-used">${ic.studies}${esc(u.join(", "))}</span>` : ""}</span>
        <span class="o-vr-v">${h.v}</span>
      </button>
      <div class="o-dd o-vr-more"><button class="icon-btn${App.menu === mid ? " open" : ""}" data-a="menu" data-v="${mid}" aria-label="More for ${h.v}" title="More">${ic.more}</button>
        ${App.menu === mid ? `<div class="o-menu right" role="menu">
          ${cur ? "" : `<button role="menuitem" data-a="verView" data-v="${h.v}">${ic.eye}View this version</button>`}
          ${isLatest ? "" : `<button role="menuitem" data-a="verRestoreFrom" data-v="${h.v}">${ic.history}Restore as ${nextV()}</button>`}
          <button role="menuitem" data-a="exportCsv">${ic.exportCsv}Export ${h.v} as CSV</button></div>` : ""}</div>
    </li>`;
  };
  return `<aside class="o-hist" aria-label="Version history">
    <div class="o-hist-h"><b>Version history</b><span class="sp"></span><button class="icon-btn" data-a="histToggle" aria-label="Close version history" title="Close">${ic.close}</button></div>
    <div class="o-hist-body">
      <div class="o-hist-sec">Current version</div><ol class="o-vlist">${row(latest, true)}</ol>
      ${older.length ? `<div class="o-hist-sec">Earlier versions</div><ol class="o-vlist">${older.map(h => row(h, false)).join("")}</ol>` : ""}
    </div>
    <p class="o-hist-note">${ic.info}Restoring copies a version forward as a new one. Nothing is deleted.</p>
  </aside>`;
};
ACTIONS.histToggle = () => { CD.histOpen = !CD.histOpen; };
ACTIONS.verRestoreFrom = el => { CD.viewV = el.dataset.v; ACTIONS.verRestore(); };
const oldBar = () => {
  const h = verHistory(curColl()).find(x => x.v === CD.viewV);
  return `<div class="o-oldbar">${ic.history}<span><b>Viewing ${h.v}</b> · ${h.date} · read-only</span></div>`;
};
ACTIONS.verView = el => { const v = el.dataset.v; CD.viewV = v === curColl().v ? null : v; };
ACTIONS.verLatest = () => { CD.viewV = null; };
ACTIONS.verRestore = () => {
  const c = curColl(), from = CD.viewV, v = nextV(), today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  verHistory(c).unshift({ v, date: today, note: `Restored from ${from}`, by: "You" });
  c.v = v; c.edited = today; CD.viewV = null;
  toast(`Restored ${from} as ${v}. All earlier versions are kept.`);
};

/* ---------- Editable title: name + pencil; either one turns the name into an input ---------- */
const cardTitle = () => CD.editing
  ? `<input id="cd-name" class="o-namein o-titlein" data-in="cdName" data-enter="cdNameDone" value="${esc(CD.draft)}" maxlength="80" aria-label="Collection name">`
  : `<button class="o-titlebtn" data-a="cdNameEdit" title="Rename">${esc(CD.name)}</button><button class="icon-btn o-titleedit" data-a="cdNameEdit" aria-label="Rename collection" title="Rename">${ic.pencil}</button>`;
ACTIONS.cdNameEdit = () => { CD.editing = true; CD.draft = CD.name; setTimeout(() => { const i = $("#cd-name"); if (i) { i.focus(); i.select(); } }); };
INPUTS.cdName = el => { CD.draft = el.value; return false; };
// Enter or clicking away saves; Esc (see RENDER.escape) cancels. The homepage card is renamed too.
ACTIONS.cdNameDone = () => {
  if (!CD.editing) return false;
  CD.editing = false;
  const v = CD.draft.trim();
  if (!v || v === CD.name) return;
  const c = COLLECTIONS.find(x => x.name === CD.name); if (c) c.name = v;
  CD.name = v; toast(`Renamed to “${v}”`);
  setTimeout(() => { const b = document.querySelector(".o-titlebtn"); if (b) b.focus(); });
};
document.addEventListener("focusout", e => { if (e.target.id === "cd-name" && CD.editing) { ACTIONS.cdNameDone(); setTimeout(render); } });

const MODAL_CARD = () => {
  const o = cardOpt(), list = cardShown(), total = COLL_PRODUCTS.length;
  const seg = `<div class="o-seg icons" role="radiogroup" aria-label="View"><button class="${CD.view === "grid" ? "on" : ""}" data-a="cardView" data-v="grid" role="radio" aria-checked="${CD.view === "grid"}" title="Grid" aria-label="Grid">${ic.grid}</button><button class="${CD.view === "list" ? "on" : ""}" data-a="cardView" data-v="list" role="radio" aria-checked="${CD.view === "list"}" title="List" aria-label="List">${ic.list}</button></div>`;
  const old = CD.viewV && CD.viewV !== curColl().v;
  const body = list.length ? VIEWS2[viewName()](list)
    : `<div class="o-empty"><b>No products tagged ${esc(filterName())}</b><span>Try another value, or clear your selection to see all ${total} products.</span></div>`;
  return `<div class="o-modal xl" role="dialog" aria-modal="true" aria-label="${esc(CD.name)}">
    <header class="o-mh">
      <button class="icon-btn" data-a="closeModal" aria-label="Back">${ic.back}</button>
      <h2 class="o-crumb">${o === "3" ? "" : `<span>Attribute Collection /</span>`}${cardTitle()}</h2>
      <span class="sp"></span>${verBtn()}${seg}${exportBtn()}
    </header>
    ${old ? oldBar() : steps(0)}
    ${o === "3" ? tabsBar() : ""}
    <div class="o-mb${o === "3" ? "" : " with-rail"}${o === "4" ? " with-use" : ""}">${o === "3" ? "" : rail()}<div class="o-scroll${list.length ? "" : " grey"}${viewName() === "cards" || viewName() === "grid" ? " grey" : ""}">${body}</div>${CD.histOpen ? histPanel() : o === "4" ? usePanel() : ""}</div>
    ${o === "4" && !old && !CD.histOpen ? "" : `<footer class="o-mf">${footNote(list.length, total)}<span class="sp"></span>
      ${old ? `<button class="btn" data-a="verLatest">Back to latest</button><button class="btn primary" data-a="verRestore">${ic.history}Restore as ${nextV()}</button>` : ctaBtn()}</footer>`}
  </div>`;
};

/* ---------- Actions ---------- */
ACTIONS.openCard = el => { setFlow("card"); openCard(COLLECTIONS[+el.dataset.v].name); };
ACTIONS.cardView = el => { CD.view = el.dataset.v; };
ACTIONS.sortDir = () => { CD.dir *= -1; };
ACTIONS.peek = el => { if (viewName() !== "preview") return false; CD.peek = el.dataset.v; };
ACTIONS.railVal = el => { const k = el.dataset.v; CD.sel.has(k) ? CD.sel.delete(k) : CD.sel.add(k); };
ACTIONS.railAttr = el => {
  const a = COLL_ATTRS.find(x => x.k === el.dataset.v), keys = Object.keys(a.values).map(v => a.k + ":" + v);
  const all = keys.every(k => CD.sel.has(k));
  keys.forEach(k => all ? CD.sel.delete(k) : CD.sel.add(k));
};
ACTIONS.tabAll = () => { CD.tabAttrs.clear(); CD.tabVals.clear(); };
// One attribute at a time; switching starts that attribute on all its products
ACTIONS.tabAttr = el => { const k = el.dataset.v; if (CD.tabAttrs.has(k)) return false; CD.tabAttrs = new Set([k]); CD.tabVals.clear(); CD.showVals = true; };
// On "All" the switch is inactive (it only shows a tooltip asking for an attribute)
ACTIONS.tabShowVals = () => { if (!CD.tabAttrs.size) return false; CD.showVals = !CD.showVals; };
ACTIONS.tabVal = el => { const s = el.dataset.v; CD.tabVals.has(s) ? CD.tabVals.delete(s) : CD.tabVals.add(s); };
ACTIONS.tabClearVals = () => { CD.tabVals.clear(); };
ACTIONS.exportCsv = () => { toast(`Exported ${cardShown().length} products as CSV`); return false; };
ACTIONS.csvToCollection = () => { toast("Prototype: this opens the CSV upload for this collection"); };
ACTIONS.updateFromStudy = () => { toast("Prototype: this opens the study picker to update this collection"); };
// "Clear" in the rail / value row: back to every product
ACTIONS.cardClear = () => { CD.sel.clear(); CD.tabAttrs.clear(); CD.tabVals.clear(); };
ACTIONS.closeModal = () => { App.modal = null; };

const cardHover = e => {
  const r = e.target.closest(".o-prev .o-trw"); if (!r || CD.peek === r.dataset.v) return;
  CD.peek = r.dataset.v;
  const p = COLL_PRODUCTS.find(x => x.id === CD.peek), pane = document.querySelector(".o-peek");
  if (p && pane) { pane.innerHTML = `${thumb(p, "s300")}<b>${esc(p.name)}</b><span class="o-id">${p.id}</span>`; document.querySelectorAll(".o-prev .o-trw").forEach(x => x.classList.toggle("on", x === r)); }
};
document.addEventListener("mouseover", cardHover);

JUMP.card = v => {
  if (v) setOpt("card", v);
  App.page = "home"; openCard(CD.name);
  render();
};
