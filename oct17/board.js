/* ---------- Study board ----------
   Modelled on the live app (tool names and tooltips are the app's own, read from its bundle) and the Phase 1 Figma
   redesign. A board is a MATRIX: Pareto (buckets by a metric), Rank (top or bottom N), Group (frames per value, with
   an optional second grouping) or Freestyle (frames for published attributes, the rest loose).
   Items never move by hand. What a click does depends on the TOOL in the left rail:
   Select (V) pan and inspect · Swap images (I) · Magnify (M) · Highlight (H) · Statistics (S)
   Create custom attribute (F) select and tag · Comment (C) drop a pin. +/- or ⌘-scroll to zoom. */

const COLS = { type: "Category", color: "Colour", priceBand: "Price band", onSale: "Sale status" };
const METRICS = { price: "price_gbp", units4w: "units_4w", sellThrough: "sell_through_pct" };
const AGGS = { avg: "Avg", sum: "Sum" };
const MATRICES = {
  pareto: { label: "Pareto", hint: "Buckets by a metric", icon: '<path d="M4 20V9M10 20V4M16 20v-6M22 20H2" stroke-width="2.4"/>' },
  rank: { label: "Rank", hint: "Top or bottom items by a metric", icon: '<rect x="3" y="3" width="5" height="5" fill="currentColor" stroke="none"/><rect x="9.5" y="3" width="5" height="5" fill="currentColor" stroke="none"/><rect x="16" y="3" width="5" height="5" fill="currentColor" stroke="none"/><rect x="3" y="9.5" width="5" height="5" fill="currentColor" stroke="none"/><rect x="9.5" y="9.5" width="5" height="5" fill="currentColor" stroke="none"/><rect x="16" y="9.5" width="5" height="5" fill="currentColor" stroke="none"/><rect x="3" y="16" width="5" height="5" fill="currentColor" stroke="none"/><rect x="9.5" y="16" width="5" height="5" fill="currentColor" stroke="none"/>' },
  group: { label: "Group", hint: "Frames per value", icon: '<rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" stroke="none" opacity=".45"/><rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" stroke="none" opacity=".45"/><rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" stroke="none"/>' },
  freestyle: { label: "Freestyle", hint: "Frame what you see", icon: '<rect x="4" y="3" width="4" height="4" fill="currentColor" stroke="none"/><rect x="15" y="5" width="4" height="4" fill="currentColor" stroke="none"/><rect x="9" y="10" width="4" height="4" fill="currentColor" stroke="none"/><rect x="3" y="16" width="4" height="4" fill="currentColor" stroke="none"/><rect x="16" y="15" width="4" height="4" fill="currentColor" stroke="none"/>' },
};
const mIcon = k => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${MATRICES[k].icon}</svg>`;
const L = d => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

// The app's own icons, from the Figma style guide (assets/icons)
const fi = n => `<img class="fi" src="assets/icons/${n}.svg" alt="">`;

/* The app's tools, in its order, with its own tooltip copy */
const TOOLS = {
  select: { key: "V", name: "Select", tip: "Select images, frames and change position for them. Drag to pan, click an item to see its details.", icon: fi("tool-select") },
  swap: { key: "I", name: "Swap images", tip: "Change view: select a different angle to display for all items shown.", icon: fi("tool-swap"), flyout: true },
  magnify: { key: "M", name: "Magnify", tip: "Use the magnifier to see image details without zooming in, while keeping the whole collection visible.", icon: fi("tool-magnify") },
  highlight: { key: "H", name: "Highlight", tip: "The highlighter lets you visually focus on specific images of interest while de-emphasising others.", icon: fi("tool-highlight") },
  stats: { key: "S", name: "Statistics", tip: "Stats panel: create calculations, adjust how stats appear, and control label visibility.", icon: fi("tool-stats") },
  attr: { key: "F", name: "Create custom attribute", tip: "Group similar items together, then create a new attribute type and assign values to each group. Drag a frame or click items.", icon: fi("tool-attributes") },
  comment: { key: "C", name: "Comment", tip: "Add a comment to this board. Click anywhere to drop a pin.", icon: fi("tool-notes") },
};
const VIEWS = { full: { name: "Side view", hint: "The product shot as supplied" }, close: { name: "Close-up", hint: "Cropped in on the upper and logo" }, mono: { name: "Silhouette", hint: "Shape only, colour removed" } };

const BD = { study: "FA26 footwear review", tool: "select", sel: new Set(), hl: new Set(), view: "full", matrix: "pareto", groupBy: "type", group2: null, wrap: "row", metric: "units4w", agg: "sum",
  buckets: [32, 68], countMode: "#", rankN: 60, rankDir: "top", orient: "v", pct: false, show: "franchise", zoom: 1, filters: {}, tag: { attr: "", value: "" },
  table: false, summary: false, peek: null, flyout: null, stats: { count: true, metric: true, avgPrice: false }, comments: {}, draft: null, openPin: null };
const TILE = () => Math.round(56 * BD.zoom), GAP = 6;
const bdStudy = () => studyByName(BD.study) || STUDIES[0];
const bdProducts = () => studyProducts(bdStudy());
const bdVal = (p, k) => k in COLS ? p[k] : (bdStudy().tags[k] || {})[p.id];
const bdShown = () => bdProducts().filter(p => Object.entries(BD.filters).every(([k, set]) => !set.size || set.has(bdVal(p, k) || "—")));
const metricOf = p => p[BD.metric] || 0;
const fmtMetric = v => BD.metric === "price" ? money(v) : BD.metric === "sellThrough" ? Math.round(v) + "%" : Math.round(v).toLocaleString();
const agg = list => !list.length ? 0 : BD.agg === "avg" ? list.reduce((t, p) => t + metricOf(p), 0) / list.length : list.reduce((t, p) => t + metricOf(p), 0);
const dims = () => { const s = bdStudy(); return [...Object.entries(COLS).map(([k, l]) => [k, l, "data"]), ...s.published.map(k => [k, attrLabel(k), "attr"])]; };
const valuesOf = k => { const m = new Map(); bdProducts().forEach(p => { const v = bdVal(p, k) || "—"; m.set(v, (m.get(v) || 0) + 1); }); return [...m.entries()].sort((a, b) => a[0] === "—" ? 1 : b[0] === "—" ? -1 : b[1] - a[1]); };
const dimLabel = k => k in COLS ? COLS[k] : attrLabel(k);
const colsFor = (n, max = 14) => Math.max(1, Math.min(max, Math.ceil(Math.sqrt(n * 2.2))));
const tipAttrs = (name, detail = "", key = "") => `data-tip="${esc(name)}"${detail ? ` data-tipd="${esc(detail)}"` : ""}${key ? ` data-tipk="${esc(key)}"` : ""}`;
const fullW = () => Math.max(4, Math.floor((innerWidth - 220) / (TILE() + GAP)));

/* ---------- Tiles ---------- */
const tile = (p, t, share) => {
  const s = bdStudy(), on = BD.tool === "attr" && BD.sel.has(p.id), v = BD.show && !(BD.show in COLS) ? (s.tags[BD.show] || {})[p.id] : null;
  const dim = BD.hl.size && !BD.hl.has(p.id), hl = BD.hl.has(p.id);
  return `<figure class="bx-tile${on ? " on" : ""}${dim ? " dim" : ""}${hl ? " hl" : ""}${BD.peek === p.id ? " peek" : ""} v-${BD.view}" style="width:${t}px;height:${t}px" data-a="bdTile" data-v="${p.id}" data-id="${p.id}">
    ${p.img ? `<img src="${p.img}" alt="" loading="lazy" draggable="false">` : thumb(p, "bx-draw")}
    ${BD.pct && share != null ? `<b class="bx-pct">${share.toFixed(1)}%</b>` : ""}
    ${v && t >= 72 ? `<i class="bx-tag">${esc(v)}</i>` : ""}
    ${on ? `<i class="bx-check">${ic.check}</i>` : ""}
  </figure>`;
};
const grid = (list, t, cols, shares) => `<div class="bx-grid${BD.wrap === "col" ? " colwrap" : ""}" style="${BD.wrap === "col" ? `grid-template-rows:repeat(${Math.ceil(list.length / cols)},${t}px);grid-auto-columns:${t}px` : `grid-template-columns:repeat(${cols},${t}px)`};gap:${GAP}px">${list.map((p, i) => tile(p, t, shares ? shares[i] : null)).join("")}</div>`;

/* ---------- Stats lines, controlled by the Statistics tool ---------- */
const statLine = ps => [BD.stats.count && `${ps.length} items`, BD.stats.metric && `${AGGS[BD.agg]} ${METRICS[BD.metric]} ${fmtMetric(agg(ps))}`, BD.stats.avgPrice && `Avg price ${money(ps.reduce((t, p) => t + p.price, 0) / (ps.length || 1))}`].filter(Boolean).join(" · ");

/* ---------- Matrices ---------- */
const sortedByMetric = list => [...list].sort((a, b) => metricOf(b) - metricOf(a));
// Pareto: sort by the metric, cut into buckets at the cumulative-share points on the slider
const tiers = list => {
  const sorted = sortedByMetric(list), total = sorted.reduce((t, p) => t + metricOf(p), 0) || 1, cuts = [...BD.buckets].sort((a, b) => a - b);
  const out = Array.from({ length: cuts.length + 1 }, () => []); let cum = 0;
  sorted.forEach(p => { cum += metricOf(p); const pct = cum / total * 100; let i = cuts.findIndex(c => pct <= c); if (i < 0) i = cuts.length; out[i].push(p); });
  return out.map(ps => ({ ps, share: ps.reduce((t, p) => t + metricOf(p), 0) / total * 100 }));
};
const glyph = (share, h = false) => `<span class="bx-glyph${h ? " h" : ""}"><i style="${h ? `width:${Math.max(6, Math.round(share))}%` : `height:${Math.max(6, Math.round(share))}%`}"></i></span>`;
const tierLabel = (tier, n) => BD.countMode === "#" ? `${tier.ps.length}` : `${(tier.ps.length / (n || 1) * 100).toFixed(0)}%`;
const PARETO = list => {
  const t = TILE(), T = tiers(list), total = list.reduce((s, p) => s + metricOf(p), 0) || 1;
  if (BD.orient === "h") return `<div class="bx-world bx-pareto h">${T.map(tier => `<section class="bx-tier h"><header><b>${tierLabel(tier, list.length)}</b>${glyph(tier.share, true)}<small>${tier.share.toFixed(1)}%</small></header>${grid(tier.ps, t, colsFor(tier.ps.length, 8), tier.ps.map(p => metricOf(p) / total * 100))}${BD.stats.metric || BD.stats.avgPrice ? `<p class="bx-statline">${statLine(tier.ps)}</p>` : ""}</section>`).join("")}</div>`;
  return `<div class="bx-world bx-pareto">${T.map((tier, i) => `<section class="bx-tier${tier.ps.length ? "" : " empty"}"><aside ${tipAttrs(`Bucket ${i + 1}`, statLine(tier.ps) || `${tier.ps.length} items`)}><b>${tierLabel(tier, list.length)}</b>${glyph(tier.share)}<small>${tier.share.toFixed(1)}%</small></aside><div>${tier.ps.length ? grid(tier.ps, t, Math.min(36, fullW() - 2), tier.ps.map(p => metricOf(p) / total * 100)) : `<p class="bx-none">No items in this bucket · move a bucket on the slider</p>`}${tier.ps.length && (BD.stats.metric || BD.stats.avgPrice) ? `<p class="bx-statline">${statLine(tier.ps)}</p>` : ""}</div></section>`).join("")}</div>`;
};
const RANK = list => {
  const t = TILE(), sorted = sortedByMetric(list), picked = (BD.rankDir === "top" ? sorted : [...sorted].reverse()).slice(0, BD.rankN), cols = Math.min(30, fullW());
  return `<div class="bx-world bx-rank"><div class="bx-rankhead">${BD.rankDir === "top" ? "Top" : "Bottom"} <b>${picked.length}</b> by <code>${METRICS[BD.metric]}</code> · ${statLine(picked)}</div><div class="bx-grid" style="grid-template-columns:repeat(${cols},${t}px);gap:${GAP}px">${picked.map((p, i) => `<div class="bx-ranked">${tile(p, t)}<small>${i + 1}</small></div>`).join("")}</div></div>`;
};
const groupsBy = (list, k) => { const m = new Map(); list.forEach(p => { const v = bdVal(p, k) || "—"; if (!m.has(v)) m.set(v, []); m.get(v).push(p); }); return [...m.entries()].sort((a, b) => a[0] === "—" ? 1 : b[0] === "—" ? -1 : b[1].length - a[1].length); };
const frame = (label, ps, t, cls = "", sub = null) => {
  const allSel = BD.tool === "attr" && ps.length && ps.every(p => BD.sel.has(p.id));
  const body = sub ? `<div class="bx-sub">${groupsBy(ps, sub).map(([v, sp]) => `<div class="bx-subrow"><span class="bx-sublab">${esc(v === "—" ? "None" : v)} <code>${sp.length}</code></span>${grid(sp, t, colsFor(sp.length, 10))}</div>`).join("")}</div>` : grid(ps, t, colsFor(ps.length, 12));
  return `<section class="bx-frame${allSel ? " sel" : ""} ${cls}" data-gid="${esc(label)}">
    <header class="bx-fh"><span class="bx-fname">${esc(label)}</span><code>${ps.length}</code>${statLine(ps) ? `<span class="bx-fstat">${statLine(ps).replace(/^\d+ items · ?/, "")}</span>` : ""}${BD.tool === "attr" ? `<button class="bx-fsel${allSel ? " on" : ""}" data-a="bdSelGroup" data-v="${esc(label)}" ${tipAttrs(allSel ? "Deselect frame" : "Select frame", `All ${ps.length} items`)}>${allSel ? ic.check : ic.frame}</button>` : ""}</header>
    ${body}
    <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
  </section>`;
};
const GROUP = list => {
  const t = TILE(), k = BD.groupBy;
  return `<div class="bx-world bx-groups">${groupsBy(list, k).map(([v, ps]) => frame(v === "—" ? `No ${dimLabel(k).toLowerCase()}` : v, ps, t, v === "—" ? "none" : "", BD.group2)).join("")}</div>`;
};
const FREESTYLE = list => {
  const t = TILE(), s = bdStudy(), k = BD.show && s.published.includes(BD.show) ? BD.show : null;
  const framed = k ? groupsBy(list.filter(p => (s.tags[k] || {})[p.id]), k) : [], loose = k ? list.filter(p => !(s.tags[k] || {})[p.id]) : list;
  return `<div class="bx-world bx-free">
    ${framed.length ? `<div class="bx-framed">${framed.map(([v, ps]) => frame(`${attrLabel(k)}: ${v}`, ps, t)).join("")}</div>` : ""}
    ${loose.length ? `<div class="bx-loose">${framed.length ? `<div class="bx-loosehead">${loose.length} not framed yet${BD.tool !== "attr" ? ` · press <kbd>F</kbd> to frame some` : ""}</div>` : ""}${grid(loose, t, Math.min(40, fullW()))}</div>` : ""}
  </div>`;
};
const canvas = () => {
  const list = bdShown();
  if (!list.length) return `<div class="bx-world"><div class="bx-empty"><b>Nothing matches these filters</b><button class="btn" data-a="bdClearFilters">Clear filters</button></div></div>`;
  return { pareto: PARETO, rank: RANK, group: GROUP, freestyle: FREESTYLE }[BD.matrix](list);
};

/* ---------- Comments: pins live on the board, in canvas coordinates ---------- */
const pins = () => BD.comments[BD.study] || (BD.comments[BD.study] = [{ id: 1, x: 760, y: 128, text: "Is this tier mostly running? Worth splitting by Category.", by: "Helen Brooms", when: "Yesterday", replies: [] }]);
const pinLayer = () => `${pins().map((c, i) => `<div class="bx-pin${BD.openPin === c.id ? " open" : ""}" style="left:${c.x}px;top:${c.y}px" data-pin="${c.id}">
    <button class="bx-pinb" data-a="pinOpen" data-v="${c.id}">${initials2(c.by)}</button>
    ${BD.openPin === c.id ? `<div class="bx-thread"><div class="bx-thh"><b>${esc(c.by)}</b><small>${esc(c.when)}</small><span class="sp"></span><button class="icon-btn" data-a="pinResolve" data-v="${c.id}" ${tipAttrs("Resolve")}>${ic.check}</button><button class="icon-btn" data-a="pinClose" ${tipAttrs("Close")}>${ic.close}</button></div><p>${esc(c.text)}</p>${c.replies.map(r => `<div class="bx-reply"><b>${esc(r.by)}</b><p>${esc(r.text)}</p></div>`).join("")}<input class="o-input" id="pin-reply" data-in="pinReply" data-enter="pinReplySend" placeholder="Reply…" autocomplete="off"></div>` : ""}
  </div>`).join("")}
  ${BD.draft ? `<div class="bx-pin open draft" style="left:${BD.draft.x}px;top:${BD.draft.y}px"><span class="bx-pinb">${initials2(ME.name)}</span><div class="bx-thread"><input class="o-input" id="pin-new" data-in="pinDraft" data-enter="pinSave" placeholder="Add a comment…" value="${esc(BD.draft.text)}" autocomplete="off"><div class="bx-thf"><button class="btn" data-a="pinCancel">Cancel</button><button class="btn primary" data-a="pinSave">Comment</button></div></div></div>` : ""}`;
const initials2 = n => n.split(/\s+/).map(w => w[0]).join("").slice(0, 2);

/* ---------- Bars ---------- */
const dd = (id, label, inner, cls = "", up = true, tip = "") => `<div class="o-dd"><button class="bx-bb${App.menu === id ? " open" : ""}${cls}" data-a="menu" data-v="${id}" aria-haspopup="menu" ${tip}>${label}</button>${App.menu === id ? `<div class="o-menu bx-menu${up ? " up" : ""}" role="menu"${id === "filters" ? " data-keep" : ""}>${inner}</div>` : ""}</div>`;
const summaryText = () => ({ pareto: `Pareto distribution · ${BD.buckets.length + 1} buckets by ${AGGS[BD.agg].toLowerCase()} ${METRICS[BD.metric]} at ${[...BD.buckets].sort((a, b) => a - b).join("% · ")}%`, rank: `Rank · ${BD.rankDir} ${BD.rankN} by ${METRICS[BD.metric]}`, group: `Group · one frame per ${dimLabel(BD.groupBy).toLowerCase()}${BD.group2 ? `, split by ${dimLabel(BD.group2).toLowerCase()}` : ""}`, freestyle: `Freestyle · frames follow published attributes` })[BD.matrix];
const topBar = () => {
  const s = bdStudy(), c = COLLAGES[s.collage];
  return `<div class="bx-top">
    <div class="bx-box">
      <a class="bx-logo" data-a="nav" data-v="attributes" href="#" ${tipAttrs("Back to the portal")}><img src="assets/brand/logo-collagia-brand.svg" alt="Collagia"></a>
      <i class="bx-vsep"></i>
      ${dd("collage", `${esc(c.name)}${ic.chev}`, `<div class="bx-mnone">${esc(c.feeds.join(" · "))}</div>`, " plain", false, tipAttrs("Collage name", "The base collage providing the data for this study. Every filter and visualisation is built on it."))}
      <i class="bx-vsep"></i>
      ${dd("study", `${mIcon(BD.matrix)}<b>${esc(s.name)}</b>${ic.chev}`, STUDIES.map(x => `<button role="menuitemradio" aria-checked="${x === s}" class="${x === s ? "cur" : ""}" data-a="bdStudy" data-v="${esc(x.name)}"><span class="o-amrow"><b>${esc(x.name)}</b><small>${esc(COLLAGES[x.collage].name)} · ${x.published.length} attribute${x.published.length === 1 ? "" : "s"}</small></span></button>`).join(""), " plain", false, tipAttrs("Study", "Switch to another study"))}
      <button class="bx-ib${BD.summary ? " on" : ""}" data-a="bdSummary" ${tipAttrs(BD.summary ? "Hide board summary" : "Show board summary")}>${fi("top-info")}</button>
    </div>
    ${BD.summary ? `<div class="bx-summary">${esc(summaryText())} · ${bdShown().length} items in view</div>` : ""}
    <div class="bx-box">
      ${dd("attrs", `${ic.tag}${s.published.length} attribute${s.published.length === 1 ? "" : "s"}${ic.chev}`, `${s.published.length ? s.published.map(k => `<div class="bx-attrrow"><b>${esc(attrLabel(k))}</b><span>${studyValueCounts(s, k).map(([v, n]) => `${esc(v)} <small>${n}</small>`).join(" · ")}</span><span class="bx-attracts"><button class="o-clear" data-a="bdShow" data-v="${k}">Show as frames</button><button class="o-clear" data-a="bdGroup" data-v="${k}">Group by</button></span></div>`).join("") : `<span class="bx-mnone">Press <kbd>F</kbd>, frame some products and publish an attribute to start.</span>`}
        <hr class="o-msep"><button role="menuitem" data-a="boardSave" ${s.published.length ? "" : "disabled"}>${ic.tag}<span class="o-amrow"><b>Save to a collection</b><small>Lift this study's attributes out so they can be shared and reused</small></span></button>
        <button role="menuitem" data-a="boardApply">${ic.importStudy}<span class="o-amrow"><b>Apply a collection</b><small>Bring a collection's attributes into this study</small></span></button>`, " plain", false, tipAttrs("Custom attributes", "Attributes published in this study"))}
      ${dd("res", `Resources${ic.chev}`, `<button role="menuitem" data-a="bdToast" data-v="Training videos">Training videos</button><button role="menuitem" data-a="bdToast" data-v="Help centre">Help centre</button>`, " plain", false)}
      <button class="bx-ib" data-a="bdToast" data-v="Customisation" ${tipAttrs("Customise", "Board colours, labels and layout")}>${fi("top-sliders")}</button>
      <button class="bx-ib" data-a="bdToast" data-v="Report a bug" ${tipAttrs("Report a bug")}>${fi("top-bug")}</button>
      <i class="bx-vsep"></i>
      <button class="bx-ib avatar" data-a="nav" data-v="profile" ${tipAttrs(ME.name, "Account settings")}>${avatar2(ME, "s")}</button>
    </div>
  </div>`;
};
const bucketSlider = () => {
  const cuts = [...BD.buckets].sort((a, b) => a - b);
  return `<div class="bx-bucketbar">
    <button class="bx-plus" data-a="bdAddBucket" data-v="left" ${tipAttrs("Add bucket", "Create groups by percentage. Add buckets and position them anywhere along the scale. Drag a bucket off the end to remove it.")}>${ic.plus}</button>
    <div class="bx-range">${BD.buckets.map((c, i) => `<input type="range" min="0" max="100" step="1" value="${c}" data-in="bdBucket" data-i="${i}" aria-label="Bucket ${i + 1}">`).join("")}
      ${cuts.map(c => `<span class="bx-rlab" style="left:${c}%">${c}%</span>`).join("")}</div>
    <button class="bx-plus" data-a="bdAddBucket" data-v="right" ${tipAttrs("Add bucket", "Create groups by percentage. Drag a bucket off the end to remove it.")}>${ic.plus}</button>
  </div>`;
};
const showBar = () => {
  const s = bdStudy(), shown = bdShown().length, total = bdProducts().length, active = Object.entries(BD.filters).filter(([, set]) => set.size);
  const matrixMenu = Object.entries(MATRICES).map(([k, m]) => `<button role="menuitemradio" aria-checked="${BD.matrix === k}" class="${BD.matrix === k ? "cur" : ""}" data-a="bdMatrix" data-v="${k}">${mIcon(k)}<span class="o-amrow"><b>${m.label}</b><small>${m.hint}</small></span></button>`).join("");
  const dimMenu = (act, cur, skip) => `<div class="o-mgroup">Catalogue</div>${Object.entries(COLS).filter(([k]) => k !== skip).map(([k, l]) => `<button role="menuitemradio" aria-checked="${cur === k}" class="${cur === k ? "cur" : ""}" data-a="${act}" data-v="${k}">${l}</button>`).join("")}<div class="o-mgroup">Attributes</div>${s.published.filter(k => k !== skip).length ? s.published.filter(k => k !== skip).map(k => `<button role="menuitemradio" aria-checked="${cur === k}" class="${cur === k ? "cur" : ""}" data-a="${act}" data-v="${k}">${ic.tag}${esc(attrLabel(k))}</button>`).join("") : `<span class="bx-mnone">Publish an attribute to use it here</span>`}`;
  const filterMenu = dims().map(([k, l, kind]) => `<div class="bx-fsec"><div class="o-mgroup">${kind === "attr" ? ic.tag : ""}${esc(l)}${BD.filters[k] && BD.filters[k].size ? `<button class="o-clear" data-a="bdFilterClear" data-v="${esc(k)}">Clear</button>` : ""}</div>${valuesOf(k).slice(0, 8).map(([v, n]) => { const on = BD.filters[k] && BD.filters[k].has(v); return `<button role="menuitemcheckbox" aria-checked="${!!on}" data-a="bdFilter" data-v="${esc(k)}|${esc(v)}"><span class="o-cb ${on ? "on" : ""}">${on ? ic.check : ""}</span>${esc(v === "—" ? "No value" : v)}<span class="n">${n}</span></button>`; }).join("")}${valuesOf(k).length > 8 ? `<span class="bx-mnone">+${valuesOf(k).length - 8} more</span>` : ""}</div>`).join("") + (active.length ? `<button class="bx-mclear" data-a="bdClearFilters">Clear all filters</button>` : "");
  const metricDD = `${dd("agg", `${AGGS[BD.agg]}${ic.chev}`, Object.entries(AGGS).map(([k, l]) => `<button role="menuitemradio" aria-checked="${BD.agg === k}" class="${BD.agg === k ? "cur" : ""}" data-a="bdAgg" data-v="${k}">${l}</button>`).join(""), " pill", true, tipAttrs("Aggregation"))}
      ${dd("metric", `<code>${METRICS[BD.metric]}</code>${ic.chev}`, Object.entries(METRICS).map(([k, l]) => `<button role="menuitemradio" aria-checked="${BD.metric === k}" class="${BD.metric === k ? "cur" : ""}" data-a="bdMetric" data-v="${k}"><code>${l}</code>${k !== "price" ? `<span class="n">simulated</span>` : ""}</button>`).join(""), " plain", true, tipAttrs("Metric", "The business data column the board is built on"))}`;
  const byMatrix = {
    pareto: `${metricDD}<span class="bx-by">by</span>${bucketSlider()}
      <button class="bx-ib" data-a="bdCount" ${tipAttrs("# / %", "Toggle between absolute count (#) and percentage (%) of items per partition")}><b class="bx-cm">${BD.countMode}</b></button>
      <button class="bx-ib${BD.orient === "h" ? " on" : ""}" data-a="bdOrient" ${tipAttrs("Orientation", "Toggle between horizontal and vertical layouts to fit your data or your screen.")}>${sv('<path d="M3 5.5h10M3 10.5h10M8 2.5l3 3-3 3M8 7.5l-3 3 3 3"/>', 'stroke-width="1.3"')}</button>`,
    rank: `${metricDD}
      <button class="bx-bb plain" data-a="bdRankDir" ${tipAttrs("Direction", "Top/Bottom toggle: switch between showing the highest or lowest ranked items")}>${BD.rankDir === "top" ? "Top" : "Bottom"}${sv(BD.rankDir === "top" ? '<path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7"/>' : '<path d="M8 3.5v9M4.5 9 8 12.5 11.5 9"/>')}</button>
      <label class="bx-num" ${tipAttrs("Number of images", "Enter how many top or bottom items to display")}><input type="number" min="1" max="${total}" value="${BD.rankN}" data-in="bdRankN" id="bd-rankn"><span>items</span></label>`,
    group: `${dd("groupby", `<span class="bx-glab">Group by</span><b>${esc(dimLabel(BD.groupBy))}</b>${ic.chev}`, dimMenu("bdGroup", BD.groupBy), " plain", true, tipAttrs("Group by", "One frame per value"))}
      ${BD.group2 ? `<span class="bx-chip">then ${esc(dimLabel(BD.group2))}<button data-a="bdGroup2Clear" aria-label="Remove second grouping">${ic.close}</button></span>` : ""}
      ${metricDD}
      <button class="bx-ib${BD.wrap === "col" ? " on" : ""}" data-a="bdWrap" ${tipAttrs("Wrap orientation", "Switch between left-to-right and top-to-bottom image wrap within frames.")}>${sv('<path d="M2.5 4h11M2.5 8h8a2 2 0 0 1 0 4H8M9.5 10.5 8 12l1.5 1.5M2.5 12h3"/>', 'stroke-width="1.3"')}</button>`,
    freestyle: `${dd("showattr", `<span class="bx-glab">Frames</span><b>${BD.show && s.published.includes(BD.show) ? esc(attrLabel(BD.show)) : "None"}</b>${ic.chev}`, s.published.length ? s.published.map(k => `<button role="menuitemradio" aria-checked="${BD.show === k}" class="${BD.show === k ? "cur" : ""}" data-a="bdShow" data-v="${k}">${ic.tag}${esc(attrLabel(k))}</button>`).join("") : `<span class="bx-mnone">Press <kbd>F</kbd> and frame some products first</span>`, " plain", true, tipAttrs("Frames", "Which published attribute draws the frames"))}`,
  };
  const addGroup = {
    pareto: `<button class="bx-bb plain" data-a="bdAddBucket" data-v="mid" ${tipAttrs("Add bucket", "Split the board into one more bucket")}>${ic.plus}Add bucket</button>`,
    rank: "",
    group: dd("addgroup", `${ic.plus}Add group`, `<div class="bx-mnone">Split every frame by a second attribute</div>${dimMenu("bdGroup2", BD.group2, BD.groupBy)}`, " plain", true, tipAttrs("Add group", "Add a second grouping inside each frame")),
    freestyle: `<button class="bx-bb plain" data-a="bdAddGroup" ${tipAttrs("Add group", "Frame products together and name them as a new attribute value", "F")}>${ic.plus}Add group</button>`,
  };
  const more = `<button role="menuitem" data-a="bdSummary">${ic.info}${BD.summary ? "Hide" : "Show"} board summary</button><button role="menuitem" data-a="bdPct">${sv('<path d="M3 13 13 3"/><circle cx="4.5" cy="4.5" r="1.5"/><circle cx="11.5" cy="11.5" r="1.5"/>', 'stroke-width="1.4"')}${BD.pct ? "Hide" : "Show"} image percentages</button>${BD.matrix === "group" ? `<button role="menuitem" data-a="bdWrap">Wrap ${BD.wrap === "row" ? "top-to-bottom" : "left-to-right"}</button>` : ""}<hr class="o-msep"><button role="menuitem" data-a="bdShortcuts">${ic.info}Keyboard shortcuts</button>`;
  return `<div class="bx-show">
    <div class="bx-box">
      ${dd("matrix", `<span class="bx-cur">${mIcon(BD.matrix)}<span><small>Current board</small>${MATRICES[BD.matrix].label}</span></span>${ic.sortI}`, matrixMenu, " cur", true, tipAttrs("Change matrix", "Pareto, Rank, Group or Freestyle"))}
      <i class="bx-vsep"></i>
      ${dd("filters", `${fi("bot-filter")}Filter${active.length ? `<em>${active.reduce((n, [, set]) => n + set.size, 0)}</em>` : ""}`, filterMenu, active.length ? " on" : " plain", true, tipAttrs("Filter", "Refine what's displayed: business data, custom attributes and image attributes can all be filtered."))}
      <button class="bx-ib${BD.pct ? " on" : ""}" data-a="bdPct" ${tipAttrs("Toggle image percentage", "Show each item's percentage contribution on the image")}>${ic.info}</button>
      ${byMatrix[BD.matrix]}
      ${addGroup[BD.matrix] ? `<i class="bx-vsep"></i>${addGroup[BD.matrix]}` : ""}
      ${dd("more", fi("bot-more"), more, " plain icon", true, tipAttrs("More"))}
    </div>
    <div class="bx-box">
      <button class="bx-ib" data-a="bdZoomStep" data-v="out" ${tipAttrs("Zoom out", "", "−")}>${ic.minus}</button>
      <span class="bx-zoomv">${Math.round(BD.zoom * 100)}%</span>
      <button class="bx-ib" data-a="bdZoomStep" data-v="in" ${tipAttrs("Zoom in", "", "+")}>${ic.plus}</button>
      <button class="bx-ib" data-a="bdZoomFit" ${tipAttrs("Reset zoom", "", "0")}>${fi("bot-fit")}</button>
      <i class="bx-vsep"></i>
      <button class="bx-bb${BD.table ? " on" : " plain"}" data-a="bdTable" ${tipAttrs(BD.table ? "Hide data table" : "Show data table", "", "D")}>${fi("bot-table")}Data table</button>
    </div>
  </div>
  <div class="bx-stats"><span><b>${shown}</b><small>Items in view</small></span><span><b>1</b><small>Avg images per item</small></span><span><b>100%</b><small>Items with images</small></span>${BD.tool === "attr" ? (BD.sel.size ? `<span class="sel"><b>${BD.sel.size}</b><small>Selected</small><button class="o-clear" data-a="bdClearSel">Clear</button></span>` : `<span class="sel"><button class="o-clear" data-a="bdSelAll">Select all in view</button></span>`) : ""}${BD.hl.size ? `<span class="sel"><b>${BD.hl.size}</b><small>Highlighted</small><button class="o-clear" data-a="bdClearHl">Clear</button></span>` : ""}</div>`;
};
const toolRail = () => `<div class="bx-tools">${Object.entries(TOOLS).map(([k, t], i) => `${i === 5 ? "<i></i>" : ""}<button class="${BD.tool === k || (k === "swap" && BD.flyout === "swap") ? "on" : ""}${k === "swap" && BD.view !== "full" ? " dot" : ""}" data-a="bdTool" data-v="${k}" ${tipAttrs(t.name, t.tip, t.key)}>${t.icon}</button>`).join("")}</div>
  ${BD.flyout === "swap" ? `<div class="bx-flyout"><div class="o-mgroup">Swap images</div>${Object.entries(VIEWS).map(([k, v]) => `<button class="${BD.view === k ? "cur" : ""}" data-a="bdView" data-v="${k}"><span class="bx-vthumb v-${k}"><img src="${bdProducts()[0].img}" alt=""></span><span class="o-amrow"><b>${v.name}</b><small>${v.hint}</small></span></button>`).join("")}<p class="bx-mnone">This catalogue has one photo per product, so the angles are stand-ins.</p></div>` : ""}`;

/* ---------- Right panel: only for the attribute and statistics tools ---------- */
const ensureKey = label => Object.keys(ATTRS).find(x => attrLabel(x).toLowerCase() === label.trim().toLowerCase()) || slug(label.trim());
const attrPanel = () => {
  const s = bdStudy(), n = BD.sel.size, sel = [...BD.sel].map(id => PRODUCTS[id]);
  const head = `<div class="bx-ph">${TOOLS.attr.icon}<b>${n ? `Tag ${n} product${n === 1 ? "" : "s"}` : "Create custom attribute"}</b><span class="sp"></span><button class="icon-btn" data-a="bdTool" data-v="select" ${tipAttrs("Done", "", "Esc")}>${ic.close}</button></div>`;
  if (!n) return `<aside class="bx-panel idle">${head}
    <p>Drag a frame around the products that belong together, or click them one by one. The frame button on a group selects all of it.</p>
    <p class="o-muted">Then name the attribute (what you're judging, e.g. <b>Upper material</b>) and the value (what you see, e.g. <b>Knit</b>). Publish, then frame the next group and publish another value.</p>
    ${s.published.length ? `<div class="bx-carried"><span class="o-sec">Published in this study</span>${s.published.map(k => `<div class="bx-crow"><b>${esc(attrLabel(k))}</b><span>${studyValueCounts(s, k).map(([v, c]) => `${esc(v)} ${c}`).join(" · ")}</span></div>`).join("")}</div>` : ""}</aside>`;
  const key = BD.tag.attr ? ensureKey(BD.tag.attr) : null, existing = key && s.tags[key] ? sel.filter(p => s.tags[key][p.id]).length : 0;
  const vals = key && ATTRS[key] ? studyValueCounts(s, key).map(([v]) => v) : [];
  const carried = {}; s.published.forEach(k => { const vs = new Set(sel.map(p => (s.tags[k] || {})[p.id]).filter(Boolean)); if (vs.size) carried[k] = [...vs]; });
  return `<aside class="bx-panel">${head}
    <div class="bx-selstrip">${sel.slice(0, 8).map(p => thumb(p, "s36")).join("")}${n > 8 ? `<span class="bx-more">+${n - 8}</span>` : ""}</div>
    <label class="o-field"><span>Attribute name</span><input id="bd-attr" class="o-input" list="bd-attrs" data-in="bdAttr" placeholder="Type name*" value="${esc(BD.tag.attr)}" autocomplete="off"><datalist id="bd-attrs">${s.published.map(k => `<option value="${esc(attrLabel(k))}">`).join("")}</datalist></label>
    <label class="o-field"><span>Value</span><input id="bd-val" class="o-input" list="bd-vals" data-in="bdValue" data-enter="bdPublish" placeholder="Type value*" value="${esc(BD.tag.value)}" autocomplete="off"><datalist id="bd-vals">${vals.map(v => `<option value="${esc(v)}">`).join("")}</datalist></label>
    ${vals.length ? `<div class="bx-valpills">${vals.map(v => `<button class="o-vpill${BD.tag.value === v ? " on" : ""}" data-a="bdPickVal" data-v="${esc(v)}">${esc(v)}</button>`).join("")}</div>` : ""}
    ${existing ? `<p class="bx-note">${ic.info}${existing} of these already have a ${esc(attrLabel(key))} value. Publishing replaces it.</p>` : ""}
    <button class="btn primary bx-pub" data-a="bdPublish" ${BD.tag.attr.trim() && BD.tag.value.trim() ? "" : "disabled"}>${ic.tag}Publish</button>
    ${Object.keys(carried).length ? `<div class="bx-carried"><span class="o-sec">On the selection</span>${Object.entries(carried).map(([k, vs]) => `<div class="bx-crow"><b>${esc(attrLabel(k))}</b><span>${vs.map(esc).join(", ")}</span><button class="o-clear" data-a="bdRemoveTag" data-v="${k}">Remove</button></div>`).join("")}</div>` : ""}
  </aside>`;
};
const statsPanel = () => {
  const row = (k, l, d) => `<button class="bx-srow" data-a="bdStat" data-v="${k}" role="checkbox" aria-checked="${BD.stats[k]}"><span class="o-cb ${BD.stats[k] ? "on" : ""}">${BD.stats[k] ? ic.check : ""}</span><span class="o-amrow"><b>${l}</b><small>${d}</small></span></button>`;
  return `<aside class="bx-panel">
    <div class="bx-ph">${TOOLS.stats.icon}<b>Statistics</b><span class="sp"></span><button class="icon-btn" data-a="bdTool" data-v="select" ${tipAttrs("Done", "", "Esc")}>${ic.close}</button></div>
    <p class="o-muted">Choose what each bucket and frame shows under its items.</p>
    ${row("count", "Item count", "How many items are in it")}
    ${row("metric", `${AGGS[BD.agg]} of ${METRICS[BD.metric]}`, "The board's metric, with its aggregation")}
    ${row("avgPrice", "Average price_gbp", "Mean price of the items")}
    <div class="bx-carried"><span class="o-sec">Calculation</span>
      <div class="bx-seg">${Object.entries(AGGS).map(([k, l]) => `<button class="${BD.agg === k ? "on" : ""}" data-a="bdAgg" data-v="${k}">${l}</button>`).join("")}</div>
      <div class="bx-seg">${Object.entries(METRICS).map(([k, l]) => `<button class="${BD.metric === k ? "on" : ""}" data-a="bdMetric" data-v="${k}"><code>${l}</code></button>`).join("")}</div>
    </div>
  </aside>`;
};
const peekCard = () => {
  if (!BD.peek || !BD.peekAt) return "";
  const p = PRODUCTS[BD.peek], s = bdStudy(), tags = s.published.filter(k => (s.tags[k] || {})[p.id]);
  const left = Math.min(BD.peekAt.x, innerWidth - 300), top = Math.min(BD.peekAt.y, innerHeight - 340);
  return `<div class="bx-peek" style="left:${left}px;top:${top}px">
    <img src="${p.img}" alt="">
    <div class="bx-peekb"><b>${esc(p.name)}</b><span class="o-id">${p.id}</span>
      <dl><div><dt>Category</dt><dd>${esc(p.type)}</dd></div><div><dt>Colour</dt><dd>${esc(p.colorDescription || p.color)}</dd></div><div><dt>price_gbp</dt><dd>${money(p.price)}</dd></div><div><dt>units_4w*</dt><dd>${p.units4w}</dd></div><div><dt>sell_through_pct*</dt><dd>${p.sellThrough}%</dd></div>${tags.map(k => `<div><dt>${ic.tag}${esc(attrLabel(k))}</dt><dd>${esc(s.tags[k][p.id])}</dd></div>`).join("")}</dl>
      <a class="o-clear" href="${p.pdpUrl}" target="_blank" rel="noopener">View on nike.com</a></div>
    <button class="icon-btn bx-peekx" data-a="bdPeekClose">${ic.close}</button>
  </div>`;
};
const dataTable = () => {
  const s = bdStudy(), list = sortedByMetric(bdShown()).slice(0, 200), ks = s.published;
  return `<div class="bx-table"><div class="bx-tabh"><b>Data table</b><span class="o-muted">${bdShown().length} products${bdShown().length > 200 ? ", first 200" : ""} · sorted by ${METRICS[BD.metric]}</span><span class="sp"></span><button class="icon-btn" data-a="bdTable" ${tipAttrs("Hide data table", "", "D")}>${ic.close}</button></div>
    <div class="bx-tabscroll"><table><thead><tr><th></th><th>Product</th><th>Style</th><th>Category</th><th>Colour</th><th class="r">price_gbp</th><th class="r">units_4w*</th><th class="r">sell_through_pct*</th>${ks.map(k => `<th>${ic.tag}${esc(attrLabel(k))}</th>`).join("")}</tr></thead>
    <tbody>${list.map(p => `<tr class="${BD.hl.has(p.id) ? "on" : ""}"><td>${thumb(p, "s36")}</td><td>${esc(p.name)}</td><td class="o-id">${p.id}</td><td>${esc(p.type)}</td><td>${esc(p.color || "")}</td><td class="r">${money(p.price)}</td><td class="r">${p.units4w}</td><td class="r">${p.sellThrough}%</td>${ks.map(k => `<td>${(s.tags[k] || {})[p.id] ? `<span class="o-pchip one">${esc(s.tags[k][p.id])}</span>` : `<span class="o-none">—</span>`}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="bx-tabfoot">* simulated</div></div>`;
};
const shortcutsCard = () => BD.shortcuts ? `<div class="bx-keys"><div class="bx-ph"><b>Keyboard shortcuts</b><span class="sp"></span><button class="icon-btn" data-a="bdShortcuts">${ic.close}</button></div>
  <dl>${Object.values(TOOLS).map(t => `<div><dt>${t.name}</dt><dd><kbd>${t.key}</kbd></dd></div>`).join("")}<div><dt>Zoom in / out</dt><dd><kbd>+</kbd><kbd>−</kbd> or <kbd>⌘</kbd>scroll</dd></div><div><dt>Reset zoom</dt><dd><kbd>0</kbd></dd></div><div><dt>Data table</dt><dd><kbd>D</kbd></dd></div><div><dt>Back to Select · clear</dt><dd><kbd>Esc</kbd></dd></div></dl></div>` : "";

RENDER.board = () => {
  const cv = $("#bd-canvas"), keep = cv ? [cv.scrollLeft, cv.scrollTop] : null;
  const panel = BD.tool === "attr" ? attrPanel() : BD.tool === "stats" ? statsPanel() : "";
  $("#board").innerHTML = `${topBar()}<div class="bx-main">${toolRail()}<div class="bx-canvas t-${BD.tool}" id="bd-canvas">${canvas()}<div class="bx-pins">${pinLayer()}</div></div>${panel}</div>${BD.table ? dataTable() : ""}${showBar()}${peekCard()}${shortcutsCard()}`;
  const nc = $("#bd-canvas"); if (nc && keep && !BD.resetScroll) { nc.scrollLeft = keep[0]; nc.scrollTop = keep[1]; } BD.resetScroll = false;
  if (BD.draft) setTimeout(() => { const i = $("#pin-new"); if (i && document.activeElement !== i) i.focus(); });
};

/* ---------- Actions ---------- */
const setTool = k => {
  if (k === "swap") { BD.flyout = BD.flyout === "swap" ? null : "swap"; return; }
  BD.flyout = null; BD.peek = null; BD.draft = null;
  BD.tool = BD.tool === k && k !== "select" ? "select" : k;
  if (BD.tool !== "attr") BD.sel.clear();
  if (BD.tool === "attr") setTimeout(() => { const i = $("#bd-attr"); if (i && BD.sel.size) i.focus(); });
};
ACTIONS.bdTool = el => setTool(el.dataset.v);
ACTIONS.bdView = el => { BD.view = el.dataset.v; BD.flyout = null; toast(`Showing ${VIEWS[BD.view].name.toLowerCase()} for every item`); };
ACTIONS.bdTile = (el, e) => {
  if (BD.suppressClick) { BD.suppressClick = false; return false; }
  const id = el.dataset.v;
  if (BD.tool === "attr") { BD.sel.has(id) ? BD.sel.delete(id) : BD.sel.add(id); return; }
  if (BD.tool === "highlight") { BD.hl.has(id) ? BD.hl.delete(id) : BD.hl.add(id); return; }
  if (BD.tool === "comment") return false;   // handled on mousedown
  if (BD.tool === "magnify") return false;
  const r = el.getBoundingClientRect(); BD.peek = BD.peek === id ? null : id; BD.peekAt = { x: r.right + 10, y: r.top };
};
ACTIONS.bdPeekClose = () => { BD.peek = null; };
const frameProducts = gid => {
  const list = bdShown(), s = bdStudy();
  if (BD.matrix === "group") { const g = groupsBy(list, BD.groupBy).find(([v]) => (v === "—" ? `No ${dimLabel(BD.groupBy).toLowerCase()}` : v) === gid); return g ? g[1] : []; }
  const k = BD.show; const g = groupsBy(list.filter(p => (s.tags[k] || {})[p.id]), k).find(([v]) => `${attrLabel(k)}: ${v}` === gid); return g ? g[1] : [];
};
ACTIONS.bdSelGroup = el => { const ps = frameProducts(el.dataset.v); if (!ps.length) return false; const all = ps.every(p => BD.sel.has(p.id)); ps.forEach(p => all ? BD.sel.delete(p.id) : BD.sel.add(p.id)); };
ACTIONS.bdSelAll = () => { bdShown().forEach(p => BD.sel.add(p.id)); };
ACTIONS.bdClearSel = () => { BD.sel.clear(); };
ACTIONS.bdClearHl = () => { BD.hl.clear(); };
ACTIONS.bdFilter = el => { const [k, v] = el.dataset.v.split("|"); const set = BD.filters[k] = BD.filters[k] || new Set(); set.has(v) ? set.delete(v) : set.add(v); };
ACTIONS.bdFilterClear = el => { delete BD.filters[el.dataset.v]; };
ACTIONS.bdClearFilters = () => { BD.filters = {}; };
ACTIONS.bdMatrix = el => { BD.matrix = el.dataset.v; BD.resetScroll = true; if (BD.matrix === "group" && !BD.groupBy) BD.groupBy = "type"; toast(`Changed matrix to ${MATRICES[BD.matrix].label}`); };
ACTIONS.bdGroup = el => { BD.groupBy = el.dataset.v; if (BD.group2 === BD.groupBy) BD.group2 = null; BD.matrix = "group"; BD.resetScroll = true; };
ACTIONS.bdGroup2 = el => { BD.group2 = el.dataset.v; };
ACTIONS.bdGroup2Clear = () => { BD.group2 = null; };
ACTIONS.bdShow = el => { BD.show = el.dataset.v; BD.matrix = "freestyle"; BD.resetScroll = true; };
ACTIONS.bdAgg = el => { BD.agg = el.dataset.v; };
ACTIONS.bdMetric = el => { BD.metric = el.dataset.v; };
ACTIONS.bdStat = el => { const k = el.dataset.v; BD.stats[k] = !BD.stats[k]; };
// Buckets: the + buttons add one; dragging a thumb to either end removes it
ACTIONS.bdAddBucket = el => {
  if (BD.buckets.length >= 6) { toast("Six buckets is the most this board shows"); return false; }
  const cuts = [0, ...[...BD.buckets].sort((a, b) => a - b), 100];
  let at;
  if (el.dataset.v === "left") at = Math.round(cuts[1] / 2);
  else if (el.dataset.v === "right") at = Math.round((cuts[cuts.length - 2] + 100) / 2);
  else { let gap = 0; for (let i = 0; i < cuts.length - 1; i++) if (cuts[i + 1] - cuts[i] > gap) { gap = cuts[i + 1] - cuts[i]; at = Math.round((cuts[i] + cuts[i + 1]) / 2); } }
  BD.buckets.push(at); toast(`Added a bucket at ${at}%. Drag it off either end to remove it.`);
};
INPUTS.bdBucket = el => { BD.buckets[+el.dataset.i] = +el.value; const lab = el.parentElement.querySelectorAll(".bx-rlab"); return false; };
document.addEventListener("change", e => {
  if (e.target.dataset && e.target.dataset.in === "bdBucket") {
    const i = +e.target.dataset.i, v = +e.target.value;
    if ((v <= 1 || v >= 99) && BD.buckets.length > 1) { BD.buckets.splice(i, 1); toast("Bucket removed"); }
    render();
  }
  if (e.target.id === "bd-rankn") render();
});
INPUTS.bdRankN = el => { const n = Math.max(1, Math.min(bdProducts().length, +el.value || 1)); BD.rankN = n; return false; };
ACTIONS.bdRankDir = () => { BD.rankDir = BD.rankDir === "top" ? "bottom" : "top"; };
ACTIONS.bdCount = () => { BD.countMode = BD.countMode === "#" ? "%" : "#"; };
ACTIONS.bdWrap = () => { BD.wrap = BD.wrap === "row" ? "col" : "row"; };
ACTIONS.bdOrient = () => { BD.orient = BD.orient === "v" ? "h" : "v"; BD.resetScroll = true; };
ACTIONS.bdPct = () => { BD.pct = !BD.pct; };
ACTIONS.bdSummary = () => { BD.summary = !BD.summary; };
ACTIONS.bdShortcuts = () => { BD.shortcuts = !BD.shortcuts; };
const setZoom = (z, anchor) => {
  const cv = $("#bd-canvas"), old = BD.zoom; BD.zoom = Math.min(3, Math.max(0.4, +z.toFixed(2)));
  if (!cv || old === BD.zoom) return;
  const r = cv.getBoundingClientRect(), ax = anchor ? anchor.x - r.left : r.width / 2, ay = anchor ? anchor.y - r.top : r.height / 2;
  const fx = (cv.scrollLeft + ax) / old, fy = (cv.scrollTop + ay) / old;
  render(); const nc = $("#bd-canvas"); nc.scrollLeft = fx * BD.zoom - ax; nc.scrollTop = fy * BD.zoom - ay;
};
ACTIONS.bdZoomStep = el => { setZoom(BD.zoom * (el.dataset.v === "in" ? 1.2 : 1 / 1.2)); return false; };
ACTIONS.bdZoomFit = () => { setZoom(1); return false; };
ACTIONS.bdTable = () => { BD.table = !BD.table; };
ACTIONS.bdAddGroup = () => { setTool("attr"); if (!BD.sel.size) toast("Drag a frame around the products that belong together, then name the attribute and value."); };
ACTIONS.bdStudy = el => { BD.study = el.dataset.v; BD.sel.clear(); BD.hl.clear(); BD.filters = {}; BD.peek = null; const s = bdStudy(); BD.show = s.published[0] || null; BD.matrix = "pareto"; BD.resetScroll = true; };
INPUTS.bdAttr = el => { BD.tag.attr = el.value; };
INPUTS.bdValue = el => { BD.tag.value = el.value; };
ACTIONS.bdPickVal = el => { BD.tag.value = el.dataset.v; setTimeout(() => { const i = $("#bd-val"); if (i) i.focus(); }); };
ACTIONS.bdPublish = () => {
  const label = BD.tag.attr.trim(), v = BD.tag.value.trim(); if (!label || !v || !BD.sel.size) return false;
  const s = bdStudy(), k = ensureKey(label); ensureAttr(label, k);
  BD.sel.forEach(id => publishTag(s, k, id, v));
  const n = BD.sel.size; BD.sel.clear(); BD.show = k; BD.tag.value = "";
  if (BD.matrix === "freestyle") toast(`Published ${attrLabel(k)} = ${v} on ${n} product${n === 1 ? "" : "s"}. They're framed now.`);
  else toast(`Published ${attrLabel(k)} = ${v} on ${n} product${n === 1 ? "" : "s"}. Switch to Freestyle to see the frame, or Group by ${attrLabel(k)}.`);
};
ACTIONS.bdRemoveTag = el => { const s = bdStudy(), k = el.dataset.v, n = BD.sel.size; BD.sel.forEach(id => unpublishTag(s, k, id)); if (!s.published.includes(k)) { if (BD.groupBy === k) BD.groupBy = "type"; if (BD.show === k) BD.show = s.published[0] || null; } toast(`Removed ${attrLabel(k)} from ${n} products`); };
ACTIONS.bdToast = el => { toast(`Prototype: ${el.dataset.v} isn't part of this prototype`); return false; };
ACTIONS.boardSave = () => { const s = bdStudy(); if (!s.published.length) return false; openCreateFrom(s.name); setFlow("create"); App.page = "home"; };
ACTIONS.boardApply = () => { ST.target = bdStudy().name; App.modal = "collPick"; setFlow("study"); };
// Comments
INPUTS.pinDraft = el => { BD.draft.text = el.value; return false; };
ACTIONS.pinSave = () => { if (!BD.draft || !BD.draft.text.trim()) return false; const c = { id: Date.now(), x: BD.draft.x, y: BD.draft.y, text: BD.draft.text.trim(), by: ME.name, when: "Just now", replies: [] }; pins().push(c); BD.draft = null; BD.openPin = null; toast("Comment added"); };
ACTIONS.pinCancel = () => { BD.draft = null; };
ACTIONS.pinOpen = el => { BD.openPin = BD.openPin === +el.dataset.v ? null : +el.dataset.v; BD.draft = null; setTimeout(() => { const i = $("#pin-reply"); if (i) i.focus(); }); };
ACTIONS.pinClose = () => { BD.openPin = null; };
ACTIONS.pinResolve = el => { const i = pins().findIndex(c => c.id === +el.dataset.v); pins().splice(i, 1); BD.openPin = null; toast("Comment resolved"); };
let replyText = "";
INPUTS.pinReply = el => { replyText = el.value; return false; };
ACTIONS.pinReplySend = () => { const c = pins().find(x => x.id === BD.openPin); if (!c || !replyText.trim()) return false; c.replies.push({ by: ME.name, text: replyText.trim() }); replyText = ""; };

/* ---------- Mouse ----------
   Select: drag pans the canvas, click inspects. Create custom attribute: drag draws a selection frame.
   Comment: click drops a pin. Magnify: a lens follows the cursor. ⌘ or Ctrl + scroll zooms. */
let drag = null;
document.addEventListener("mousedown", e => {
  if (App.page !== "board" || App.modal || e.button !== 0) return;
  const cv = e.target.closest("#bd-canvas"); if (!cv || e.target.closest("button, input, a, .bx-pin, .bx-fh")) return;
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left + cv.scrollLeft, y = e.clientY - r.top + cv.scrollTop;
  if (BD.tool === "comment") { BD.draft = { x, y, text: "" }; BD.openPin = null; render(); e.preventDefault(); return; }
  if (BD.tool === "attr") { if (e.target.closest(".bx-tile")) return; drag = { kind: "marq", x0: x, y0: y, add: e.shiftKey, moved: false, cv }; e.preventDefault(); return; }
  if (BD.tool === "select" || BD.tool === "stats" || BD.tool === "highlight") { drag = { kind: "pan", sx: e.clientX, sy: e.clientY, l: cv.scrollLeft, t: cv.scrollTop, moved: false, cv }; cv.classList.add("panning"); e.preventDefault(); }
});
document.addEventListener("mousemove", e => {
  if (BD.tool === "magnify" && App.page === "board") lens(e);
  if (!drag) return;
  const { cv } = drag;
  if (drag.kind === "pan") { const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; cv.scrollLeft = drag.l - dx; cv.scrollTop = drag.t - dy; return; }
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left + cv.scrollLeft, y = e.clientY - r.top + cv.scrollTop;
  if (Math.abs(x - drag.x0) + Math.abs(y - drag.y0) < 5 && !drag.moved) return;
  drag.moved = true;
  const left = Math.min(x, drag.x0), top = Math.min(y, drag.y0), w = Math.abs(x - drag.x0), h = Math.abs(y - drag.y0);
  let m = cv.querySelector(".bx-marq"); if (!m) { m = document.createElement("div"); m.className = "bx-marq"; cv.appendChild(m); }
  Object.assign(m.style, { left: left + "px", top: top + "px", width: w + "px", height: h + "px" });
  const box = { l: left - cv.scrollLeft + r.left, t: top - cv.scrollTop + r.top, r: left - cv.scrollLeft + r.left + w, b: top - cv.scrollTop + r.top + h };
  cv.querySelectorAll(".bx-tile").forEach(t => { const tr = t.getBoundingClientRect(); t.classList.toggle("hit", tr.left < box.r && tr.right > box.l && tr.top < box.b && tr.bottom > box.t); });
});
document.addEventListener("mouseup", () => {
  if (!drag) return;
  const d = drag; drag = null; d.cv.classList.remove("panning");
  if (d.kind === "pan") { if (d.moved) BD.suppressClick = true; setTimeout(() => { BD.suppressClick = false; }, 0); return; }
  const m = d.cv.querySelector(".bx-marq"); if (m) m.remove();
  if (!d.moved) { if (!d.add && BD.sel.size) { BD.sel.clear(); render(); } return; }
  if (!d.add) BD.sel.clear();
  d.cv.querySelectorAll(".bx-tile.hit").forEach(t => BD.sel.add(t.dataset.id));
  render();
});
document.addEventListener("wheel", e => {
  if (App.page !== "board" || !(e.metaKey || e.ctrlKey) || !e.target.closest("#bd-canvas")) return;
  e.preventDefault(); const d = Math.max(-40, Math.min(40, e.deltaY)); setZoom(BD.zoom * Math.exp(-d * 0.006), { x: e.clientX, y: e.clientY });
}, { passive: false });
document.addEventListener("scroll", e => { if (BD.peek && e.target.id === "bd-canvas") { BD.peek = null; render(); } }, true);

/* Magnifier lens */
let lensEl = null;
const lens = e => {
  if (!lensEl) { lensEl = document.createElement("div"); lensEl.className = "bx-lens"; document.body.appendChild(lensEl); }
  const t = e.target.closest && e.target.closest(".bx-tile");
  if (!t) { lensEl.style.display = "none"; return; }
  const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
  lensEl.style.display = "block"; lensEl.style.left = e.clientX + 18 + "px"; lensEl.style.top = e.clientY - 110 + "px";
  lensEl.style.backgroundImage = `url("${t.querySelector("img").src}")`; lensEl.style.backgroundPosition = `${px}% ${py}%`;
};

/* Tooltips: name, shortcut and the app's detailed description */
let tipEl = null, tipFor = null;
document.addEventListener("mouseover", e => {
  const el = e.target.closest && e.target.closest("[data-tip]");
  if (el === tipFor) return; tipFor = el;
  if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "bx-tip"; document.body.appendChild(tipEl); }
  if (!el || drag) { tipEl.style.display = "none"; return; }
  tipEl.innerHTML = `<div class="bx-tiph"><b>${esc(el.dataset.tip)}</b>${el.dataset.tipk ? `<kbd>${esc(el.dataset.tipk)}</kbd>` : ""}</div>${el.dataset.tipd ? `<p>${esc(el.dataset.tipd)}</p>` : ""}`;
  tipEl.style.display = "block";
  const r = el.getBoundingClientRect(), tr = tipEl.getBoundingClientRect(), side = el.closest(".bx-tools");
  let x = side ? r.right + 10 : r.left + r.width / 2 - tr.width / 2, y = side ? r.top + r.height / 2 - tr.height / 2 : (r.top > innerHeight / 2 ? r.top - tr.height - 8 : r.bottom + 8);
  x = Math.max(8, Math.min(x, innerWidth - tr.width - 8)); y = Math.max(8, Math.min(y, innerHeight - tr.height - 8));
  tipEl.style.left = x + "px"; tipEl.style.top = y + "px";
});
document.addEventListener("mousedown", () => { if (tipEl) tipEl.style.display = "none"; tipFor = null; }, true);

/* Keyboard */
document.addEventListener("keydown", e => {
  if (App.page !== "board" || App.modal || e.metaKey || e.ctrlKey || e.altKey) return;
  // In a board text field only Escape is ours: it leaves the field, then works as normal
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { if (e.key !== "Escape" || App.menu) return; e.target.blur(); }
  const k = e.key;
  if (k === "Escape") { if (App.menu) return; if (BD.shortcuts) BD.shortcuts = false; else if (BD.draft) BD.draft = null; else if (BD.openPin) BD.openPin = null; else if (BD.peek) BD.peek = null; else if (BD.flyout) BD.flyout = null; else if (BD.sel.size) BD.sel.clear(); else if (BD.tool !== "select") setTool("select"); else if (BD.hl.size) BD.hl.clear(); else return; render(); return; }
  if (k === "+" || k === "=" || e.code === "Equal" || e.code === "NumpadAdd") { e.preventDefault(); setZoom(BD.zoom * 1.2); return; }
  if (k === "-" || k === "_" || e.code === "Minus" || e.code === "NumpadSubtract") { e.preventDefault(); setZoom(BD.zoom / 1.2); return; }
  if (k === "0" || e.code === "Digit0" || e.code === "Numpad0") { setZoom(1); return; }
  if (k.toLowerCase() === "d") { BD.table = !BD.table; render(); return; }
  if (k === "?") { BD.shortcuts = !BD.shortcuts; render(); return; }
  const t = Object.entries(TOOLS).find(([, v]) => v.key.toLowerCase() === k.toLowerCase());
  if (t) { e.preventDefault(); setTool(t[0]); render(); }
});

JUMP.board = v => {
  App.page = "board"; App.modal = null; App.menu = null;
  if (v && studyByName(v)) BD.study = v;
  const s = bdStudy(); if (BD.show && !(BD.show in COLS) && !s.published.includes(BD.show)) BD.show = s.published[0] || null;
  render();
};
