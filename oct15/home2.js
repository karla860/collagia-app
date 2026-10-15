/* ---------- Flow 1: Attributes Homepage · Option 4 (Grouped sidebar) and Empty state C (Drop a CSV) ----------
   Option 4: workspace switcher, labelled sections, Attributes opens into All collections / Shared with me /
   Recently deleted, and the collections themselves are listed in the sidebar.
   Empty state C: a CSV drop zone with sample files that can be dragged into it. */

const DELETED = [];   // filled by Delete in the card ⋯ menu, shown under Recently deleted
const SHARED_WITH_ME = ["Statues by BG Color", "Collectibles by Finish Type"];
const SECTIONS = { all: "All collections", shared: "Shared with me", deleted: "Recently deleted" };
Object.assign(H, { section: "all", navOpen: true, sbAll: false, dzOver: false, dzErr: "" });

/* ---------- Sidebar ---------- */
const nv = d => `<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const SB = {
  studies: nv('<path d="M6 2h4M6.5 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9.5 6V2"/>'),
  collages: '<svg class="i" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="5" height="7" rx="1"/><rect x="9" y="2" width="5" height="4" rx="1"/><rect x="2" y="11" width="5" height="3" rx="1"/><rect x="9" y="8" width="5" height="6" rx="1"/></svg>',
  attributes: nv('<path d="M2 2.5h5.5L14 9l-5 5-6.5-6.5z"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none"/>'),
  settings: nv('<circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v1.8M8 12.7v1.8M14.5 8h-1.8M3.3 8H1.5M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3M12.6 12.6l-1.3-1.3M4.7 4.7 3.4 3.4"/>'),
  resources: nv('<path d="M3 2.5h7.5A2.5 2.5 0 0 1 13 5v8.5H5.5A2.5 2.5 0 0 1 3 11z"/><path d="M3 11a2.5 2.5 0 0 1 2.5-2.5H13M6 5.5h4"/>'),
  bug: nv('<rect x="4.5" y="5" width="7" height="9" rx="3.5"/><path d="M6 5V4a2 2 0 0 1 4 0v1M8 8v6M4.5 9H2M14 9h-2.5M4.8 6.5 3 5M11.2 6.5 13 5M4.8 12 3 13.5M11.2 12l1.8 1.5"/>'),
  right: nv('<path d="m6 3.5 4.5 4.5L6 12.5"/>'),
  down: nv('<path d="m3.5 6 4.5 4.5L12.5 6"/>'),
  updown: nv('<path d="m5 6 3-3 3 3M5 10l3 3 3-3"/>'),
  dots: '<svg class="i" viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.5" cy="8" r="1.3"/></svg>',
};
const sectionCount = k => k === "all" ? COLLECTIONS.length : k === "shared" ? COLLECTIONS.filter(c => SHARED_WITH_ME.includes(c.name)).length : DELETED.length;

const sidebarGrouped = () => {
  const max = H.sbAll ? COLLECTIONS.length : 3;
  const item = (icon, label, attrs, extra = "", cls = "") => `<li><button class="sb-item ${cls}" ${attrs}>${icon}<span>${label}</span>${extra}</button></li>`;
  return `
    <button class="sb-ws" data-a="sbToast" data-v="Switch workspace" aria-label="Workspace: Collagia, Nike">
      <span class="sb-logo">C</span><span class="sb-wsname"><b>Collagia</b><small>Nike · Enterprise</small></span>${SB.updown}</button>
    <div class="sb-label">Workspace</div>
    <ul class="sb-nav">
      ${item(SB.studies, "Studies", 'data-a="nav" data-v="x"', `<span class="sb-chev">${SB.right}</span>`)}
      ${item(SB.collages, "Collages", 'data-a="nav" data-v="collages"', `<span class="sb-chev">${SB.right}</span>`)}
      <li><button class="sb-item${H.navOpen ? " open" : ""}" data-a="sbToggle" aria-expanded="${H.navOpen}">${SB.attributes}<span>Attributes</span><span class="sb-chev">${H.navOpen ? SB.down : SB.right}</span></button>
        ${H.navOpen ? `<ul class="sb-sub">${Object.entries(SECTIONS).map(([k, l]) =>
          `<li><button class="sb-subitem${H.section === k ? " on" : ""}" data-a="sbSection" data-v="${k}" ${H.section === k ? 'aria-current="page"' : ""}>${l}<span class="n">${sectionCount(k)}</span></button></li>`).join("")}</ul>` : ""}</li>
    </ul>
    <div class="sb-label">Collections</div>
    <ul class="sb-nav">
      ${COLLECTIONS.slice(0, max).map(c => item(`<img class="sb-thumb" src="${c.img}" alt="">`, esc(c.name), `data-a="openCard" data-v="${cIndex(c)}" title="${esc(c.name)}"`)).join("")}
      ${COLLECTIONS.length > 3 ? item(SB.dots, H.sbAll ? "Show less" : "More", 'data-a="sbMore"', "", "muted") : ""}
      ${!COLLECTIONS.length ? `<li class="sb-none">No collections yet</li>` : ""}
    </ul>
    <span class="sp"></span>
    <ul class="sb-nav">
      ${item(SB.settings, "Settings", 'data-a="nav" data-v="x"')}
      ${item(SB.resources, "Resources", 'data-a="nav" data-v="x"')}
      ${item(SB.bug, "Report a bug", 'data-a="nav" data-v="x"')}
      <li><button class="sb-item sb-me" data-a="nav" data-v="profile"><span class="avatar" aria-hidden="true">JM</span><span>Jamie McArdle</span></button></li>
    </ul>`;
};

// The default sidebar comes from the page; Option 4 swaps in the grouped one
let SIDEBAR_DEFAULT = null;
RENDER.sidebar = () => {
  const s = $(".sidebar"); if (!s) return;
  if (SIDEBAR_DEFAULT == null) SIDEBAR_DEFAULT = s.innerHTML;
  const grouped = App.opt.home === "side";
  if (s.classList.contains("grouped") !== grouped || grouped) s.innerHTML = grouped ? sidebarGrouped() : SIDEBAR_DEFAULT;
  s.classList.toggle("grouped", grouped);
};

/* ---------- Option 4 page body: follows the section picked in the sidebar ---------- */
const deletedCard = (c, i) => `
  <article class="ccard deleted">
    ${cprev(c)}
    <div class="cbody"><div class="ctitle"><h3>${esc(c.name)}</h3></div>${ctags(c, 4)}
      <div class="cedit"><span class="when">${ic.trash}Deleted just now</span><span class="sp"></span><button class="btn" data-a="sbRestore" data-v="${i}">Restore</button></div></div>
  </article>`;
const sectionBody = list => {
  if (H.section === "deleted") return DELETED.length
    ? `<div class="h-grid">${DELETED.map(deletedCard).join("")}</div>`
    : `<div class="no-match"><b>Nothing deleted recently</b><span>Deleted collections stay here for 30 days, so you can restore them.</span></div>`;
  const shown = H.section === "shared" ? list.filter(c => SHARED_WITH_ME.includes(c.name)) : list;
  if (!shown.length) return H.section === "shared"
    ? `<div class="no-match"><b>Nothing shared with you yet</b><span>Collections other people share with you will show up here.</span></div>` : null;
  return `<div class="h-grid">${shown.map(c => card(c)).join("")}</div>`;
};

/* ---------- Empty state C · Drop a CSV ---------- */
const SAMPLES = [
  { name: "Apparel patterns.csv", size: "4 KB", bytes: 4e3, coll: "Apparel patterns", tags: ["Solid", "Striped", "Floral", "Plaid"] },
  { name: "Statue backgrounds.csv", size: "2 KB", bytes: 2e3, coll: "Statue backgrounds", tags: ["Black & White", "Grey", "Beige"] },
  { name: "Full catalog.csv", size: "8 MB", bytes: 8e6, coll: "Full catalog", tags: [] },
];
const LIMIT = 5e6;
const fileUp = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 18v-6M9.5 14.5 12 12l2.5 2.5"/></svg>';
const emptyC = () => `
  <div class="dz-wrap">
    <label class="dz${H.dzOver ? " over" : ""}${H.dzErr ? " bad" : ""}" id="dz">
      <input type="file" id="dz-file" accept=".csv,text/csv" class="dz-input">
      <span class="dz-icon">${fileUp}</span>
      <b>${H.dzOver ? "Drop to import" : "Drop a CSV here"}</b>
      <span class="dz-sub">One row per product: product ID, attribute, value · 5 MB limit</span>
      ${H.dzErr ? `<span class="dz-err" role="alert">${esc(H.dzErr)}</span>` : `<span class="dz-browse">or <u>browse files</u></span>`}
    </label>
    <p class="dz-hint">No file handy? Drag a sample into the drop zone.</p>
    <div class="dz-samples">${SAMPLES.map((s, i) => `
      <div class="dz-sample" draggable="true" data-sample="${i}" data-a="dzSample" data-v="${i}" role="button" tabindex="0" title="Drag into the drop zone, or click to import">
        <span class="dz-ficon">CSV</span><span class="dz-fmeta"><b>${esc(s.name)}</b><small>${s.size}</small></span></div>`).join("")}</div>
  </div>`;

// Imports a sample or a real file; anything that isn't a CSV under 5 MB shows an error in the drop zone
const importCsv = (name, bytes, coll, tags) => {
  H.dzOver = false;
  if (!/\.csv$/i.test(name)) { H.dzErr = `“${name}” isn’t a CSV. Export your sheet as .csv and try again.`; render(); return; }
  if (bytes > LIMIT) { H.dzErr = `“${name}” is ${(bytes / 1e6).toFixed(0)} MB. Files can be up to 5 MB.`; render(); return; }
  H.dzErr = "";
  saveCollection(coll, tags.length ? tags : ["Imported"], `${name} upload`);
  setOpt("home", "1");
  render();
};
const importFile = f => {
  const coll = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Imported collection";
  if (!/\.csv$/i.test(f.name) || f.size > LIMIT) return importCsv(f.name, f.size, coll, []);
  // Attributes come from the second column of the CSV (product ID, attribute, value)
  f.text().then(t => {
    const rows = t.split(/\r?\n/).map(r => r.split(",")).filter(r => r.length > 1).slice(1);
    importCsv(f.name, f.size, coll, [...new Set(rows.map(r => r[1].trim()).filter(Boolean))].slice(0, 12));
  });
};

/* Drag and drop: samples carry their index, real files come through dataTransfer.files */
document.addEventListener("dragstart", e => { const s = e.target.closest && e.target.closest(".dz-sample"); if (s) e.dataTransfer.setData("text/plain", "sample:" + s.dataset.sample); });
document.addEventListener("dragover", e => {
  const dz = e.target.closest && e.target.closest("#dz"); if (!dz) return;
  e.preventDefault();
  if (!H.dzOver) { H.dzOver = true; dz.classList.add("over"); dz.querySelector("b").textContent = "Drop to import"; }
});
document.addEventListener("dragleave", e => {
  const dz = e.target.closest && e.target.closest("#dz"); if (!dz || dz.contains(e.relatedTarget)) return;
  H.dzOver = false; dz.classList.remove("over"); dz.querySelector("b").textContent = "Drop a CSV here";
});
document.addEventListener("drop", e => {
  const dz = e.target.closest && e.target.closest("#dz"); if (!dz) return;
  e.preventDefault();
  const m = (e.dataTransfer.getData("text/plain") || "").match(/^sample:(\d)$/);
  if (m) { const s = SAMPLES[+m[1]]; return importCsv(s.name, s.bytes, s.coll, s.tags); }
  if (e.dataTransfer.files[0]) importFile(e.dataTransfer.files[0]);
});
document.addEventListener("change", e => { if (e.target.id === "dz-file" && e.target.files[0]) importFile(e.target.files[0]); });
document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".dz-sample")) { e.preventDefault(); e.target.click(); } });

/* ---------- Actions ---------- */
ACTIONS.sbToast = el => { toast(`Prototype: ${el.dataset.v} isn't part of this prototype`); return false; };
ACTIONS.sbToggle = () => { H.navOpen = !H.navOpen; };
ACTIONS.sbSection = el => { H.section = el.dataset.v; H.q = ""; App.modal = null; setFlow("home"); App.page = "home"; };
ACTIONS.sbMore = () => { H.sbAll = !H.sbAll; };
ACTIONS.sbRestore = el => { const c = DELETED.splice(+el.dataset.v, 1)[0]; COLLECTIONS.unshift(c); toast(`Restored “${c.name}”`); };
ACTIONS.dzSample = el => { const s = SAMPLES[+el.dataset.v]; importCsv(s.name, s.bytes, s.coll, s.tags); return false; };
