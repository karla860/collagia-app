/* ---------- Open a collection ----------
   A read-first screen: what is in here, under just the name (Share and version history sit in the header and ⋯). The left rail is a view
   selector (one thing selected at a time, never a checkbox). Every product shows the value it carries.
   The four moves (apply / update from a study, download / update from a CSV) are all here, ranked by use. */

const CD = { openA: new Set(), id: "franchise", view: "grid", sel: null, q: "", histOpen: false, viewV: null, editing: false, draft: "", closed: new Set(), demo: null, showRows: false };
// Sample collection for the "no products" edge state: a CSV whose rows matched nothing. Never listed on the Attributes page.
let EMPTY_COLL = null;
const emptyColl = () => EMPTY_COLL || (EMPTY_COLL = { id: "__empty", name: "Archive materials", desc: "Material for each archive lot, from the registrar's spreadsheet.",
  attrs: ["stone"], values: { stone: {} }, productIds: [], source: { type: "csv", name: "archive_materials.csv" }, owner: PEOPLE.leyla, shared: [ME], v: "v1",
  created: "Oct 18, 2026", edited: "Oct 18, 2026", sample: true, csvRows: 24 });
// New collection's review step renders this same rail and grid for a collection that isn't saved yet (create.js)
let CD_PREVIEW = null;
const curColl = () => CD_PREVIEW || (CD.id === "__empty" ? emptyColl() : collById(CD.id)) || COLLECTIONS[0];
const cdSelName = () => CD.sel ? (CD.sel.v === NOVAL ? `no ${attrLabel(CD.sel.k)}` : CD.sel.v ? `${attrLabel(CD.sel.k)} · ${CD.sel.v}` : attrLabel(CD.sel.k)) : "";
// A collection always shows one attribute at a time (the first one to start), so every card carries exactly one value
const openCard = id => { CD.id = id || CD.id; Object.assign(CD, { view: "grid", sel: null, q: "", histOpen: false, viewV: null, editing: false, closed: new Set(), demo: null, showRows: false }); CD.sel = firstSel(); CD.openA = new Set(CD.sel ? [CD.sel.k] : []); App.modal = "card"; App.menu = null; };
const firstSel = () => { const c = curColl(); return c && c.attrs.length ? { k: c.attrs[0], v: null } : null; };

const sorted = list => [...list].sort((a, b) => a.name.localeCompare(b.name));
const cardShown = () => {
  const c = curColl(), q = CD.q.trim().toLowerCase(), ps = cProducts(c).filter(p => !q || p.name.toLowerCase().includes(q) || String(p.id).toLowerCase().includes(q));
  if (!CD.sel || !CD.sel.v) return sorted(ps);
  if (CD.sel.v === NOVAL) return sorted(ps.filter(p => !cValue(c, CD.sel.k, p.id)));
  return sorted(ps.filter(p => cValue(c, CD.sel.k, p.id) === CD.sel.v));
};
// Edge states: products in the collection with no value for an attribute, and values only one product carries
const NOVAL = "__none";
const noValue = (c, k) => cProducts(c).filter(p => !cValue(c, k, p.id));
const usedBy = c => STUDIES.filter(s => s.applied[c.id]);

/* ---------- Rail: a tree. The attribute is the parent, its values are the children. One selection at a time. ---------- */
const rail = () => {
  const c = curColl(), ps = cProducts(c), nv = c.attrs.reduce((n, k) => n + valueCounts(c, k).length, 0);
  return `<aside class="o-rail tree" aria-label="Show products by attribute">
    <div class="o-rail-h"><span>Attributes in this collection</span><small>${c.attrs.length} attribute${c.attrs.length === 1 ? "" : "s"} · ${nv} value${nv === 1 ? "" : "s"}</small></div>
    ${c.attrs.map(k => {
      const onA = CD.sel && CD.sel.k === k && !CD.sel.v, n = Object.keys(c.values[k] || {}).length, vals = valueCounts(c, k), closed = !CD.openA.has(k) && !(CD.sel && CD.sel.k === k && CD.sel.v); // the attribute on show opens; click it again to fold it
      return `<div class="o-tnode${closed ? " closed" : ""}">
        <div class="o-tattr${onA ? " on" : ""}${CD.sel && CD.sel.k === k && CD.sel.v ? " in" : ""}">
          <button class="o-tchev" data-a="cardFold" data-v="${k}" aria-label="${closed ? "Show" : "Hide"} values" aria-expanded="${!closed}">${ic.chev}</button>
          <button class="o-tname" data-a="cardSel" data-v="${k}" role="radio" aria-checked="${!!onA}">${ic.tag}<b>${esc(attrLabel(k))}</b><small>${vals.length} value${vals.length === 1 ? "" : "s"}</small><span class="n">${n}</span></button>
        </div>
        ${closed ? "" : `<ul class="o-tvals">${vals.map(([v, n]) => { const on = CD.sel && CD.sel.k === k && CD.sel.v === v; return `<li><button class="o-tval${on ? " on" : ""}${n === 1 ? " one" : ""}" data-a="cardSel" data-v="${k}|${esc(v)}" role="radio" aria-checked="${!!on}" ${hue(k, v)}${n === 1 ? ` title="Only one product carries ${esc(v)}"` : ""}><i class="o-vdot"></i><span>${esc(v)}</span><span class="o-vbar" title="${Math.round(n / ps.length * 100)}% of products"><i style="width:${Math.max(4, Math.round(n / vals[0][1] * 100))}%"></i></span><span class="n">${n}</span></button></li>`; }).join("")}${(() => { const nv = noValue(c, k).length, on = CD.sel && CD.sel.k === k && CD.sel.v === NOVAL; return nv ? `<li><button class="o-tval none${on ? " on" : ""}" data-a="cardSel" data-v="${k}|${NOVAL}" role="radio" aria-checked="${on}" title="No ${esc(attrLabel(k))}"><i class="o-vdot"></i><span>No value</span><span class="o-vbar"></span><span class="n">${nv}</span></button></li>` : ""; })()}</ul>`}
      </div>`;
    }).join("")}
  </aside>`;
};
// Clicking an attribute opens its values (and shows it on the cards); clicking it again folds them away
ACTIONS.cardFold = el => { const k = el.dataset.v; CD.openA.has(k) ? CD.openA.delete(k) : CD.openA.add(k); };

/* ---------- Products, each with what this collection adds to it ----------
   Git-diff language, shared with the apply preview: a "+ Attribute: value" chip per tag the collection brings,
   tinted with that value's colour so the grid reads at a glance. Picking an attribute groups the grid by value. */
// Attribute tag (style guide): grey chip, "+ Attribute:" in grey, the value in black, colour only in the value's dot
const addChip = (k, v, short = false) => `<span class="o-addchip hue" ${hue(k, v)} title="${esc(attrLabel(k))}: ${esc(v)}">${ic.plus}${short ? "" : `<small>${esc(attrLabel(k))}:</small>`}${v === "Other" ? "" : `<i class="o-vdot"></i>`}<span class="v">${esc(v)}</span></span>`;
// At most two attributes per product card (the selected one when an attribute is picked); the rest fold into "+N more"
const PCHIPS_MAX = 2;
// One value per card: the value this product carries for the attribute picked in the rail
const pchips = p => {
  const c = curColl(); if (!CD.sel) return "";
  const k = CD.sel.k, v = cValue(c, k, p.id);
  return `<div class="o-pchips">${v ? addChip(k, v, true) : `<span class="o-addchip nov" title="No ${esc(attrLabel(k))}">No value</span>`}</div>`;
};
/* Edge state: photos still loading. The product is already there (name, code, tag); its thumbnail shimmers until the photo arrives. */
const photoLoading = p => CD.demo === "nophotos" && cProducts(curColl()).findIndex(x => x.id === p.id) % 4 === 1;
const pthumb = (p, cls) => photoLoading(p) ? `<span class="o-th ${cls} loading" role="img" aria-label="Photo loading"></span>` : thumb(p, cls);
const pcard = p => `<div class="o-pcard">${pthumb(p, "sq")}<div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}</div>${pchips(p)}</div>`;
const gridView = list => {
  const c = curColl();
  return `<div class="o-pgrid">${list.map(pcard).join("")}</div>`;
};
// List: one row per product, every attribute in a single wrapping cell (not one column each), so it scales to any number of attributes
const LIST_MAX = 3;
const listView = list => {
  const c = curColl(), k = CD.sel ? CD.sel.k : c.attrs[0];
  const cell = p => `<span class="o-lattrs">${cValue(c, k, p.id) ? addChip(k, cValue(c, k, p.id), true) : `<span class="o-addchip nov">No value</span>`}</span>`;
  return `<div class="o-ltable o-list2">
    <div class="o-lhd"><span></span><span>Product</span><span>${esc(attrLabel(k))}</span></div>
    ${list.map(p => `<div class="o-lrow">${pthumb(p, "s36")}<span class="o-lp"><span class="nm">${esc(p.name)}</span><span class="o-id">${p.id}</span></span>${cell(p)}</div>`).join("")}
  </div>`;
};

/* ---------- Versions ---------- */
const verHistory = c => c.hist || (c.hist = Array.from({ length: +c.v.slice(1) }, (_, i) => i === 0
  ? { v: "v1", date: c.created, note: c.source.type === "study" ? `Created from study ${c.source.name}` : `Created from ${c.source.name}`, by: c.owner.name }
  : { v: "v" + (i + 1), date: c.edited, note: i % 2 ? "Updated from a CSV" : `Updated from study ${c.source.name}`, by: (c.shared.find(p => !p.you) || c.owner).name }).reverse());
const personByName = n => [ME, ...Object.values(PEOPLE)].find(p => p.name === n) || { name: n };
const nextV = c => "v" + (verHistory(c).length + 1);
// Version history as a timeline (like Figma's): newest on top, the version number leads each entry,
// the author is a face (name on hover), and the explainer lives behind the ⓘ next to the title
const histPanel = () => {
  const c = curColl(), shown = CD.viewV || c.v, hist = verHistory(c);
  const row = (h, isLatest) => {
    const u = STUDIES.filter(s => s.applied[c.id] === h.v).map(s => s.name), cur = h.v === shown, mid = "vrow:" + h.v, p = personByName(h.by);
    const face = p.photo ? `<img class="o-vt-av" src="${p.photo}" alt="${esc(p.name)}" ${tipAttrs(p.you ? `${p.name} (you)` : p.name)}>` : `<span class="o-vt-av" ${tipAttrs(p.name)}>${p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>`;
    return `<li class="o-vt-i${cur ? " cur" : ""}${isLatest ? " latest" : ""}">
      <span class="o-vt-dot" aria-hidden="true"></span>
      <button class="o-vt-main" data-a="verView" data-v="${h.v}" aria-current="${cur}">
        <span class="o-vt-top"><b class="o-vt-v">${h.v}</b>${isLatest ? `<span class="o-vt-tag">Current</span>` : cur ? `<span class="o-vt-tag view">Viewing</span>` : ""}</span>
        <span class="o-vt-note">${esc(h.note)}</span>
        <span class="o-vt-meta">${face}<span>${h.date}</span></span>
        ${u.length ? `<span class="o-vt-used">${ic.studies}<span>In ${esc(u.join(", "))}</span></span>` : ""}
      </button>
      <div class="o-dd o-vr-more"><button class="icon-btn${App.menu === mid ? " open" : ""}" data-a="menu" data-v="${mid}" aria-label="More for ${h.v}" title="More">${ic.more}</button>
        ${App.menu === mid ? `<div class="o-menu right" role="menu">
          ${cur ? "" : `<button role="menuitem" data-a="verView" data-v="${h.v}">${ic.eye}View this version</button>`}
          ${isLatest ? "" : `<button role="menuitem" data-a="verRestoreFrom" data-v="${h.v}">${ic.history}Restore as ${nextV(c)}</button>`}
          <button role="menuitem" data-a="exportCsv">${ic.download}Download ${h.v} as CSV</button></div>` : ""}</div>
    </li>`;
  };
  return `<aside class="o-hist" aria-label="Version history">
    <div class="o-hist-h"><b>Version history</b><span class="o-hist-i" tabindex="0" aria-label="How versions work" ${tipAttrs("How versions work", "Nothing is ever deleted")}>${ic.info}</span><span class="sp"></span><button class="icon-btn" data-a="histToggle" aria-label="Close version history" ${tipAttrs("Close")}>${ic.close}</button></div>
    <div class="o-hist-body"><ol class="o-vt">${hist.map((h, k) => row(h, k === 0)).join("")}</ol></div>
  </aside>`;
};
ACTIONS.histToggle = () => { CD.histOpen = !CD.histOpen; };
ACTIONS.verView = el => { const v = el.dataset.v; CD.viewV = v === curColl().v ? null : v; };
ACTIONS.verLatest = () => { CD.viewV = null; };
ACTIONS.verRestoreFrom = el => { CD.viewV = el.dataset.v; ACTIONS.verRestore(); };
ACTIONS.verRestore = () => {
  const c = curColl(), from = CD.viewV, v = nextV(c), today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  verHistory(c).unshift({ v, date: today, note: `Restored from ${from}`, by: ME.name });
  c.v = v; c.edited = today; CD.viewV = null;
  toast(`Restored ${from} as ${v}. All earlier versions are kept.`);
};
const oldBar = () => { const h = verHistory(curColl()).find(x => x.v === CD.viewV); return `<div class="o-oldbar">${ic.history}<span><b>Viewing ${h.v}</b> · ${h.date} · read-only</span></div>`; };

/* ---------- Rename ---------- */
const cardTitle = () => CD.editing
  ? `<input id="cd-name" class="o-namein o-titlein" data-in="cdName" data-enter="cdNameDone" value="${esc(CD.draft)}" maxlength="80" aria-label="Collection name">`
  : `<button class="o-titlebtn" data-a="cdNameEdit" title="Rename">${esc(curColl().name)}</button><button class="icon-btn o-titleedit" data-a="cdNameEdit" aria-label="Rename collection" title="Rename">${ic.pencil}</button>`;
ACTIONS.cdNameEdit = () => { CD.editing = true; CD.draft = curColl().name; setTimeout(() => { const i = $("#cd-name"); if (i) { i.focus(); i.select(); } }); };
INPUTS.cdName = el => { CD.draft = el.value; return false; };
ACTIONS.cdNameDone = () => {
  if (!CD.editing) return false;
  CD.editing = false;
  const v = CD.draft.trim(); if (!v || v === curColl().name) return;
  curColl().name = v; toast(`Renamed to “${v}”`);
};
document.addEventListener("focusout", e => { if (e.target.id === "cd-name" && CD.editing) { ACTIONS.cdNameDone(); setTimeout(render); } });

/* What the bar above the grid says for a selection, including the two edge states */
const selMsg = (c, list, total, selName) => {
  const k = CD.sel.k, lab = esc(attrLabel(k));
  // Short labels only: the explanation sits in its own row underneath (selNote), so the toolbar stays one tidy line
  if (CD.sel.v === NOVAL) return `<span class="o-adds"><i class="o-vdot none"></i><b>No ${lab}</b><span class="o-muted">· ${list.length} of ${total} products</span></span>`;
  if (!CD.sel.v) return `<span class="o-adds">Showing <b>${lab}</b> for ${total} products<span class="o-muted">· pick a value to see only its products</span></span>`;
  if (CD.sel.v && list.length === 1 && !CD.q) return `<span class="o-adds"><b>${lab}</b><span class="o-muted">· ${esc(CD.sel.v)} · 1 product</span></span>`;
  // The attribute leads; the value is secondary. On the collection screen this is what importing it into a study would do.
  const v = esc(CD.sel.v), n = `${list.length} of ${total} products`;
  return CD_PREVIEW ? `<span class="o-adds"><b>${lab}</b><span class="o-muted">· ${v} · ${n}</span></span>`
    : `<span class="o-adds">Importing sets <b>${lab}</b> to ${v} on ${n}</span>`;
};
/* Partial results stay on screen; what's wrong is flagged above them with one way to fix it */
const UNMATCHED = [
  { row: 7, id: "ANT_23O", mark: 6, why: "Ends in the letter O, not zero. Did you mean ANT_230?" },
  { row: 19, id: "ant-241", why: "No product has this ID in Christie's Antiquities." },
  { row: 26, id: "", why: "The product ID cell is empty." },
];
const notices = (c, total, list) => {
  const lab = CD.sel ? esc(attrLabel(CD.sel.k)) : "";
  // Alert (Figma "Alert State"): something will be lost if you apply
  if (CD.sel && CD.sel.v === NOVAL) return `<div class="o-notice">${ic.warn}<span><b>${list.length} of ${total} products have no ${lab} in this collection.</b> Importing leaves them without one, and removes any ${lab} a study already has on them.</span></div>`;
  // Note (neutral): worth a look, nothing is lost
  if (CD.sel && CD.sel.v && list.length === 1 && !CD.q) return `<div class="o-notice note">${ic.info}<span><b>Only 1 product carries ${esc(CD.sel.v)}.</b> A one-product value is often a typo or a one-off, so check it in the study before applying.</span></div>`;
  // Photos still loading: no banner, the shimmering thumbnails say it on their own
  if (CD.demo === "unmatched" && c.source.type === "csv") {
    return `<div class="o-notice">${ic.warn}<span><b>${UNMATCHED.length} rows in ${esc(c.source.name)} didn't match a product,</b> so they aren't in this collection. The other ${total} are here as normal.</span><span class="o-sample">Sample rows</span>
      <button class="o-clear" data-a="cdRows">${CD.showRows ? "Hide rows" : "See which rows"}</button><button class="btn" data-a="updateFromCsv" data-v="${c.id}">${ic.upload}Update from a CSV</button></div>
      ${CD.showRows ? `<div class="o-unmatched">${UNMATCHED.map(r => `<div><span class="o-id">Row ${r.row}</span><code>${!r.id ? "(empty)" : r.mark != null ? `${esc(r.id.slice(0, r.mark))}<mark>${esc(r.id[r.mark])}</mark>${esc(r.id.slice(r.mark + 1))}` : esc(r.id)}</code><span>${esc(r.why)}</span></div>`).join("")}</div>` : ""}`;
  }
  return "";
};
/* A collection with no products at all: say so plainly, one line on why, one way forward */
const emptyColl0 = c => `<div class="o-empty0">
    <div class="o-e0-h">${ic.box}<b>This collection has no products</b><span>None of the rows in ${esc(c.source.name)} matched a product ID, so there's nothing to show or import yet.</span></div>
    <button class="btn primary" data-a="cdFixCsv">${ic.upload}Update from a CSV</button>
  </div>`;
/* Nothing to show: say why, and offer the one way out */
const emptyState = (c, total, selName) => !total ? emptyColl0(c) : CD.q
  ? `<div class="o-empty o-empty2">${ic.search}<b>No products match “${esc(CD.q)}”</b><span>The search above looks at product names and style codes in this collection only (${total} products)${CD.sel ? `, within ${esc(selName)}` : ""}.</span><button class="btn" data-a="cardQClear">Clear search</button></div>`
  : `<div class="o-empty o-empty2">${ic.box}<b>No products carry ${esc(selName)}</b><span>This version of the collection has nothing here.</span><button class="btn" data-a="cardAll">Show every ${esc(attrLabel(CD.sel ? CD.sel.k : curColl().attrs[0]))}</button></div>`;

/* ---------- Footer: two moves, both with studies (Giorgi's Loom: a collection sits between studies and your computer).
   Import is the main one; the CSV moves, version history and rename live behind ⋯. Nothing to import while it's empty. */
const syncBar = (c, total) => `<span class="sp"></span>
  <button class="btn" data-a="updateFromStudy" data-v="${c.id}">${ic.studies}Update from a study</button>
  <button class="btn primary o-cta" data-a="cpOpen" ${total ? "" : "disabled"}>${ic.importStudy}Import to a study</button>`;

/* ---------- The screen ---------- */
const appliedDD = c => {
  const used = usedBy(c), id = "applied";
  return `<div class="o-dd"><button class="o-applied-btn${App.menu === id ? " open" : ""}" data-a="menu" data-v="${id}" aria-haspopup="menu" title="Studies that already have this collection">${ic.studies}${used.length ? `Used in ${esc(used[0].name)}${used.length > 1 ? ` + ${used.length - 1} more` : ""}` : "Not in any study yet"}${ic.chev}</button>
    ${App.menu === id ? `<div class="o-menu o-appliedmenu" role="menu">
      ${used.length ? used.map(s => `<button role="menuitem" data-a="openStudyFromCard" data-v="${esc(s.name)}"><span class="o-amrow"><b>${esc(s.name)}</b><small>${s.name === c.source.name ? "Made from this study · " : ""}${s.applied[c.id]}</small></span>${ic.chevR}</button>`).join("") : `<span class="bd-mnone">Import it to a study and that study will be listed here.</span>`}
    </div>` : ""}</div>`;
};
ACTIONS.openStudyFromCard = el => { App.modal = null; setFlow("board"); const c = curColl(); BD.matrix = "group"; BD.groupBy = c.attrs[0]; BD.show = c.attrs[0]; JUMP.board(el.dataset.v); return false; };

const MODAL_CARD = () => {
  const c = curColl(), list = cardShown(), total = cProducts(c).length, old = CD.viewV && CD.viewV !== c.v;
  const seg = `<div class="o-seg icons" role="radiogroup" aria-label="View"><button class="${CD.view === "grid" ? "on" : ""}" data-a="cardView" data-v="grid" role="radio" aria-checked="${CD.view === "grid"}" title="Grid" aria-label="Grid">${ic.grid}</button><button class="${CD.view === "list" ? "on" : ""}" data-a="cardView" data-v="list" role="radio" aria-checked="${CD.view === "list"}" title="List" aria-label="List">${ic.list}</button></div>`;
  const selName = cdSelName();
  return `<div class="o-modal xl v2card" role="dialog" aria-modal="true" aria-label="${esc(c.name)}">
    <header class="o-mh v2h">
      <button class="icon-btn" data-a="closeModal" aria-label="Back to Attributes">${ic.back}</button>
      <div class="o-ident">
        <h2 class="o-title">${CD.editing ? cardTitle() : esc(c.name)}</h2>      </div>
      <span class="sp"></span>
      <button class="btn" data-a="openAccessCur">${ic.share}Share</button>
      <div class="o-dd"><button class="icon-btn o-morebtn${App.menu === "more" ? " open" : ""}" data-a="menu" data-v="more" aria-haspopup="menu" aria-label="More">${ic.more}</button>
        ${App.menu === "more" ? `<div class="o-menu o-moremenu right" role="menu">
          <button role="menuitem" data-a="exportCsv">${ic.download}Download CSV</button>
          <button role="menuitem" data-a="updateFromCsv" data-v="${c.id}">${ic.upload}Update from a CSV</button>
          <button role="menuitem" data-a="histToggle">${ic.history}Version history</button>
          <button role="menuitem" data-a="cdNameEdit">${ic.pencil}Rename</button>
        </div>` : ""}</div>
    </header>
    ${old ? oldBar() : ""}
    <div class="o-mb with-rail">${rail()}
      <div class="o-scroll grey">
        <div class="o-selbar o-selbar2"${total ? "" : " hidden"}><div class="o-selmsg">${CD.sel ? `${selMsg(c, list, total, selName)}${CD.sel.v ? `<button class="o-clear" data-a="cardAll">Show all values</button>` : ""}` : `<span class="o-adds">${ic.plus}Importing adds <b>${c.attrs.length} attribute${c.attrs.length === 1 ? "" : "s"}</b> (${c.attrs.map(k => esc(attrLabel(k))).join(", ")}) to <b>${total} products</b>. Each product shows the value it gets.</span>`}</div>
          <label class="o-searchbox o-cdsearch${CD.q && !list.length ? " miss" : ""}">${ic.search}<input id="cd-q" data-in="cardQ" value="${esc(CD.q)}" placeholder="Find a product  /" aria-label="Find a product (press /)">${CD.q ? `<button class="icon-btn" data-a="cardQClear" aria-label="Clear search">${ic.close}</button>` : ""}</label><span class="sp"></span>${seg}</div>
        ${notices(c, total, list)}
        ${list.length ? (CD.view === "grid" ? gridView(list) : listView(list)) : emptyState(c, total, selName)}
      </div>
      ${CD.histOpen ? histPanel() : ""}
    </div>
    <footer class="o-mf">
      ${old ? `<span class="sp"></span>` : ""}${old ? `<button class="btn" data-a="verLatest">Back to latest</button><button class="btn primary" data-a="verRestore">${ic.history}Restore as ${nextV(c)}</button>`
        : syncBar(c, total)}
    </footer>
  </div>`;
};

/* ---------- Actions ---------- */
ACTIONS.openCard = el => { setFlow("card"); openCard(el.dataset.v); };
ACTIONS.cardView = el => { CD.view = el.dataset.v; };
// "Show all" keeps the attribute and clears the value
ACTIONS.cardAll = () => { CD.sel = CD.sel ? { k: CD.sel.k, v: null } : firstSel(); };
INPUTS.cardQ = el => { CD.q = el.value; };
ACTIONS.cardQClear = () => { CD.q = ""; };
ACTIONS.cardSel = el => {
  const [k, v] = el.dataset.v.split("|");
  if (!v && CD.sel && CD.sel.k === k && !CD.sel.v) { CD.openA.has(k) ? CD.openA.delete(k) : CD.openA.add(k); return; }
  CD.sel = { k, v: v || null }; CD.openA.add(k);
};
ACTIONS.exportCsv = () => { const c = curColl(); toast(`Downloaded ${c.productIds.length} rows as ${c.name.replace(/\W+/g, "_").toLowerCase()}.csv`); return false; };
ACTIONS.closeModal = () => { App.modal = null; };

JUMP.card = () => { App.page = "home"; openCard(CD.id); render(); };

ACTIONS.cdRetryPhotos = () => { CD.demo = null; toast("Photos reloaded"); };
ACTIONS.cdRows = () => { CD.showRows = !CD.showRows; };
ACTIONS.cdFixCsv = () => { toast("This opens Update from a CSV with a corrected sheet"); return false; };
ACTIONS.cdDownloadRows = () => { const c = curColl(); toast(`Downloaded ${c.csvRows} rows with a “reason” column`); return false; };

/* Guide entries: the collection screen's edge states (#edge/novalue|single|nomatch|nophotos|unmatched|empty) */
JUMP.edge = v => {
  App.page = "home";
  if (v === "single") { openCard("franchise"); const one = valueCounts(curColl(), "franchise").find(([, n]) => n === 1); if (one) CD.sel = { k: "franchise", v: one[0] }; }
  else if (v === "nomatch") { openCard("franchise"); CD.q = "Air Max 2099"; }
  else if (v === "nophotos") { openCard("franchise"); CD.demo = "nophotos"; }
  else if (v === "unmatched") { openCard("statues"); CD.demo = "unmatched"; CD.showRows = true; }
  else if (v === "empty") { openCard("__empty"); }
  else { openCard("statues"); CD.sel = { k: "stone", v: NOVAL }; }
  render();
};
