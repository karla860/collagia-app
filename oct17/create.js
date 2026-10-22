/* ---------- New collection ----------
   One modal, three steps either way: Pick a study (or Upload a file) → Review attributes (or Check the file) → Name; the New collection menu picks which.
   From a study, the review step is where attributes are chosen: every one the study published starts ticked, and unticking
   leaves it out. A CSV has no choice to make, so its review shows it exactly as the collection screen will. */

const CR = { step: "study", src: "study", study: null, included: new Set(), reviewed: null, focus: null, openA: new Set(), val: null, name: "", desc: "", csv: null, dzOver: false, dzErr: "", mode: "create", target: null };
const resetCreate = (mode = "create", target = null) => Object.assign(CR, { step: "study", src: "study", study: null, included: new Set(), reviewed: null, focus: null, openA: new Set(), val: null, name: "", desc: "", csv: null, dzOver: false, dzErr: "", mode, target });
const openCreate = (src, mode = "create", target = null) => {
  resetCreate(mode, target); setFlow(mode === "create" ? "create" : "card"); App.menu = null; App.modal = "create";
  if (src === "csv") { CR.src = "csv"; CR.step = "csv"; }
};
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
const STEP_STUDY = () => `<div class="o-scroll grey"><div class="o-studies">${STUDIES.map(s => { const ok = s.published.length > 0;
  return studyCard(s, { act: ok ? `data-a="crPickStudy" data-v="${esc(s.name)}"` : 'aria-disabled="true" title="No attributes yet"', on: CR.study === s.name, off: !ok, role: "radio" }); }).join("")}</div></div>`;

/* ---------- Step 3a · Review attributes (from a study) ----------
   The study's attributes on the left, each with a tick and its values; the study's products on the right. The tick decides
   what goes in (all of an attribute's values come with it), and the grid follows it as it changes: only products that carry a
   ticked attribute, each showing just the ticked attributes' values. Clicking a value only previews its products. */
const crShown = () => { const ps = sorted(crTagged()); return CR.val ? ps.filter(p => crTag(CR.val.k, p) === CR.val.v) : ps; };
const crRail = () => {
  const s = crStudy();
  return `<aside class="o-rail cr-rail" aria-label="Attributes to include">
    <div class="cr-rail-h"><b>Published in ${esc(s.name)}</b><small>Tick what goes into the collection</small></div>
    ${s.published.map(k => {
      const on = CR.included.has(k), vals = studyValueCounts(s, k), open = CR.openA.has(k);
      return `<div class="cr-attr${on ? " on" : ""}">
        <div class="cr-attr-h">
          <button class="cr-tick" data-a="crTick" data-v="${k}" role="checkbox" aria-checked="${on}" aria-label="Include ${esc(attrLabel(k))}"><span class="o-cb${on ? " on" : ""}">${on ? ic.check : ""}</span></button>
          <button class="cr-aname${CR.focus === k ? " focus" : ""}" data-a="crFocus" data-v="${k}" aria-expanded="${open}"><b>${esc(attrLabel(k))}</b><small>${vals.length} value${vals.length === 1 ? "" : "s"}</small></button>
        </div>
        ${open && on ? `<div class="cr-vals">${vals.map(([v, n]) => { const sel = CR.val && CR.val.k === k && CR.val.v === v;
          return `<button class="cr-val${sel ? " sel" : ""}" data-a="crVal" data-v="${k}|${esc(v)}" aria-pressed="${sel}" title="Preview the ${n} products with ${esc(v)}">${esc(v)}<em>${n}</em></button>`; }).join("")}</div>` : ""}
      </div>`;
    }).join("")}
  </aside>`;
};
// Each product names the ticked attributes it carries (values stay on hover, so the grid doesn't become a wall of text):
// two pills on one line, the rest as "+N more", in the study's order
const CR_PTAGS = 2;
const crPcard = p => {
  const tags = [...CR.included].map(k => [k, crTag(k, p)]).filter(([, v]) => v), rest = tags.slice(CR_PTAGS);
  return `<div class="o-pcard">${thumb(p, "sq")}<div class="nm">${esc(p.name)}</div><div class="o-id">${p.id}</div>
    <div class="o-pchips cr-ptags">${tags.slice(0, CR_PTAGS).map(([k, v]) => `<span class="cr-ptag" title="${esc(attrLabel(k))}: ${esc(v)}">${esc(attrLabel(k))}</span>`).join("")}${rest.length ? `<span class="cr-ptag more" title="${rest.map(([k, v]) => `${esc(attrLabel(k))}: ${esc(v)}`).join("&#10;")}">+${rest.length} more</span>` : ""}</div></div>`;
};
const STEP_SELECT = () => {
  const s = crStudy();
  // Start on the first attribute, its values open, each time a study is reviewed
  if (CR.reviewed !== CR.study) { CR.reviewed = CR.study; CR.focus = s.published[0] || null; CR.openA = new Set(CR.focus ? [CR.focus] : []); CR.val = null; }
  const list = crShown(), tagged = crTagged().length, total = crProducts().length;
  const msg = !CR.included.size ? ""
    : CR.val ? `Previewing <b>${esc(attrLabel(CR.val.k))} · ${esc(CR.val.v)}</b>: ${list.length} of ${tagged} products. Previewing changes nothing.<button class="o-clear" data-a="crValAll">Show all products</button>`
    : `<span><b>${tagged}</b> of ${total} products in this study carry the ticked attributes. Every value of a ticked attribute comes with it; previewing a value changes nothing.</span>`;
  return `<div class="o-mb with-rail">${crRail()}
    <div class="o-scroll grey">${CR.included.size ? `<p class="cr-msg">${msg}</p><div class="o-pgrid">${list.map(crPcard).join("")}</div>`
      : `<p class="cr-empty">Nothing is ticked, so the collection would be empty. Tick an attribute to see its products.</p>`}</div>
  </div>`;
};

/* ---------- Step 3b · A new collection from a CSV ----------
   The collection screen's own rail and grid (card.js), drawn for the collection this will save: one attribute at a time,
   a value narrows the grid. Nothing here changes what goes in. */
const STEP_PICK = () => {
  const c = previewColl();
  // Start on the first attribute each time a file is reviewed (the selection state is shared with the collection screen)
  const key = CR.csv.name;
  if (CR.reviewed !== key) { CR.reviewed = key; Object.assign(CD, { sel: { k: c.attrs[0], v: null }, openA: new Set([c.attrs[0]]), q: "", view: "grid", demo: null }); }
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
const fileUp = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 18v-6M9.5 14.5 12 12l2.5 2.5"/></svg>';
const STEP_CSV = () => `<div class="o-scroll"><div class="dz-wrap">
  <label class="dz${CR.dzOver ? " over" : ""}${CR.dzErr ? " bad" : ""}" id="dz">
    <input type="file" id="dz-file" accept=".csv,text/csv" class="dz-input">
    <span class="dz-icon">${fileUp}</span>
    <b>${CR.dzOver ? "Drop to read it" : "Drop a CSV here"}</b>
    <span class="dz-sub">One row per product. First column is the style code, every other column becomes an attribute.</span>
    ${CR.dzErr ? `<span class="dz-err" role="alert">${esc(CR.dzErr)}</span>` : `<span class="dz-browse">or <u>browse files</u></span>`}
  </label>
</div></div>`;

/* ---------- Step 2b · Check the file ----------
   Updating: the Import preview, the collection as it is now against the file. A new collection has nothing to compare
   with, so it is reviewed exactly like one made from a study. */
const collageOf = c => Object.keys(COLLAGES).find(k => COLLAGES[k].productIds.includes(c.productIds[0])) || Object.keys(COLLAGES)[0];
const STEP_CHECK = () => {
  if (CR.mode !== "update") return STEP_PICK();
  const old = collById(CR.target), c = previewColl();
  if (CR.reviewed !== CR.csv.name) { CR.reviewed = CR.csv.name; Object.assign(CP, { open: null, all: new Set(), more: new Set(), same: new Set(), q: "" }); }
  const now = { name: old.name, kind: "Collection now", after: "From the file", collage: collageOf(c), tags: old.values, published: old.attrs, applied: {} };
  return `<div class="o-scroll grey"><div class="cpx-body">${cpLayout(c, now, cpModel(c, now), "")}</div></div>`;
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
  if (step === "pick") {
    const all = crStudy().published.length, vals = [...CR.included].reduce((t, k) => t + studyValueCounts(crStudy(), k).length, 0);
    note = !n ? `<span class="o-showing">Tick at least one attribute</span>`
      : `<span class="o-showing">${n === all ? `All <b>${n}</b>` : `<b>${n}</b> of ${all}`} attribute${all === 1 ? "" : "s"} · ${vals} values · ${crTagged().length} tagged products</span>`;
    next = `<button class="btn primary" data-a="crNext" ${n ? "" : "disabled"}>Continue${ic.chevR}</button>`;
  }
  if (step === "check") { next = `<button class="btn primary" data-a="crNext">Continue${ic.chevR}</button>`; }
  if (step === "name") { next = CR.mode === "update" ? `<button class="btn primary" data-a="crCreate">${ic.history}Save as ${nextV(collById(CR.target))}</button>` : `<button class="btn primary" data-a="crCreate">${ic.plus}Create collection</button>`; }
  return `<footer class="o-mf">${back}${note}<span class="sp"></span>${next}</footer>`;
};

const MODAL_CREATE = () => `<div class="o-modal xl cr" role="dialog" aria-modal="true" aria-label="New attribute collection">
  <header class="o-mh"><button class="icon-btn" data-a="closeModal" aria-label="Close">${ic.close}</button><h2 class="o-h20">${crTitle()}</h2></header>
  ${stepper()}
  ${{ study: STEP_STUDY, pick: STEP_SELECT, csv: STEP_CSV, check: STEP_CHECK, name: STEP_NAME }[CR.step]()}
  ${crFooter()}
</div>`;

/* ---------- Actions ---------- */
ACTIONS.newFromStudy = () => openCreate("study");
ACTIONS.newFromCsv = () => openCreate("csv");
ACTIONS.crPickStudy = el => { CR.study = el.dataset.v; CR.included = new Set(crStudy().published); };
// Ticks keep the study's order, so the default name and the collection list attributes the way the study does
ACTIONS.crTick = el => { const k = el.dataset.v; CR.included.has(k) ? CR.included.delete(k) : CR.included.add(k); CR.included = new Set(crStudy().published.filter(x => CR.included.has(x))); if (CR.val && !CR.included.has(CR.val.k)) CR.val = null; };
// Clicking an attribute shows it on the cards and opens its values; clicking it again folds them
ACTIONS.crFocus = el => { const k = el.dataset.v; if (CR.focus === k) { CR.openA.has(k) ? CR.openA.delete(k) : CR.openA.add(k); return; } CR.focus = k; CR.openA.add(k); };
ACTIONS.crVal = el => { const [k, v] = el.dataset.v.split("|"); CR.val = CR.val && CR.val.k === k && CR.val.v === v ? null : { k, v }; CR.focus = k; };
ACTIONS.crValAll = () => { CR.val = null; };
ACTIONS.crBack =() => { CR.step = { pick: "study", check: "csv", name: CR.src === "csv" ? "check" : "pick" }[CR.step]; };
ACTIONS.crNext = () => { CR.step = { study: "pick", pick: "name", check: "name" }[CR.step]; if (CR.step === "name") setTimeout(() => { const i = $("#cr-name"); if (i) i.focus(); }); };
INPUTS.crName = el => { CR.name = el.value; };
INPUTS.crDesc = el => { CR.desc = el.value; return false; };
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
