/* ---------- Flow 3: Creating a new Attribute Collection ----------
   Chooser (from a Study / from a CSV), then the study's custom attributes in one of six layouts:
   Current (Values dropdown), Iteration 1 chip rows, 3 side rail, 4 header dropdowns, 5 filter bar,
   6 chip filters (its own page), 7 attribute multi-select with a values row per chosen attribute.
   Attribute checkboxes choose what goes into the new collection; the value narrows the products shown. */

const CR = { name: "Consumer Preferences", editing: false, included: new Set(), active: "color", value: "Warm colors" };
// Iteration 7 picks several attributes (attrs) and, optionally, values within them ("attr|value" in picks)
const resetCreate = () => Object.assign(CR, { name: "Consumer Preferences", editing: false, included: new Set(["color", "mat1", "mat2"]), active: "color", value: "Warm colors",
  picks: new Set(["color|Warm colors"]), attrs: new Set(["color", "mat1"]), mq: "" });
// Iterations 5 and 7 pick several values at once
const multiPick = () => ["i5", "i7"].includes(App.opt.create);
const crAttrs = () => ["i4", "i5", "i7"].includes(App.opt.create) ? STUDY_ATTRS : STUDY_ATTRS.filter(a => a.k !== "design");
const picksOf = k => [...CR.picks].filter(s => s.startsWith(k + "|")).map(s => s.slice(k.length + 1));
// Several values of one attribute widen the list; values of different attributes narrow it
const crShown = () => multiPick()
  ? STUDY_PRODUCTS.filter(p => STUDY_ATTRS.every(a => { const v = picksOf(a.k); return !v.length || v.includes(p[a.k]); }))
  : STUDY_PRODUCTS.filter(p => !CR.value || p[CR.active] === CR.value);
const vCount = (k, v) => STUDY_PRODUCTS.filter(p => p[k] === v).length;
const activeAttr = () => STUDY_ATTRS.find(a => a.k === CR.active);

const MODAL_CHOOSER = () => `<div class="o-modal chooser" role="dialog" aria-modal="true" aria-label="Create a New Attribute Collection">
  <header class="o-mh plain"><button class="icon-btn" data-a="closeModal" aria-label="Back">${ic.back}</button><h2 class="o-h20">Create a New Attribute Collection</h2></header>
  <div class="o-choose">
    <button class="o-opt" data-a="fromStudy"><span class="o-optimg"><span class="o-dash">${ic.studies}<i>${ic.plus}</i></span></span><b>Create from a Study</b><span>Use a Study’s custom Attributes as the source</span></button>
    <button class="o-opt" data-a="fromCsv"><span class="o-optimg"><span class="o-dash csv">CSV<i>${ic.upload}</i></span></span><b>Import from a CSV</b><span>Upload a CSV file to create a library</span></button>
  </div>
</div>`;

/* ---------- Pieces ---------- */
const titleEdit = () => `<div class="o-crtitle">
  <button class="icon-btn" data-a="toChooser" aria-label="Back">${ic.back}</button>
  <span class="o-crumbgrey">Custom Attributes</span><span class="o-crumbgrey">/</span>
  ${CR.editing ? `<input id="cr-name" class="o-namein" data-in="crName" data-enter="crNameDone" value="${esc(CR.name)}" aria-label="Collection name">`
    : `<button class="o-namebox" data-a="crNameEdit">${esc(CR.name)}${ic.pencil}</button>`}
</div>`;
const attrChip = (a, style) => {
  const inc = CR.included.has(a.k), act = CR.active === a.k;
  return `<span class="o-achip ${style}${inc ? " inc" : ""}${act && style !== "plain" ? " act" : ""}">
    <button class="o-achk" data-a="crInclude" data-v="${a.k}" aria-label="${inc ? "Exclude" : "Include"} ${a.label}">${cbox(inc ? "on" : "")}</button>
    <button class="o-alab" data-a="crActive" data-v="${a.k}">${a.label}</button></span>`;
};
const valChip = (v, style) => {
  const n = vCount(CR.active, v), on = CR.value === v;
  return `<button class="o-vchip ${style}${on ? " on" : ""}" data-a="crValue" data-v="${esc(v)}">${esc(v)}<span class="n">${n}</span></button>`;
};
const crCards = cols => `<div class="o-crgrid c${cols}">${crShown().map(p => `<div class="o-crcard">${thumb(p, "s100")}<div><div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}</div></div></div>`).join("")}</div>`;
const crFooter = label => `<footer class="o-mf"><span class="o-showing">Showing <b>${crShown().length}</b> of ${STUDY_PRODUCTS.length} products</span><span class="sp"></span>
  <button class="btn" data-a="crExport">${ic.exportCsv}Export as CSV</button><button class="btn primary" data-a="crCreate">${ic.plus}${label}</button></footer>`;
const valuesMenu = (id, cls = "") => App.menu === id ? `<div class="o-menu ${cls}" role="menu">${crAttrs().filter(a => CR.included.has(a.k)).map(a => `
  <div class="o-mgroup">${a.label}</div>${a.values.map(v => `<button role="menuitemradio" class="${CR.active === a.k && CR.value === v ? "cur" : ""}" data-a="crPick" data-v="${a.k}|${esc(v)}">${esc(v)}<span class="n">${vCount(a.k, v)}</span></button>`).join("")}`).join("")}</div>` : "";
const attrsMenu = (id, cls = "") => App.menu === id ? `<div class="o-menu ${cls}" role="menu" data-keep>${crAttrs().map(a =>
  `<button role="menuitemcheckbox" aria-checked="${CR.included.has(a.k)}" data-a="crInclude" data-v="${a.k}" data-keep>${cbox(CR.included.has(a.k) ? "on" : "")}${a.label}${App.opt.create === "i5" ? `<span class="n">${a.values.length}</span>` : ""}</button>`).join("")}</div>` : "";

const CREATE_VIEWS = {
  cur: () => `<header class="o-mh tall">${titleEdit()}</header>
    <div class="o-crrow"><span class="o-rl">Attributes</span>${crAttrs().map(a => attrChip(a, "box")).join("")}</div>
    <div class="o-crrow line"><span class="o-rl">Values</span><div class="o-dd"><button class="o-select w200${App.menu === "crv" ? " open" : ""}" data-a="menu" data-v="crv">${esc(CR.value || "All values")}${ic.chev}</button>${valuesMenu("crv")}</div></div>
    <div class="o-scroll grey">${crCards(5)}</div>${crFooter("New Attribute Collection")}`,
  i1: () => `<header class="o-mh tall">${titleEdit()}</header>
    <div class="o-crrow"><span class="o-caps">Attributes</span>${crAttrs().map(a => attrChip(a, "box")).join("")}</div>
    <div class="o-crrow line"><span class="o-caps">Values</span>${activeAttr().values.map(v => valChip(v, "pink")).join("")}</div>
    <div class="o-scroll grey">${crCards(5)}</div>${crFooter("Create")}`,
  i3: () => `<header class="o-mh tall line">${titleEdit()}</header>
    <div class="o-mb with-rail"><aside class="o-rail"><div class="o-rail-h">Attributes &amp; Values</div>${crAttrs().map(a => `<div class="o-rg">
      <button class="o-rrow attr" data-a="crInclude" data-v="${a.k}">${cbox(CR.included.has(a.k) ? "on" : "")}<b>${a.label}</b><span class="n">${a.values.length}</span></button>
      ${a.values.map(v => `<button class="o-rrow" data-a="crPick" data-v="${a.k}|${esc(v)}">${cbox(CR.active === a.k && CR.value === v ? "on" : "")}<span>${esc(v)}</span><span class="n">${vCount(a.k, v)}</span></button>`).join("")}</div>`).join("")}</aside>
    <div class="o-scroll grey">${crCards(4)}</div></div>${crFooter("Create Custom Attributes")}`,
  i4: () => `<header class="o-mh tall">${titleEdit()}<span class="sp"></span>
      <div class="o-dd"><button class="o-select w200${App.menu === "cra" ? " open" : ""}" data-a="menu" data-v="cra">${ic.importStudy}Attributes${ic.chev}</button>${attrsMenu("cra", "full")}</div>
      <div class="o-dd"><button class="o-select w200${App.menu === "crv" ? " open" : ""}" data-a="menu" data-v="crv">${ic.list}${esc(CR.value || "Values")}${ic.chev}</button>${valuesMenu("crv", "full")}</div></header>
    <div class="o-scroll grey">${crCards(5)}</div>${crFooter("Create Custom Attributes")}`,
  i5: () => {
    // Values are multi-select; the chosen ones show as removable chips right in the filter bar
    const inc = crAttrs().filter(a => CR.included.has(a.k));
    const chosen = inc.flatMap(a => picksOf(a.k).map(v => [a, v]));
    const label = !chosen.length ? "All" : chosen.length === 1 ? chosen[0][1] : `${chosen.length} selected`;
    const menu = App.menu === "crv" ? `<div class="o-menu full o-vmenu" role="listbox" aria-multiselectable="true" data-keep>
        <div class="o-vmenu-h">${chosen.length ? `<b>${chosen.length}</b> value${chosen.length === 1 ? "" : "s"} selected` : "None selected · showing all products"}</div>
        ${inc.map(a => `<div class="o-mgroup">${a.label}${picksOf(a.k).length ? ` · ${picksOf(a.k).length} of ${a.values.length}` : ""}</div>${a.values.map(v => { const on = CR.picks.has(a.k + "|" + v); return `
          <button role="option" aria-selected="${on}" data-a="crValToggle" data-v="${a.k}|${esc(v)}" data-keep>${cbox(on ? "on" : "")}<span>${esc(v)}</span><span class="n">${vCount(a.k, v)}</span></button>`; }).join("")}`).join("")}
      </div>` : "";
    return `<header class="o-mh tall">${titleEdit()}<span class="sp"></span><button class="btn" data-a="crExport">${ic.exportCsv}Export as CSV</button><button class="btn primary" data-a="crCreate">${ic.plus}Create Custom Attributes</button></header>
    <div class="o-filterbar">
      <div class="o-dd"><button class="o-select w260${App.menu === "cra" ? " open" : ""}" data-a="menu" data-v="cra"><span class="o-fl">Attributes:</span>${CR.included.size} selected${ic.chev}</button>${attrsMenu("cra", "full")}</div>
      <div class="o-dd"><button class="o-select w200${App.menu === "crv" ? " open" : ""}" data-a="menu" data-v="crv"><span class="o-fl">Values:</span><span class="o-selv">${esc(label)}</span>${ic.chev}</button>${menu}</div>
      ${chosen.map(([a, v]) => `<span class="o-fchip" title="${esc(a.label)}: ${esc(v)}"><span class="o-fchip-k">${esc(a.label)}:</span>${esc(v)}<button data-a="crUnpick" data-v="${a.k}|${esc(v)}" aria-label="Remove ${esc(v)}">${ic.close}</button></span>`).join("")}
      ${chosen.length ? `<button class="o-clear" data-a="crMultiClear">Clear all</button>` : ""}<span class="sp"></span><span class="o-showing"><b>${crShown().length}</b> of ${STUDY_PRODUCTS.length} products</span></div>
    <div class="o-scroll grey">${crCards(5)}</div>`;
  },
  i7: () => {
    // Attributes are what you choose (multi-select); each chosen attribute gets a row of values to narrow the preview
    const open = App.menu === "crmulti", q = CR.mq.trim().toLowerCase(), all = crAttrs();
    const list = all.filter(a => !q || a.label.toLowerCase().includes(q) || a.values.some(v => v.toLowerCase().includes(q)));
    const picked = all.filter(a => CR.attrs.has(a.k));
    // Values: one compact dropdown per chosen attribute, so the filter bar stays a single short row
    const valueDD = a => {
      const id = "vals:" + a.k, v = picksOf(a.k), open = App.menu === id;
      const label = !v.length ? "All" : v.length === 1 ? v[0] : `${v.length} selected`;
      return `<div class="o-dd"><button class="o-vdd${v.length ? " on" : ""}${open ? " open" : ""}" data-a="menu" data-v="${id}" aria-haspopup="listbox" aria-expanded="${open}">
          <span class="o-vdd-k">${esc(a.label)}</span><span class="o-vdd-v">${esc(label)}</span>${ic.chev}</button>
        ${open ? `<div class="o-menu o-vmenu" role="listbox" aria-multiselectable="true" data-keep>
          <div class="o-vmenu-h">${v.length ? `<b>${v.length}</b> of ${a.values.length} selected` : `None selected · showing all ${a.values.length}`}</div>
          ${a.values.map(x => { const on = CR.picks.has(a.k + "|" + x); return `<button role="option" aria-selected="${on}" data-a="crValToggle" data-v="${a.k}|${esc(x)}" data-keep>${cbox(on ? "on" : "")}<span>${esc(x)}</span><span class="n">${vCount(a.k, x)}</span></button>`; }).join("")}
          ${v.length ? `<button class="o-vmenu-clear" data-a="crValClear" data-v="${a.k}" data-keep>Show all ${esc(a.label)} values</button>` : ""}
        </div>` : ""}</div>`;
    };
    return `<header class="o-mh tall">${titleEdit()}</header>
    <div class="o-crrow o-mrow"><span class="o-rl">Attributes</span>
      <div class="o-dd o-mwrap">
        <div class="o-mfield${open ? " open" : ""}" data-a="crMultiOpen">
          ${picked.map(a => `<span class="o-mchip">${esc(a.label)}<span class="o-mchip-n">${a.values.length}</span><button data-a="crUnattr" data-v="${a.k}" aria-label="Remove ${esc(a.label)}">${ic.close}</button></span>`).join("")}
          <input id="cr-mq" data-in="crMq" placeholder="${picked.length ? "Add attributes…" : "Pick attributes for this collection…"}" value="${esc(CR.mq)}" autocomplete="off" aria-label="Search attributes">
          <span class="o-mcaret">${ic.chev}</span>
        </div>
        ${open ? `<div class="o-menu full o-mlist" role="listbox" aria-multiselectable="true" data-keep>
          <div class="o-mhead"><span>${picked.length} of ${all.length} attributes</span><button class="o-clear" data-a="crAttrAll" data-keep>${picked.length === all.length ? "Clear" : "Select all"}</button></div>
          ${list.length ? list.map(a => { const on = CR.attrs.has(a.k); return `<button role="option" aria-selected="${on}" class="o-aopt" data-a="crPickAttr" data-v="${a.k}" data-keep>
            ${cbox(on ? "on" : "")}<span class="o-aopt-t"><b>${esc(a.label)}</b><small>${a.values.map(esc).join(", ")}</small></span><span class="n">${a.values.length} values</span></button>`; }).join("")
            : `<p class="o-mnone">No attributes match “${esc(CR.mq)}”</p>`}
        </div>` : ""}
      </div>
    </div>
    <div class="o-crrow line o-vbar"><span class="o-rl">Values</span>
      ${picked.length ? picked.map(valueDD).join("") : `<span class="o-muted">Pick attributes above to filter by their values.</span>`}
      ${CR.picks.size ? `<button class="o-clear" data-a="crMultiClear">Clear values</button>` : ""}
    </div>
    <div class="o-scroll grey">${crCards(5)}</div>${crFooter("New Attribute Collection")}`;
  },
};
const MODAL_CREATE = () => `<div class="o-modal xl cr-${App.opt.create}" role="dialog" aria-modal="true" aria-label="Create from ${esc(CR.name)}">${CREATE_VIEWS[App.opt.create]()}</div>`;

/* ---------- Actions ---------- */
const openChooser = () => { setFlow("create"); App.modal = "chooser"; App.menu = null; };
ACTIONS.newCollection = () => openChooser();
ACTIONS.toChooser = () => { App.modal = "chooser"; };
// Iteration 6 (chip filters) is its own page, shown in a frame
const createModal = () => App.opt.create === "chips" ? "chips" : "create";
ACTIONS.fromStudy = () => { resetCreate(); App.modal = createModal(); };
ACTIONS.fromCsv = () => { toast("Prototype: this opens the CSV upload"); return false; };
ACTIONS.crInclude = el => {
  const k = el.dataset.v;
  if (CR.included.has(k)) {
    if (CR.included.size === 1) { toast("Keep at least one attribute in the collection"); return false; }
    CR.included.delete(k);
    picksOf(k).forEach(v => CR.picks.delete(k + "|" + v));
    if (CR.active === k) { CR.active = [...CR.included][0]; CR.value = activeAttr().values[0]; }
  } else CR.included.add(k);
};
ACTIONS.crActive = el => { const k = el.dataset.v; CR.included.add(k); if (CR.active !== k) { CR.active = k; CR.value = activeAttr().values[0]; } };
ACTIONS.crValue = el => { CR.value = CR.value === el.dataset.v ? null : el.dataset.v; };
ACTIONS.crPick = el => { const [k, v] = el.dataset.v.split("|"); if (CR.active === k && CR.value === v) CR.value = null; else { CR.active = k; CR.value = v; CR.included.add(k); } };
ACTIONS.crClear = () => { CR.value = null; };
ACTIONS.crExport = () => { toast(`Exported ${crShown().length} products as CSV`); return false; };
ACTIONS.crNameEdit = () => { CR.editing = true; setTimeout(() => { const i = $("#cr-name"); if (i) { i.focus(); i.select(); } }); };
INPUTS.crName = el => { CR.name = el.value; return false; };
ACTIONS.crNameDone = () => { CR.editing = false; CR.name = CR.name.trim() || "Untitled collection"; };
document.addEventListener("focusout", e => { if (e.target.id === "cr-name" && CR.editing) { ACTIONS.crNameDone(); setTimeout(render); } });
// Adds the new collection to the homepage and goes there
const saveCollection = (name, tags, source) => {
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  COLLECTIONS.unshift({ name, v: "v1", tags, desc: `Custom attributes from the ${source}.`, created: today, edited: today, img: "assets/preview-apparel.png" });
  if (App.opt.home.startsWith("empty")) setOpt("home", "1");
  App.modal = null; setFlow("home"); H.sort = "edited";
  toast(`“${name}” saved with ${tags.length} attribute${tags.length === 1 ? "" : "s"}`);
};
// Iteration 7 keeps the chosen attributes; the rest keep the checked ones
const crTags = () => {
  if (!multiPick()) return STUDY_ATTRS.filter(a => CR.included.has(a.k)).map(a => a.label);
  const keep = crAttrs().filter(a => CR.attrs.has(a.k));
  return (keep.length ? keep : crAttrs()).map(a => a.label);
};
ACTIONS.crCreate = () => saveCollection(CR.name, crTags(), "Consumer Preferences study");
ACTIONS.crMultiOpen = () => { App.menu = "crmulti"; setTimeout(() => { const i = $("#cr-mq"); if (i) i.focus(); }); };
INPUTS.crMq = el => { CR.mq = el.value; App.menu = "crmulti"; };
const dropAttr = k => { CR.attrs.delete(k); picksOf(k).forEach(v => CR.picks.delete(k + "|" + v)); };
ACTIONS.crPickAttr = el => { const k = el.dataset.v; CR.attrs.has(k) ? dropAttr(k) : CR.attrs.add(k); };
ACTIONS.crUnattr = el => { dropAttr(el.dataset.v); };
ACTIONS.crAttrAll = () => { const all = crAttrs(); if (all.every(a => CR.attrs.has(a.k))) all.forEach(a => dropAttr(a.k)); else all.forEach(a => CR.attrs.add(a.k)); };
ACTIONS.crValToggle = el => { const s = el.dataset.v; CR.picks.has(s) ? CR.picks.delete(s) : CR.picks.add(s); };
ACTIONS.crMultiClear = () => { CR.picks.clear(); };
ACTIONS.crUnpick = el => { CR.picks.delete(el.dataset.v); };
ACTIONS.crValClear = el => { picksOf(el.dataset.v).forEach(v => CR.picks.delete(el.dataset.v + "|" + v)); };

JUMP.create = v => {
  App.page = "home";
  if (v) { setOpt("create", v); resetCreate(); App.modal = createModal(); App.menu = null; }
  else openChooser();
  render();
};
