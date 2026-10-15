/* ---------- Flow 1: Attributes Homepage (Options 1–3, Empty states A and B; Option 4 and Empty state C are in home2.js) ---------- */

const H = { q: "", sort: "edited" };
const SORTS = { edited: "Last edited", created: "Date created", name: "Name A–Z" };
const INTRO = "Create custom Attributes inside a study, publish them, then save them to a shared library. Pull a library into any study, or upload a CSV to start from scratch.";

const shownCollections = () => {
  const q = H.q.trim().toLowerCase();
  const list = COLLECTIONS.filter(c => !q || c.name.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q)));
  const by = { edited: (a, b) => new Date(b.edited) - new Date(a.edited), created: (a, b) => new Date(b.created) - new Date(a.created), name: (a, b) => a.name.localeCompare(b.name) };
  return list.sort(by[H.sort]);
};
const ago = date => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date)) / 864e5));
  if (days === 0) return "Today";
  if (days < 7) return days + "d ago";
  if (days < 60) return Math.floor(days / 7) + "w ago";
  return Math.floor(days / 30) + "mo ago";
};

/* ---------- Pieces ---------- */
const ctag = t => `<span class="ctag">${esc(t)}</span>`;
const ctags = (c, max) => `<div class="ctags">${c.tags.slice(0, max).map(ctag).join("")}${c.tags.length > max ? `<span class="ctag more">+${c.tags.length - max} more</span>` : ""}</div>`;
const cIndex = c => COLLECTIONS.indexOf(c);
const moreBtn = c => `<button class="more-btn" data-a="menu" data-v="card:${cIndex(c)}" aria-haspopup="menu" aria-label="More actions for ${esc(c.name)}">${ic.more}</button>`;
const titleRow = c => `<div class="ctitle"><h3>${esc(c.name)}</h3>${moreBtn(c)}</div>`;
const edited = c => `<div class="cedit"><span class="when" title="Last edited ${c.edited}">${ic.clock}${ago(c.edited)}</span></div>`;
const cprev = c => `<div class="cprev"><img src="${c.img}" alt="Preview of ${esc(c.name)}"></div>`;
const newBtn = () => `<button class="btn primary" data-a="newCollection">${ic.plus}New Attribute Collection</button>`;

// Outline the collection being shared while the floating share panel is open
const sharing = c => App.modal === "access" && App.opt.access === "5" && c.name === AC.name ? " is-sharing" : "";
const card = (c, ring = false) => `
  <article class="ccard${ring ? " has-ring" : ""}${sharing(c)}" data-a="openCard" data-v="${cIndex(c)}" tabindex="0">
    ${cprev(c)}
    <div class="cbody">${titleRow(c)}${ring ? `<p class="cdesc">${esc(c.desc)}</p>` : ""}${ctags(c, ring ? 3 : 4)}${edited(c)}</div>
  </article>`;
const mediaCard = c => `
  <article class="ccard media${sharing(c)}" data-a="openCard" data-v="${cIndex(c)}" tabindex="0">
    ${cprev(c)}
    <div class="mpanel">${titleRow(c)}${ctags(c, 2)}${edited(c)}</div>
  </article>`;

const emptyActions = primary => `<div class="empty-actions">${primary ? newBtn() : ""}<button class="btn" data-a="csvUpload">${ic.upload}Upload CSV</button><button class="btn" data-a="toStudies">${ic.studies}Go to Studies</button></div>`;
const tagIcon = size => `<svg viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M2 2.5h5.5L14 9l-5 5-6.5-6.5z"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/></svg>`;
const emptyB = () => `
  <div class="empty-body">
    <span class="empty-icon big">${tagIcon(24)}</span>
    <b>No attribute collections yet</b>
    <p>Create your first collection to tag products the same way across studies. You can also bring in attributes published from a study, or upload a CSV.</p>
    ${emptyActions(true)}
  </div>`;
const emptyA = () => `
  <div class="h-empty">
    <div class="h-grid ghosts" aria-hidden="true">${"<div class='ghost'><span class='gp'></span><span class='gl' style='width:55%'></span><span class='gl' style='width:75%'></span><span class='gl' style='width:30%'></span></div>".repeat(3)}</div>
    <div class="empty-msg">
      <span class="empty-icon">${tagIcon(20)}</span>
      <b>No attribute collections yet</b>
      <p>Collections appear here once attributes from a study are published and saved to the library.</p>
      ${emptyActions(false)}
    </div>
  </div>`;
const noMatches = () => `<div class="no-match"><b>No collections match “${esc(H.q)}”</b><span>Try another name or attribute, or clear the search.</span><button class="btn" data-a="clearSearch">Clear search</button></div>`;

RENDER.home = () => {
  RENDER.sidebar();
  const o = App.opt.home, empty = o.startsWith("empty");
  const section = o === "side" && H.section !== "all";   // Option 4 · a sub-page picked in the sidebar
  const list = empty ? [] : shownCollections(), total = empty ? 0 : COLLECTIONS.length;
  let body;
  if (o === "emptyB") body = emptyB();
  else if (o === "emptyC") body = emptyC();
  else if (empty) body = emptyA();
  else if (section) body = sectionBody(list) || noMatches();
  else if (!COLLECTIONS.length) body = emptyB();
  else if (!list.length) body = noMatches();
  else if (o === "2") body = `<div class="h-grid wide">${list.map(mediaCard).join("")}</div>`;
  else if (o === "3") body = `<div class="h-grid four">${list.map(c => card(c, true)).join("")}</div>`;
  else body = `<div class="h-grid">${list.map(c => card(c)).join("")}</div>`;

  $("#home").innerHTML = `
    <div class="h-title"><div class="h-heading"><h1>${section ? SECTIONS[H.section] : "Attributes"}</h1>
      <span class="info" tabindex="0" aria-describedby="attr-tip">${ic.info}<span class="tip" role="tooltip" id="attr-tip">${INTRO}</span></span></div></div>
    <div class="h-toolbar">
      <span class="h-count">${section ? `${sectionCount(H.section)} Attribute Collections` : `${H.q ? `${list.length} of ${total}` : total} Attribute Collections`}</span>
      <span class="sp"></span>
      ${empty || !COLLECTIONS.length ? "" : `<label class="h-search">${ic.search}<input id="hq" data-in="homeSearch" placeholder="Search an Attribute…" value="${esc(H.q)}"></label>
      <label class="h-sort">Sort: <select id="hsort" data-in="homeSort">${Object.entries(SORTS).map(([k, l]) => `<option value="${k}"${H.sort === k ? " selected" : ""}>${l}</option>`).join("")}</select></label>`}
      ${o === "emptyB" || (!empty && !COLLECTIONS.length) ? "" : newBtn()}
    </div>
    ${body}`;
};

/* ---------- Card ⋯ menu (floats over the page) ---------- */
RENDER.float = () => {
  const f = $("#o-float");
  const m = App.menu && App.menu.match(/^card:(\d+)$/);
  if (!m || (App.modal && !(App.modal === "access" && App.opt.access === "5"))) { f.innerHTML = ""; return; }
  const c = COLLECTIONS[+m[1]], r = App.menuAt;
  const left = Math.max(8, Math.min(r.right - 200, innerWidth - 208));
  f.innerHTML = `<div class="o-menu o-cardmenu" role="menu" style="top:${r.bottom + 6}px;left:${left}px">
    <button role="menuitem" data-a="openCard" data-v="${m[1]}">${ic.open}Open</button>
    <button role="menuitem" data-a="openAccess" data-v="${m[1]}">${ic.share}Share</button>
    <button role="menuitem" data-a="openImport" data-v="${m[1]}">${ic.importStudy}Import to a Study</button>
    <button role="menuitem" class="danger" data-a="askDelete" data-v="${m[1]}">${ic.trash}Delete</button>
  </div>`;
};

/* ---------- Delete: confirm first, then offer Undo ---------- */
let delIndex = null;
const MODAL_DELETE = () => {
  const c = COLLECTIONS[delIndex];
  return `<div class="o-modal confirm" role="alertdialog" aria-modal="true" aria-labelledby="del-h" aria-describedby="del-p">
    <div class="o-confirm"><span class="o-confirm-icon">${ic.trash}</span>
      <div><h2 id="del-h" class="o-h16">Delete “${esc(c.name)}”?</h2>
      <p id="del-p">The collection and its ${c.tags.length} attributes are removed for everyone it’s shared with. Studies that already imported it keep their attributes.</p></div></div>
    <footer class="o-mf flat"><span class="sp"></span><button class="btn" data-a="closeModal">Cancel</button><button class="btn danger" data-a="confirmDelete" id="del-ok">Delete collection</button></footer>
  </div>`;
};
ACTIONS.undo = () => { const fn = toastUndo; toastUndo = null; $("#toast").hidden = true; if (fn) fn(); };
ACTIONS.askDelete = el => { delIndex = +el.dataset.v; App.menu = null; App.modal = "confirmDelete"; setTimeout(() => { const b = $("#del-ok"); if (b) b.focus(); }); };
ACTIONS.confirmDelete = () => {
  const i = delIndex, c = COLLECTIONS.splice(i, 1)[0];
  DELETED.unshift(c);   // listed under Recently deleted (Option 4)
  App.modal = null;
  toast(`Deleted “${c.name}”`, () => { DELETED.splice(DELETED.indexOf(c), 1); COLLECTIONS.splice(i, 0, c); toast(`Restored “${c.name}”`); });
};

/* ---------- Actions ---------- */
INPUTS.homeSearch = el => { H.q = el.value; };
INPUTS.homeSort = el => { H.sort = el.value; };
ACTIONS.clearSearch = () => { H.q = ""; };
ACTIONS.csvUpload = () => { toast("Prototype: this opens the CSV upload"); return false; };
ACTIONS.toStudies = () => { toast("Prototype: Studies isn't part of this prototype"); return false; };
ACTIONS.nav = el => {
  const v = el.dataset.v;
  if (v === "attributes") { setFlow("home"); App.page = "home"; App.modal = null; return; }
  if (v === "collages") { setFlow("board"); JUMP.board(null); return false; }
  toast(`Prototype: ${el.textContent.trim()} isn't part of this prototype`); return false;
};

document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("article[data-a=openCard]")) { e.preventDefault(); e.target.click(); }
});

JUMP.home = v => {
  if (v) setOpt("home", v);
  App.page = "home"; App.modal = null; App.menu = null; H.q = "";
  render();
};
