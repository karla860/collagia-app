/* ---------- Flow 2: Clicking on an Attribute Card ----------
   Option 1 · Side rail: List = columns table, Grid = row cards
   Option 2 · Side rail: List = list + preview, Grid = photo grid
   Option 3 · Tabs:      List = columns table, Grid = photo grid
   Empty state: Option 1 with Solid: Cool colors (0 products) selected */

// Option 3 lets people pick several attributes (tabAttrs) and several values ("attr:value" in tabVals)
const CD = { name: "Apparel by Pattern Style", view: "list", sel: new Set(), tabAttrs: new Set(), tabVals: new Set(), dir: 1, peek: null };
const cardOpt = () => App.opt.card === "empty" ? "1" : App.opt.card;
const resetCard = () => {
  Object.assign(CD, { view: "list", dir: 1, peek: null, editing: false });
  CD.sel = new Set([App.opt.card === "empty" ? "solid:Cool colors" : "solid:Warm colors"]);
  CD.tabAttrs = new Set(["solid"]); CD.tabVals = new Set(["solid:Warm colors"]);
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
const rail = () => `<aside class="o-rail"><div class="o-rail-h">Attributes</div>${COLL_ATTRS.map(a => {
  const vals = Object.entries(a.values), on = vals.filter(([v]) => CD.sel.has(a.k + ":" + v)).length;
  const total = vals.reduce((s, [, n]) => s + n, 0);
  return `<div class="o-rg">
    <button class="o-rrow attr" data-a="railAttr" data-v="${a.k}">${cbox(on === 0 ? "" : on === vals.length ? "on" : "some")}<b>${a.label}</b><span class="n">${total}</span></button>
    ${vals.map(([v, n]) => `<button class="o-rrow${n ? "" : " zero"}" data-a="railVal" data-v="${a.k}:${esc(v)}">${cbox(CD.sel.has(a.k + ":" + v) ? "on" : "")}<span>${esc(v)}</span><span class="n">${n}</span></button>`).join("")}
  </div>`;
}).join("")}</aside>`;

// Chips toggle on and off; selected ones show a check so it reads as multi-select
const tabsBar = () => {
  const picked = COLL_ATTRS.filter(a => CD.tabAttrs.has(a.k));
  const chip = (on, act, v, label, extra = "") => `<button class="o-chip${on ? " dark" : ""}" data-a="${act}" data-v="${esc(v)}" aria-pressed="${on}">${on ? ic.check : ""}${label}${extra}</button>`;
  return `<div class="o-tabsbar">
    <div class="o-trow"><span class="o-tlab">Attributes</span>
      ${chip(!CD.tabAttrs.size, "tabAll", "all", "All")}
      ${COLL_ATTRS.map(a => { const n = valsOf(a.k).length; return chip(CD.tabAttrs.has(a.k), "tabAttr", a.k, attrLabel(a), n ? `<span class="n">${n}</span>` : ""); }).join("")}</div>
    ${picked.length ? `<div class="o-trow"><span class="o-tlab">Values</span>
      ${picked.map(a => `<span class="o-vgroup">${picked.length > 1 ? `<span class="o-vgl">${attrLabel(a)}</span>` : ""}${Object.entries(a.values).map(([v, n]) =>
        chip(CD.tabVals.has(a.k + ":" + v), "tabVal", a.k + ":" + v, esc(v), `<span class="n">${n}</span>`)).join("")}</span>`).join("")}
      ${CD.tabVals.size ? `<button class="o-clear" data-a="tabClearVals">Clear values</button>` : ""}</div>` : ""}
  </div>`;
};

const pHead = `<div class="o-thd"><button data-a="sortDir">Product ${CD.dir > 0 ? ic.sort : `<span class="flip">${ic.sort}</span>`}</button><span>ID</span></div>`;
const pRow = (p, on = false) => `<div class="o-trw${on ? " on" : ""}" data-a="peek" data-v="${p.id}">${thumb(p, "s36")}<span class="nm">${esc(p.name)}</span><span class="o-id">${p.id}</span></div>`;
const VIEWS2 = {
  columns: list => {
    const rows = Math.ceil(list.length / 3);
    return `<div class="o-cols">${[0, 1, 2].map(c => `<div class="o-col">${pHead}${list.slice(c * rows, (c + 1) * rows).map(pRow).join("")}</div>`).join("")}</div>`;
  },
  cards: list => `<div class="o-rcards">${list.map(p => `<div class="o-rcard">${thumb(p, "s56")}<div><div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}</div></div></div>`).join("")}</div>`,
  preview: list => {
    const p = list.find(x => x.id === CD.peek) || list.find(x => x.id === "HOD_129") || list[0];
    return `<div class="o-prev"><div class="o-col">${pHead}${list.map(x => pRow(x, x === p)).join("")}</div>
      <div class="o-peek">${p ? `${thumb(p, "s300")}<b>${esc(p.name)}</b><span class="o-id">${p.id}</span>` : ""}</div></div>`;
  },
  grid: list => `<div class="o-pgrid${cardOpt() === "3" ? " six" : ""}">${list.map(p => `<div class="o-pcard">${thumb(p, "sq")}<div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}</div></div>`).join("")}</div>`,
};
const viewName = () => ({ "1": { list: "columns", grid: "cards" }, "2": { list: "preview", grid: "grid" }, "3": { list: "columns", grid: "grid" } })[cardOpt()][CD.view];

const importMenu = () => `<div class="o-dd">
  <button class="o-select w156${App.menu === "import" ? " open" : ""}" data-a="menu" data-v="import" aria-haspopup="menu">Import${ic.chev}</button>
  ${App.menu === "import" ? `<div class="o-menu right" role="menu">
    <button role="menuitem" data-a="toStudyPick">${ic.importStudy}Attributes to Study</button>
    <button role="menuitem" data-a="csvToCollection">${ic.csv}Attributes from CSV</button>
  </div>` : ""}</div>`;

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
  const seg = `<div class="o-seg"><button class="${CD.view === "grid" ? "on" : ""}" data-a="cardView" data-v="grid">${ic.grid}Grid</button><button class="${CD.view === "list" ? "on" : ""}" data-a="cardView" data-v="list">${ic.list}List</button></div>`;
  const exportBtn = `<button class="btn" data-a="exportCsv">${ic.exportCsv}Export as CSV</button>`;
  const body = list.length ? VIEWS2[viewName()](list)
    : `<div class="o-empty"><b>No products tagged ${esc(filterName())}</b><span>Try another value, or clear the filters to see all ${total} products.</span></div>`;
  return `<div class="o-modal xl" role="dialog" aria-modal="true" aria-label="${esc(CD.name)}">
    <header class="o-mh">
      <button class="icon-btn" data-a="closeModal" aria-label="Back">${ic.back}</button>
      <h2 class="o-crumb">${o === "3" ? "" : `<span>Attribute Collection /</span>`}${cardTitle()}</h2>
      <span class="sp"></span>${seg}${importMenu()}${o === "3" ? exportBtn : ""}
    </header>
    ${o === "3" ? tabsBar() : ""}
    <div class="o-mb${o === "3" ? "" : " with-rail"}">${o === "3" ? "" : rail()}<div class="o-scroll${list.length ? "" : " grey"}${viewName() === "cards" || viewName() === "grid" ? " grey" : ""}">${body}</div></div>
    <footer class="o-mf"><span class="o-showing">Showing <b>${list.length} of ${total}</b> products</span><span class="sp"></span>${o === "3" ? "" : exportBtn}<button class="btn primary" data-a="newCollection">${ic.plus}New Attribute Collection</button></footer>
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
ACTIONS.tabAttr = el => {
  const k = el.dataset.v;
  if (CD.tabAttrs.has(k)) { CD.tabAttrs.delete(k); valsOf(k).forEach(s => CD.tabVals.delete(s)); }
  else CD.tabAttrs.add(k);
};
ACTIONS.tabVal = el => { const s = el.dataset.v; CD.tabVals.has(s) ? CD.tabVals.delete(s) : CD.tabVals.add(s); };
ACTIONS.tabClearVals = () => { CD.tabVals.clear(); };
ACTIONS.exportCsv = () => { toast(`Exported ${cardShown().length} products as CSV`); return false; };
ACTIONS.csvToCollection = () => { toast("Prototype: this opens the CSV upload for this collection"); };
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
