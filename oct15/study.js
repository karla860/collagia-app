/* ---------- Flow 4: Adding Attributes to a Study ----------
   Attribute card › Import › Attributes to Study › choose a study › import preview (Option 1 or 3) */

const ST = { sel: null, q: "", preview: true };   // no study is picked until the user picks one

const MODAL_PICK = () => {
  const q = ST.q.trim().toLowerCase(), list = STUDIES.filter(s => !q || s.name.toLowerCase().includes(q));
  const sel = STUDIES.find(s => s.name === ST.sel && s.match);
  const fit = s => !s.match ? `<span class="o-fit none">No matching products</span>`
    : `<span class="o-fit${s.match === s.products ? " all" : ""}">${s.match === s.products ? "All" : s.match} of ${s.products} products match</span>`;
  return `<div class="o-modal xl pick" role="dialog" aria-modal="true" aria-label="Import attributes from ${esc(CD.name)} to a study">
  <header class="o-mh plain"><button class="icon-btn" data-a="pickBack" aria-label="Back">${ic.back}</button><h2 class="o-h16">Import attributes from <b>${esc(CD.name)}</b> to a study</h2></header>
  ${steps(1, `<label class="o-searchbox">${ic.search}<input id="st-q" data-in="stQ" placeholder="Search a Study…" value="${esc(ST.q)}" aria-label="Search a study"></label>`)}
  <div class="o-scroll grey"><div class="o-studies">${list.length ? list.map(s => `
    <div class="o-study${ST.sel === s.name ? " on" : ""}${s.match ? "" : " off"}" ${s.match ? `data-a="pickStudy" data-v="${esc(s.name)}" tabindex="0"` : 'aria-disabled="true" title="None of this study’s products are in the collection"'} role="radio" aria-checked="${ST.sel === s.name}">
      <div class="o-sprev"><img src="${s.img}" alt="">${s.applied ? `<span class="o-applied">Already applied · ${s.applied}</span>` : ""}</div>
      <div class="o-sbody"><div><b>${esc(s.name)}</b><span>${esc(s.collage)} · ${s.edited}</span>${fit(s)}</div></div>
    </div>`).join("") : `<p class="o-muted o-nostudy">No studies match “${esc(ST.q)}”</p>`}</div></div>
  <footer class="o-mf"><span class="o-showing">${sel ? `<b>${esc(sel.name)}</b>` : ""}</span><span class="sp"></span>
    <button class="o-toggle${ST.preview ? " on" : ""}" data-a="togglePreview" role="switch" aria-checked="${ST.preview}"><span class="o-knob"></span>Preview before Import</button>
    <button class="btn primary" data-a="importToStudy" ${sel && list.includes(sel) ? "" : "disabled"}>${ic.importStudy}${ST.preview ? "Preview Changes" : "Import to Study"}</button></footer>
</div>`;
};

const importSrc = () => `oct15/import-preview.html?embed=1&iter=${App.previewIter}&study=${encodeURIComponent(ST.sel)}`;

/* ---------- Modal shell: one overlay, the open modal decides its content ---------- */
/* ---------- Step 3 · Success: what was imported, then the way into the study's board ---------- */
const MODAL_SUCCESS = () => {
  const r = ST.result || { changes: 53, items: 53 }, c = COLLECTIONS.find(x => x.name === CD.name);
  return `<div class="o-modal o-success" role="alertdialog" aria-modal="true" aria-labelledby="ok-h">
    <div class="o-ok-body">
      <span class="o-ok-badge">${ic.check}</span>
      <h2 id="ok-h">Attributes imported</h2>
      <p><b>${esc(CD.name)}</b> is now in <b>${esc(ST.sel)}</b>.</p>
      <ul class="o-ok-facts">
        <li>${ic.tag}<span><b>${COLL_ATTRS.length}</b> attributes added</span></li>
        <li>${ic.box}<span><b>${r.items}</b> products tagged</span></li>
        ${c ? `<li>${ic.history}<span>Version <b>${c.v}</b> applied</span></li>` : ""}
      </ul>
    </div>
    <footer class="o-mf flat"><button class="btn" data-a="successHome">Back to Attributes</button><span class="sp"></span>
      <button class="btn primary" data-a="openStudyBoard" id="ok-go">Open Study Board${ic.arrowR}</button></footer>
  </div>`;
};
const showSuccess = (result) => {
  ST.result = result;
  const s = STUDIES.find(x => x.name === ST.sel), c = COLLECTIONS.find(x => x.name === CD.name);
  if (s && c) s.applied = c.v;   // the study now records which version it has
  App.modal = "success";
  setTimeout(() => { const b = document.getElementById("ok-go"); if (b) b.focus(); });
};
ACTIONS.openStudyBoard = () => { App.modal = null; setFlow("board"); JUMP.board(null); toast(`Opened ${ST.sel || "the study"} board`); return false; };
ACTIONS.successHome = () => { App.modal = null; setFlow("home"); App.page = "home"; };

const MODALS = { success: MODAL_SUCCESS, card: MODAL_CARD, confirmDelete: MODAL_DELETE, access: () => ACCESS_VIEWS[App.opt.access](), chooser: MODAL_CHOOSER, create: MODAL_CREATE, studyPick: MODAL_PICK };
RENDER.modal = () => {
  const ov = $("#o-ov");
  // The floating panel (Access Option 5) leaves the page scrollable and clickable
  const floating = App.modal === "access" && App.opt.access === "5";
  document.body.classList.toggle("locked", !!App.modal && !floating);
  ov.hidden = !App.modal;
  const chips = App.modal === "chips";
  ov.classList.toggle("clear", App.modal === "import" || chips);
  if (!App.modal) { ov.innerHTML = ""; delete ov.dataset.m; return; }
  if (chips) {
    // Flow 3 · Iteration 6 · Chip filters is its own page (oct15/chip-filters.html); keep the frame alive across re-renders
    if (!ov.querySelector("iframe[data-chips]")) ov.innerHTML = `<iframe class="o-frame" data-chips title="${esc(CD.name)}" src="oct15/chip-filters.html?embed=1"></iframe>`;
    delete ov.dataset.k;
    return;
  }
  if (App.modal === "import") {
    // Keep the iframe alive across re-renders; only reload when the source changes
    const f = ov.querySelector("iframe");
    if (!f || f.dataset.src !== importSrc()) ov.innerHTML = `<iframe class="o-frame" title="Import preview" src="${importSrc()}" data-src="${importSrc()}"></iframe>`;
    return;
  }
  // Re-rendering the same modal (a tab switch, a toggle) must not replay its entrance animation
  const steady = ov.dataset.m === App.modal; ov.dataset.m = App.modal; ov.classList.toggle("steady", steady);
  const scroller = ov.querySelector(".o-scroll"), top = scroller ? scroller.scrollTop : 0, key = ov.dataset.k;
  ov.innerHTML = MODALS[App.modal]();
  ov.dataset.k = App.modal + App.opt.card + App.opt.create;
  const ns = ov.querySelector(".o-scroll"); if (ns && key === ov.dataset.k) ns.scrollTop = top;
};
RENDER.escape = () => {
  if (!App.modal) return false;
  if (App.modal === "card" && CD.editing) { CD.editing = false; return true; }   // cancel the rename, keep the modal
  if (App.modal === "create" || App.modal === "chips") App.modal = "chooser";
  else if (App.modal === "studyPick") App.modal = "card";
  else App.modal = null;
  return true;
};
// Backdrop click closes (only when the press also started on the backdrop)
let pressedBackdrop = false;
document.addEventListener("mousedown", e => { pressedBackdrop = e.target.id === "o-ov"; });
document.addEventListener("click", e => { if (e.target.id === "o-ov" && pressedBackdrop && App.modal && App.modal !== "import") { App.modal = null; render(); } });

/* ---------- Messages from the embedded import preview ---------- */
addEventListener("message", e => {
  const d = e.data; if (!d || d.o15 !== "import") return;
  if (d.act === "back") App.modal = "studyPick";
  else if (d.act === "applied") showSuccess({ changes: d.changes, items: d.items });
  else if (d.act === "done") { App.modal = null; setFlow("home"); toast(`Attributes from “${CD.name}” were added to ${ST.sel}`); }
  else App.modal = null;
  render();
});

/* ---------- Messages from the embedded chip-filters modal (Flow 3 · Iteration 6) ---------- */
addEventListener("message", e => {
  const d = e.data; if (!d || d.o15 !== "chips") return;
  if (d.act === "export") return toast(`Exported ${d.n} products as CSV`);
  if (d.act === "renamed") return toast(`Renamed to “${d.name}”`);
  // Back and Esc step back to the Flow 3 chooser, like the other iterations
  if (d.act === "close") App.modal = "chooser";
  else if (d.act === "newCollection") saveCollection(d.name, d.tags, "chip filters");
  render();
});

/* ---------- Actions ---------- */
ACTIONS.toStudyPick = () => { setFlow("study"); ST.q = ""; ST.sel = null; App.modal = "studyPick"; };
ACTIONS.openImport = el => { CD.name = COLLECTIONS[+el.dataset.v].name; resetCard(); ACTIONS.toStudyPick(); };
ACTIONS.pickBack = () => { App.modal = "card"; };
ACTIONS.pickStudy = el => { ST.sel = el.dataset.v; };
INPUTS.stQ = el => { ST.q = el.value; };
ACTIONS.togglePreview = () => { ST.preview = !ST.preview; };
ACTIONS.importToStudy = () => {
  if (ST.preview) { App.modal = "import"; return; }
  const s = STUDIES.find(x => x.name === ST.sel);
  showSuccess({ items: s ? s.match : COLL_PRODUCTS.length });
};
document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".o-study")) { e.preventDefault(); e.target.click(); } });

RENDER.navActive = () => {
  if (App.flow === "study") return App.modal === "studyPick" ? "pick" : App.modal === "import" ? "p" + App.previewIter : App.modal === "card" ? "view" : App.modal === "success" ? "done" : null;
  if (App.flow === "board") return BD.tagOpen ? "tag" : "board";
  if (App.flow === "create" && App.modal === "chooser") return null;
  return App.opt[App.flow];
};

JUMP.study = v => {
  App.page = "home"; App.menu = null;
  if (!v) v = "pick";   // the journey's step 4 starts by choosing a study
  if (v === "view") { CD.name = "Apparel by Pattern Style"; setOpt("card", App.opt.card); resetCard(); App.modal = "card"; App.menu = null; }
  else if (v === "pick") { ST.q = ""; ST.sel = null; App.modal = "studyPick"; }
  else if (v === "done") { ST.sel = ST.sel || "Consumer Preferences"; showSuccess({ changes: 53, items: 53 }); }
  else { App.previewIter = v.slice(1); store.set("previewIter", App.previewIter); ST.sel = ST.sel || "Consumer Preferences"; App.modal = "import"; }
  render();
};
