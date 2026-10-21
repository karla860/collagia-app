/* ---------- Attributes homepage ----------
   Cards say what is inside a collection (its attributes, with values), where it came from, who owns it,
   and whether anyone else can see it. An explainer strip carries the Study ⇄ Collection ⇄ CSV model. */

const H = { q: "", sort: "edited", explain: store.get("explain", true) };
const SORTS = { edited: "Last edited", created: "Date created", name: "Name A–Z" };

const ago = date => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date)) / 864e5));
  if (isNaN(days)) return "today";
  if (days === 0) return "today";
  if (days < 7) return days + "d ago";
  if (days < 60) return Math.floor(days / 7) + "w ago";
  return Math.floor(days / 30) + "mo ago";
};
const shownCollections = () => {
  const q = H.q.trim().toLowerCase();
  const list = COLLECTIONS.filter(c => !q || c.name.toLowerCase().includes(q) || c.attrs.some(k => attrLabel(k).toLowerCase().includes(q)));
  const by = { edited: (a, b) => new Date(b.edited) - new Date(a.edited), created: (a, b) => new Date(b.created) - new Date(a.created), name: (a, b) => a.name.localeCompare(b.name) };
  return list.sort(by[H.sort]);
};

/* ---------- The explainer: one picture of the whole feature ---------- */
const explainStrip = (compact = false) => `
  <section class="o-explain${compact ? " compact" : ""}" aria-label="How attributes work">
    <div class="o-ex-node"><span class="o-ex-ic">${ic.studies}</span><b>Study</b><span>Select products on a board and publish a tag: an attribute name and a value, like Upper material = Knit.</span></div>
    <div class="o-ex-arrow"><i>${ic.swap}</i><small>Apply to a study<br>Update from a study</small></div>
    <div class="o-ex-node lib"><span class="o-ex-ic">${ic.tag}</span><b>Attribute collection</b><span>The same attributes, lifted out of the study so they can be kept, versioned, shared and used in other studies.</span></div>
    <div class="o-ex-arrow"><i>${ic.swap}</i><small>Download CSV<br>Update from a CSV</small></div>
    <div class="o-ex-node"><span class="o-ex-ic">${ic.csv}</span><b>Spreadsheet</b><span>A CSV of product IDs and values, from the collection or from anywhere else.</span></div>
    ${compact ? "" : `<button class="icon-btn o-ex-x" data-a="hideExplain" aria-label="Hide" title="Hide">${ic.close}</button>`}
  </section>`;
ACTIONS.hideExplain = () => { H.explain = false; store.set("explain", false); };
ACTIONS.showExplain = () => { H.explain = true; store.set("explain", true); };

/* ---------- Cards ---------- */
const srcLine = c => c.source.type === "study"
  ? `${ic.studies}<span>From study <b>${esc(c.source.name)}</b></span>`
  : `${ic.csv}<span>From <b>${esc(c.source.name)}</b></span>`;
const avatar2 = (p, cls = "") => p.photo ? `<img class="o-av photo ${cls}" src="${p.photo}" alt="" title="${esc(p.name)}">` : `<span class="o-av ${cls}${p.you ? " me" : ""}" title="${esc(p.name)}">${p.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2)}</span>`;
const moreBtn = c => `<button class="more-btn" data-a="menu" data-v="card:${c.id}" aria-haspopup="menu" aria-label="More actions for ${esc(c.name)}">${ic.more}</button>`;
/* Card (Figma "Card · Apparel by Pattern Style"): a board canvas as the cover, title with a round ⋯,
   grey tags with a red square, then where it came from, who has it and when it changed */
const cover = c => {
  // Cover: a plain grid of the collection's own products, with how many more there are
  const ps = cProducts(c), show = ps.slice(0, 21);
  return `<div class="cgrid">${show.map(p => thumb(p, "t")).join("")}${ps.length > show.length ? `<span class="cmore">+${ps.length - show.length}</span>` : ""}</div>`;
};
const card = c => {
  const tags = c.attrs.map(k => { const n = valueCounts(c, k).length; return `<span class="ctag hued" title="Adds ${esc(attrLabel(k))}: ${esc(valueCounts(c, k).map(([v]) => v).join(", "))}"><span class="cdots">${valueCounts(c, k).slice(0, 4).map(([v]) => `<i ${hue(k, v)}></i>`).join("")}</span>${esc(attrLabel(k))}<small>${n}</small></span>`; });
  return `
  <article class="ccard v4" data-a="openCard" data-v="${c.id}" tabindex="0">
    ${cover(c)}
    <div class="cbody">
      <div class="ctitle"><h3>${esc(c.name)}</h3>${moreBtn(c)}</div>
      <div class="ctags">${tags.slice(0, 4).join("")}${tags.length > 4 ? `<span class="ctag more">+${tags.length - 4} more</span>` : ""}</div>
      <div class="csrc">${srcLine(c)}</div>
      <div class="cfoot"><span class="when" title="Version ${c.v.slice(1)} · last edited ${c.edited}">${ic.clock}${ago(c.edited)} · ${c.v}</span><span class="sp"></span>${avatar2(c.owner, "s")}</div>
    </div>
  </article>`;
};

const newBtn = () => `<div class="o-dd"><button class="btn primary${App.menu === "newmenu" ? " open" : ""}" data-a="menu" data-v="newmenu" aria-haspopup="menu" aria-expanded="${App.menu === "newmenu"}">${ic.plus}New collection${ic.chev}</button>
  ${App.menu === "newmenu" ? `<div class="o-menu o-newmenu right" role="menu">
    <button role="menuitem" data-a="newFromStudy">${ic.studies}<span><b>From a study</b><small>Save attributes you published on a board</small></span></button>
    <button role="menuitem" data-a="newFromCsv">${ic.upload}<span><b>From a CSV</b><small>Turn a spreadsheet into attributes</small></span></button>
  </div>` : ""}</div>`;
const sortDD = () => `<div class="o-dd"><button class="o-select h-sortbtn${App.menu === "hsort" ? " open" : ""}" data-a="menu" data-v="hsort" aria-haspopup="menu" aria-expanded="${App.menu === "hsort"}" title="Sort">${ic.sortI}<span>${SORTS[H.sort]}</span>${ic.chev}</button>
  ${App.menu === "hsort" ? `<div class="o-menu right" role="menu">${Object.entries(SORTS).map(([k, l]) => `<button role="menuitemradio" aria-checked="${H.sort === k}" class="${H.sort === k ? "cur" : ""}" data-a="homeSortPick" data-v="${k}">${l}${H.sort === k ? ic.check : ""}</button>`).join("")}</div>` : ""}</div>`;
ACTIONS.homeSortPick = el => { H.sort = el.dataset.v; };

const emptyHome = () => `
  <div class="empty-body">
    <span class="empty-icon big solid">${ic.tag}</span>
    <b>No attribute collections yet</b>
    <p>Publish attributes on a board in a study, then save them here so your team can reuse them. Or start from a spreadsheet.</p>
    <div class="empty-actions">${newBtn()}</div>
  </div>`;
const noMatches = () => `<div class="no-match"><b>No collections match “${esc(H.q)}”</b><span>Try another name or attribute, or clear the search.</span><button class="btn" data-a="clearSearch">Clear search</button></div>`;

RENDER.home = () => {
  markNav();
  const list = shownCollections(), total = COLLECTIONS.length;
  const body = !total ? emptyHome() : !list.length ? noMatches() : `<div class="h-grid">${list.map(card).join("")}</div>`;
  $("#home").innerHTML = `
    <div class="h-head"><h1>Attributes</h1><span class="sp"></span>
      ${total ? `<label class="h-search">${ic.search}<input id="hq" data-in="homeSearch" placeholder="Search collections…" value="${esc(H.q)}"></label>${sortDD()}` : ""}${newBtn()}</div>
    ${H.q && list.length ? `<p class="h-results">${list.length} of ${total} collections match “${esc(H.q)}”</p>` : ""}
    ${body}`;
};

/* ---------- Card ⋯ menu ---------- */
RENDER.float = () => {
  const f = $("#o-float");
  const m = App.menu && App.menu.match(/^card:(.+)$/);
  if (!m || App.modal) { f.innerHTML = ""; return; }
  const c = collById(m[1]), r = App.menuAt;
  const left = Math.max(8, Math.min(r.right - 220, innerWidth / uz() - 228));
  f.innerHTML = `<div class="o-menu o-cardmenu" role="menu" style="top:${r.bottom + 6}px;left:${left}px">
    <button role="menuitem" data-a="openCard" data-v="${c.id}">${ic.open}Open</button>
    <button role="menuitem" data-a="applyFromMenu" data-v="${c.id}">${ic.importStudy}Apply to a study</button>
    <button role="menuitem" data-a="openAccess" data-v="${c.id}">${ic.share}Share…</button>
    <hr class="o-msep"><div class="o-mgroup">Update this collection</div>
    <button role="menuitem" data-a="updateFromStudy" data-v="${c.id}">${ic.studies}From a study</button>
    <button role="menuitem" data-a="updateFromCsv" data-v="${c.id}">${ic.upload}From a CSV</button>
    <hr class="o-msep">
    <button role="menuitem" data-a="exportCsvFor" data-v="${c.id}">${ic.download}Download CSV</button>
    <button role="menuitem" class="danger" data-a="askDelete" data-v="${c.id}">${ic.trash}Delete</button>
  </div>`;
};

/* ---------- Delete: confirm, then Undo ---------- */
let delId = null;
const MODAL_DELETE = () => {
  const c = collById(delId);
  return `<div class="o-modal confirm" role="alertdialog" aria-modal="true" aria-labelledby="del-h" aria-describedby="del-p">
    <div class="o-confirm"><span class="o-confirm-icon">${ic.trash}</span>
      <div><h2 id="del-h" class="o-h16">Delete “${esc(c.name)}”?</h2>
      <p id="del-p">${isPrivate(c) ? "Only you can see this collection, so nobody else is affected." : `It disappears for the ${c.shared.length} people it is shared with.`} Studies that already applied it keep their attributes.</p></div></div>
    <footer class="o-mf flat"><span class="sp"></span><button class="btn" data-a="closeModal">Cancel</button><button class="btn danger" data-a="confirmDelete" id="del-ok">Delete collection</button></footer>
  </div>`;
};
ACTIONS.askDelete = el => { delId = el.dataset.v; App.menu = null; App.modal = "confirmDelete"; setTimeout(() => { const b = $("#del-ok"); if (b) b.focus(); }); };
ACTIONS.confirmDelete = () => {
  const i = COLLECTIONS.findIndex(c => c.id === delId), c = COLLECTIONS.splice(i, 1)[0];
  App.modal = null;
  toast(`Deleted “${c.name}”`, () => { COLLECTIONS.splice(i, 0, c); toast(`Restored “${c.name}”`); });
};
ACTIONS.exportCsvFor = el => { const c = collById(el.dataset.v); toast(`Downloaded ${c.productIds.length} rows as ${c.name.replace(/\W+/g, "_").toLowerCase()}.csv`); return false; };

/* ---------- Studies page (sidebar › Studies) ---------- */
const S_PAGE = { q: "" };
RENDER.studies = () => {
  markNav();
  const q = S_PAGE.q.trim().toLowerCase(), list = STUDIES.filter(s => !q || s.name.toLowerCase().includes(q));
  $("#home").innerHTML = `
    <div class="h-title"><div class="h-heading"><h1>Studies</h1></div></div>
    <div class="h-toolbar"><span class="h-count">${q ? `${list.length} of ${STUDIES.length}` : STUDIES.length} studies</span><span class="sp"></span>
      <label class="h-search">${ic.search}<input id="sq" data-in="studySearch" placeholder="Search studies…" value="${esc(S_PAGE.q)}"></label>
      <button class="btn primary" data-a="bdToast" data-v="New study">${ic.plus}New study</button></div>
    ${list.length ? `<div class="o-studies in-page">${list.map(s => `
      <div class="o-study" data-a="openStudy" data-v="${esc(s.name)}" tabindex="0" role="link">
        <div class="o-sprev study">${studyProducts(s).slice(0, 12).map(p => thumb(p, "s56")).join("")}</div>
        <div class="o-sbody"><div><b>${esc(s.name)}</b><span>${esc(COLLAGES[s.collage].name)} · ${s.edited}</span><span class="o-fit">${studyProducts(s).length} products · ${s.published.length} attribute${s.published.length === 1 ? "" : "s"} published</span></div></div>
      </div>`).join("")}</div>` : `<div class="no-match"><b>No studies match “${esc(S_PAGE.q)}”</b><span>Try another name.</span></div>`}`;
};
INPUTS.studySearch = el => { S_PAGE.q = el.value; };
ACTIONS.openStudy = el => { setFlow("board"); JUMP.board(el.dataset.v); return false; };
const markNav = () => { document.querySelectorAll(".sidebar .nav li").forEach(li => li.classList.toggle("active", li.dataset.v === (App.page === "studies" ? "studies" : App.page === "settings" ? "settings" : "attributes"))); const pr = $(".sidebar .profile"); if (pr) pr.classList.toggle("active", App.page === "settings"); };

/* ---------- Actions ---------- */
INPUTS.homeSearch = el => { H.q = el.value; };
ACTIONS.clearSearch = () => { H.q = ""; };
ACTIONS.nav = el => {
  const v = el.dataset.v;
  if (v === "attributes") { setFlow("home"); App.page = "home"; App.modal = null; return; }
  if (v === "studies") { setFlow("home"); App.page = "studies"; App.modal = null; S_PAGE.q = ""; return; }
  if (v === "collages") { setFlow("board"); JUMP.board(null); return false; }
  if (v === "settings" || v === "profile") { setFlow("settings"); App.page = "settings"; App.modal = null; SET.tab = v === "profile" ? "profile" : SET.tab || "profile"; return; }
  toast(`Prototype: ${el.textContent.trim()} isn't part of this prototype`); return false;
};
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("article[data-a=openCard]")) { e.preventDefault(); e.target.click(); }
});

JUMP.home = v => { App.page = v === "studies" ? "studies" : "home"; App.modal = null; App.menu = null; H.q = ""; S_PAGE.q = ""; render(); };
