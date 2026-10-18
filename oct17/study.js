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
      <div class="o-sbody"><div><b>${esc(s.name)}</b><span>${esc(COLLAGES[s.collage].name)} · ${s.edited}</span>${fit(s)}</div></div>
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

/* ---------- Preview ---------- */
const dchip = (kind, from, to) => kind === "remove" ? `<span class="o-dchip rm">${ic.minus}${esc(from)}</span>`
  : kind === "change" ? `<span class="o-dchip ch"><s>${esc(from)}</s>${ic.arrowR}${esc(to)}</span>` : `<span class="o-dchip add">${ic.plus}${esc(to)}</span>`;
const sentence = (c, s, t) => {
  const n = c.attrs.length, label = n === 1 ? attrLabel(c.attrs[0]) : `${n} attributes`;
  const parts = [t.added && `${t.added} tags added`, t.changed && `${t.changed} changed`, t.removed && `${t.removed} removed`].filter(Boolean);
  return `${s.published.some(k => c.attrs.includes(k)) ? "Replaces" : "Adds"} <b>${esc(label)}</b> in <b>${esc(s.name)}</b> with this collection's version: ${parts.join(", ") || "no changes"}.`;
};
const MODAL_PREVIEW = () => {
  const c = stColl(), s = stStudy(), d = diffFor(c, s), t = diffTotals(d), synced = s.applied[c.id] === c.v || !t.items;
  const rows = [...d].sort((a, b) => b.removed.length - a.removed.length || b.total - a.total);
  if (ST.open === null) ST.open = rows[0] && rows[0].total ? rows[0].k : null;
  const group = (label, cls, items, fn) => items.length ? `<div class="o-dgroup ${cls}"><div class="o-dgh">${label}<span class="n">${items.length}</span></div>
    ${items.slice(0, 6).map(x => `<div class="o-drow">${thumb(x.p, "s36")}<span class="nm">${esc(x.p.name)}</span><span class="o-id">${x.p.id}</span>${fn(x)}</div>`).join("")}
    ${items.length > 6 ? `<div class="o-dmore">+ ${items.length - 6} more</div>` : ""}</div>` : "";
  const row = a => {
    const open = ST.open === a.k, sum = [a.removed.length && `<b class="rm">${a.removed.length} removed</b>`, a.changed.length && `${a.changed.length} changed`, a.added.length && `${a.added.length} added`].filter(Boolean).join(" · ");
    return `<section class="o-arow${open ? " open" : ""}${a.removed.length ? " warn" : ""}">
      <button class="o-arow-h" data-a="pvToggle" data-v="${a.k}" aria-expanded="${open}">
        ${ic.tag}<b>${esc(attrLabel(a.k))}</b>
        <span class="o-arow-sum">${a.total ? sum : "Already identical"}</span>
        <span class="o-arow-vals">${a.studyValues.slice(0, 4).map(v => `<s>${esc(v)}</s>`).join("")}${a.studyValues.length ? `<i>${ic.arrowR}</i>` : ""}${valueCounts(c, a.k).slice(0, 6).map(([v]) => `<span>${esc(v)}</span>`).join("")}${valueCounts(c, a.k).length > 6 ? `<span class="more">+${valueCounts(c, a.k).length - 6} more</span>` : ""}</span>
        <span class="o-arow-n"><span class="rm">−${a.removed.length}</span><span class="ch">⇄${a.changed.length}</span><span class="add">+${a.added.length}</span></span>${ic.chev}
      </button>
      ${open && a.total ? `<div class="o-arow-b">
        ${a.removed.length ? `<p class="o-why">${ic.warn}These products carry <b>${esc(attrLabel(a.k))}</b> in the study but aren't in this collection, so the value is removed.</p>` : ""}
        ${group("Removed", "rm", a.removed, x => dchip("remove", x.from))}
        ${group("Changed", "ch", a.changed, x => dchip("change", x.from, x.to))}
        ${group("Added", "add", a.added, x => `<span class="o-addchip">${ic.plus}<small>${esc(attrLabel(a.k))}:</small><i class="o-vdot" ${hue(a.k, x.to)}></i>${esc(x.to)}</span>`)}
      </div>` : ""}
    </section>`;
  };
  return `<div class="o-modal xl preview" role="dialog" aria-modal="true" aria-label="Preview">
    <header class="o-mh"><button class="icon-btn" data-a="pvBack" aria-label="Back">${ic.back}</button><h2 class="o-h20">Apply <b>${esc(c.name)}</b> to <b>${esc(s.name)}</b></h2><span class="sp"></span><span class="o-pvtag">${ic.eye}Preview · nothing applied yet</span></header>
    <div class="o-scroll grey"><div class="o-pv">
      ${synced ? `<div class="o-lead ok">${ic.check}<div><b>Already up to date.</b> ${esc(s.name)} has this collection's tags. Applying it again changes nothing.</div></div>`
        : `<div class="o-lead${t.removed ? " warn" : ""}">${t.removed ? ic.warn : ic.info}<div>${sentence(c, s, t)}${t.removed ? ` <b>${t.removed} products lose a value</b> because this collection has nothing for them.` : ""}</div></div>
      <div class="o-counters">
        <div><span>Changes</span><b>${t.items}</b></div>
        <div class="add"><span>Tags added</span><b>${t.added}</b></div>
        <div class="ch"><span>Changed</span><b>${t.changed}</b></div>
        <div class="rm"><span>Removed</span><b>${t.removed}</b></div>
      </div>`}
      <div class="o-sec">By attribute${t.removed ? " · removals first" : ""}</div>
      ${rows.map(row).join("")}
    </div></div>
    <footer class="o-mf"><span class="o-showing">${synced ? "" : `<b>${t.items}</b> changes across ${c.attrs.length} attribute${c.attrs.length === 1 ? "" : "s"}`}</span><span class="sp"></span>
      <button class="btn" data-a="pvBack">Cancel</button>
      ${synced ? `<button class="btn primary" data-a="pvBack">Choose another study</button>` : `<button class="btn primary${t.removed ? " danger" : ""}" data-a="pvApply">${ic.importStudy}${s.published.some(k => c.attrs.includes(k)) ? "Replace" : "Add"} ${c.attrs.length === 1 ? esc(attrLabel(c.attrs[0])) : c.attrs.length + " attributes"} in ${esc(s.name)}</button>`}
    </footer>
  </div>`;
};

/* ---------- Result ---------- */
const MODAL_SUCCESS = () => {
  const c = stColl(), s = stStudy(), r = ST.result || { items: 0, added: 0, changed: 0, removed: 0 };
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
    <footer class="o-mf flat"><button class="btn" data-a="successHome">Back to Attributes</button><span class="sp"></span>
      <button class="btn primary" data-a="openStudyBoard" id="ok-go">Open the study board${ic.arrowR}</button></footer>
  </div>`;
};

/* ---------- Modal shell: one overlay, the open modal decides its content. No iframes. ---------- */
const MODALS = { success: () => MODAL_SUCCESS(), card: () => MODAL_CARD(), confirmDelete: () => MODAL_DELETE(), access: () => MODAL_ACCESS(), create: () => MODAL_CREATE(), studyPick: () => MODAL_PICK(), collPick: () => MODAL_COLLPICK(), preview: () => MODAL_PREVIEW() };
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
  else if (App.modal === "preview") App.modal = ST.fromBoard ? "collPick" : "studyPick";
  else App.modal = null;
  return true;
};
let pressedBackdrop = false;
document.addEventListener("mousedown", e => { pressedBackdrop = e.target.id === "o-ov"; });
document.addEventListener("click", e => { if (e.target.id === "o-ov" && pressedBackdrop && App.modal) { App.modal = null; render(); } });

/* ---------- Actions ---------- */
ACTIONS.toStudyPick = () => { setFlow("study"); ST.q = ""; ST.sel = null; ST.open = null; ST.fromBoard = false; App.modal = "studyPick"; };
ACTIONS.applyFromMenu = el => { openCard(el.dataset.v); ACTIONS.toStudyPick(); };
ACTIONS.pickBack = () => { App.modal = "card"; setFlow("card"); };
ACTIONS.pickStudy = el => { ST.sel = el.dataset.v; };
INPUTS.stQ = el => { ST.q = el.value; };
ACTIONS.toPreview = () => { ST.open = null; App.modal = "preview"; };
ACTIONS.pickColl = el => { CD.id = el.dataset.v; ST.sel = ST.target; ST.open = null; ST.fromBoard = true; App.modal = "preview"; };
ACTIONS.pvBack = () => { App.modal = ST.fromBoard ? "collPick" : "studyPick"; };
ACTIONS.pvToggle = el => { ST.open = ST.open === el.dataset.v ? "" : el.dataset.v; };
ACTIONS.pvApply = () => {
  const c = stColl(), s = stStudy(), t = diffTotals(diffFor(c, s));
  applyCollection(c, s);
  ST.result = t; App.modal = "success";
  setTimeout(() => { const b = document.getElementById("ok-go"); if (b) b.focus(); });
};
ACTIONS.openStudyBoard = () => { App.modal = null; setFlow("board"); const s = stStudy(); if (s) { BD.matrix = "group"; BD.groupBy = stColl().attrs[0]; BD.show = BD.groupBy; } JUMP.board(ST.sel); toast(`Opened ${ST.sel || "the study"}`); return false; };
ACTIONS.successHome = () => { App.modal = null; setFlow("home"); App.page = "home"; };
document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".o-study")) { e.preventDefault(); e.target.click(); } });

JUMP.study = v => {
  App.page = "home"; App.menu = null; ST.fromBoard = false;
  if (!collById(CD.id)) CD.id = COLLECTIONS[0].id;
  if (v === "preview") { ST.sel = ST.sel || "Price architecture"; ST.open = null; App.modal = "preview"; }
  else if (v === "done") { ST.sel = ST.sel || "Price architecture"; ST.result = ST.result || diffTotals(diffFor(curColl(), stStudy())); App.modal = "success"; }
  else { ST.q = ""; ST.sel = null; App.modal = "studyPick"; }
  render();
};
