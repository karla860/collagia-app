/* ---------- Data ---------- */
// Each product has one attribute (its pattern) and one value within that attribute
const items = [
  ["Dri-FIT training tee in Terracotta", "TOP_117", "tee", "#b4472c", "#ece8e2", "solid", "Warm colors"],
  ["Performance tank in Mustard", "TAN_118", "tank", "#e3b11f", "#efedea", "solid", "Warm colors"],
  ["Track pants in Rust", "PNT_119", "pants", "#b5532e", "#e9e8e6", "solid", "Warm colors"],
  ["Sports bra in Magenta", "BRA_120", "bra", "#d0368f", "#e6e3de", "solid", "Warm colors"],
  ["Fleece joggers in Oatmeal", "JOG_121", "pants", "#d4c3a6", "#8a8781", "solid", "Neutrals"],
  ["Breton longsleeve in Ecru", "TOP_122", "long", "#f1efe9", "#c8c8c6", "striped", "Breton"],
  ["Pinstripe joggers in Grey", "JOG_123", "pants", "#a3a3a3", "#ecebe8", "striped", "Pinstripe"],
  ["Rugby stripe top in Forest", "TOP_124", "long", "#4f8a5f", "#e9e7e2", "striped", "Rugby"],
  ["Ditsy floral tee in Sage", "TOP_125", "tee", "#8fa585", "#ece9e4", "floral", "Ditsy"],
  ["Tropical print shorts in Coral", "SRT_126", "shorts", "#d97c4a", "#ece8e1", "floral", "Tropical"],
  ["Botanical sports bra in Plum", "BRA_127", "bra", "#7a3e6a", "#e8e4de", "floral", "Botanical"],
  ["Logo tee in Black", "TOP_128", "tee", "#222222", "#e6e3de", "graphic", "Logo"],
  ["Slogan hoodie in Heather Grey", "HOD_129", "long", "#8d8d8f", "#ebe9e5", "graphic", "Typography"],
  ["Illustrated crewneck in Cobalt", "CRW_130", "long", "#2f5bb7", "#e9e7e2", "graphic", "Illustration"],
  ["Color-block windbreaker", "WBR_131", "long", "#2f5bb7", "#e8e5df", "multi", "Color block"],
  ["Tie-dye training tee", "TOP_132", "tee", "#d0368f", "#ebe8e3", "multi", "Tie-dye"],
  ["Ombré performance tank", "TAN_133", "tank", "#f2a65a", "#e9e6e0", "multi", "Ombré"],
  ["Tartan flannel overshirt", "SHT_134", "long", "#b53a2e", "#e9e9e9", "plaid", "Tartan"],
  ["Gingham shorts in Sky", "SRT_135", "shorts", "#8fb7d9", "#ece9e4", "plaid", "Gingham"],
  ["Buffalo check puffer vest", "VST_136", "vest", "#b53a2e", "#e6e3de", "plaid", "Buffalo check"],
].map(([name, sku, s, c, bg, a, v]) => ({ name, sku, s, c, bg, a, v }));

const ATTRS = [
  { k: "solid", label: "Solid" },
  { k: "striped", label: "Striped" },
  { k: "floral", label: "Floral" },
  { k: "graphic", label: "Graphic print" },
  { k: "multi", label: "Multicolored" },
  { k: "plaid", label: "Plaid" },
];
const VALUES = {
  solid: ["Warm colors", "Cool colors", "Neutrals"],
  striped: ["Breton", "Pinstripe", "Rugby"],
  floral: ["Ditsy", "Tropical", "Botanical"],
  graphic: ["Logo", "Typography", "Illustration"],
  multi: ["Color block", "Tie-dye", "Ombré"],
  plaid: ["Tartan", "Gingham", "Buffalo check"],
};

// Prototype iterations — mirror Option 4a–4g in Figma ("Flow 2: Clicking on an Attribute Card").
// Each option sets the layout plus the filter shown on that Figma screen.
const OPTIONS = {
  "4a": { group: "Side rail", label: "Columns", attrUI: "rail", view: "table", tableUI: "columns", value: "Warm colors" },
  "4b": { group: "Side rail", label: "Row cards", attrUI: "rail", view: "table", tableUI: "cards", value: "Warm colors" },
  "4c": { group: "Side rail", label: "List & preview", attrUI: "rail", view: "table", tableUI: "preview", value: "Warm colors" },
  "4d": { group: "Side rail", label: "Grid", attrUI: "rail", view: "grid", tableUI: "columns", value: "Warm colors" },
  "4e": { group: "Tabs", label: "Columns", attrUI: "tabs", view: "table", tableUI: "columns", value: "Warm colors" },
  "4f": { group: "Tabs", label: "Grid", attrUI: "tabs", view: "grid", tableUI: "columns", value: "Warm colors" },
  "4g": { group: "", label: "Empty state", attrUI: "rail", view: "table", tableUI: "columns", value: "Cool colors" },
};

/* ---------- State ---------- */
const read = (k, ok, d) => { try { const v = localStorage.getItem(k); return ok[v] ? v : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

const emptyFilters = () => Object.fromEntries(ATTRS.map(({ k }) => [k, new Set()]));
const S = {
  option: read("option", OPTIONS, "4a"),
  attrUI: "rail", tableUI: "columns", view: "table", dir: 1,
  f: emptyFilters(),  // selected values per attribute
  tab: null,          // Rows/Tabs: the one active attribute (null = all products)
  peek: null,
};

/* ---------- Icons ---------- */
const ic = {
  back: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
  plus: '<svg class="i" style="width:14px;height:14px" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 1.5v11M1.5 7h11"/></svg>',
  dl: '<svg class="i" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 1.5h1.5v6.19l2.22-2.22 1.06 1.06L8 10.56 3.97 6.53l1.06-1.06 2.22 2.22zM2 10h1.5v2.5h9V10H14v4H2z"/></svg>',
  grid: '<svg class="i" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
  list: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 4h12M2 8h12M2 12h12"/></svg>',
};

/* ---------- Filtering ---------- */
// Rows/Tabs: pick one attribute, then optionally narrow by its values.
// Side rail: any mix of values across attributes (nothing checked = everything).
const matches = i => {
  if (S.attrUI === "rail") {
    const any = ATTRS.some(({ k }) => S.f[k].size);
    return !any || S.f[i.a].has(i.v);
  }
  if (!S.tab) return true;
  return i.a === S.tab && (!S.f[i.a].size || S.f[i.a].has(i.v));
};
const countFor = (k, v) => items.filter(i => i.a === k && (v === undefined || i.v === v)).length;
const isFiltered = () => S.tab || ATTRS.some(({ k }) => S.f[k].size);
const resetFilters = () => { S.f = emptyFilters(); S.tab = null; };
const visible = () => items.filter(matches).sort((a, b) => a.name.localeCompare(b.name) * S.dir);


/* ---------- Pieces ---------- */
const thumb = i => `<div class="th" style="--bg:${i.bg};--c:${i.c}"><svg><use href="#${i.s}"/>${i.a === "solid" ? "" : `<use href="#${i.s}" fill="url(#p-${i.a})"/>`}</svg></div>`;
const cb = (on, part) => `<span class="cb${on ? " on" : ""}${part ? " part" : ""}"></span>`;
const clearAll = () => isFiltered() ? `<a class="link" data-act="clearall">Clear</a>` : "";
const vchip = (k, v) => {
  const n = countFor(k, v);
  return `<button class="vchip${S.f[k].has(v) ? " on" : ""}${n ? "" : " zero"}" data-act="toggle" data-k="${k}" data-v="${v}">${v}<span class="n">${n}</span></button>`;
};
const atab = (k, label) =>
  `<button class="atab${S.tab === k ? " on" : ""}" data-act="tab" data-k="${k || ""}">${label}</button>`;
const valueChips = () => S.tab
  ? VALUES[S.tab].map(v => vchip(S.tab, v)).join("")
  : `<span class="hint">Pick an attribute to see its values</span>`;
const attrLabel = k => ATTRS.find(a => a.k === k).label;

// Plain-language summary of the active filters, e.g. "Striped: Breton · Plaid"
const filterSummary = () => {
  const keys = S.attrUI === "rail" ? ATTRS.map(a => a.k).filter(k => S.f[k].size) : S.tab ? [S.tab] : [];
  return keys.map(k => {
    const vals = VALUES[k].filter(v => S.f[k].has(v));
    return !vals.length || vals.length === VALUES[k].length ? attrLabel(k) : `${attrLabel(k)}: ${vals.join(", ")}`;
  }).join(" · ");
};

/* ---------- Attribute section iterations ---------- */
const attrSection = {
  // 1 — labelled attribute tabs, the active attribute's values in a strip below
  tabs: () => `
    <div class="tb">
      <span class="flabel">Attributes</span>${atab(null, "All")}${ATTRS.map(({ k, label }) => atab(k, label)).join("")}
      <span class="sp"></span>${clearAll()}
    </div>
    <div class="tb2"><span class="flabel">Values</span>${valueChips()}</div>`,

  // 2 — no toolbar; attributes live in the left rail (rendered in the body)
  rail: () => "",
};

const rail = () => `<aside class="rail">
  <div class="rtitle">Attributes${clearAll()}</div>
  ${ATTRS.map(({ k, label }) => {
    const n = S.f[k].size, all = n === VALUES[k].length;
    return `<div class="rgroup">
      <div class="opt rhead" data-act="toggleattr" data-k="${k}">${cb(all, n && !all)}${label}<span class="n">${countFor(k)}</span></div>
      ${VALUES[k].map(v => {
        const c = countFor(k, v);
        return `<div class="opt sub${c ? "" : " zero"}" data-act="toggle" data-k="${k}" data-v="${v}">${cb(S.f[k].has(v))}${v}<span class="n">${c}</span></div>`;
      }).join("")}
    </div>`;
  }).join("")}
</aside>`;

/* ---------- Views (read-only summary — products are not selectable) ---------- */
const gridView = list => `<div class="vgrid">${list.map(i => `
  <div class="vcard">${thumb(i)}<h3>${i.name}</h3><span class="sku">${i.sku}</span></div>`).join("")}</div>`;

const sortHead = () => `<th data-act="sort">Product ${S.dir > 0 ? "↑" : "↓"}</th>`;
const row = (i, cls = "", act = "") => `
  <tr class="${cls}"${act ? ` data-act="${act}"` : ""} data-sku="${i.sku}">
    <td><div class="prod">${thumb(i)}<span class="nm">${i.name}</span></div></td>
    <td class="sku">${i.sku}</td>
  </tr>`;

// How many side-by-side column groups fit in the results width
const columnCount = () => {
  const area = root.querySelector(".results");
  const w = area ? area.clientWidth : Math.min(1200, innerWidth - 48);
  return Math.max(1, Math.min(3, Math.floor(w / 320)));
};

const tableViews = {
  // 1 — the list flows down into 2–3 side-by-side columns, each with its own header
  columns: list => {
    const cols = columnCount();
    const per = Math.ceil(list.length / cols);
    const chunks = Array.from({ length: cols }, (_, c) => list.slice(c * per, (c + 1) * per)).filter(c => c.length);
    return `<div class="tcols">${chunks.map(chunk => `
      <table class="t">
        <thead><tr>${sortHead()}<th class="w-id">ID</th></tr></thead>
        <tbody>${chunk.map(i => row(i)).join("")}</tbody>
      </table>`).join("")}</div>`;
  },

  // 2 — compact horizontal cards: bigger image, name and ID stacked
  cards: list => `
    <div class="rhead-bar"><span class="sp"></span><a class="link" data-act="sort">Name ${S.dir > 0 ? "A–Z" : "Z–A"}</a></div>
    <div class="rcards">${list.map(i => `
      <div class="rcard">${thumb(i)}<div class="txt"><b>${i.name}</b><span class="sku">${i.sku}</span></div></div>`).join("")}</div>`,

  // 3 — narrow list on the left, large preview of the hovered product on the right
  preview: list => {
    const p = list.find(i => i.sku === S.peek) || list[0];
    return `<div class="split">
      <div class="list"><table class="t">
        <thead><tr>${sortHead()}<th class="w-id">ID</th></tr></thead>
        <tbody>${list.map(i => row(i, i === p ? "peek" : "", "peek")).join("")}</tbody>
      </table></div>
      <div class="peekpane">${thumb(p)}<b>${p.name}</b><span class="sku">${p.sku}</span></div>
    </div>`;
  },
};

// Matching empty state: names the filters that produced nothing
const emptyState = () => `
  <div class="empty">
    <b>No products tagged ${filterSummary()}</b>
    <span>Try another value, or clear the filters to see all ${items.length} products.</span>
    <button class="btn" data-act="clearall">Clear filters</button>
  </div>`;

// Bottom bar stays white. The hint says what's shown and what to do next.
const footer = list => {
  const hint = isFiltered()
    ? `<span class="meta">Showing <b>${list.length} of ${items.length}</b> products · ${filterSummary()}<a class="link" data-act="clearall">Show all</a></span>`
    : `<span class="meta">Showing all <b>${items.length}</b> products · ${S.attrUI === "rail" ? "Check attributes on the left" : "Pick an attribute above"} to narrow this summary</span>`;
  return `
    <div class="ft">${hint}
      <div class="actions"><button class="btn">${ic.dl} Export as CSV</button><button class="btn primary">${ic.plus} New Attribute Collection</button></div></div>`;
};

/* ---------- Render ---------- */
const overlay = document.getElementById("overlay");
const root = document.getElementById("modal-root");
const proto = document.getElementById("proto");

const seg = (name, opts, cur) => `<div class="seg small">${Object.entries(opts).map(([id, l]) =>
  `<button class="${cur === id ? "on" : ""}" data-proto="${name}" data-v="${id}">${l}</button>`).join("")}</div>`;

const renderProto = () => {
  const groups = [...new Set(Object.values(OPTIONS).map(o => o.group))];
  proto.innerHTML = `<span class="plabel">Option</span>${groups.map(g => {
    const opts = Object.fromEntries(Object.entries(OPTIONS).filter(([, o]) => o.group === g).map(([id, o]) => [id, `<b>${id}</b> ${o.label}`]));
    return `${g ? `<span class="meta">${g}</span>` : ""}${seg("option", opts, S.option)}`;
  }).join("")}`;
};

// Apply an option's layout and the filter its Figma screen shows (Solid → value)
const applyOption = id => {
  const o = OPTIONS[id];
  Object.assign(S, { option: id, attrUI: o.attrUI, view: o.view, tableUI: o.tableUI, peek: null });
  resetFilters();
  S.f.solid = new Set([o.value]);
  if (o.attrUI === "tabs") S.tab = "solid";
};

const render = () => {
  const list = visible();
  const results = !list.length
    ? emptyState()
    : S.view === "grid" ? gridView(list) : tableViews[S.tableUI](list);
  const white = S.view === "table" && list.length && S.tableUI !== "cards";
  const results$ = `<div class="results${white ? " white" : ""}">${results}</div>`;
  root.innerHTML = `
    <div class="m">
      <div class="hd">
        <button class="back" data-act="dismiss" aria-label="Close">${ic.back}</button>
        <h2><span>Custom Attributes /</span> Apparel by Pattern Style</h2>
        <div class="seg" aria-label="View">
          <button class="${S.view === "grid" ? "on" : ""}" data-act="view" data-view="grid">${ic.grid} Grid</button>
          <button class="${S.view === "table" ? "on" : ""}" data-act="view" data-view="table">${ic.list} Table</button>
        </div>
      </div>
      ${attrSection[S.attrUI]()}
      <div class="body${S.attrUI === "rail" ? " with-rail" : ""}">${S.attrUI === "rail" ? rail() : ""}${results$}</div>
      ${footer(list)}
    </div>`;
  // Column count depends on the rendered body width, so re-render once if it changed
  if (S.view === "table" && S.tableUI === "columns" && list.length) {
    const want = columnCount();
    if (root.querySelectorAll(".tcols table").length !== Math.min(want, list.length)) {
      root.querySelector(".results").innerHTML = tableViews.columns(list);
    }
  }
  renderProto();
};

/* ---------- Open / close ---------- */
let lastFocus = null;
const openModal = () => {
  lastFocus = document.activeElement;
  overlay.hidden = false;
  document.body.classList.add("locked");
  render();
  root.querySelector(".back").focus();
};
const closeModal = () => {
  overlay.hidden = true;
  document.body.classList.remove("locked");
  if (lastFocus) lastFocus.focus();
};

// Close when clicking the dimmed backdrop. Tracking where the press started stops
// a drag that begins inside the modal (e.g. selecting text) from closing it.
let pressedOnBackdrop = false;
overlay.addEventListener("mousedown", e => { pressedOnBackdrop = e.target === overlay; });
overlay.addEventListener("click", e => {
  if (e.target === overlay && pressedOnBackdrop) closeModal();
  pressedOnBackdrop = false;
});

document.getElementById("open-modal").addEventListener("click", openModal);
document.getElementById("mosaic").innerHTML = items.slice(0, 8).map(thumb).join("");

proto.addEventListener("click", e => {
  const b = e.target.closest("[data-proto]");
  if (!b) return;
  applyOption(b.dataset.v);
  save("option", b.dataset.v);
  render();
});

/* ---------- Modal interactions ---------- */
root.addEventListener("click", e => {
  const a = e.target.closest("[data-act]");
  if (!a) return;
  const { act, k, v } = a.dataset;
  switch (act) {
    case "dismiss": closeModal(); return;
    case "toggle": S.f[k].has(v) ? S.f[k].delete(v) : S.f[k].add(v); break;
    case "clearall": resetFilters(); break;
    case "tab": {
      const next = k || null;
      if (next !== S.tab) S.f = emptyFilters();  // one attribute at a time
      S.tab = next;
      break;
    }
    case "toggleattr": {
      const all = S.f[k].size === VALUES[k].length;
      S.f[k] = all ? new Set() : new Set(VALUES[k]);
      break;
    }
    case "sort": S.dir = -S.dir; break;
    case "view": {
      S.view = a.dataset.view;
      // Keep the option bar in sync when the in-modal Grid/Table toggle is used
      const match = Object.entries(OPTIONS).find(([id, o]) => id !== "4g" && o.attrUI === S.attrUI && o.view === S.view && (S.view === "grid" || o.tableUI === S.tableUI));
      if (match) S.option = match[0];
      break;
    }
    case "peek": S.peek = a.dataset.sku; break;
    default: return;
  }
  // Keep scroll positions across the re-render
  const scrollers = [".results", ".list", ".rail"];
  const tops = scrollers.map(sel => root.querySelector(sel)?.scrollTop || 0);
  render();
  scrollers.forEach((sel, n) => { const el = root.querySelector(sel); if (el) el.scrollTop = tops[n]; });
});

// Hovering a row in the list + preview layout updates the preview pane in place
root.addEventListener("mouseover", e => {
  if (S.tableUI !== "preview" || S.view !== "table") return;
  const tr = e.target.closest("tr[data-sku]");
  if (!tr || tr.dataset.sku === S.peek) return;
  S.peek = tr.dataset.sku;
  const p = items.find(i => i.sku === S.peek);
  root.querySelectorAll("tr.peek").forEach(r => r.classList.remove("peek"));
  tr.classList.add("peek");
  root.querySelector(".peekpane").innerHTML = `${thumb(p)}<b>${p.name}</b><span class="sku">${p.sku}</span>`;
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !overlay.hidden) closeModal();
});

window.addEventListener("resize", () => { if (!overlay.hidden) render(); });

applyOption(S.option);
openModal();
