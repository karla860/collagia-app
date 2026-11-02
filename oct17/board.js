/* ---------- Study board ----------
   Modelled on the live app (tool names and tooltips are the app's own, read from its bundle) and the Phase 1 Figma
   redesign. A board is a MATRIX: Pareto (buckets by a metric), Rank (top or bottom N), Group (frames per value, with
   an optional second grouping) or Freeform (frames for published attributes, the rest loose).
   Items never move by hand. What a click does depends on the TOOL in the left rail:
   Select (V) pan and inspect · Swap images (I) · Magnify (M) · Highlight (H) · Statistics (S)
   Create custom attribute (F) select and tag · Comment (C) drop a pin. +/- or ⌘-scroll to zoom. */

const COLS = { type: "Category", color: "Colour", priceBand: "Price band", onSale: "Sale status" };
const METRICS = { price: "price_gbp", units4w: "units_4w", sellThrough: "sell_through_pct" };
const AGGS = { avg: "Avg", sum: "Sum" };
// Board-type icons from the Figma "Matrix" set (4781:19756): solid squares and bars in three tones (100%, 70%, 50%)
const mSq = (x, y, op, rot = "", s = 3.66, rx = 0.91) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${rx}"${op < 1 ? ` opacity="${op}"` : ""}${rot ? ` transform="rotate(${rot})"` : ""}/>`;
const MATRICES = {
  pareto: { label: "Pareto", hint: "Buckets by a metric", icon: '<rect x="13.62" y="2.5" width="3.89" height="15" rx="1.25"/><rect x="8.06" y="7.08" width="3.89" height="10.42" rx="1.25" opacity=".7"/><rect x="2.5" y="11.67" width="3.89" height="5.83" rx="1.25" opacity=".5"/>' },
  rank: { label: "Rank", hint: "Top or bottom items by a metric", icon: [[2.5, 14.17, .5], [14.17, 2.5, 1], [14.17, 8.33, .7], [14.17, 14.17, .5], [8.33, 8.33, .7], [8.33, 14.17, .5]].map(([x, y, o]) => mSq(x, y, o)).join("") },
  group: { label: "Group by", hint: "Frames per value", icon: [[2.5, 2.5, .5], [7.82, 2.5, .5], [5.16, 6.94, .5], [13.66, 13.6, 1], [8.33, 13.6, 1], [11, 9.17, 1]].map(([x, y, o]) => mSq(x, y, o, "", 3.9, .97)).join("") },
  freestyle: { label: "Freeform", hint: "Frame what you see", icon: [[2.5, 2.5, 1], [2.96, 8.07, .7], [7.99, 10.81, .7], [2.5, 13.56, .5], [13.33, 2.5, 1], [12.5, 8.33, .7], [13.97, 13.1, .5, "15 13.97 13.1"], [7.07, 5.82, 1, "-15 7.07 5.82"]].map(([x, y, o, r]) => mSq(x, y, o, r)).join("") },
};
const mIcon = k => `<svg class="i" viewBox="0 0 20 20" fill="currentColor" stroke="none" aria-hidden="true">${MATRICES[k].icon}</svg>`;
const L = d => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

// The app's own icons, from the Figma style guide (assets/icons)
const fi = n => `<img class="fi" src="assets/icons/${n}.svg" alt="">`;

/* The app's tools, in its order, with its own tooltip copy */
// Tool rail icons: the solid set from the Figma toolbar (4778:16777), drawn on an 18px grid
const tIcon = d => `<svg class="i ti" viewBox="0 0 18 18" fill="currentColor" fill-rule="evenodd" stroke="none" aria-hidden="true">${d}</svg>`;
const tIcon32 = d => `<svg class="i ti" viewBox="7 7 18 18" fill="currentColor" fill-rule="evenodd" stroke="none" aria-hidden="true">${d}</svg>`;
const TOOLS = {
  select: { key: "V", name: "Select", tip: "Select and move items", icon: tIcon('<path d="M4.05 3.29l.09.03 10.16 3.71c.26.1.43.34.42.62 0 .25-.14.46-.35.56l-.1.04-4.32 1.38-.25.08-.08.25-1.38 4.32c-.09.27-.32.44-.6.45h-.01c-.28 0-.51-.16-.6-.42L3.32 4.14l-.03-.09c-.05-.21.02-.43.17-.59.16-.16.38-.22.59-.17Z" stroke="currentColor"/>') },
  // Swap images and Attributes: exact paths from Figma 4781:18424 and 4781:18449 (drawn in a 32px button, so the
  // viewBox crops to the centre 18px)
  swap: { key: "I", name: "Swap images", tip: "Show a different angle", icon: tIcon32('<path d="M15.1111 14.2222C14.6213 14.2222 14.2222 13.8231 14.2222 13.3333C14.2222 12.8436 14.6213 12.4445 15.1111 12.4445C15.6008 12.4445 15.9999 12.8436 15.9999 13.3333C15.9999 13.8231 15.6008 14.2222 15.1111 14.2222Z"/><path d="M20.2108 13.7893C19.6036 13.1822 18.6179 13.1822 18.0108 13.7893L13.1396 18.6587C13.3956 18.8009 13.6854 18.8898 13.9992 18.8898H20.6659C21.6481 18.8898 22.4436 18.0933 22.4436 17.112V16.0231L20.2099 13.7893H20.2108Z"/><path d="M17.8887 22.2222H11.3331C9.98467 22.2222 8.88867 21.1262 8.88867 19.7778V14C8.88867 13.632 9.18734 13.3333 9.55534 13.3333C9.92334 13.3333 10.222 13.632 10.222 14V19.7778C10.222 20.3902 10.7207 20.8889 11.3331 20.8889H17.8887C18.2567 20.8889 18.5553 21.1876 18.5553 21.5556C18.5553 21.9236 18.2567 22.2222 17.8887 22.2222Z"/><path d="M20.6668 19.5555H14.0001C12.6517 19.5555 11.5557 18.4595 11.5557 17.1111V12.2222C11.5557 10.8738 12.6517 9.77777 14.0001 9.77777H20.6668C22.0152 9.77777 23.1112 10.8738 23.1112 12.2222V17.1111C23.1112 18.4595 22.0152 19.5555 20.6668 19.5555ZM14.0001 11.1111C13.3877 11.1111 12.889 11.6098 12.889 12.2222V17.1111C12.889 17.7235 13.3877 18.2222 14.0001 18.2222H20.6668C21.2792 18.2222 21.7779 17.7235 21.7779 17.1111V12.2222C21.7779 11.6098 21.2792 11.1111 20.6668 11.1111H14.0001Z"/><path d="M22.7753 20C22.7753 19.6686 23.0436 19.4004 23.375 19.4004C23.7063 19.4004 23.9746 19.6686 23.9746 20C23.9746 21.4185 22.8498 22.5709 21.4433 22.6201L21.7744 22.9512C22.0083 23.1854 22.0083 23.5646 21.7744 23.7988C21.5401 24.0331 21.1601 24.0331 20.9257 23.7988L19.5761 22.4492C19.3418 22.2149 19.3418 21.8349 19.5761 21.6006L20.9257 20.251C21.1601 20.0167 21.5401 20.0167 21.7744 20.251C22.0085 20.4853 22.0086 20.8654 21.7744 21.0996L21.4531 21.4199C22.1919 21.367 22.7753 20.7523 22.7753 20Z"/>') },
  magnify: { key: "M", name: "Magnify", tip: "See detail without zooming", icon: tIcon('<path d="M7.88 2.97a4.99 4.99 0 0 1 3.97 8.23l-.3.35-.35.29A4.99 4.99 0 0 1 2.98 7.87a4.99 4.99 0 0 1 4.9-4.9ZM8 5a1 1 0 0 0-1 1v1H6a1 1 0 0 0 0 2h1v1a1 1 0 0 0 2 0V9h1a1 1 0 0 0 0-2H9V6a1 1 0 0 0-1-1Z" stroke="currentColor"/><rect x="10" y="11.32" width="1.87" height="6.6" rx=".93" transform="rotate(-45 10 11.32)"/>') },
  highlight: { key: "H", name: "Highlight", tip: "Focus on chosen items", icon: tIcon('<path d="M15 9V4.33C15 3.6 14.4 3 13.67 3H4.33C3.6 3 3 3.6 3 4.33v9.34C3 14.4 3.6 15 4.33 15H9" fill="none" stroke="currentColor" stroke-linecap="round"/><path d="M14.92 12.28c.33.2.31.7-.03.73l-1.71.2-.77 1.54c-.15.3-.62.15-.7-.22l-.84-4.08c-.07-.32.22-.52.5-.35l3.55 2.18Z" stroke="currentColor"/>') },
  attr: { key: "F", name: "Create custom attribute", tip: "Frame items, then name them", icon: tIcon32('<path d="M12.6755 13.3111C13.0265 13.3111 13.3111 13.0265 13.3111 12.6755C13.3111 12.3245 13.0265 12.0399 12.6755 12.0399C12.3245 12.0399 12.04 12.3245 12.04 12.6755C12.04 13.0265 12.3245 13.3111 12.6755 13.3111Z"/><path d="M22.1911 16.5333L20.5022 14.8444H19.2489L21.5689 17.1644L17.1689 21.5644L10.6667 15.0711V10.6667H15.0756L16.5911 12.1822L17.0356 11.3911L15.7022 10.0578C15.6215 9.97189 15.5246 9.90291 15.417 9.85484C15.3094 9.80677 15.1934 9.78057 15.0756 9.77777H10.6667C10.4309 9.77777 10.2048 9.87142 10.0381 10.0381C9.87142 10.2048 9.77777 10.4309 9.77777 10.6667V15.0756C9.77876 15.3109 9.87306 15.5363 10.04 15.7022L16.5289 22.1911C16.6114 22.2738 16.7095 22.3393 16.8174 22.3841C16.9253 22.4288 17.041 22.4518 17.1578 22.4518C17.2746 22.4518 17.3903 22.4288 17.4982 22.3841C17.6061 22.3393 17.7041 22.2738 17.7867 22.1911L22.1867 17.7911C22.2696 17.7088 22.3355 17.611 22.3806 17.5033C22.4257 17.3955 22.4492 17.28 22.4496 17.1631C22.45 17.0463 22.4274 16.9306 22.383 16.8225C22.3387 16.7144 22.2735 16.6162 22.1911 16.5333Z" stroke="currentColor" stroke-width="0.2"/><path d="M19.9333 8.50664L17.3911 12.8889C17.332 12.9757 17.298 13.0772 17.293 13.1821C17.288 13.287 17.3122 13.3913 17.3628 13.4833C17.4134 13.5754 17.4885 13.6516 17.5798 13.7036C17.6711 13.7555 17.775 13.7812 17.88 13.7778H22.9689C23.0739 13.7812 23.1778 13.7555 23.2691 13.7036C23.3604 13.6516 23.4355 13.5754 23.4861 13.4833C23.5367 13.3913 23.5609 13.287 23.5559 13.1821C23.5509 13.0772 23.5169 12.9757 23.4578 12.8889L20.9156 8.50664C20.8654 8.42089 20.7937 8.34976 20.7075 8.30033C20.6214 8.25089 20.5238 8.22488 20.4244 8.22488C20.3251 8.22488 20.2275 8.25089 20.1413 8.30033C20.0552 8.34976 19.9835 8.42089 19.9333 8.50664Z"/>') },
  stats: { key: "S", name: "Statistics", tip: "Calculations and labels", icon: tIcon('<rect x="12.11" y="2.78" width="3.56" height="12.44" rx="1.56"/><rect x="7.22" y="7.22" width="3.56" height="8" rx="1.56"/><rect x="2.33" y="10.78" width="3.56" height="4.44" rx="1.56"/><path d="M3.44 9.44a.67.67 0 0 0 .47-.2l4.2-4.19v.61a.67.67 0 0 0 1.33 0V3.44a.67.67 0 0 0-.66-.66H6.56a.67.67 0 0 0 0 1.33h.61L2.97 8.31a.67.67 0 0 0 .47 1.13Z"/>') },
  comment: { key: "C", name: "Comment", tip: "Click to drop a pin", icon: tIcon('<path d="M9 2.5a6.5 6.5 0 0 0-5.74 9.55l-.71 2.13a.94.94 0 0 0 1.27 1.27l2.13-.71A6.5 6.5 0 1 0 9 2.5Zm2 8H7a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1Zm0-2H7a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1Z"/>') },
};
const VIEWS = { full: { name: "Side view", hint: "The product shot as supplied" }, close: { name: "Close-up", hint: "Cropped in on the upper and logo" }, mono: { name: "Silhouette", hint: "Shape only, colour removed" } };

const BD = { study: "FA26 footwear review", tool: "select", sel: new Set(), hl: new Set(), view: "full", matrix: "pareto", groupBy: "type", group2: null, wrap: "row", metric: "units4w", agg: "sum",
  buckets: [32, 68], countMode: "#", rankN: 60, rankDir: "top", orient: "v", pct: false, show: "franchise", zoom: 1, filters: {}, tag: { attr: "", value: "" }, dd: null,
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
const fullW = () => Math.max(4, Math.floor((innerWidth / uz() - 220) / (TILE() + GAP)));

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
// Section header: the attribute in the white part, the value and its item count in the black box (as staging labels
// Freeform frames, "Visible Tech Features: True | 13"). label stays the frame's id for selecting it.
const frame = (label, ps, t, cls = "", sub = null, head = null) => {
  const allSel = BD.tool === "attr" && ps.length && ps.every(p => BD.sel.has(p.id));
  const body = sub ? `<div class="bx-sub">${groupsBy(ps, sub).map(([v, sp]) => `<div class="bx-subrow"><span class="bx-sublab">${esc(dimLabel(sub))} · <b>${esc(v === "—" ? "None" : v)}</b> <code>${sp.length}</code></span>${grid(sp, t, colsFor(sp.length, 10))}</div>`).join("")}</div>` : grid(ps, t, colsFor(ps.length, 12));
  return `<section class="bx-frame${allSel ? " sel" : ""} ${cls}" data-gid="${esc(label)}">
    <header class="bx-fh">${head ? `<span class="bx-fname">${esc(head.attr)}</span><code><span class="bx-fv">${esc(head.value)}</span>${ps.length}</code>` : `<span class="bx-fname">${esc(label)}</span><code>${ps.length}</code>`}${BD.tool === "attr" ? `<button class="bx-fsel${allSel ? " on" : ""}" data-a="bdSelGroup" data-v="${esc(label)}" ${tipAttrs(allSel ? "Deselect frame" : "Select frame", `All ${ps.length} items`)}>${allSel ? ic.check : ic.frame}</button>` : ""}</header>
    ${body}
    <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
  </section>`;
};
const GROUP = list => {
  const t = TILE(), k = BD.groupBy;
  return `<div class="bx-world bx-groups">${groupsBy(list, k).map(([v, ps]) => frame(v === "—" ? `No ${dimLabel(k).toLowerCase()}` : v, ps, t, v === "—" ? "none" : "", BD.group2, { attr: dimLabel(k), value: v === "—" ? "None" : v })).join("")}</div>`;
};
// Freeform keeps unframed products loose, as staging does: spaced out with a small, stable offset per product
// (seeded by its id, so nothing jumps between renders), alternate rows shifted
const jitter = (id, salt) => { let h = 2166136261 ^ salt; for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) % 1000) / 1000 - 0.5; };
const scatter = (list, t) => {
  const sx = Math.round(t * 1.45), sy = Math.round(t * 1.35), cols = Math.max(4, Math.floor((fullW() * (t + GAP)) / sx) - 1);
  const rows = Math.ceil(list.length / cols), spread = n => n - t - 8;
  return `<div class="bx-scatter" style="width:${cols * sx + Math.round(sx * .4) + t}px;height:${(rows - 1) * sy + t + 8}px">${list.map((p, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = Math.round(c * sx + (r % 2 ? sx * .4 : 0) + jitter(p.id, 1) * spread(sx) + spread(sx) / 2), y = Math.round(r * sy + jitter(p.id, 2) * spread(sy) + spread(sy) / 2);
    return `<div class="bx-scat" style="left:${x}px;top:${y}px">${tile(p, t)}</div>`;
  }).join("")}</div>`;
};
const FREESTYLE = list => {
  const t = TILE(), s = bdStudy(), k = BD.show && s.published.includes(BD.show) ? BD.show : null;
  const framed = k ? groupsBy(list.filter(p => (s.tags[k] || {})[p.id]), k) : [], loose = k ? list.filter(p => !(s.tags[k] || {})[p.id]) : list;
  return `<div class="bx-world bx-free">
    ${framed.length ? `<div class="bx-framed">${framed.map(([v, ps]) => frame(`${attrLabel(k)}: ${v}`, ps, t, "", null, { attr: attrLabel(k), value: v })).join("")}</div>` : ""}
    ${loose.length ? `<div class="bx-loose">${framed.length ? `<div class="bx-loosehead">${loose.length} not framed yet${BD.tool !== "attr" ? ` · press <kbd>F</kbd> to frame some` : ""}</div>` : ""}${scatter(loose, t)}</div>` : ""}
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
const summaryText = () => ({ pareto: `Pareto distribution · ${BD.buckets.length + 1} buckets by ${AGGS[BD.agg].toLowerCase()} ${METRICS[BD.metric]} at ${[...BD.buckets].sort((a, b) => a - b).join("% · ")}%`, rank: `Rank · ${BD.rankDir} ${BD.rankN} by ${METRICS[BD.metric]}`, group: `Group by · one frame per ${dimLabel(BD.groupBy).toLowerCase()}${BD.group2 ? `, split by ${dimLabel(BD.group2).toLowerCase()}` : ""}`, freestyle: `Freeform · frames follow published attributes` })[BD.matrix];
const topBar = () => {
  const s = bdStudy(), c = COLLAGES[s.collage];
  return `<div class="bx-top">
    <div class="bx-box">
      <a class="bx-logo" data-a="nav" data-v="attributes" href="#" ${tipAttrs("Back to the portal")}><img src="assets/brand/logo-collagia-brand.svg" alt="Collagia"></a>
      <i class="bx-vsep"></i>
      ${dd("collage", `${esc(c.name)}${ic.chev}`, `<div class="bx-mnone">${esc(c.feeds.join(" · "))}</div>`, " plain", false, tipAttrs("Collage name", "The data behind this study"))}
      <i class="bx-vsep"></i>
      ${dd("study", `${mIcon(BD.matrix)}<b>${esc(s.name)}</b>${ic.chev}`, STUDIES.map(x => `<button role="menuitemradio" aria-checked="${x === s}" class="${x === s ? "cur" : ""}" data-a="bdStudy" data-v="${esc(x.name)}"><span class="o-amrow"><b>${esc(x.name)}</b><small>${esc(COLLAGES[x.collage].name)} · ${x.published.length} attribute${x.published.length === 1 ? "" : "s"}</small></span></button>`).join(""), " plain", false, tipAttrs("Study", "Switch to another study"))}
      <button class="bx-ib${BD.summary ? " on" : ""}" data-a="bdSummary" ${tipAttrs(BD.summary ? "Hide board summary" : "Show board summary")}>${fi("top-info")}</button>
    </div>
    ${BD.summary ? `<div class="bx-summary">${esc(summaryText())} · ${bdShown().length} items in view</div>` : ""}
    <div class="bx-box">
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
    <button class="bx-plus" data-a="bdAddBucket" data-v="left" ${tipAttrs("Add bucket", "Split by percentage")}>${ic.plus}</button>
    <div class="bx-range">${BD.buckets.map((c, i) => `<input type="range" min="0" max="100" step="1" value="${c}" data-in="bdBucket" data-i="${i}" aria-label="Bucket ${i + 1}">`).join("")}
      ${cuts.map(c => `<span class="bx-rlab" style="left:${c}%">${c}%</span>`).join("")}</div>
    <button class="bx-plus" data-a="bdAddBucket" data-v="right" ${tipAttrs("Add bucket", "Split by percentage")}>${ic.plus}</button>
  </div>`;
};
const showBar = () => {
  const s = bdStudy(), shown = bdShown().length, total = bdProducts().length, active = Object.entries(BD.filters).filter(([, set]) => set.size);
  const matrixMenu = Object.entries(MATRICES).map(([k, m]) => `<button role="menuitemradio" aria-checked="${BD.matrix === k}" class="${BD.matrix === k ? "cur" : ""}" data-a="bdMatrix" data-v="${k}">${mIcon(k)}<span class="o-amrow"><b>${m.label}</b><small>${m.hint}</small></span></button>`).join("");
  const dimMenu = (act, cur, skip) => `<div class="o-mgroup">Catalogue</div>${Object.entries(COLS).filter(([k]) => k !== skip).map(([k, l]) => `<button role="menuitemradio" aria-checked="${cur === k}" class="${cur === k ? "cur" : ""}" data-a="${act}" data-v="${k}">${l}</button>`).join("")}<div class="o-mgroup">Attributes</div>${s.published.filter(k => k !== skip).length ? s.published.filter(k => k !== skip).map(k => `<button role="menuitemradio" aria-checked="${cur === k}" class="${cur === k ? "cur" : ""}" data-a="${act}" data-v="${k}">${ic.tag}${esc(attrLabel(k))}</button>`).join("") : `<span class="bx-mnone">Publish an attribute to use it here</span>`}`;
  const fsec = ([k, l, kind]) => `<div class="bx-fsec"><div class="o-mgroup">${kind === "attr" ? ic.tag : ""}${esc(l)}${BD.filters[k] && BD.filters[k].size ? `<button class="o-clear" data-a="bdFilterClear" data-v="${esc(k)}">Clear</button>` : ""}</div>${valuesOf(k).slice(0, 8).map(([v, n]) => { const on = BD.filters[k] && BD.filters[k].has(v); return `<button role="menuitemcheckbox" aria-checked="${!!on}" data-a="bdFilter" data-v="${esc(k)}|${esc(v)}"><span class="o-cb ${on ? "on" : ""}">${on ? ic.check : ""}</span>${esc(v === "—" ? "No value" : v)}<span class="n">${n}</span></button>`; }).join("")}${valuesOf(k).length > 8 ? `<span class="bx-mnone">+${valuesOf(k).length - 8} more</span>` : ""}</div>`;
  const filterMenu = dims().map(fsec).join("") + (active.length ? `<button class="bx-mclear" data-a="bdClearFilters">Clear all filters</button>` : "");
  // Freeform bar (Figma 4781:18124): one chip per published attribute, then Add Filter. A chip filters by that attribute's
  // values and can set which attribute the frames follow; Add Filter offers the catalogue columns.
  const attrChip = k => { const n = BD.filters[k] ? BD.filters[k].size : 0;
    return dd(`fchip:${k}`, `${TOOLS.attr.icon}${esc(attrLabel(k))}${n ? `<em>${n}</em>` : ""}`, `<button role="menuitemradio" aria-checked="${BD.show === k}" class="${BD.show === k ? "cur" : ""}" data-a="bdShow" data-v="${k}">${ic.frame}Show as frames</button><hr class="o-msep">${fsec([k, attrLabel(k), "attr"])}`, ` bx-achip${n ? " on" : ""}`, true, tipAttrs(attrLabel(k), "Filter or frame by this attribute")); };
  const freeBar = `${s.published.map(attrChip).join("")}${dd("addfilter", `${ic.plus}Add Filter`, dims().filter(([, , kind]) => kind === "data").map(fsec).join(""), " bx-achip", true, tipAttrs("Add filter", "Narrow by a catalogue column"))}`;
  const metricDD = `<span class="bx-metric">${dd("agg", `${AGGS[BD.agg]}${ic.chev}`, Object.entries(AGGS).map(([k, l]) => `<button role="menuitemradio" aria-checked="${BD.agg === k}" class="${BD.agg === k ? "cur" : ""}" data-a="bdAgg" data-v="${k}">${l}</button>`).join(""), " pill", true, tipAttrs("Aggregation"))}
      ${dd("metric", `<code>${METRICS[BD.metric]}</code>${ic.chev}`, Object.entries(METRICS).map(([k, l]) => `<button role="menuitemradio" aria-checked="${BD.metric === k}" class="${BD.metric === k ? "cur" : ""}" data-a="bdMetric" data-v="${k}"><code>${l}</code>${k !== "price" ? `<span class="n">simulated</span>` : ""}</button>`).join(""), " plain", true, tipAttrs("Metric", "The data column shown"))}</span>`;
  const byMatrix = {
    pareto: `${metricDD}<span class="bx-by">by</span>${bucketSlider()}
      <button class="bx-ib" data-a="bdCount" ${tipAttrs("# / %", "Count or percentage")}><b class="bx-cm">${BD.countMode}</b></button>
      <button class="bx-ib${BD.orient === "h" ? " on" : ""}" data-a="bdOrient" ${tipAttrs("Orientation", "Horizontal or vertical")}>${ic.swap}</button>`,
    rank: `${metricDD}
      <button class="bx-bb plain" data-a="bdRankDir" ${tipAttrs("Direction", "Highest or lowest first")}>${BD.rankDir === "top" ? "Top" : "Bottom"}${sv(BD.rankDir === "top" ? '<path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7"/>' : '<path d="M8 3.5v9M4.5 9 8 12.5 11.5 9"/>')}</button>
      <label class="bx-num" ${tipAttrs("Number of images", "How many to show")}><input type="number" min="1" max="${total}" value="${BD.rankN}" data-in="bdRankN" id="bd-rankn"><span>items</span></label>`,
    group: `${dd("groupby", `<span class="bx-glab">Group by</span><b>${esc(dimLabel(BD.groupBy))}</b>${ic.chev}`, dimMenu("bdGroup", BD.groupBy), " plain", true, tipAttrs("Group by", "One frame per value"))}
      ${BD.group2 ? `<span class="bx-chip">then ${esc(dimLabel(BD.group2))}<button data-a="bdGroup2Clear" aria-label="Remove second grouping">${ic.close}</button></span>` : ""}
      ${metricDD}
      <button class="bx-ib${BD.wrap === "col" ? " on" : ""}" data-a="bdWrap" ${tipAttrs("Wrap orientation", "Rows or columns")}>${sv('<path d="M2.5 4h11M2.5 8h8a2 2 0 0 1 0 4H8M9.5 10.5 8 12l1.5 1.5M2.5 12h3"/>', 'stroke-width="1.3"')}</button>`,
    freestyle: `${dd("showattr", `<span class="bx-glab">Frames</span><b>${BD.show && s.published.includes(BD.show) ? esc(attrLabel(BD.show)) : "None"}</b>${ic.chev}`, s.published.length ? s.published.map(k => `<button role="menuitemradio" aria-checked="${BD.show === k}" class="${BD.show === k ? "cur" : ""}" data-a="bdShow" data-v="${k}">${ic.tag}${esc(attrLabel(k))}</button>`).join("") : `<span class="bx-mnone">Press <kbd>F</kbd> and frame some products first</span>`, " plain", true, tipAttrs("Frames", "Attribute for the frames"))}`,
  };
  const addGroup = {
    pareto: `<button class="bx-bb plain" data-a="bdAddBucket" data-v="mid" ${tipAttrs("Add bucket", "One more bucket")}>${ic.plus}Add bucket</button>`,
    rank: "",
    group: dd("addgroup", `${ic.plus}Add group`, `<div class="bx-mnone">Split every frame by a second attribute</div>${dimMenu("bdGroup2", BD.group2, BD.groupBy)}`, " plain", true, tipAttrs("Add group", "Group inside each frame")),
    freestyle: `<button class="bx-bb plain" data-a="bdAddGroup" ${tipAttrs("Add group", "Frame and name a value", "F")}>${ic.plus}Add group</button>`,
  };
  const more = `<button role="menuitem" data-a="bdSummary">${ic.info}${BD.summary ? "Hide" : "Show"} board summary</button><button role="menuitem" data-a="bdPct">${sv('<path d="M3 13 13 3"/><circle cx="4.5" cy="4.5" r="1.5"/><circle cx="11.5" cy="11.5" r="1.5"/>', 'stroke-width="1.4"')}${BD.pct ? "Hide" : "Show"} image percentages</button>${BD.matrix === "group" ? `<button role="menuitem" data-a="bdWrap">Wrap ${BD.wrap === "row" ? "top-to-bottom" : "left-to-right"}</button>` : ""}<hr class="o-msep"><button role="menuitem" data-a="bdShortcuts">${ic.info}Keyboard shortcuts</button>`;
  // Layout follows the app's bottom nav (Figma 4342:1295): sections split by full-height lines, ⋮ in a grey end cap
  return `<div class="bx-show bx-nav">
    <div class="bx-box bx-navl">
      <div class="bx-sec">${dd("matrix", `<span class="bx-cur">${mIcon(BD.matrix)}<span><small>Current board</small>${esc(s.name)}</span></span>${ic.sortI}`, matrixMenu, " cur", true, tipAttrs("Change matrix", "Pareto, Rank, Group by or Freeform"))}</div>
      ${BD.matrix === "freestyle" ? `<div class="bx-sec grow">${freeBar}</div>` : `<div class="bx-sec pad">${dd("filters", `${fi("bot-filter")}Filter${active.length ? `<em>${active.reduce((n, [, set]) => n + set.size, 0)}</em>` : ""}`, filterMenu, active.length ? " on" : " plain", true, tipAttrs("Filter", "Narrow what shows"))}
        <button class="bx-ib${BD.pct ? " on" : ""}" data-a="bdPct" ${tipAttrs("Toggle image percentage", "Show % on each image")}>${ic.info}</button></div>
      <div class="bx-sec grow">${byMatrix[BD.matrix]}${addGroup[BD.matrix] || ""}</div>`}
      <div class="bx-sec cap">${dd("more", fi("bot-more"), more, " plain icon", true, tipAttrs("More"))}</div>
    </div>
    <div class="bx-box bx-navr">
      <div class="bx-sec"><span class="bx-zoom"><button class="bx-ib" data-a="bdZoomStep" data-v="out" ${tipAttrs("Zoom out", "", "−")}>${ic.minus}</button><span class="bx-zoomv">${Math.round(BD.zoom * 100)}%</span><button class="bx-ib" data-a="bdZoomStep" data-v="in" ${tipAttrs("Zoom in", "", "+")}>${ic.plus}</button></span>
        <button class="bx-sq" data-a="bdZoomFit" ${tipAttrs("Fit to screen", "", "0")}>${fi("bot-fit")}</button></div>
      <div class="bx-sec"><button class="bx-bb${BD.table ? " on" : ""}" data-a="bdTable" ${tipAttrs(BD.table ? "Hide data table" : "Show data table", "", "D")}>${fi("bot-table")}Data table</button></div>
    </div>
  </div>
  <div class="bx-drawer"><button class="bx-handle" data-a="bdTable" aria-label="${BD.table ? "Close" : "Open"} the data table" ${tipAttrs(BD.table ? "Hide data table" : "Show data table", "", "D")}></button></div>
  <div class="bx-stats">${BD.tool === "attr" ? (BD.sel.size ? `<span class="sel"><b>${BD.sel.size}</b><small>Selected</small><button class="o-clear" data-a="bdClearSel">Clear</button></span>` : `<span class="sel"><button class="o-clear" data-a="bdSelAll">Select all in view</button></span>`) : ""}${BD.hl.size ? `<span class="sel"><b>${BD.hl.size}</b><small>Highlighted</small><button class="o-clear" data-a="bdClearHl">Clear</button></span>` : ""}</div>`;
};
// Rail order and spacing follow Figma 4781:17559: Select, Swap, Magnify, Highlight, Attributes, Statistics, Comment, no divider
const toolRail = () => `<div class="bx-tools">${Object.entries(TOOLS).map(([k, t]) => `<button class="${BD.tool === k || (k === "swap" && BD.flyout === "swap") ? "on" : ""}${k === "swap" && BD.view !== "full" ? " dot" : ""}" data-a="bdTool" data-v="${k}" ${tipAttrs(t.name, t.tip, t.key)}>${t.icon}</button>`).join("")}</div>
  ${BD.flyout === "swap" ? `<div class="bx-flyout"><div class="o-mgroup">Swap images</div>${Object.entries(VIEWS).map(([k, v]) => `<button class="${BD.view === k ? "cur" : ""}" data-a="bdView" data-v="${k}"><span class="bx-vthumb v-${k}"><img src="${bdProducts()[0].img}" alt=""></span><span class="o-amrow"><b>${v.name}</b><small>${v.hint}</small></span></button>`).join("")}<p class="bx-mnone">This catalogue has one photo per product, so the angles are stand-ins.</p></div>` : ""}`;

/* ---------- Right panel: only for the statistics tool. Attributes are named in the input popover alone. ---------- */
const ensureKey = label => Object.keys(ATTRS).find(x => attrLabel(x).toLowerCase() === label.trim().toLowerCase()) || slug(label.trim());
/* ---------- Input popover (Figma 4392:1295): Attribute Name and Value Name beside the framed products ----------
   Each field is a combobox: type a new name, or pick from what this study already has (with counts). */
const IP_CHEV = `<img class="bx-ip-chev" src="assets/icons/ip-chevron.svg" width="14" height="14" alt="">`;
const ipOptions = which => {
  const s = bdStudy(), typed = (which === "attr" ? BD.tag.attr : BD.tag.value).trim(), ql = typed.toLowerCase();
  const key = BD.tag.attr.trim() ? ensureKey(BD.tag.attr) : null;
  const all = which === "attr" ? s.published.map(k => [attrLabel(k), `${studyValueCounts(s, k).length} values`])
    : key && s.tags[key] ? studyValueCounts(s, key).map(([v, c]) => [v, `${c}`]) : [];
  const exact = all.some(([l]) => l.toLowerCase() === ql);
  return { list: exact || !ql ? all : all.filter(([l]) => l.toLowerCase().includes(ql)), create: ql && !exact ? typed : null };
};
// A product has one value per attribute, so tagging a product that already has one replaces it. Say so before it happens.
const selHaving = k => { const s = bdStudy(), own = s.tags[k] || {}; return [...BD.sel].filter(id => own[id]); };
const ipReplaceNote = () => {
  if (!BD.tag.attr.trim()) return "";
  const k = ensureKey(BD.tag.attr), n = selHaving(k).length, lab = esc(attrLabel(k));
  return n ? `<p class="bx-ip-note">${n === BD.sel.size ? (n === 1 ? "It already has" : `All ${n} already have`) : `${n} of ${BD.sel.size} already have`} a value for ${lab}. Picking one replaces it.</p>` : "";
};
const ipField = (which, label, ph) => {
  const open = BD.dd === which, val = which === "attr" ? BD.tag.attr : BD.tag.value, o = open ? ipOptions(which) : null;
  const cur = val.trim().toLowerCase();
  return `<div class="bx-ip-l">${label}</div>
    <div class="bx-ip-f${open ? " open" : ""}"><input id="${which === "attr" ? "bd-attr" : "bd-val"}" data-in="${which === "attr" ? "bdAttr" : "bdValue"}" data-a="bdDD" data-v="${which}" data-enter="${which === "attr" ? "bdAttrNext" : "bdPublish"}" role="combobox" aria-expanded="${open}" aria-label="${label}" placeholder="${ph}" value="${esc(val)}" autocomplete="off">
      <button class="bx-ip-cbtn" data-a="bdDD" data-v="${which}!" tabindex="-1" aria-label="Show options">${IP_CHEV}</button>
      ${open ? `<div class="bx-ip-dd" role="listbox">${o.list.length ? `<div class="bx-ip-dh">${which === "attr" ? "In this study" : `${esc(attrLabel(ensureKey(BD.tag.attr)))} values`}</div>` : ""}${o.list.map(([l, n]) => `<button role="option" aria-selected="${l.toLowerCase() === cur}" class="${l.toLowerCase() === cur ? "on" : ""}" data-a="bdOpt" data-v="${which}|${esc(l)}"><span>${esc(l)}</span><small>${n}</small>${l.toLowerCase() === cur ? ic.check : ""}</button>`).join("")}
        ${o.create ? `<button class="bx-ip-new" data-a="bdOpt" data-v="${which}|${esc(o.create)}">${ic.plus}<span>Create “<b>${esc(o.create)}</b>”</span></button>` : ""}
        ${!o.list.length && !o.create ? `<p class="bx-ip-empty">${which === "attr" ? "Type a name, e.g. Upper material" : "Type a value, e.g. Knit"}</p>` : ""}</div>` : ""}
    </div>`;
};
const inputPop = () => {
  if (BD.tool !== "attr" || !BD.sel.size) return "";
  // Figma 4392:1295: just the two fields. Choosing a value (or Enter in Value Name) publishes it to the selection.
  return `<div class="bx-inpop" id="bd-inpop" role="dialog" aria-label="Name the attribute and value">
    ${ipField("attr", "Attribute Name", "Type Name*")}
    ${ipField("val", "Value Name", "Type Name*")}
  </div>`;
};
// Always sits right next to the Create custom attribute button in the tool rail, top-aligned with it
const placeInputPop = () => {
  const pop = $("#bd-inpop"), main = $("#board .bx-main"), btn = $('#board .bx-tools button[data-v="attr"]'); if (!pop || !main || !btn) return;
  const z = uz(), m = main.getBoundingClientRect(), b = btn.getBoundingClientRect(), ph = pop.offsetHeight * z;
  const y = Math.min(Math.max(m.top + 8, b.top), m.bottom - ph - 8);
  pop.style.left = (b.right + 8 - m.left) / z + "px"; pop.style.top = (y - m.top) / z + "px";
};
ACTIONS.bdDD = el => {
  const v = el.dataset.v, which = v.replace("!", "");
  const next = v.endsWith("!") && BD.dd === which ? null : which; if (next === BD.dd && !v.endsWith("!")) return false;
  BD.dd = next; if (v.endsWith("!")) setTimeout(() => { const i = $(which === "attr" ? "#bd-attr" : "#bd-val"); if (i) i.focus(); });
};
ACTIONS.bdOpt = el => {
  const [which, ...rest] = el.dataset.v.split("|"), v = rest.join("|");
  if (which === "attr") { if (v !== BD.tag.attr) BD.tag.value = ""; BD.tag.attr = v; BD.dd = "val"; setTimeout(() => { const i = $("#bd-val"); if (i) i.focus(); }); }
  else { BD.tag.value = v; BD.dd = null; ACTIONS.bdPublish(); }
};
ACTIONS.bdAttrNext = () => { if (!BD.tag.attr.trim()) return false; BD.dd = "val"; setTimeout(() => { const i = $("#bd-val"); if (i) i.focus(); }); };
// Tabbing into a field opens its list; clicking anywhere else closes it
document.addEventListener("focusin", e => { const w = e.target.id === "bd-attr" ? "attr" : e.target.id === "bd-val" ? "val" : null; if (w && BD.dd !== w) { BD.dd = w; render(); } });
document.addEventListener("click", e => { if (BD.dd && App.page === "board" && !e.target.closest(".bx-ip-f")) { BD.dd = null; render(); } });

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
  const left = Math.min(BD.peekAt.x, innerWidth / uz() - 300), top = Math.min(BD.peekAt.y, innerHeight / uz() - 340);
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
  const panel = BD.tool === "stats" ? statsPanel() : "";
  $("#board").innerHTML = `${topBar()}<div class="bx-main">${toolRail()}<div class="bx-canvas t-${BD.tool}" id="bd-canvas">${canvas()}<div class="bx-pins">${pinLayer()}</div></div>${panel}${inputPop()}</div>${BD.table ? dataTable() : ""}${showBar()}${peekCard()}${shortcutsCard()}`;
  const nc = $("#bd-canvas"); if (nc && keep && !BD.resetScroll) { nc.scrollLeft = keep[0]; nc.scrollTop = keep[1]; } BD.resetScroll = false;
  if ($("#bd-inpop")) placeInputPop();
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
  const r = el.getBoundingClientRect(); BD.peek = BD.peek === id ? null : id; BD.peekAt = { x: r.right / uz() + 10, y: r.top / uz() };
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
  const r = cv.getBoundingClientRect(), uzz = uz(), ax = (anchor ? anchor.x - r.left : r.width / 2) / uzz, ay = (anchor ? anchor.y - r.top : r.height / 2) / uzz;
  const fx = (cv.scrollLeft + ax) / old, fy = (cv.scrollTop + ay) / old;
  render(); const nc = $("#bd-canvas"); nc.scrollLeft = fx * BD.zoom - ax; nc.scrollTop = fy * BD.zoom - ay;
};
ACTIONS.bdZoomStep = el => { setZoom(BD.zoom * (el.dataset.v === "in" ? 1.2 : 1 / 1.2)); return false; };
ACTIONS.bdZoomFit = () => { setZoom(1); return false; };
ACTIONS.bdTable = () => { BD.table = !BD.table; };
ACTIONS.bdAddGroup = () => { setTool("attr"); if (!BD.sel.size) toast("Drag a frame around the products that belong together, then name the attribute and value."); };
ACTIONS.bdStudy = el => { BD.study = el.dataset.v; BD.sel.clear(); BD.hl.clear(); BD.filters = {}; BD.peek = null; const s = bdStudy(); BD.show = s.published[0] || null; BD.matrix = s.board || "pareto"; BD.resetScroll = true; };
INPUTS.bdAttr = el => { BD.tag.attr = el.value; };
INPUTS.bdValue = el => { BD.tag.value = el.value; };
ACTIONS.bdPickVal = el => { BD.tag.value = el.dataset.v; setTimeout(() => { const i = $("#bd-val"); if (i) i.focus(); }); };
ACTIONS.bdPublish = () => {
  const label = BD.tag.attr.trim(), v = BD.tag.value.trim(); if (!label || !v || !BD.sel.size) return false;
  const s = bdStudy(), k = ensureKey(label); ensureAttr(label, k);
  // One value per attribute: count the products whose old value this replaces, before publishing over it
  const own = s.tags[k] || {}, moved = [...BD.sel].filter(id => own[id] && own[id] !== v).length;
  BD.sel.forEach(id => publishTag(s, k, id, v));
  const n = BD.sel.size; BD.sel.clear(); BD.show = k; BD.tag.value = ""; BD.dd = null;
  const replaced = moved ? ` ${moved} had another ${attrLabel(k)}, now replaced.` : "";
  if (BD.matrix === "freestyle") toast(`Published ${attrLabel(k)} = ${v} on ${n} product${n === 1 ? "" : "s"}.${replaced} They're framed now.`);
  else toast(`Published ${attrLabel(k)} = ${v} on ${n} product${n === 1 ? "" : "s"}.${replaced} Switch to Freeform to see the frame, or Group by ${attrLabel(k)}.`);
};
ACTIONS.bdToast = el => { toast(`Prototype: ${el.dataset.v} isn't part of this prototype`); return false; };
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
  const r = cv.getBoundingClientRect(), z = uz(), x = (e.clientX - r.left) / z + cv.scrollLeft, y = (e.clientY - r.top) / z + cv.scrollTop;
  if (BD.tool === "comment") { BD.draft = { x, y, text: "" }; BD.openPin = null; render(); e.preventDefault(); return; }
  if (BD.tool === "attr") { if (e.target.closest(".bx-tile")) return; drag = { kind: "marq", x0: x, y0: y, add: e.shiftKey, moved: false, cv }; e.preventDefault(); return; }
  if (BD.tool === "select" || BD.tool === "stats" || BD.tool === "highlight") { drag = { kind: "pan", sx: e.clientX, sy: e.clientY, l: cv.scrollLeft, t: cv.scrollTop, moved: false, cv }; cv.classList.add("panning"); e.preventDefault(); }
});
document.addEventListener("mousemove", e => {
  if (BD.tool === "magnify" && App.page === "board") lens(e);
  if (!drag) return;
  const { cv } = drag;
  if (drag.kind === "pan") { const dx = (e.clientX - drag.sx) / uz(), dy = (e.clientY - drag.sy) / uz(); if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; cv.scrollLeft = drag.l - dx; cv.scrollTop = drag.t - dy; return; }
  const r = cv.getBoundingClientRect(), z = uz(), x = (e.clientX - r.left) / z + cv.scrollLeft, y = (e.clientY - r.top) / z + cv.scrollTop;
  if (Math.abs(x - drag.x0) + Math.abs(y - drag.y0) < 5 && !drag.moved) return;
  drag.moved = true;
  const left = Math.min(x, drag.x0), top = Math.min(y, drag.y0), w = Math.abs(x - drag.x0), h = Math.abs(y - drag.y0);
  let m = cv.querySelector(".bx-marq"); if (!m) { m = document.createElement("div"); m.className = "bx-marq"; cv.appendChild(m); }
  Object.assign(m.style, { left: left + "px", top: top + "px", width: w + "px", height: h + "px" });
  const box = { l: (left - cv.scrollLeft) * z + r.left, t: (top - cv.scrollTop) * z + r.top, r: (left - cv.scrollLeft + w) * z + r.left, b: (top - cv.scrollTop + h) * z + r.top };
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
  tipEl.style.left = x / uz() + "px"; tipEl.style.top = y / uz() + "px";
});
document.addEventListener("mousedown", () => { if (tipEl) tipEl.style.display = "none"; tipFor = null; }, true);

/* Keyboard */
document.addEventListener("keydown", e => {
  if (App.page !== "board" || App.modal || e.metaKey || e.ctrlKey || e.altKey) return;
  // In a board text field only Escape is ours: it leaves the field, then works as normal
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { if (e.key !== "Escape" || App.menu) return; e.target.blur(); }
  const k = e.key;
  if (k === "Escape") { if (App.menu) return; if (BD.dd) BD.dd = null; else if (BD.shortcuts) BD.shortcuts = false; else if (BD.draft) BD.draft = null; else if (BD.openPin) BD.openPin = null; else if (BD.peek) BD.peek = null; else if (BD.flyout) BD.flyout = null; else if (BD.sel.size) BD.sel.clear(); else if (BD.tool !== "select") setTool("select"); else if (BD.hl.size) BD.hl.clear(); else return; render(); return; }
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
