/* ---------- Create a new attribute collection (Figma Flow 3, Iterations 1–5) ---------- */
// Opened from the homepage "New Attribute Collection" button. Uses read/save, ic (app.js),
// COLLECTIONS, H, renderHome, toast, esc (home.js).

const C_DESC = "A visual catalog of apparel products organized by surface pattern, enabling designers and online store teams to filter listings and spot gaps in the assortment.";

// name, id, design style, color, material 1, material 2, function
const PRODUCTS = [
  ["Dri-FIT training tee in Ecru", "TOP_117", "Solid", "Neutrals", "Polyester", "Recycled", "Training"],
  ["Performance tank in Terracotta", "TAN_118", "Solid", "Warm colors", "Polyester", "Elastane blend", "Training"],
  ["Windbreaker in Sienna", "WBR_119", "Solid", "Warm colors", "Nylon", "Recycled", "Outdoor"],
  ["Longsleeve top in Apricot", "TOP_120", "Solid", "Warm colors", "Cotton", "Organic", "Lifestyle"],
  ["Fleece crewneck in Camel", "CRW_121", "Solid", "Warm colors", "Fleece", "Recycled", "Lifestyle"],
  ["Dri-FIT training tee in Beige", "TOP_122", "Solid", "Neutrals", "Polyester", "Recycled", "Training"],
  ["Dri-FIT training tee in Orange", "TOP_123", "Solid", "Warm colors", "Polyester", "Recycled", "Training"],
  ["Sports Bra in Magenta", "BRA_124", "Solid", "Warm colors", "Polyester", "Elastane blend", "Training"],
  ["Fleece joggers in Sand", "JOG_125", "Solid", "Neutrals", "Fleece", "Organic", "Lifestyle"],
  ["Biker shorts in Cinnamon", "SRT_126", "Solid", "Warm colors", "Polyester", "Elastane blend", "Training"],
  ["Track pants in Mustard", "PNT_127", "Striped", "Warm colors", "Polyester", "Recycled", "Lifestyle"],
  ["Sweatpants in Toffee", "SWP_128", "Solid", "Warm colors", "Cotton", "Organic", "Lifestyle"],
  ["Fleece hoodie in Cognac", "HOD_129", "Solid", "Warm colors", "Fleece", "Recycled", "Lifestyle"],
  ["Puffer vest in Amber", "VST_130", "Solid", "Warm colors", "Nylon", "Recycled", "Outdoor"],
  ["Track jacket in Brick Red", "JKT_131", "Striped", "Warm colors", "Polyester", "Recycled", "Lifestyle"],
  ["Training leggings in Rust", "LEG_132", "Solid", "Warm colors", "Polyester", "Elastane blend", "Training"],
  ["Half-zip pullover in Burnt Sienna", "PUL_133", "Solid", "Warm colors", "Fleece", "Organic", "Outdoor"],
  ["Sweatpants in Chestnut", "SWP_134", "Solid", "Warm colors", "Cotton", "Organic", "Lifestyle"],
].map(([name, id, style, color, m1, m2, fn]) => ({ name, id, style, color, m1, m2, fn, img: `assets/products/${id}.png` }));

const C_ATTRS = [
  { k: "style", label: "Design Style", values: ["Solid", "Striped", "Graphic print"] },
  { k: "color", label: "Color", values: ["Warm colors", "Cool colors", "Neutrals"] },
  { k: "m1", label: "Materials 1", values: ["Cotton", "Polyester", "Fleece", "Nylon"] },
  { k: "m2", label: "Materials 2", values: ["Elastane blend", "Recycled", "Organic"] },
  { k: "fn", label: "Function", values: ["Training", "Lifestyle", "Outdoor"] },
];
const cAttr = k => C_ATTRS.find(a => a.k === k);
const ITERS = { "1": "Guided steps", "2": "Attribute + value", "3": "Side panel", "4": "Overview", "5": "Name as you go" };

const C = {
  iter: read("createIter", ITERS, "1"),
  view: "choose",     // choose | build
  step: "review",     // iteration 1 only: review | name
  included: new Set(["color", "m1", "m2", "fn"]),
  sel: { color: "Warm colors" },
  active: "color",
  name: "Consumer Preferences",
  desc: C_DESC,
  hint: true,
  open: null,         // open menu: "add" | "val:<k>"
};
const resetCreate = () => Object.assign(C, { view: "choose", step: "review", included: new Set(["color", "m1", "m2", "fn"]), sel: { color: "Warm colors" }, active: "color", name: "Consumer Preferences", desc: C_DESC, hint: true, open: null });

/* ---------- Filtering ---------- */
const included = () => C_ATTRS.filter(a => C.included.has(a.k));
const passes = (p, except) => included().every(({ k }) => k === except || !C.sel[k] || p[k] === C.sel[k]);
const cShown = () => PRODUCTS.filter(p => passes(p));
const cCount = (k, v) => PRODUCTS.filter(p => p[k] === v && passes(p, k)).length;
const filterText = () => included().filter(a => C.sel[a.k]).map(a => `${a.label}: ${C.sel[a.k]}`).join(" · ");

/* ---------- Icons ---------- */
const ci = {
  back: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
  close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>',
  chev: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 4 4 4-4"/></svg>',
  chevUp: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 10 4-4 4 4"/></svg>',
  x: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m4.5 4.5 7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>',
  arrow: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h9.5M9 4.5 12.5 8 9 11.5"/></svg>',
  dl: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 1.5h1.5v6.19l2.22-2.22 1.06 1.06L8 10.56 3.97 6.53l1.06-1.06 2.22 2.22zM2 10h1.5v2.5h9V10H14v4H2z"/></svg>',
  ext: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 9.5V13a.5.5 0 0 1-.5.5h-8A.5.5 0 0 1 3 13V5a.5.5 0 0 1 .5-.5H7"/></svg>',
  pencil: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M10.5 2.5 13.5 5.5 6 13H3v-3z"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.25"/><path d="M8 7.25V11" stroke-linecap="round"/><circle cx="8" cy="5" r=".9" fill="currentColor" stroke="none"/></svg>',
  study: '<svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M6 2h4M6.5 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9.5 6V2"/></svg>',
  csv: '<svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M4 1.5h5.5L13 5v9.5H4z"/><path d="M9.5 1.5V5H13M6 9h5M6 11.5h5"/></svg>',
};

/* ---------- Pieces ---------- */
const cBtn = (label, act, { primary = false, icon = "", trail = "" } = {}) =>
  `<button class="cbtn${primary ? " primary" : ""}" data-c="${act}">${icon}${label}${trail}</button>`;
const cHeader = ({ title, right = "", desc = true } = {}) => `
  <div class="cm-head">
    <div class="cm-title">
      <button class="cm-icon" data-c="back" aria-label="Back">${ci.back}</button>
      <nav class="crumbs"><a data-c="close">Custom Attributes</a><span>/</span>${title || `<b>${esc(C.name)}</b>`}</nav>
      <span class="sp"></span>${right}
      <button class="cm-icon" data-c="close" aria-label="Close">${ci.close}</button>
    </div>
    ${desc === true ? `<p class="cm-desc">${esc(C.desc)}</p>` : desc || ""}
  </div>`;
const pcard = (p, tags = false) => `
  <div class="pcard"><img src="${p.img}" alt="">
    <div><b>${esc(p.name)}</b><span class="pid">${p.id}</span>
      ${tags ? included().filter(a => C.sel[a.k]).map(a => `<span class="ctag">${p[a.k]}</span>`).join("") : ""}</div>
  </div>`;
const cGrid = (tags = false) => {
  const list = cShown();
  return list.length
    ? `<div class="pgrid">${list.map(p => pcard(p, tags)).join("")}</div>`
    : `<div class="pgrid empty"><div><b>No products match ${esc(filterText())}</b><span>Pick another value or clear a filter.</span>${cBtn("Clear filters", "clear")}</div></div>`;
};
const cCountText = () => {
  const f = filterText();
  return `<span class="cm-count">Showing <b>${cShown().length}</b> of ${PRODUCTS.length} products${f ? " · " + esc(f) : ""}</span>`;
};
const cFooter = buttons => `<div class="cm-foot">${cCountText()}<span class="sp"></span>${buttons}</div>`;
const valueChip = (k, v) => {
  const on = C.sel[k] === v, n = cCount(k, v);
  return `<button class="vpill${on ? " on" : ""}${n ? "" : " zero"}" data-c="pick" data-k="${k}" data-v="${on ? "" : v}">${v}<span>${n}</span></button>`;
};
const addMenu = () => {
  const rest = C_ATTRS.filter(a => !C.included.has(a.k));
  return C.open === "add" ? `<div class="cmenu">${rest.length ? rest.map(a => `<button data-c="include" data-k="${a.k}">${a.label}<span>${a.values.length} values</span></button>`).join("") : `<span class="none">All study attributes are included</span>`}</div>` : "";
};
const addAttr = (cls = "") => `<span class="menu-wrap"><button class="add-attr ${cls}" data-c="menu" data-m="add">${ci.plus}Add attribute</button>${addMenu()}</span>`;
const saveBtns = () => cBtn("Export as CSV", "export", { icon: ci.dl }) + cBtn("Save collection", "save", { primary: true, icon: C.iter === "5" ? ci.check : "" });

/* ---------- Iterations ---------- */
const ITER_VIEWS = {
  // 1 — progress steps, attribute tabs with values right beneath, "Next" leads to naming
  "1": () => {
    const steps = [["Choose attributes", "done"], ["Review products", C.step === "review" ? "now" : "done"], ["Name & save", C.step === "name" ? "now" : "next"]];
    const stepper = `<ol class="stepper">${steps.map(([l, s], i) => `<li class="${s}"><span>${s === "done" ? ci.check : i + 1}</span>${l}</li>`).join("")}</ol>`;
    if (C.step === "name") return `
      ${cHeader({ right: stepper, desc: false })}
      <div class="name-step">
        <label>Collection name<input class="cin" data-f="name" value="${esc(C.name)}"></label>
        <label>Description <em>optional</em><textarea class="cin" data-f="desc" rows="3">${esc(C.desc)}</textarea></label>
        <div class="name-sum"><b>${included().length} attributes</b> · ${included().map(a => a.label).join(", ")}<br>${PRODUCTS.length} products from the study</div>
      </div>
      <div class="cm-foot"><span class="cm-count">You can rename the collection anytime.</span><span class="sp"></span>${cBtn("Back", "step-review")}${cBtn("Save collection", "save", { primary: true })}</div>`;
    const a = cAttr(C.active);
    return `
      ${cHeader({ right: stepper })}
      <div class="atabs">${included().map(x => `<button class="atab2${x.k === C.active ? " on" : ""}" data-c="active" data-k="${x.k}">${x.label}<span>${x.values.length}</span></button>`).join("")}${addAttr("ghost")}</div>
      <div class="vrow"><span class="flab">${a.label} values</span>${a.values.map(v => valueChip(a.k, v)).join("")}</div>
      ${cGrid()}
      ${cFooter(cBtn("Back", "back") + cBtn("Export as CSV", "export", { icon: ci.dl }) + cBtn("Next: Name & save", "step-name", { primary: true, trail: ci.arrow }))}`;
  },

  // 2 — each chip pairs an attribute with its value; cards show the matched values
  "2": () => `
    ${cHeader()}
    <div class="pairs"><span class="flab">Attributes (${C.included.size})</span>
      ${included().map(a => `
        <span class="menu-wrap"><span class="pair${C.sel[a.k] ? " on" : ""}">
          <b>${a.label}</b>
          <button data-c="menu" data-m="val:${a.k}">${C.sel[a.k] || "All values"}${ci.chev}</button>
          <button class="rm" data-c="exclude" data-k="${a.k}" aria-label="Remove ${a.label}">${ci.x}</button>
        </span>${C.open === "val:" + a.k ? `<div class="cmenu">
          <button data-c="pick" data-k="${a.k}" data-v="">All values<span>${PRODUCTS.filter(p => passes(p, a.k)).length}</span></button>
          ${a.values.map(v => `<button class="${C.sel[a.k] === v ? "on" : ""}" data-c="pick" data-k="${a.k}" data-v="${v}">${v}<span>${cCount(a.k, v)}</span></button>`).join("")}</div>` : ""}</span>`).join("")}
      ${addAttr("dashed")}<span class="sp"></span><a class="clink" data-c="clear">Clear all</a>
    </div>
    ${cGrid(true)}
    ${cFooter(saveBtns())}`,

  // 3 — the study's attributes as a checklist; the active one shows its values
  "3": () => `
    ${cHeader()}
    <div class="cm-body">
      <aside class="apanel">
        <div class="ap-title"><b>Attributes from the study</b><span>Tick the ones to include in this collection</span></div>
        ${C_ATTRS.map(a => {
          const on = C.included.has(a.k), act = C.active === a.k && on;
          return `<div class="ap-row${act ? " act" : ""}">
              <button class="cbx${on ? " on" : ""}" data-c="toggle-inc" data-k="${a.k}" aria-label="Include ${a.label}">${on ? ci.check : ""}</button>
              <button class="ap-name${on ? "" : " off"}" data-c="active" data-k="${a.k}">${a.label}<span>${a.values.length} values</span>${act ? ci.chevUp : ci.chev}</button>
            </div>
            ${act ? `<div class="ap-vals">
              <button class="rad${C.sel[a.k] ? "" : " on"}" data-c="pick" data-k="${a.k}" data-v=""><i></i>All values</button>
              ${a.values.map(v => `<button class="rad${C.sel[a.k] === v ? " on" : ""}" data-c="pick" data-k="${a.k}" data-v="${v}"><i></i>${v}<span>${cCount(a.k, v)}</span></button>`).join("")}
            </div>` : ""}`;
        }).join("")}
        <span class="sp-v"></span>
        <div class="ap-sum">${C.included.size} of ${C_ATTRS.length} attributes included</div>
      </aside>
      ${cGrid()}
    </div>
    ${cFooter(saveBtns())}`,

  // 4 — overview of what's in the collection; click a value to see its products
  "4": () => `
    ${cHeader({ desc: false })}
    <div class="overview">
      <div class="ov-title"><b>What’s in this collection</b><span>${PRODUCTS.length} products · ${C.included.size} attributes · click a value to see its products</span></div>
      <div class="ov-cards">${included().map(a => {
        const max = Math.max(...a.values.map(v => PRODUCTS.filter(p => p[a.k] === v).length), 1);
        return `<div class="ov-card${C.sel[a.k] ? " on" : ""}"><div class="ov-head"><b>${a.label}</b><span>${a.values.length} values</span></div>
          ${a.values.map(v => { const n = PRODUCTS.filter(p => p[a.k] === v).length; return `<button class="ov-row${C.sel[a.k] === v ? " on" : ""}" data-c="pick" data-k="${a.k}" data-v="${C.sel[a.k] === v ? "" : v}"><span>${v}</span><i><em style="width:${Math.round(n / max * 100)}%"></em></i><span class="n">${n}</span></button>`; }).join("")}</div>`;
      }).join("")}</div>
    </div>
    ${cGrid()}
    ${cFooter(saveBtns())}`,

  // 5 — name and describe the collection right here; link back to the source study
  "5": () => {
    const a = cAttr(C.active);
    const title = `<label class="name-edit"><input class="cin" data-f="name" value="${esc(C.name)}" aria-label="Collection name">${ci.pencil}</label>`;
    const src = `<button class="src" data-c="study">From study: <b>Consumer Preferences</b>${ci.ext}</button>`;
    const desc = `<textarea class="cin desc-edit" data-f="desc" rows="2" aria-label="Description">${esc(C.desc)}</textarea>
      ${C.hint ? `<div class="hint">${ci.info}<span>Choose a value for each attribute to check which products it covers, then save. You can rename the collection anytime.</span><button data-c="hint">Got it</button></div>` : ""}`;
    return `
      ${cHeader({ title, right: src, desc })}
      <div class="vrow bordered"><span class="flab">Attribute</span>
        ${included().map(x => `<button class="apill${x.k === C.active ? " on" : ""}" data-c="active" data-k="${x.k}">${x.label}</button>`).join("")}
        <span class="vdiv"></span><span class="flab">Value</span>${a.values.map(v => valueChip(a.k, v)).join("")}
      </div>
      ${cGrid()}
      ${cFooter(saveBtns())}`;
  },
};

const chooser = () => `
  <div class="cm chooser">
    <div class="cm-title pad"><b>Create a New Attribute Collection</b><span class="sp"></span><button class="cm-icon" data-c="close" aria-label="Close">${ci.close}</button></div>
    <div class="choose">
      <button class="choice" data-c="from-study"><span class="ch-art">${ci.study}</span><b>Create from a Study</b><span>Use a study’s custom attributes as the source</span></button>
      <button class="choice" data-c="from-csv"><span class="ch-art">${ci.csv}</span><b>Import a CSV</b><span>Upload a CSV file to create a library</span></button>
    </div>
  </div>`;

/* ---------- Render ---------- */
const cOverlay = document.getElementById("create-overlay");
const cRoot = document.getElementById("create-root");
const cProto = document.getElementById("create-proto");

const renderCreate = () => {
  cRoot.innerHTML = C.view === "choose" ? chooser() : `<div class="cm">${ITER_VIEWS[C.iter]()}</div>`;
  cProto.hidden = C.view === "choose";
  cProto.innerHTML = `<span class="plabel">Create flow</span><div class="seg small">${Object.entries(ITERS).map(([id, l]) =>
    `<button class="${C.iter === id ? "on" : ""}" data-ci="${id}"><b>${id}</b> ${l}</button>`).join("")}</div>`;
};

let cLastFocus = null;
const openCreate = () => {
  cLastFocus = document.activeElement;
  resetCreate();
  cOverlay.hidden = false;
  document.body.classList.add("locked");
  renderCreate();
};
const closeCreate = () => {
  cOverlay.hidden = true;
  document.body.classList.remove("locked");
  if (cLastFocus) cLastFocus.focus();
};

// Saving adds the collection to the top of the homepage
const saveCollection = () => {
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const name = C.name.trim() || "Untitled collection";
  COLLECTIONS.unshift({ name, v: "v1", tags: included().map(a => a.label), desc: C.desc, created: today, edited: today, img: "assets/preview-apparel.png" });
  if (H.option.startsWith("empty")) H.option = "5";
  H.sort = "edited";
  closeCreate();
  renderHome();
  toast(`“${name}” saved to your attribute collections`);
};

/* ---------- Interactions ---------- */
let cPressedOnBackdrop = false;
cOverlay.addEventListener("mousedown", e => { cPressedOnBackdrop = e.target === cOverlay; });
cOverlay.addEventListener("click", e => { if (e.target === cOverlay && cPressedOnBackdrop) closeCreate(); cPressedOnBackdrop = false; });

cProto.addEventListener("click", e => {
  const b = e.target.closest("[data-ci]"); if (!b) return;
  C.iter = b.dataset.ci; C.step = "review"; C.open = null; save("createIter", C.iter); renderCreate();
});

cRoot.addEventListener("click", e => {
  const a = e.target.closest("[data-c]");
  if (!a) { if (C.open && !e.target.closest(".cmenu")) { C.open = null; renderCreate(); } return; }
  const { c: act, k, v, m } = a.dataset;
  if (act !== "menu") C.open = null;
  switch (act) {
    case "close": closeCreate(); return;
    case "back": if (C.view === "build") { C.view = "choose"; } break;
    case "from-study": C.view = "build"; break;
    case "from-csv": location.href = "import-preview.html"; return;
    case "menu": C.open = C.open === m ? null : m; break;
    case "active": C.active = k; if (!C.included.has(k)) C.included.add(k); break;
    case "pick": C.sel[k] = v || undefined; if (C.iter !== "2") C.active = k; break;
    case "include": C.included.add(k); C.active = k; break;
    case "exclude": C.included.delete(k); delete C.sel[k]; if (C.active === k) C.active = included()[0]?.k || "color"; break;
    case "toggle-inc":
      if (C.included.has(k)) { C.included.delete(k); delete C.sel[k]; if (C.active === k) C.active = included()[0]?.k || "color"; }
      else { C.included.add(k); C.active = k; }
      break;
    case "clear": C.sel = {}; break;
    case "step-name": C.step = "name"; break;
    case "step-review": C.step = "review"; break;
    case "hint": C.hint = false; break;
    case "study": toast("Prototype: this would open the Consumer Preferences study"); return;
    case "export": toast(`Prototype: this would export ${cShown().length} products as CSV`); return;
    case "save": saveCollection(); return;
    default: return;
  }
  renderCreate();
});

// Name and description fields keep their value without re-rendering (keeps focus)
cRoot.addEventListener("input", e => {
  const f = e.target.dataset.f; if (!f) return;
  C[f] = e.target.value;
});

document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || cOverlay.hidden) return;
  if (C.open) { C.open = null; renderCreate(); } else closeCreate();
});
