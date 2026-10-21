/* ---------- New collection ----------
   One modal, three steps either way: Pick a study (or Upload a file) → Review attributes (or Check the file) → Name; the New collection menu picks which.
   Nothing is chosen attribute by attribute: a collection takes everything the study published. The review step shows it
   exactly as the collection screen will, so it reads the same before and after saving. */

const CR = { step: "study", src: "study", study: null, included: new Set(), reviewed: null, name: "", desc: "", csv: null, dzOver: false, dzErr: "", mode: "create", target: null };
const resetCreate = (mode = "create", target = null) => Object.assign(CR, { step: "study", src: "study", study: null, included: new Set(), reviewed: null, name: "", desc: "", csv: null, dzOver: false, dzErr: "", mode, target });
const openCreate = (src, mode = "create", target = null) => {
  resetCreate(mode, target); setFlow(mode === "create" ? "create" : "card"); App.menu = null; App.modal = "create";
  if (src === "csv") { CR.src = "csv"; CR.step = "csv"; }
};
// From a board: this study and all of its attributes, straight to the review step
const openCreateFrom = studyName => { openCreate("study"); CR.study = studyName; CR.included = new Set(studyByName(studyName).published); CR.step = "pick"; };
const crStudy = () => studyByName(CR.study);
const crProducts = () => crStudy() ? studyProducts(crStudy()) : [];
const crTag = (k, p) => (crStudy().tags[k] || {})[p.id];
const crTagged = () => crProducts().filter(p => [...CR.included].some(k => crTag(k, p)));
const defaultName = () => {
  const ks = [...CR.included]; if (!ks.length) return "";
  return ks.length <= 2 ? ks.map(attrLabel).join(" & ") : `${attrLabel(ks[0])}, ${attrLabel(ks[1])} +${ks.length - 2}`;
};

/* ---------- Stepper ---------- */
const CR_STEPS = () => CR.src === "csv" ? ["Upload a file", "Check the file", "Name it"] : ["Pick a study", "Review attributes", "Name it"];
const crAt = () => ({ study: 0, csv: 0, pick: 1, check: 1, name: 2 })[CR.step];
const stepper = () => `<div class="o-steps" aria-label="Steps"><ol>${CR_STEPS().map((l, i) => `<li class="${i < crAt() ? "done" : i === crAt() ? "now" : ""}"${i === crAt() ? ' aria-current="step"' : ""}><span class="o-stepn">${i < crAt() ? ic.check : i + 1}</span>${l}</li>`).join("")}</ol>
</div>`;
const crTitle = () => CR.mode === "update" ? `Update <b>${esc(collById(CR.target).name)}</b>` : "New attribute collection";

/* ---------- Step 2a · Pick a study ---------- */
const STEP_STUDY = () => `<div class="o-scroll grey"><div class="o-studies">${STUDIES.map(s => {
  const n = s.published.length, ok = n > 0;
  return `<div class="o-study${CR.study === s.name ? " on" : ""}${ok ? "" : " off"}" ${ok ? `data-a="crPickStudy" data-v="${esc(s.name)}" tabindex="0"` : 'aria-disabled="true" title="No attributes yet"'} role="radio" aria-checked="${CR.study === s.name}">
    <div class="o-sprev study">${studyProducts(s).slice(0, 12).map(p => thumb(p, "s56")).join("")}</div>
    <div class="o-sbody"><div><b>${esc(s.name)}</b><span>${esc(COLLAGES[s.collage].name)} · ${s.edited}</span>
      ${studyTags(s)}</div></div>
  </div>`; }).join("")}</div></div>`;

/* What a study already has: one grey tag per published attribute with its value count, the first four then "+N more" */
const studyTags = (s, max = 4) => {
  if (!s.published.length) return `<span class="o-fit none">Nothing published yet</span>`;
  // Same tag as the attribute cards: the values' own colours, then the name and how many values
  const tags = s.published.map(k => `<span class="ctag hued" title="${esc(attrLabel(k))}: ${studyValueCounts(s, k).length} values"><span class="cdots">${studyValueCounts(s, k).slice(0, 4).map(([v]) => `<i ${hue(k, v)}></i>`).join("")}</span>${esc(attrLabel(k))}<small>${studyValueCounts(s, k).length}</small></span>`);
  return `<span class="o-stags-h">${s.published.length} attribute${s.published.length === 1 ? "" : "s"}</span>
    <span class="ctags o-stags">${tags.slice(0, max).join("")}${tags.length > max ? `<span class="ctag more" title="${esc(s.published.slice(max).map(attrLabel).join(", "))}">+${tags.length - max} more</span>` : ""}</span>`;
};

/* ---------- Step 3a · Review attributes ----------
   The collection screen's own rail and grid (card.js), drawn for the collection this will save: one attribute at a time,
   a value narrows the grid. Nothing here changes what goes in. */
const STEP_PICK = () => {
  const c = previewColl();
  // Start on the first attribute each time a study is reviewed (the selection state is shared with the collection screen)
  if (CR.reviewed !== CR.study) { CR.reviewed = CR.study; Object.assign(CD, { sel: { k: c.attrs[0], v: null }, openA: new Set([c.attrs[0]]), q: "", view: "grid", demo: null }); }
  CD_PREVIEW = c;
  try {
    const list = cardShown(), total = cProducts(c).length, selName = cdSelName();
    return `<div class="o-mb with-rail">${rail()}
    <div class="o-scroll grey">
      <div class="o-selbar o-selbar2"><div class="o-selmsg">${selMsg(c, list, total, selName)}${CD.sel.v ? `<button class="o-clear" data-a="cardAll">Show all values</button>` : ""}</div>
        <label class="o-searchbox o-cdsearch${CD.q && !list.length ? " miss" : ""}">${ic.search}<input id="cd-q" data-in="cardQ" value="${esc(CD.q)}" placeholder="Find a product  /" aria-label="Find a product (press /)">${CD.q ? `<button class="icon-btn" data-a="cardQClear" aria-label="Clear search">${ic.close}</button>` : ""}</label></div>
      ${list.length ? gridView(list) : emptyState(c, total, selName)}
    </div>
  </div>`;
  } finally { CD_PREVIEW = null; }
};

/* ---------- Step 2b · Upload a file ---------- */
const h32 = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const SAMPLES = [
  { name: "ho26_line_plan.csv", size: "6 KB", rows: 326, skipped: 6, attrs: ["season", "hero"],
    build: () => { const values = { season: {}, hero: {} }; NIKE_IDS.forEach(id => { values.season[id] = ["SP27", "HO26", "Carryover"][h32(id) % 3]; values.hero[id] = h32(id + "h") % 6 === 0 ? "Yes" : "No"; }); return { values, productIds: [...NIKE_IDS] }; } },
  { name: "statue_backgrounds.csv", size: "2 KB", rows: 30, skipped: 0, attrs: ["bg", "stone"],
    build: () => { const values = { bg: {}, stone: {} }; STATUE_IDS.forEach(id => { values.bg[id] = PRODUCTS[id]._bg; values.stone[id] = PRODUCTS[id]._stone; }); return { values, productIds: [...STATUE_IDS] }; } },
];
const fileUp = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 18v-6M9.5 14.5 12 12l2.5 2.5"/></svg>';
const STEP_CSV = () => `<div class="o-scroll"><div class="dz-wrap">
  <label class="dz${CR.dzOver ? " over" : ""}${CR.dzErr ? " bad" : ""}" id="dz">
    <input type="file" id="dz-file" accept=".csv,text/csv" class="dz-input">
    <span class="dz-icon">${fileUp}</span>
    <b>${CR.dzOver ? "Drop to read it" : "Drop a CSV here"}</b>
    <span class="dz-sub">One row per product. First column is the style code, every other column becomes an attribute.</span>
    ${CR.dzErr ? `<span class="dz-err" role="alert">${esc(CR.dzErr)}</span>` : `<span class="dz-browse">or <u>browse files</u></span>`}
  </label>
  <div class="o-csvex"><span class="o-csvex-h">What the file should look like</span>
    <table><tr><th>style_code</th><th>Season</th><th>Hero product</th></tr><tr><td>HJ0624-758</td><td>HO26</td><td>Yes</td></tr><tr><td>IO1560-900</td><td>SP27</td><td>No</td></tr><tr><td>…</td><td></td><td></td></tr></table></div>
  <p class="dz-hint">No file handy? Use a sample.</p>
  <div class="dz-samples">${SAMPLES.map((s, i) => `<button class="dz-sample" data-a="crSample" data-v="${i}" title="Read this sample"><span class="dz-ficon">CSV</span><span class="dz-fmeta"><b>${esc(s.name)}</b><small>${s.size} · ${s.rows} rows</small></span></button>`).join("")}</div>
</div></div>`;

/* ---------- Step 3b · Check the file: a summary, not a worklist ---------- */
const STEP_CHECK = () => {
  const f = CR.csv, matched = f.productIds.length;
  return `<div class="o-scroll grey"><div class="o-check">
    <div class="o-lead ok">${ic.check}<div><b>${matched} of ${f.rows} rows match a product.</b> ${f.skipped ? `${f.skipped} rows have style codes that aren't in any collage and are skipped.` : "Every row found its product."} All of them come in together, so there is nothing to pick here. Check the columns look right, then name it.</div></div>
    <div class="o-cols3">${f.attrs.map(k => { const counts = valueCounts(f, k), max = Math.max(...counts.map(([, n]) => n));
      return `<div class="o-acard"><div class="o-acard-h">${ic.tag}<b>${esc(attrLabel(k))}</b><span class="n">${counts.length} values</span></div>
        ${counts.map(([v, n]) => `<div class="o-bar"><span>${esc(v)}</span><i style="width:${Math.round(n / max * 100)}%"></i><small>${n}</small></div>`).join("")}</div>`; }).join("")}</div>
    <div class="o-strip">${cProducts(f).slice(0, 12).map(p => thumb(p, "s56")).join("")}<span class="o-muted">${matched} products</span></div>
  </div></div>`;
};

/* ---------- Step 4 · Name it ---------- */
const previewColl = () => {
  const attrs = CR.src === "csv" ? CR.csv.attrs : [...CR.included];
  const snap = CR.src === "csv" ? { values: CR.csv.values, productIds: CR.csv.productIds } : snapshot(crStudy(), attrs);
  return { id: "preview", name: CR.name || defaultName() || "Untitled collection", attrs, ...snap, source: CR.src === "csv" ? { type: "csv", name: CR.csv.name } : { type: "study", name: CR.study }, owner: ME, shared: [], v: "v1", edited: new Date().toISOString() };
};
const STEP_NAME = () => `<div class="o-scroll"><div class="o-namestep">
    <div class="o-nameform">
      <label class="o-field"><span>Name</span><input id="cr-name" class="o-input" data-in="crName" value="${esc(CR.name)}" placeholder="${esc(defaultName() || "Collection name")}" maxlength="80"></label>
      <label class="o-field"><span>Description <small>optional</small></span><textarea id="cr-desc" class="o-input" data-in="crDesc" rows="3" placeholder="What these attributes mean and who they're for">${esc(CR.desc)}</textarea></label>
      <p class="o-private">${ic.lock}<span><b>Private until you share it.</b> Only you will see this collection. Share it from its page when it's ready.</span></p>
    </div>
    <div class="o-namecard"><span class="o-sec">How it will look on the Attributes page</span>${card(previewColl()).replace('data-a="openCard"', "").replace(/<button class="more-btn"[\s\S]*?<\/button>/, "")}</div>
  </div></div>`;

const crFooter = () => {
  const n = CR.included.size, step = CR.step;
  const back = step === "study" || step === "csv" ? "" : `<button class="btn" data-a="crBack">${ic.back}Back</button>`;
  let note = "", next = "";
  if (step === "study") { next = `<button class="btn primary" data-a="crNext" ${CR.study ? "" : "disabled"}>Continue${ic.chevR}</button>`; }
  if (step === "pick") { const vals = [...CR.included].reduce((t, k) => t + studyValueCounts(crStudy(), k).length, 0); note = `<span class="o-showing">All <b>${n}</b> attribute${n === 1 ? "" : "s"} · ${vals} values · ${crTagged().length} tagged products</span>`; next = `<button class="btn primary" data-a="crNext">Continue${ic.chevR}</button>`; }
  if (step === "check") { next = `<button class="btn primary" data-a="crNext">Continue${ic.chevR}</button>`; }
  if (step === "name") { next = CR.mode === "update" ? `<button class="btn primary" data-a="crCreate">${ic.history}Save as ${nextV(collById(CR.target))}</button>` : `<button class="btn primary" data-a="crCreate">${ic.plus}Create collection</button>`; }
  return `<footer class="o-mf">${back}${note}<span class="sp"></span>${next}</footer>`;
};

const MODAL_CREATE = () => `<div class="o-modal xl cr" role="dialog" aria-modal="true" aria-label="New attribute collection">
  <header class="o-mh"><button class="icon-btn" data-a="closeModal" aria-label="Close">${ic.close}</button><h2 class="o-h20">${crTitle()}</h2></header>
  ${stepper()}
  ${{ study: STEP_STUDY, pick: STEP_PICK, csv: STEP_CSV, check: STEP_CHECK, name: STEP_NAME }[CR.step]()}
  ${crFooter()}
</div>`;

/* ---------- Actions ---------- */
ACTIONS.newFromStudy = () => openCreate("study");
ACTIONS.newFromCsv = () => openCreate("csv");
ACTIONS.crPickStudy = el => { CR.study = el.dataset.v; CR.included = new Set(crStudy().published); };
ACTIONS.crBack = () => { CR.step = { pick: "study", check: "csv", name: CR.src === "csv" ? "check" : "pick" }[CR.step]; };
ACTIONS.crNext = () => { CR.step = { study: "pick", pick: "name", check: "name" }[CR.step]; if (CR.step === "name") setTimeout(() => { const i = $("#cr-name"); if (i) i.focus(); }); };
INPUTS.crName = el => { CR.name = el.value; };
INPUTS.crDesc = el => { CR.desc = el.value; return false; };
ACTIONS.crSample = el => { const s = SAMPLES[+el.dataset.v]; CR.csv = { ...s, ...s.build() }; CR.dzErr = ""; CR.step = "check"; return true; };
ACTIONS.crCreate = () => {
  const c0 = previewColl(), today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  c0.attrs.forEach(k => ensureAttr(attrLabel(k), k));
  if (CR.mode === "update") {
    const c = collById(CR.target), v = nextV(c), from = CR.src === "csv" ? CR.csv.name : `study ${CR.study}`;
    verHistory(c).unshift({ v, date: today, note: `Updated from ${from}`, by: ME.name });
    c.v = v; c.edited = today; c.attrs = c0.attrs; c.values = c0.values; c.productIds = c0.productIds;
    App.modal = null; openCard(c.id); setFlow("card");
    toast(`Updated “${c.name}” from ${from}. Now ${v}.`);
    return;
  }
  const name = CR.name.trim() || defaultName() || "Untitled collection";
  const c = { ...c0, id: "c" + Date.now(), name, desc: CR.desc.trim(), created: today, edited: today };
  if (CR.src === "study") c.source.collage = crStudy().collage;
  COLLECTIONS.unshift(c);
  App.modal = null;
  // From a study: back to its board, grouped by the new collection's first attribute (the study is, by definition, on v1).
  // A CSV has no study yet, so it opens the collection instead.
  if (CR.src === "study") {
    crStudy().applied[c.id] = "v1"; setFlow("board"); Object.assign(BD, { matrix: "group", groupBy: c.attrs[0], show: c.attrs[0] }); JUMP.board(CR.study);
    toast(`Created “${name}”, in ${CR.study}`); return;
  }
  openCard(c.id); setFlow("card"); App.page = "home";
  toast(`Created “${name}”`);
};

/* Drag and drop onto the drop zone */
document.addEventListener("dragover", e => { const dz = e.target.closest && e.target.closest("#dz"); if (!dz) return; e.preventDefault(); if (!CR.dzOver) { CR.dzOver = true; dz.classList.add("over"); } });
document.addEventListener("dragleave", e => { const dz = e.target.closest && e.target.closest("#dz"); if (!dz || dz.contains(e.relatedTarget)) return; CR.dzOver = false; dz.classList.remove("over"); });
const readFile = f => {
  CR.dzOver = false;
  if (!/\.csv$/i.test(f.name)) { CR.dzErr = `“${f.name}” isn't a CSV. Export your sheet as .csv and try again.`; render(); return; }
  if (f.size > 5e6) { CR.dzErr = `“${f.name}” is ${(f.size / 1e6).toFixed(0)} MB. Files can be up to 5 MB.`; render(); return; }
  // Real files: parsed as style_code, then one column per attribute; rows whose code isn't in the catalogue are skipped
  f.text().then(t => {
    const rows = t.split(/\r?\n/).map(r => r.split(",").map(x => x.trim())).filter(r => r.length > 1);
    const head = rows.shift(), attrs = head.slice(1).map(l => ensureAttr(l)), values = {}, ids = new Set(); let skipped = 0;
    attrs.forEach(k => values[k] = {});
    rows.forEach(r => { const id = r[0]; if (!PRODUCTS[id]) { skipped++; return; } ids.add(id); attrs.forEach((k, i) => { if (r[i + 1]) { values[k][id] = r[i + 1]; ensureValue(k, r[i + 1]); } }); });
    CR.csv = { name: f.name, size: `${Math.max(1, Math.round(f.size / 1e3))} KB`, rows: rows.length, skipped, attrs, values, productIds: [...ids] }; CR.dzErr = ""; CR.step = "check"; render();
  });
};
document.addEventListener("drop", e => { const dz = e.target.closest && e.target.closest("#dz"); if (!dz) return; e.preventDefault(); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); });
document.addEventListener("change", e => { if (e.target.id === "dz-file" && e.target.files[0]) readFile(e.target.files[0]); });

/* Update this collection from a study or a CSV: the same steps, saving a new version instead of a new collection */
ACTIONS.updateFromStudy = el => { openCreate("study", "update", el.dataset.v || CD.id); };
ACTIONS.updateFromCsv = el => { openCreate("csv", "update", el.dataset.v || CD.id); };

JUMP.create = () => { App.page = "home"; openCreate("study"); render(); };
