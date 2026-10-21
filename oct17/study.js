/* ---------- Apply to a study ----------
   Pick a study (the collage decides whether anything matches), then a preview that leads with a plain sentence
   and shows removals first, because applying REPLACES the study's version of each attribute. Then a result.
   From a board it runs the other way round: pick a collection for THIS study. */

const ST = { sel: null, q: "", open: null, result: null, target: null };
const stColl = () => curColl();
const stStudy = () => studyByName(ST.sel);

const MODAL_PICK = () => {
  const c = stColl(), q = ST.q.trim().toLowerCase(), list = STUDIES.filter(s => !q || s.name.toLowerCase().includes(q));
  const sel = stStudy(), total = c.productIds.length;
  const fit = s => { const n = matchCount(c, s); return !n ? `<span class="o-fit none">No matching products · different collage</span>` : `<span class="o-fit${n === total ? " all" : ""}">${n === total ? "All" : n} of ${total} products in this collection</span>`; };
  const has = s => s.applied[c.id] ? `<span class="o-applied${s.applied[c.id] === c.v ? " ok" : ""}">${s.applied[c.id] === c.v ? `Has ${c.v} · up to date` : `Has ${s.applied[c.id]} · behind ${c.v}`}</span>` : "";
  return `<div class="o-modal xl pick" role="dialog" aria-modal="true" aria-label="Apply ${esc(c.name)} to a study">
  <header class="o-mh"><button class="icon-btn" data-a="pickBack" aria-label="Back">${ic.back}</button><h2 class="o-h20">Apply <b>${esc(c.name)}</b> to a study</h2><span class="sp"></span>
    <label class="o-searchbox">${ic.search}<input id="st-q" data-in="stQ" placeholder="Search studies…" value="${esc(ST.q)}" aria-label="Search a study"></label></header>
  <div class="o-pickhelp">${ic.info}Attributes only land on products the study contains, so the study's collage decides whether anything happens. Nothing changes until you've seen the preview.</div>
  <div class="o-scroll grey"><div class="o-studies">${list.length ? list.map(s => { const n = matchCount(c, s); return `
    <div class="o-study${ST.sel === s.name ? " on" : ""}${n ? "" : " off"}" ${n ? `data-a="pickStudy" data-v="${esc(s.name)}" tabindex="0"` : 'aria-disabled="true" title="None of this study’s products are in the collection"'} role="radio" aria-checked="${ST.sel === s.name}">
      <div class="o-sprev study">${studyProducts(s).slice(0, 12).map(p => thumb(p, "s56")).join("")}${has(s)}</div>
      <div class="o-sbody"><div><b>${esc(s.name)}</b><span>${esc(COLLAGES[s.collage].name)} · ${s.edited}</span>${fit(s)}${studyTags(s, 3)}</div></div>
    </div>`; }).join("") : `<p class="o-muted o-nostudy">No studies match “${esc(ST.q)}”</p>`}</div></div>
  <footer class="o-mf"><span class="o-showing">${sel ? `Applying to <b>${esc(sel.name)}</b>` : "Choose a study"}</span><span class="sp"></span>
    <button class="btn primary" data-a="toPreview" ${sel && list.includes(sel) ? "" : "disabled"}>${ic.eye}Preview changes${ic.chevR}</button></footer>
</div>`;
};

/* From a board: which collection to bring into this study */
const MODAL_COLLPICK = () => {
  const s = studyByName(ST.target);
  return `<div class="o-modal collpick" role="dialog" aria-modal="true" aria-label="Apply a collection to ${esc(s.name)}">
  <header class="o-mh"><button class="icon-btn" data-a="closeModal" aria-label="Close">${ic.close}</button><h2 class="o-h20">Apply a collection to <b>${esc(s.name)}</b></h2></header>
  <div class="o-pickhelp">${ic.info}Only collections that share products with this study's collage can do anything here.</div>
  <div class="o-scroll"><div class="o-colllist">${COLLECTIONS.map(c => { const n = matchCount(c, s), on = s.applied[c.id]; return `
    <button class="o-collrow${n ? "" : " off"}" data-a="pickColl" data-v="${c.id}" ${n ? "" : "disabled"}>
      <span class="o-collthumbs">${cProducts(c).slice(0, 3).map(p => thumb(p, "s36")).join("")}</span>
      <span class="o-colltxt"><b>${esc(c.name)}</b><span>${c.attrs.map(attrLabel).join(", ")} · ${c.v} · ${isPrivate(c) ? "private" : `shared with ${c.shared.length}`}</span></span>
      <span class="o-collfit">${n ? (on === c.v ? `<span class="o-fit all">Already has ${c.v}</span>` : on ? `<span class="o-fit">Has ${on} · behind ${c.v}</span>` : `<span class="o-fit">${n} of ${c.productIds.length} products match</span>`) : `<span class="o-fit none">Different collage</span>`}</span>
      ${n ? ic.chevR : ""}
    </button>`; }).join("")}</div></div>
</div>`;
};

/* ---------- Preview ----------
   The same view as Compare with a study (cpSummary + cpGroups in compare.js), so this step confirms what Compare showed
   rather than telling it again in different numbers. Then one button that says what it does. */
const MODAL_PREVIEW = () => {
  const c = stColl(), s = stStudy(), m = cpModel(c, s), synced = !m.changed.length;
  return `<div class="o-modal xl preview cpx" role="dialog" aria-modal="true" aria-label="Preview">
    <header class="o-mh"><button class="icon-btn" data-a="pvBack" aria-label="Back">${ic.back}</button><h2 class="o-h20">Apply <b>${esc(c.name)}</b> to <b>${esc(s.name)}</b></h2><span class="sp"></span><span class="o-pvtag">${ic.eye}Preview · nothing applied yet</span></header>
    <div class="o-scroll grey"><div class="cpx-body">
      ${cpLayout(c, s, m, "")}
    </div></div>
    <footer class="o-mf"><span class="sp"></span>
      <button class="btn" data-a="pvBack">Cancel</button>
      ${synced ? `<button class="btn primary" data-a="pvBack">Choose another study</button>` : `<button class="btn primary" data-a="pvApply">${ic.importStudy}${s.published.some(k => c.attrs.includes(k)) ? "Replace" : "Add"} ${c.attrs.length === 1 ? esc(attrLabel(c.attrs[0])) : c.attrs.length + " attributes"} in ${esc(s.name)}</button>`}
    </footer>
  </div>`;
};

/* ---------- Result ---------- */
const MODAL_SUCCESS = () => {
  const c = stColl(), s = stStudy(), r = ST.result || { items: 0, added: 0, changed: 0, removed: 0 };
  // One clear next step (the study, by name), then two quiet ways out: back, or undo
  return `<div class="o-modal o-success" role="alertdialog" aria-modal="true" aria-labelledby="ok-h">
    <div class="o-ok-body">
      <span class="o-ok-badge">${ic.check}</span>
      <h2 id="ok-h">Applied to ${esc(s.name)}</h2>
      <p><b>${esc(c.name)}</b> ${c.v} is now in the study. Its attributes are in the study's filters and group-by.</p>
      <ul class="o-ok-facts">
        <li>${ic.tag}<span><b>${c.attrs.length}</b> attribute${c.attrs.length === 1 ? "" : "s"}: ${c.attrs.map(attrLabel).join(", ")}</span></li>
        <li>${ic.box}<span><b>${r.items}</b> changes · ${r.added} added, ${r.changed} changed, ${r.removed} removed</span></li>
        <li>${ic.history}<span>The study remembers it has <b>${c.v}</b>; re-apply after an update to catch up</span></li>
      </ul>
    </div>
    <footer class="o-ok-acts">
      <button class="btn primary o-ok-go" data-a="openStudyBoard" id="ok-go">Open ${esc(s.name)}${ic.arrowR}</button>
      <div class="o-ok-sec"><button class="o-ok-link" data-a="successHome">${ic.arrowL}Back to Attributes</button>${ST.undo && ST.undo.study === s.name ? `<i class="o-ok-dot"></i><button class="o-ok-link" data-a="undoApply" title="Puts the study back the way it was">${ic.undo}Undo apply</button>` : ""}</div>
    </footer>
  </div>`;
};

/* ---------- Modal shell: one overlay, the open modal decides its content. No iframes. ---------- */
const MODALS = { success: () => MODAL_SUCCESS(), card: () => MODAL_CARD(), confirmDelete: () => MODAL_DELETE(), access: () => MODAL_ACCESS(), create: () => MODAL_CREATE(), studyPick: () => MODAL_PICK(), collPick: () => MODAL_COLLPICK(), preview: () => MODAL_PREVIEW(), compare: () => MODAL_COMPARE() };
RENDER.modal = () => {
  const ov = $("#o-ov");
  document.body.classList.toggle("locked", !!App.modal);
  ov.hidden = !App.modal;
  if (!App.modal) { ov.innerHTML = ""; delete ov.dataset.m; return; }
  const steady = ov.dataset.m === App.modal; ov.dataset.m = App.modal; ov.classList.toggle("steady", steady);
  const scroller = ov.querySelector(".o-scroll"), top = scroller ? scroller.scrollTop : 0, key = ov.dataset.k;
  ov.innerHTML = MODALS[App.modal]();
  ov.dataset.k = App.modal + (App.modal === "create" ? CR.step : "");
  const ns = ov.querySelector(".o-scroll"); if (ns && key === ov.dataset.k) ns.scrollTop = top;
};
RENDER.escape = () => {
  if (!App.modal) return false;
  if (App.modal === "card" && CD.editing) { CD.editing = false; return true; }
  if (App.modal === "studyPick") App.modal = ST.fromBoard ? null : "card";
  else if (App.modal === "preview") App.modal = ST.fromCompare ? "compare" : ST.fromBoard ? "collPick" : "studyPick";
  else if (App.modal === "compare") { App.modal = "card"; setFlow("card"); }
  else if (App.modal === "access") ACTIONS.accessBack();
  else App.modal = null;
  return true;
};
let pressedBackdrop = false;
document.addEventListener("mousedown", e => { pressedBackdrop = e.target.id === "o-ov"; });
document.addEventListener("click", e => { if (e.target.id === "o-ov" && pressedBackdrop && App.modal) { if (App.modal === "access") ACTIONS.accessBack(); else App.modal = null; render(); } });

/* ---------- Actions ---------- */
ACTIONS.toStudyPick = () => { setFlow("study"); ST.q = ""; ST.sel = null; ST.open = null; ST.fromBoard = false; ST.fromCompare = false; App.modal = "studyPick"; };
ACTIONS.applyFromMenu = el => { openCard(el.dataset.v); ACTIONS.toStudyPick(); };
ACTIONS.pickBack = () => { App.modal = "card"; setFlow("card"); };
ACTIONS.pickStudy = el => { ST.sel = el.dataset.v; };
INPUTS.stQ = el => { ST.q = el.value; };
// There is no separate preview screen: choosing a study opens the comparison, which is the preview
ACTIONS.toPreview = () => { openCompare(ST.sel); };
ACTIONS.pickColl = el => { CD.id = el.dataset.v; ST.sel = ST.target; ST.fromBoard = true; openCompare(ST.target); };
ACTIONS.pvBack = () => { if (ST.fromCompare) { App.modal = "compare"; setFlow("compare"); return; } App.modal = ST.fromBoard ? "collPick" : "studyPick"; };
// Apply straight away (no confirmation): keep a copy of the study's attributes so the success screen can undo it
ACTIONS.pvApply = () => {
  const c = stColl(), s = stStudy(), t = diffTotals(diffFor(c, s));
  ST.undo = { study: s.name, coll: c.id, tags: JSON.parse(JSON.stringify(s.tags)), published: [...s.published], applied: { ...s.applied } };
  applyCollection(c, s);
  ST.result = t; App.modal = "success";
  setTimeout(() => { const b = document.getElementById("ok-go"); if (b) b.focus(); });
};
ACTIONS.undoApply = () => {
  const u = ST.undo, s = u && studyByName(u.study); if (!s) return false;
  s.tags = u.tags; s.published = u.published; s.applied = u.applied; ST.undo = null;
  openCompare(s.name); toast(`Undone. ${s.name} is back to how it was.`);
};
// Opens the board grouped by the collection's first attribute, then split by its second, so every attribute that landed is visible
ACTIONS.openStudyBoard = () => { App.modal = null; setFlow("board"); const s = stStudy(), at = stColl().attrs; if (s) { BD.matrix = "group"; BD.groupBy = at[0]; BD.group2 = at[1] || null; BD.show = BD.groupBy; BD.filters = {}; } JUMP.board(ST.sel); toast(`Opened ${ST.sel || "the study"}`); return false; };
// Demo: a collection with two attributes (Statue backgrounds: Background color + Material) applied to a study that has neither.
// Resets that study first so the demo can be replayed.
const resetAntiquities = () => { const s = studyByName("Antiquities sale 2026"); if (s) { s.tags = {}; s.published = []; s.applied = {}; } };
ACTIONS.successHome = () => { App.modal = null; setFlow("home"); App.page = "home"; };
document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".o-study")) { e.preventDefault(); e.target.click(); } });

JUMP.study = v => {
  App.page = "home"; App.menu = null; ST.fromBoard = false;
  if (!collById(CD.id)) CD.id = COLLECTIONS[0].id;
  if (v === "multi" || v === "multidone" || v === "multiboard") {
    resetAntiquities(); CD.id = "statues"; ST.sel = "Antiquities sale 2026"; ST.fromCompare = false; CP.open = null; CP.touched = false; CP.q = ""; App.modal = "preview";
    if (v !== "multi") { ACTIONS.pvApply(); if (v === "multiboard") { ACTIONS.openStudyBoard(); return; } }
  }
  else if (v === "preview") { ST.sel = ST.sel || "Price architecture"; openCompare(ST.sel); }
  else if (v === "done") { ST.sel = ST.sel || "Price architecture"; ST.result = ST.result || diffTotals(diffFor(curColl(), stStudy())); App.modal = "success"; }
  else { ST.q = ""; ST.sel = null; App.modal = "studyPick"; }
  render();
};
