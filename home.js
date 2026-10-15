/* ---------- Attributes homepage (Figma "Flow 1: Attributes Homepage", Options 5, 8, 9) ---------- */
// Uses read/save, ic and openCollection from app.js

const COLLECTIONS = [
  { name: "Statues by BG Color", v: "v1", tags: ["Black & White", "Grey", "Beige"], desc: "A collection that groups statue product images by their background color, used by e-commerce and merchandising teams.", created: "Sep 2, 2026", edited: "Sep 30, 2026", img: "assets/preview-statues.png" },
  { name: "Apparel by Pattern Style", v: "v2", tags: ["Solid", "Striped", "Floral", "Graphic Print", "Multicolored", "Plaid"], desc: "A visual catalog of apparel products organized by surface pattern, enabling designers and online store teams to filter listings.", created: "Aug 19, 2026", edited: "Sep 16, 2026", img: "assets/preview-apparel.png" },
  { name: "Collectibles by Finish Type", v: "v1", tags: ["Glossy", "Matte", "Hand-Painted", "Bronze", "Copper", "Gold Plated", "Gold"], desc: "A merchandise collection that sorts collectible items by surface finish, helping fans and store teams browse, price, and identify listings.", created: "Aug 12, 2026", edited: "Sep 9, 2026", img: "assets/preview-collectibles.png" },
];

const HOME_OPTIONS = { "5": "Refined cards", "8": "Media cards", "9": "Hover actions", empty: "Empty A", emptyB: "Empty B" };
const SORTS = { edited: "Last edited", created: "Date created", name: "Name A–Z" };
const INTRO = "Create custom Attributes inside a study, publish them, then save them to a shared library. Pull a library into any study, or upload a CSV to start from scratch.";

const H = { option: read("homeOption", HOME_OPTIONS, "5"), q: "", sort: "edited" };

const hi = {
  search: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>',
  clock: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="8" cy="8" r="6.25"/><path d="M8 4.75V8l2.25 1.5"/></svg>',
  info: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.25"/><path d="M8 7.25V11" stroke-linecap="round"/><circle cx="8" cy="5" r=".9" fill="currentColor" stroke="none"/></svg>',
  studies: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M6 2h4M6.5 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9.5 6V2"/></svg>',
  upload: '<svg class="i" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 10.5h1.5V4.31l2.22 2.22 1.06-1.06L8 1.44 3.97 5.47l1.06 1.06 2.22-2.22zM2 10h1.5v2.5h9V10H14v4H2z"/></svg>',
  more: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="7.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="16.5" r="1.4"/></svg>',
};

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const shownCollections = () => {
  const q = H.q.trim().toLowerCase();
  const list = COLLECTIONS.filter(c => !q || c.name.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q)));
  const by = { edited: (a, b) => new Date(b.edited) - new Date(a.edited), created: (a, b) => new Date(b.created) - new Date(a.created), name: (a, b) => a.name.localeCompare(b.name) };
  return list.sort(by[H.sort]);
};

/* ---------- Pieces ---------- */
const tag = t => `<span class="ctag">${esc(t)}</span>`;
const tags = (c, max) => `<div class="ctags">${c.tags.slice(0, max).map(tag).join("")}${c.tags.length > max ? `<span class="ctag more">+${c.tags.length - max} more</span>` : ""}</div>`;
const moreBtn = c => `<button class="more-btn" data-h="more" data-name="${esc(c.name)}" aria-label="More actions for ${esc(c.name)}">${hi.more}</button>`;
const titleRow = c => `<div class="ctitle"><h3>${esc(c.name)}</h3>${moreBtn(c)}</div>`;
// Compact relative time: 3d ago, 2w ago, 4mo ago (full date on hover)
const ago = date => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date)) / 864e5));
  if (days === 0) return "Today";
  if (days < 7) return days + "d ago";
  if (days < 60) return Math.floor(days / 7) + "w ago";
  return Math.floor(days / 30) + "mo ago";
};
const edited = c => `<div class="cedit"><span class="when" title="Last edited ${c.edited}">${hi.clock}${ago(c.edited)}</span></div>`;
const preview = c => `<div class="cprev"><img src="${c.img}" alt="Preview of ${esc(c.name)}"></div>`;
const primaryBtn = () => `<button class="btn primary" data-h="new">${ic.plus}New Attribute Collection</button>`;

// Option 5: name, tags, edit time. Option 9 (ring): preview inset 4px, keeps the description, max 3 tags
const card = (c, { ring = false } = {}) => `
  <article class="ccard${ring ? " has-ring" : ""}" data-h="open" data-name="${esc(c.name)}" tabindex="0">
    ${preview(c)}
    <div class="cbody">${titleRow(c)}${ring ? `<p class="cdesc">${esc(c.desc)}</p>` : ""}${tags(c, ring ? 3 : 4)}${edited(c)}</div>
  </article>`;

// Option 8: media card. Frosted info panel along the preview's bottom edge; its contents wrap inside it
const mediaCard = c => `
  <article class="ccard media" data-h="open" data-name="${esc(c.name)}" tabindex="0">
    ${preview(c)}
    <div class="mpanel">${titleRow(c)}${tags(c, 2)}${edited(c)}</div>
  </article>`;

// Empty-state actions: white buttons with a grey stroke; variant B adds the primary CTA
const emptyActions = primary => `<div class="empty-actions">${primary ? primaryBtn() : ""}<button class="btn" data-h="csv">${hi.upload}Upload CSV</button><button class="btn" data-h="studies">${hi.studies}Go to Studies</button></div>`;

// Empty B: message straight on the page body, no placeholder cards
const emptyMessage = () => `
  <div class="empty-body">
    <span class="empty-icon big"><svg viewBox="0 0 16 16" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M2 2.5h5.5L14 9l-5 5-6.5-6.5z"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/></svg></span>
    <b>No attribute collections yet</b>
    <p>Create your first collection to tag products the same way across studies. You can also bring in attributes published from a study, or upload a CSV.</p>
    ${emptyActions(true)}
  </div>`;

// Empty A: placeholder cards in the grid layout with a message on top.
// The header button stays the one "new" action; the message offers the other two routes.
const homeEmptyState = () => `
  <div class="h-empty">
    <div class="h-grid ghosts" aria-hidden="true">${"<div class='ghost'><span class='gp'></span><span class='gl' style='width:55%'></span><span class='gl' style='width:75%'></span><span class='gl' style='width:30%'></span></div>".repeat(3)}</div>
    <div class="empty-msg">
      <span class="empty-icon"><svg viewBox="0 0 16 16" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2 2.5h5.5L14 9l-5 5-6.5-6.5z"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/></svg></span>
      <b>No attribute collections yet</b>
      <p>Collections appear here once attributes from a study are published and saved to the library.</p>
      ${emptyActions(false)}
    </div>
  </div>`;

const noMatches = () => `<div class="no-match"><b>No collections match “${esc(H.q)}”</b><span>Try another name or attribute, or clear the search.</span><button class="btn" data-h="clear-search">Clear search</button></div>`;

/* ---------- Page ---------- */
const renderHome = () => {
  const o = H.option, empty = o === "empty" || o === "emptyB";
  const list = empty ? [] : shownCollections(), total = empty ? 0 : COLLECTIONS.length;
  // Page description lives in a tooltip beside the title
  const title = `<div class="h-title"><div class="h-heading"><h1>Attributes</h1>
         <span class="info" tabindex="0" aria-describedby="attr-tip">${hi.info}<span class="tip" role="tooltip" id="attr-tip">${INTRO}</span></span></div></div>`;

  let body;
  if (o === "emptyB") body = emptyMessage();
  else if (empty) body = homeEmptyState();
  else if (!list.length) body = noMatches();
  else if (o === "8") body = `<div class="h-grid wide">${list.map(mediaCard).join("")}</div>`;
  else if (o === "9") body = `<div class="h-grid four">${list.map(c => card(c, { ring: true })).join("")}</div>`;
  else body = `<div class="h-grid">${list.map(c => card(c)).join("")}</div>`;

  document.getElementById("home").innerHTML = `
    ${title}
    <div class="h-toolbar">
      <span class="h-count">${H.q ? `${list.length} of ${total}` : total} Attribute Collections</span>
      <span class="sp"></span>
      ${empty ? "" : `<label class="h-search">${hi.search}<input class="hq" placeholder="Search an Attribute…" value="${esc(H.q)}"></label>
      <label class="h-sort">Sort: <select class="hsort">${Object.entries(SORTS).map(([k, l]) => `<option value="${k}"${H.sort === k ? " selected" : ""}>${l}</option>`).join("")}</select></label>`}
      ${o === "emptyB" ? "" : primaryBtn()}
    </div>
    ${body}`;

  document.getElementById("home-proto").innerHTML = `<span class="plabel">Homepage option</span><div class="seg small">${Object.entries(HOME_OPTIONS).map(([id, l]) =>
    `<button class="${H.option === id ? "on" : ""}" data-ho="${id}">${id.startsWith("empty") ? "" : `<b>${id}</b> `}${l}</button>`).join("")}</div>`;
};

/* ---------- Interactions ---------- */
let toastTimer;
const toast = msg => {
  const t = document.getElementById("toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
};

document.getElementById("home-proto").addEventListener("click", e => {
  const b = e.target.closest("[data-ho]"); if (!b) return;
  H.option = b.dataset.ho; H.q = "";
  save("homeOption", H.option); renderHome();
});

const home = document.getElementById("home");
home.addEventListener("click", e => {
  const a = e.target.closest("[data-h]"); if (!a) return;
  const act = a.dataset.h;
  if (act !== "open") e.stopPropagation();
  switch (act) {
    case "open": openCollection(a.dataset.name); return;
    case "more": cardMenu.hidden || cardMenu.dataset.name !== a.dataset.name ? openCardMenu(a) : closeCardMenu(); return;
    case "new": openCreate(); return;
    case "studies": toast("Prototype: this would open Studies"); return;
    case "csv": toast("Prototype: this would open the CSV upload"); return;
    case "clear-search": H.q = ""; break;
    default: return;
  }
  renderHome();
});
home.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-h=open][tabindex]")) { e.preventDefault(); openCollection(e.target.dataset.name); }
});
home.addEventListener("input", e => {
  if (!e.target.matches(".hq")) return;
  H.q = e.target.value; renderHome();
  const q = home.querySelector(".hq"); q.focus(); q.setSelectionRange(q.value.length, q.value.length);
});
home.addEventListener("change", e => {
  if (e.target.matches(".hsort")) { H.sort = e.target.value; renderHome(); }
});

renderHome();
