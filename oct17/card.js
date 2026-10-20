/* ---------- Open a collection ----------
   A read-first screen: what is in here, who can see it, which version this is. The left rail is a view
   selector (one thing selected at a time, never a checkbox). Every product shows the value it carries.
   The four moves (apply / update from a study, download / update from a CSV) are all here, ranked by use. */

const CD = { id: "franchise", view: "grid", sel: null, q: "", histOpen: false, viewV: null, editing: false, draft: "", closed: new Set(), demo: null, showRows: false };
// Sample collection for the "no products" edge state: a CSV whose rows matched nothing. Never listed on the Attributes page.
let EMPTY_COLL = null;
const emptyColl = () => EMPTY_COLL || (EMPTY_COLL = { id: "__empty", name: "Archive materials", desc: "Material for each archive lot, from the registrar's spreadsheet.",
  attrs: ["stone"], values: { stone: {} }, productIds: [], source: { type: "csv", name: "archive_materials.csv" }, owner: PEOPLE.leyla, shared: [ME], v: "v1",
  created: "Oct 18, 2026", edited: "Oct 18, 2026", sample: true, csvRows: 24 });
const curColl = () => (CD.id === "__empty" ? emptyColl() : collById(CD.id)) || COLLECTIONS[0];
const openCard = id => { CD.id = id || CD.id; Object.assign(CD, { view: "grid", sel: null, q: "", histOpen: false, viewV: null, editing: false, closed: new Set(), demo: null, showRows: false }); App.modal = "card"; App.menu = null; };

const sorted = list => [...list].sort((a, b) => a.name.localeCompare(b.name));
const cardShown = () => {
  const c = curColl(), q = CD.q.trim().toLowerCase(), ps = cProducts(c).filter(p => !q || p.name.toLowerCase().includes(q) || String(p.id).toLowerCase().includes(q));
  if (!CD.sel) return sorted(ps);
  if (!CD.sel.v) return sorted(ps.filter(p => cValue(c, CD.sel.k, p.id)));
  if (CD.sel.v === NOVAL) return sorted(ps.filter(p => !cValue(c, CD.sel.k, p.id)));
  return sorted(ps.filter(p => cValue(c, CD.sel.k, p.id) === CD.sel.v));
};
// Edge states: products in the collection with no value for an attribute, and values only one product carries
const NOVAL = "__none";
const noValue = (c, k) => cProducts(c).filter(p => !cValue(c, k, p.id));
const usedBy = c => STUDIES.filter(s => s.applied[c.id]);

/* ---------- Rail: a tree. The attribute is the parent, its values are the children. One selection at a time. ---------- */
const rail = () => {
  const c = curColl(), all = !CD.sel, ps = cProducts(c), nv = c.attrs.reduce((n, k) => n + valueCounts(c, k).length, 0);
  return `<aside class="o-rail tree" aria-label="Show products by attribute">
    <div class="o-rail-h"><span>Attributes in this collection</span><small>${c.attrs.length} attribute${c.attrs.length === 1 ? "" : "s"} · ${nv} value${nv === 1 ? "" : "s"}</small></div>
    <button class="o-tr all${all ? " on" : ""}" data-a="cardAll" role="radio" aria-checked="${all}">${ic.allProducts}<b>All products</b><span class="n">${ps.length}</span></button>
    ${c.attrs.map(k => {
      const onA = CD.sel && CD.sel.k === k && !CD.sel.v, n = Object.keys(c.values[k] || {}).length, vals = valueCounts(c, k), closed = CD.closed.has(k);
      return `<div class="o-tnode${closed ? " closed" : ""}">
        <div class="o-tattr${onA ? " on" : ""}">
          <button class="o-tchev" data-a="cardFold" data-v="${k}" aria-label="${closed ? "Show" : "Hide"} values" aria-expanded="${!closed}">${ic.chev}</button>
          <button class="o-tname" data-a="cardSel" data-v="${k}" role="radio" aria-checked="${!!onA}">${ic.tag}<b>${esc(attrLabel(k))}</b><small>${vals.length} value${vals.length === 1 ? "" : "s"}</small><span class="n">${n}</span></button>
        </div>
        ${closed ? "" : `<ul class="o-tvals">${vals.map(([v, n]) => { const on = CD.sel && CD.sel.k === k && CD.sel.v === v; return `<li><button class="o-tval${on ? " on" : ""}${n === 1 ? " one" : ""}" data-a="cardSel" data-v="${k}|${esc(v)}" role="radio" aria-checked="${!!on}" ${hue(k, v)}${n === 1 ? ` title="Only one product carries ${esc(v)}"` : ""}><i class="o-vdot"></i><span>${esc(v)}</span><span class="o-vbar" title="${Math.round(n / ps.length * 100)}% of products"><i style="width:${Math.max(4, Math.round(n / vals[0][1] * 100))}%"></i></span><span class="n">${n}</span></button></li>`; }).join("")}${(() => { const nv = noValue(c, k).length, on = CD.sel && CD.sel.k === k && CD.sel.v === NOVAL; return nv ? `<li><button class="o-tval none${on ? " on" : ""}" data-a="cardSel" data-v="${k}|${NOVAL}" role="radio" aria-checked="${on}" title="In this collection, but with no ${esc(attrLabel(k))}"><i class="o-vdot"></i><span>No value</span><span class="o-vbar"></span><span class="n">${nv}</span></button></li>` : ""; })()}</ul>`}
      </div>`;
    }).join("")}
  </aside>`;
};
ACTIONS.cardFold = el => { const k = el.dataset.v; CD.closed.has(k) ? CD.closed.delete(k) : CD.closed.add(k); };

/* ---------- Products, each with what this collection adds to it ----------
   Git-diff language, shared with the apply preview: a "+ Attribute: value" chip per tag the collection brings,
   tinted with that value's colour so the grid reads at a glance. Picking an attribute groups the grid by value. */
// Attribute tag (style guide): grey chip, "+ Attribute:" in grey, the value in black, colour only in the value's dot
const addChip = (k, v, short = false) => `<span class="o-addchip hue" ${hue(k, v)} title="Applying this collection adds ${esc(attrLabel(k))} = ${esc(v)}">${ic.plus}${short ? "" : `<small>${esc(attrLabel(k))}:</small>`}${v === "Other" ? "" : `<i class="o-vdot"></i>`}<span class="v">${esc(v)}</span></span>`;
// At most two attributes per product card (the selected one when an attribute is picked); the rest fold into "+N more"
const PCHIPS_MAX = 2;
const pchips = p => {
  const c = curColl(), ks = CD.sel ? [CD.sel.k] : c.attrs, shown = ks.slice(0, PCHIPS_MAX), rest = ks.slice(PCHIPS_MAX);
  const chip = k => cValue(c, k, p.id) ? addChip(k, cValue(c, k, p.id)) : `<span class="o-addchip nov" title="This collection has no ${esc(attrLabel(k))} for this product">No ${esc(attrLabel(k))}</span>`;
  return `<div class="o-pchips">${shown.map(chip).join("")}${rest.length ? `<span class="o-addchip more" title="${esc(rest.map(k => `${attrLabel(k)}: ${cValue(c, k, p.id) || "no value"}`).join(" · "))}">+${rest.length} more</span>` : ""}</div>`;
};
/* Edge state: photos still loading. The product is already there (name, code, tag); its thumbnail shimmers until the photo arrives. */
const photoLoading = p => CD.demo === "nophotos" && cProducts(curColl()).findIndex(x => x.id === p.id) % 4 === 1;
const pthumb = (p, cls) => photoLoading(p) ? `<span class="o-th ${cls} loading" role="img" aria-label="Photo loading"></span>` : thumb(p, cls);
const pcard = p => `<div class="o-pcard">${pthumb(p, "sq")}<div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}${p.price ? ` · ${money(p.price)}` : ""}</div>${pchips(p)}</div>`;
const gridView = list => {
  const c = curColl();
  if (!CD.sel || CD.sel.v) return `<div class="o-pgrid">${list.map(pcard).join("")}</div>`;
  const k = CD.sel.k; // one section per value, in the rail's order
  return valueCounts(c, k).map(([v]) => { const ps = list.filter(p => cValue(c, k, p.id) === v); return ps.length ? `<section class="o-vsec" ${hue(k, v)}>
    <button class="o-vsec-h" data-a="cardSel" data-v="${k}|${esc(v)}"><i class="o-vdot"></i><b>${esc(v)}</b><span>${ps.length} product${ps.length === 1 ? "" : "s"}</span>${ic.chevR}</button>
    <div class="o-pgrid">${ps.map(pcard).join("")}</div></section>` : ""; }).join("");
};
const listView = list => {
  const c = curColl(), ks = CD.sel ? [CD.sel.k] : c.attrs;
  return `<div class="o-ltable" style="--cols:${ks.length}">
    <div class="o-lhd"><span>Product</span><span>ID</span>${ks.map(k => `<span>${esc(attrLabel(k))}</span>`).join("")}</div>
    ${list.map(p => `<div class="o-lrow">${pthumb(p, "s36")}<span class="nm">${esc(p.name)}</span><span class="o-id">${p.id}</span>${ks.map(k => `<span>${cValue(c, k, p.id) ? addChip(k, cValue(c, k, p.id), true) : `<span class="o-none">—</span>`}</span>`).join("")}</div>`).join("")}
  </div>`;
};

/* ---------- Versions ---------- */
const verHistory = c => c.hist || (c.hist = Array.from({ length: +c.v.slice(1) }, (_, i) => i === 0
  ? { v: "v1", date: c.created, note: c.source.type === "study" ? `Created from study ${c.source.name}` : `Created from ${c.source.name}`, by: c.owner.name }
  : { v: "v" + (i + 1), date: c.edited, note: i % 2 ? "Updated from a CSV" : `Updated from study ${c.source.name}`, by: c.owner.name }).reverse());
const nextV = c => "v" + (verHistory(c).length + 1);
const verBtn = () => {
  const c = curColl(), shown = CD.viewV || c.v;
  return `<button class="o-histbtn${CD.histOpen ? " on" : ""}${shown !== c.v ? " old" : ""}" data-a="histToggle" aria-pressed="${!!CD.histOpen}" title="Version history">${ic.history}<span>${shown}</span></button>`;
};
const histPanel = () => {
  const c = curColl(), shown = CD.viewV || c.v, [latest, ...older] = verHistory(c);
  const ini = n => n.split(" ").map(w => w[0]).join("").slice(0, 2);
  const row = (h, isLatest) => {
    const u = STUDIES.filter(s => s.applied[c.id] === h.v).map(s => s.name), cur = h.v === shown, mid = "vrow:" + h.v;
    return `<li class="o-vr${cur ? " cur" : ""}">
      <button class="o-vr-main" data-a="verView" data-v="${h.v}" aria-current="${cur}">
        <span class="o-vr-av" title="${esc(h.by)}">${ini(h.by)}</span>
        <span class="o-vr-txt"><b>${esc(h.note)}</b><small>${esc(h.by)} · ${h.date}</small>
          ${u.length ? `<span class="o-vr-used">${ic.studies}Applied in ${esc(u.join(", "))}</span>` : ""}</span>
        <span class="o-vr-v">${h.v}</span>
      </button>
      <div class="o-dd o-vr-more"><button class="icon-btn${App.menu === mid ? " open" : ""}" data-a="menu" data-v="${mid}" aria-label="More for ${h.v}" title="More">${ic.more}</button>
        ${App.menu === mid ? `<div class="o-menu right" role="menu">
          ${cur ? "" : `<button role="menuitem" data-a="verView" data-v="${h.v}">${ic.eye}View this version</button>`}
          ${isLatest ? "" : `<button role="menuitem" data-a="verRestoreFrom" data-v="${h.v}">${ic.history}Restore as ${nextV(c)}</button>`}
          <button role="menuitem" data-a="exportCsv">${ic.download}Download ${h.v} as CSV</button></div>` : ""}</div>
    </li>`;
  };
  return `<aside class="o-hist" aria-label="Version history">
    <div class="o-hist-h"><b>Version history</b><span class="sp"></span><button class="icon-btn" data-a="histToggle" aria-label="Close version history" title="Close">${ic.close}</button></div>
    <div class="o-hist-body">
      <div class="o-hist-sec">Current version</div><ol class="o-vlist">${row(latest, true)}</ol>
      ${older.length ? `<div class="o-hist-sec">Earlier versions</div><ol class="o-vlist">${older.map(h => row(h, false)).join("")}</ol>` : ""}
    </div>
    <p class="o-hist-note">${ic.info}Every update saves a new version. Restoring copies an old one forward; nothing is deleted.</p>
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
  if (CD.sel.v && list.length === 1 && !CD.q) return `<span class="o-adds"><i class="o-vdot" ${hue(k, CD.sel.v)}></i><b>${esc(CD.sel.v)}</b><span class="o-muted">· 1 product</span></span>`;
  return `<span class="o-adds">${ic.plus}<b>${list.length}</b> of ${total} products get <b>${esc(selName)}</b></span>`;
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
  if (CD.sel && CD.sel.v === NOVAL) return `<div class="o-notice">${ic.warn}<span><b>${list.length} of ${total} products have no ${lab} in this collection.</b> Applying leaves them without one, and removes any ${lab} a study already has on them.</span></div>`;
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
    <div class="o-e0-h">${ic.box}<b>This collection has no products</b><span>None of the rows in ${esc(c.source.name)} matched a product ID, so there's nothing to show or apply yet.</span></div>
    <button class="btn primary" data-a="cdFixCsv">${ic.upload}Update from a CSV</button>
    <span class="o-sample">Sample collection</span>
  </div>`;
/* Nothing to show: say why, and offer the one way out */
const emptyState = (c, total, selName) => !total ? emptyColl0(c) : CD.q
  ? `<div class="o-empty o-empty2">${ic.search}<b>No products match “${esc(CD.q)}”</b><span>Search looks at product names and style codes in this collection only (${total} products)${CD.sel ? `, within ${esc(selName)}` : ""}.</span><button class="btn" data-a="cardQClear">Clear search</button></div>`
  : `<div class="o-empty o-empty2">${ic.box}<b>No products carry ${esc(selName)}</b><span>This version of the collection has nothing here.</span><button class="btn" data-a="cardAll">Show all products</button></div>`;

/* ---------- The screen ---------- */
const appliedDD = c => {
  const used = usedBy(c), id = "applied";
  return `<div class="o-dd"><button class="o-applied-btn${App.menu === id ? " open" : ""}" data-a="menu" data-v="${id}" aria-haspopup="menu" title="Studies that already have this collection">${ic.studies}${used.length ? `Used in ${esc(used[0].name)}${used.length > 1 ? ` + ${used.length - 1} more` : ""}` : "Not in any study yet"}${ic.chev}</button>
    ${App.menu === id ? `<div class="o-menu o-appliedmenu" role="menu">
      ${used.length ? used.map(s => `<button role="menuitem" data-a="openStudyFromCard" data-v="${esc(s.name)}"><span class="o-amrow"><b>${esc(s.name)}</b><small>${s.name === c.source.name ? "Made from this study · " : ""}has ${s.applied[c.id]}${s.applied[c.id] === c.v ? ", up to date" : `, behind ${c.v}`}</small></span>${ic.chevR}</button>`).join("") : `<span class="bd-mnone">Apply it to a study and that study will be listed here.</span>`}
    </div>` : ""}</div>`;
};
ACTIONS.openStudyFromCard = el => { App.modal = null; setFlow("board"); const c = curColl(); BD.matrix = "group"; BD.groupBy = c.attrs[0]; BD.show = c.attrs[0]; JUMP.board(el.dataset.v); return false; };

const MODAL_CARD = () => {
  const c = curColl(), list = cardShown(), total = cProducts(c).length, old = CD.viewV && CD.viewV !== c.v;
  const seg = `<div class="o-seg icons" role="radiogroup" aria-label="View"><button class="${CD.view === "grid" ? "on" : ""}" data-a="cardView" data-v="grid" role="radio" aria-checked="${CD.view === "grid"}" title="Grid" aria-label="Grid">${ic.grid}</button><button class="${CD.view === "list" ? "on" : ""}" data-a="cardView" data-v="list" role="radio" aria-checked="${CD.view === "list"}" title="List" aria-label="List">${ic.list}</button></div>`;
  const selName = CD.sel ? (CD.sel.v === NOVAL ? `no ${attrLabel(CD.sel.k)}` : CD.sel.v ? `${attrLabel(CD.sel.k)} · ${CD.sel.v}` : attrLabel(CD.sel.k)) : "";
  return `<div class="o-modal xl v2card" role="dialog" aria-modal="true" aria-label="${esc(c.name)}">
    <header class="o-mh v2h">
      <button class="icon-btn" data-a="closeModal" aria-label="Back to Attributes">${ic.back}</button>
      <div class="o-ident">
        <h2 class="o-title">${CD.editing ? cardTitle() : esc(c.name)}</h2>
        <div class="o-identrow">${avatar2(c.owner, "s")}<span>${c.owner.you ? "You" : esc(c.owner.name)}</span><i>·</i>${visChip(c, 'data-a="openAccessCur" role="button" tabindex="0" title="Change who can see this"')}<i>·</i>${verBtn()}<i>·</i><span class="o-muted">${srcLine(c)}</span></div>
      </div>
      <span class="sp"></span>
      <button class="btn" data-a="openAccessCur">${ic.share}Share</button>
      <div class="o-dd"><button class="icon-btn o-morebtn${App.menu === "more" ? " open" : ""}" data-a="menu" data-v="more" aria-haspopup="menu" aria-label="More">${ic.more}</button>
        ${App.menu === "more" ? `<div class="o-menu o-newmenu right" role="menu">
          <button role="menuitem" data-a="exportCsv">${ic.download}<span><b>Download CSV</b></span></button>
          <hr class="o-msep"><div class="o-mgroup">Update this collection</div>
          <button role="menuitem" data-a="updateFromStudy" data-v="${c.id}">${ic.studies}<span><b>From a study</b></span></button>
          <button role="menuitem" data-a="updateFromCsv" data-v="${c.id}">${ic.upload}<span><b>From a CSV</b></span></button>
          <hr class="o-msep">
          <button role="menuitem" data-a="histToggle">${ic.history}Version history</button>
          <button role="menuitem" data-a="cdNameEdit">${ic.pencil}Rename</button>
        </div>` : ""}</div>
    </header>
    ${old ? oldBar() : ""}
    <div class="o-mb with-rail">${rail()}
      <div class="o-scroll grey">
        <div class="o-selbar"${total ? "" : " hidden"}>${CD.sel ? `${selMsg(c, list, total, selName)}<button class="o-clear" data-a="cardAll">Show all</button>` : `<span class="o-adds">${ic.plus}Applying this adds <b>${c.attrs.length} attribute${c.attrs.length === 1 ? "" : "s"}</b> (${c.attrs.map(k => esc(attrLabel(k))).join(", ")}) to <b>${total} products</b>. Each product shows the value it gets.</span>`}<span class="sp"></span><label class="o-searchbox o-cdsearch">${ic.search}<input id="cd-q" data-in="cardQ" value="${esc(CD.q)}" placeholder="Find a product" aria-label="Find a product">${CD.q ? `<button class="icon-btn" data-a="cardQClear" aria-label="Clear search">${ic.close}</button>` : ""}</label>${seg}</div>
        ${notices(c, total, list)}
        ${list.length ? (CD.view === "grid" ? gridView(list) : listView(list)) : emptyState(c, total, selName)}
      </div>
      ${CD.histOpen ? histPanel() : ""}
    </div>
    <footer class="o-mf">
      ${c.desc ? `<span class="o-desc" title="${esc(c.desc)}">${esc(c.desc)}</span><i class="o-fsep"></i>` : ""}
      <span class="sp"></span>
      ${old ? `<button class="btn" data-a="verLatest">Back to latest</button><button class="btn primary" data-a="verRestore">${ic.history}Restore as ${nextV(c)}</button>`
        : !total ? `<button class="btn o-cmpbtn" disabled title="There are no products to compare yet"><span class="o-cmpg">⇄</span>Compare with a study</button>
          <button class="btn primary o-cta" disabled title="There are no products to apply yet">${ic.importStudy}Apply to a study</button>`
        : `<button class="btn o-cmpbtn" data-a="cpOpen" title="Optional: see what applying would change in a study, product by product, before you apply"><span class="o-cmpg">⇄</span>Compare with a study</button>
          <button class="btn primary o-cta" data-a="toStudyPick" data-v="apply">${ic.importStudy}Apply to a study</button>`}
    </footer>
  </div>`;
};

/* ---------- Actions ---------- */
ACTIONS.openCard = el => { setFlow("card"); openCard(el.dataset.v); };
ACTIONS.cardView = el => { CD.view = el.dataset.v; };
ACTIONS.cardAll = () => { CD.sel = null; };
INPUTS.cardQ = el => { CD.q = el.value; };
ACTIONS.cardQClear = () => { CD.q = ""; };
ACTIONS.cardSel = el => { const [k, v] = el.dataset.v.split("|"); CD.sel = { k, v: v || null }; };
ACTIONS.exportCsv = () => { const c = curColl(); toast(`Downloaded ${c.productIds.length} rows as ${c.name.replace(/\W+/g, "_").toLowerCase()}.csv`); return false; };
ACTIONS.closeModal = () => { App.modal = null; };

JUMP.card = () => { App.page = "home"; openCard(CD.id); render(); };

ACTIONS.cdRetryPhotos = () => { CD.demo = null; toast("Photos reloaded"); };
ACTIONS.cdRows = () => { CD.showRows = !CD.showRows; };
ACTIONS.cdFixCsv = () => { toast("Sample collection: this opens Update from a CSV with a corrected sheet"); return false; };
ACTIONS.cdDownloadRows = () => { const c = curColl(); toast(`Downloaded ${c.csvRows} rows with a “reason” column`); return false; };

/* Guide entries: the collection screen's edge states (#edge/novalue|single|nomatch|nophotos|unmatched|empty) */
JUMP.edge = v => {
  App.page = "home";
  if (v === "single") { openCard("franchise"); const one = valueCounts(curColl(), "franchise").find(([, n]) => n === 1); CD.sel = one ? { k: "franchise", v: one[0] } : null; }
  else if (v === "nomatch") { openCard("franchise"); CD.q = "Air Max 2099"; }
  else if (v === "nophotos") { openCard("franchise"); CD.demo = "nophotos"; }
  else if (v === "unmatched") { openCard("statues"); CD.demo = "unmatched"; CD.showRows = true; }
  else if (v === "empty") { openCard("__empty"); }
  else { openCard("statues"); CD.sel = { k: "stone", v: NOVAL }; }
  render();
};
