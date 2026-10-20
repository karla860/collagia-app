/* ---------- Compare with a study ----------
   An optional, read-only step reached from inside a collection, right before "Apply to a study".
   Pick a study, read one sentence, then short lines of what turns into what ("Running → Vomero · 22 products"),
   grouped by attribute: the study now on the left, after applying on the right. Open a line to see its products.
   The Apply preview renders the very same view (cpSummary + cpGroups), so the second step confirms the first.
   Everything is computed from the prototype's data; nothing is written until the user applies.
   Applying replaces the study's whole column for each attribute in the collection (applyCollection in data.js),
   which is why values can be removed (the live import preview has the same Deletes). */

const CP = { study: null, open: null, all: new Set(), more: new Set(), same: new Set(), q: "", sq: "", showOff: false, loading: false, demo: null, at: null };
const CMP_RANK = { remove: 0, change: 1, add: 2, same: 3 };
const LINES_SHOWN = 6, PRODUCTS_SHOWN = 12;

// One row per product the comparison touches, with one mark per attribute: { k, from, to, kind }
const cmpRows = (c, s) => {
  const inStudy = new Set(COLLAGES[s.collage].productIds), rows = new Map();
  const mark = (id, m) => { if (!rows.has(id)) rows.set(id, { p: PRODUCTS[id], marks: [] }); rows.get(id).marks.push(m); };
  c.attrs.forEach(k => {
    const own = s.tags[k] || {}, mine = c.values[k] || {};
    Object.entries(mine).forEach(([id, to]) => { if (!inStudy.has(id)) return; const from = own[id]; mark(id, { k, from, to, kind: !from ? "add" : from === to ? "same" : "change" }); });
    Object.entries(own).forEach(([id, from]) => { if (!(id in mine)) mark(id, { k, from, kind: "remove" }); });
  });
  return [...rows.values()].map(r => ({ ...r, kind: r.marks.reduce((a, m) => CMP_RANK[m.kind] < CMP_RANK[a] ? m.kind : a, "same") }));
};
// Group by what turns into what. A line knows how many of its products also change in another line.
const lines = (rows, k, same) => {
  const g = new Map(), many = new Set(rows.filter(r => r.marks.filter(m => m.kind !== "same").length > 1).map(r => r.p.id));
  rows.forEach(r => r.marks.forEach(m => {
    if (m.k !== k || (m.kind === "same") !== same) return;
    const key = `${m.k}|${m.from || ""}|${m.to || ""}`;
    if (!g.has(key)) g.set(key, { key, k, from: m.from, to: m.to, kind: m.kind, ps: [], also: 0 });
    const t = g.get(key); t.ps.push(r.p); if (many.has(r.p.id)) t.also++;
  }));
  return [...g.values()].sort((a, b) => CMP_RANK[a.kind] - CMP_RANK[b.kind] || b.ps.length - a.ps.length);
};
// Everything one comparison needs, from the real data
const cpModel = (c, s) => {
  const all = cmpRows(c, s), q = CP.q.trim().toLowerCase();
  const rows = all; // search has its own view (cpSearch), so the sections always show everything
  const changed = all.filter(r => r.kind !== "same"), values = changed.reduce((n, r) => n + r.marks.filter(m => m.kind !== "same").length, 0);
  const inStudy = new Set(COLLAGES[s.collage].productIds);
  // same = products the study and collection both describe that keep every value (counted from the rows, not shared − changed:
  // removals can sit on study products the collection doesn't contain)
  return { all, rows, changed, values, same: all.filter(r => r.kind === "same").length, shared: matchCount(c, s), lost: changed.filter(r => r.marks.some(m => m.kind === "remove")).length,
    notInStudy: c.productIds.filter(id => !inStudy.has(id)).length };
};

const openCompare = (study = null) => {
  Object.assign(CP, { study: null, open: null, all: new Set(), more: new Set(), same: new Set(), q: "", sq: "", showOff: false, loading: false, demo: null });
  ST.fromCompare = false; setFlow("compare"); App.modal = "compare"; App.menu = null;
  // Start on the study that most needs it: one that has an older version of this collection
  const c = curColl(), behind = STUDIES.find(s => matchCount(c, s) && s.applied[c.id] && s.applied[c.id] !== c.v);
  if (study || behind) cpLoad(study || behind.name);
};
// The comparison is instant here; a short "Comparing…" beat stands in for the real request
const cpLoad = name => {
  Object.assign(CP, { study: name, tab: "all", open: null, all: new Set(), more: new Set(), same: new Set(), q: "", touched: false, loading: true, at: new Date() });
  setTimeout(() => { if (CP.study === name && CP.demo !== "loading") { CP.loading = false; render(); } }, 450);
};
const cpColl = () => CP.demo === "noattrs" ? { ...curColl(), name: "Untitled collection", attrs: [], values: {} } : curColl();

/* ---------- Shared view: the sentence, then one group of lines per attribute ---------- */
const cpVal = (k, v, kind) => !v ? `<span class="cpx-val none${kind === "remove" ? " rm" : ""}">No value</span>` : `<span class="cpx-val" ${hue(k, v)}><i class="o-vdot"></i>${esc(v)}</span>`;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const cpSummary = (c, s, m) => {
  const has = s.applied[c.id], label = c.attrs.length === 1 ? `their ${esc(attrLabel(c.attrs[0]))}` : "a value";
  const ver = has ? (has === c.v ? `${esc(s.name)} already has ${esc(c.name)} ${c.v}.` : `${esc(s.name)} has ${esc(c.name)} ${has}; this is ${c.v}.`) : `${esc(s.name)} doesn't have ${esc(c.name)} yet.`;
  if (!m.changed.length) return `<div class="cpx-verdict ok">${ic.check}<div><b>Nothing would change.</b><span>${ver} All ${m.shared} shared products already match.</span></div></div>`;
  const vals = m.values !== m.changed.length ? ` (${plural(m.values, "value")}${c.attrs.length > 1 ? ` across ${c.attrs.length} attributes` : ""})` : "";
  // Just the headline: the breakdown (lose / stay the same) lives in the At a glance card beside it
  return `<div class="cpx-verdict"><div><b>${plural(m.changed.length, "product")} would change in ${esc(s.name)}${vals}.</b></div></div>`;
};

/* ---------- The list, organised by outcome ----------
   Removed (riskiest) first, then Changed, then Added, then one quiet row of what stays the same.
   Every section says what happens in words, with the same mark everywhere: − removed, ⇄ changed, + added, = same. */
const OUTCOMES = [["remove", "−", "Removed"], ["change", "⇄", "Changed"], ["add", "+", "Added"]];
const outcomeLine = (c, kind, n) => {
  const lab = c.attrs.length === 1 ? esc(attrLabel(c.attrs[0])) : null, p = plural(n, "product");
  return { remove: `${p} lose ${lab ? `their ${lab}` : "a value"}`, change: `${p} get a different ${lab || "value"}`, add: `${p} get ${lab ? `a ${lab}` : "a value"} for the first time` }[kind];
};
// One product inside an opened line: its own before → after, and anything else it changes
const cpProduct = (c, t, r) => {
  const others = r.marks.filter(m => m.kind !== "same" && m.k !== t.k).map(m => esc(attrLabel(m.k)));
  return `<span class="cpx-prod">${thumb(r.p, "s28")}<span class="cpx-prod-t"><b>${esc(r.p.name)}</b><span class="o-id">${r.p.id}</span></span>
    <span class="cpx-mini">${t.kind === "same" ? `<span class="same">= ${esc(t.to)} · no change</span>` : t.from ? `<span>${esc(t.from)}</span>` : `<span class="none">No value</span>`}${ic.arrowR}${t.kind === "same" ? "" : t.to ? `<span>${esc(t.to)}</span>` : `<span class="none rm">No value</span>`}</span>
    ${others.length ? `<small class="cpx-also">also changes ${others.join(", ")}</small>` : ""}</span>`;
};
const cpLine = (c, s, t, byId) => {
  const open = CP.q || CP.open === t.key, all = CP.all.has(t.key), ps = [...t.ps].sort((a, b) => a.name.localeCompare(b.name)), shown = all ? ps : ps.slice(0, PRODUCTS_SHOWN);
  return `<button class="cpx-t ${t.kind}${open ? " open" : ""}" data-a="cpOpenT" data-v="${esc(t.key)}" aria-expanded="${!!open}">
      <span class="cpx-now">${c.attrs.length > 1 ? `<small>${esc(attrLabel(t.k))}</small>` : ""}${cpVal(t.k, t.from)}</span>
      <span class="cpx-arrow">${ic.arrowR}</span>
      <span class="cpx-after">${cpVal(t.k, t.to, t.kind)}</span>
      <span class="cpx-n"><span class="cpx-thumbs">${t.ps.slice(0, 4).map(p => thumb(p, "s28")).join("")}</span>${plural(t.ps.length, "product")}${ic.chev}</span>
    </button>
    ${open ? `<div class="cpx-ps">${shown.map(p => cpProduct(c, t, byId[p.id])).join("")}
      ${ps.length > PRODUCTS_SHOWN ? `<button class="o-clear cpx-allbtn" data-a="cpAll" data-v="${esc(t.key)}">${all ? "Show fewer" : `Show all ${ps.length}`}</button>` : ""}</div>` : ""}`;
};
/* Search answers "what happens to this product?" for ANY product in the study or the collection:
   removed, changed, added, stays the same, not affected (study only, no value), or not in this study (collection only). */
const SEARCH_OUT = {
  remove: ["−", "Removed", "Loses its value"], change: ["⇄", "Changed", "Gets a different value"], add: ["+", "Added", "Gets a value for the first time"],
  same: ["=", "Stays the same", "Keeps its value"], untouched: ["·", "Not affected", "Not in this collection and has no value to lose"], notin: ["·", "Not in this study", "Nothing lands on it"],
};
const SEARCH_RANK = { remove: 0, change: 1, add: 2, same: 3, untouched: 4, notin: 5 };
const SEARCH_MAX = 40;
const cpSearch = (c, s, m) => {
  const q = CP.q.trim().toLowerCase(), inStudy = new Set(COLLAGES[s.collage].productIds), byId = Object.fromEntries(m.all.map(r => [r.p.id, r]));
  const ids = [...new Set([...c.productIds, ...inStudy])].filter(id => { const p = PRODUCTS[id]; return p && (p.name.toLowerCase().includes(q) || String(id).toLowerCase().includes(q)); });
  const hits = ids.map(id => ({ p: PRODUCTS[id], r: byId[id], kind: byId[id] ? byId[id].kind : inStudy.has(id) ? "untouched" : "notin" }))
    .sort((a, b) => SEARCH_RANK[a.kind] - SEARCH_RANK[b.kind] || a.p.name.localeCompare(b.p.name));
  if (!hits.length) return `<div class="cpx-empty o-empty o-empty2">${ic.search}<b>No products match “${esc(CP.q)}”</b><span>Search looks at product names and style codes in ${esc(s.name)} and in ${esc(c.name)}.</span><button class="btn" data-a="cpQClear">Clear search</button></div>`;
  const counts = Object.keys(SEARCH_OUT).map(k => [k, hits.filter(h => h.kind === k).length]).filter(([, n]) => n);
  const detail = h => {
    if (!h.r) return `<span class="cpx-sr-why">${SEARCH_OUT[h.kind][2]}</span>`;
    return h.r.marks.map(mk => `<span class="cpx-mini ${mk.kind}">${c.attrs.length > 1 ? `<small>${esc(attrLabel(mk.k))}</small>` : ""}${mk.kind === "same" ? `<span class="same">= ${esc(mk.to)} · no change</span>` : `${mk.from ? `<span>${esc(mk.from)}</span>` : `<span class="none">No value</span>`}${ic.arrowR}${mk.to ? `<span>${esc(mk.to)}</span>` : `<span class="none rm">No value</span>`}`}</span>`).join("");
  };
  return `<div class="cpx-sr">
    <div class="cpx-sr-h"><b>${plural(hits.length, "product")} match “${esc(CP.q)}”</b>${counts.map(([k, n]) => `<span class="cpx-sr-c ${k}"><span class="cpx-g">${SEARCH_OUT[k][0]}</span>${n} ${SEARCH_OUT[k][1].toLowerCase()}</span>`).join("")}</div>
    ${hits.slice(0, SEARCH_MAX).map(h => `<div class="cpx-sr-row ${h.kind}">${thumb(h.p, "s36")}
      <span class="cpx-prod-t"><b>${esc(h.p.name)}</b><span class="o-id">${h.p.id}</span></span>
      <span class="cpx-sr-out ${h.kind}"><span class="cpx-g">${SEARCH_OUT[h.kind][0]}</span>${SEARCH_OUT[h.kind][1]}</span>
      <span class="cpx-sr-d">${detail(h)}</span></div>`).join("")}
    ${hits.length > SEARCH_MAX ? `<p class="cpx-foot">Showing the first ${SEARCH_MAX}. Type more of the name or style code to narrow it down.</p>` : ""}
  </div>`;
};
const cpGroups = (c, s, m) => {
  const byId = Object.fromEntries(m.rows.map(r => [r.p.id, r]));
  const all = c.attrs.flatMap(k => lines(m.rows, k, false));
  // Open the first line on arrival (removals come first), so the products that matter are already in view
  if (CP.open === null && !CP.touched && all.length) CP.open = all.sort((a, b) => CMP_RANK[a.kind] - CMP_RANK[b.kind])[0].key;
  const thead = `<div class="cpx-th"><span>Now in ${esc(s.name)}</span><span></span><span>After applying ${esc(c.name)}</span><span></span></div>`;
  const sections = OUTCOMES.map(([kind, g, title]) => {
    const ts = all.filter(t => t.kind === kind).sort((a, b) => c.attrs.indexOf(a.k) - c.attrs.indexOf(b.k) || b.ps.length - a.ps.length);
    if (!ts.length) return "";
    const n = new Set(ts.flatMap(t => t.ps.map(p => p.id))).size, more = CP.more.has(kind) || CP.q, list = more ? ts : ts.slice(0, LINES_SHOWN);
    return `<section class="cpx-sec cpx-block ${kind}">
      <div class="cpx-sh"><span class="cpx-g">${g}</span><b>${title}</b><span>${outcomeLine(c, kind, n)}</span></div>
      ${thead}
      ${list.map(t => cpLine(c, s, t, byId)).join("")}
      ${ts.length > list.length ? `<button class="cpx-more" data-a="cpMore" data-v="${kind}">Show ${ts.length - list.length} more</button>` : ""}
    </section>`;
  }).join("");
  // What stays the same: one quiet row per attribute, values with their counts
  const stay = m.same;
  const sameRows = c.attrs.map(k => {
    const vals = lines(m.rows, k, true).sort((a, b) => b.ps.length - a.ps.length); if (!vals.length) return "";
    const open = CP.same.has(k), shown = open ? vals : vals.slice(0, 8);
    // Each value opens its products, so any product that stays the same can be checked
    const openT = vals.find(t => t.key === CP.open);
    return `<div class="cpx-samerow">${c.attrs.length > 1 ? `<small>${esc(attrLabel(k))}</small>` : ""}${shown.map(t => `<button class="cpx-sv${CP.open === t.key ? " on" : ""}" ${hue(k, t.to)} data-a="cpOpenT" data-v="${esc(t.key)}" aria-expanded="${CP.open === t.key}" title="See the ${t.ps.length} products that keep ${esc(t.to)}"><i class="o-vdot"></i>${esc(t.to)}<em>${t.ps.length}</em></button>`).join("")}
      ${vals.length > 8 ? `<button class="o-clear" data-a="cpSame" data-v="${k}">${open ? "Show fewer" : `+${vals.length - 8} more`}</button>` : ""}</div>
      ${openT ? (() => { const ps = [...openT.ps].sort((a, b) => a.name.localeCompare(b.name)), all = CP.all.has(openT.key); return `<div class="cpx-ps same">${(all ? ps : ps.slice(0, PRODUCTS_SHOWN)).map(p => cpProduct(c, openT, byId[p.id])).join("")}${ps.length > PRODUCTS_SHOWN ? `<button class="o-clear cpx-allbtn" data-a="cpAll" data-v="${esc(openT.key)}">${all ? "Show fewer" : `Show all ${ps.length}`}</button>` : ""}</div>`; })() : ""}`;
  }).join("");
  const sameSec = stay && sameRows ? `<section class="cpx-sec cpx-block same"><div class="cpx-sh"><span class="cpx-g">=</span><b>Stays the same</b><span>${plural(stay, "product")} keep${stay === 1 ? "s" : ""} ${c.attrs.length === 1 ? `their ${esc(attrLabel(c.attrs[0]))}` : "their values"}</span></div>${sameRows}</section>` : "";
  const search = `<label class="o-searchbox cpx-q">${ic.search}<input id="cp-q" data-in="cpQ" value="${esc(CP.q)}" placeholder="Find any product to see what happens to it" aria-label="Find a product">${CP.q ? `<button class="icon-btn" data-a="cpQClear" aria-label="Clear search">${ic.close}</button>` : ""}</label>`;
  if (CP.q.trim()) return `${search}${cpSearch(c, s, m)}`;
  // Tabs to jump between outcomes; each outcome is its own block
  const vn = { remove: 0, change: 0, add: 0, same: 0 }; m.all.forEach(r => r.marks.forEach(x => vn[x.kind]++));
  const TABS = [["all", "All", 0], ["remove", "Removed", vn.remove], ["change", "Changed", vn.change], ["add", "Added", vn.add], ["same", "Stays the same", vn.same]].filter(([k, , n]) => k === "all" || n);
  const tab = TABS.some(([k]) => k === CP.tab) ? CP.tab : "all";
  const tabs = `<div class="cpx-tabs" role="tablist">${TABS.map(([k, l, n]) => `<button role="tab" aria-selected="${tab === k}" class="${tab === k ? "on" : ""}" data-a="cpTab" data-v="${k}">${l}${k === "all" ? "" : `<span class="n">${n}</span>`}</button>`).join("")}</div>`;
  const pick = (cls, html) => tab === "all" || tab === cls ? html : "";
  const secs = OUTCOMES.map(([kind]) => pick(kind, (sections.match(new RegExp(`<section class="cpx-sec cpx-block ${kind}">[\\s\\S]*?</section>`)) || [""])[0])).join("");
  return `${search}${tabs}<div class="cpx-table cpx-blocks">${secs}${pick("same", sameSec)}</div>`;
};

/* The right-hand column: who is compared with what, the numbers, and the one rule that explains removals */
const cpSide = (c, s, m, foot) => {
  const has = s.applied[c.id], lab = c.attrs.length === 1 ? esc(attrLabel(c.attrs[0])) : "attribute";
  const stat = (n, l, cls = "") => `<div class="cpx-stat ${cls}"><b>${n}</b><span>${l}</span></div>`;
  // One unit throughout: values (cells). A product can lose one value and gain another, so products don't add up.
  const vn = { remove: 0, change: 0, add: 0, same: 0 }; m.all.forEach(r => r.marks.forEach(x => vn[x.kind]++));
  // Study first (which study, which version), then the numbers. No dividers: spacing alone separates the two.
  return `<aside class="cpx-side">
    <section class="cpx-study"><span class="cpx-k">Study</span><div class="cpx-study-t"><b>${esc(s.name)}</b>
      <span class="cpx-badge${has && has !== c.v ? " behind" : has ? " ok" : ""}">${has ? (has === c.v ? `Has ${c.v} · up to date` : `Has ${has} · this is ${c.v}`) : `Doesn't have it yet`}</span></div></section>
    <section class="cpx-glance"><span class="cpx-k">Values at a glance</span>
      ${["remove", "change", "add", "same"].map(k => [k, vn[k]]).filter(([k, n]) => n || k === "same").map(([k, n]) => stat(n, `value${n === 1 ? "" : "s"} ${{ remove: "removed", change: "changed", add: "added", same: "stay the same" }[k]}`, k === "same" ? "muted" : "")).join("")}
    </section>
    <section class="cpx-attrs"><span class="cpx-k">Attributes</span>
      ${c.attrs.map(k => { const inStudy = s.published.includes(k), n = m.all.reduce((t, r) => t + r.marks.filter(x => x.k === k && x.kind !== "same").length, 0);
        return `<div class="cpx-attr"><b>${esc(attrLabel(k))}</b>${inStudy ? "" : `<span class="cpx-astate new">New to the study</span>`}<small>${n ? plural(n, "value") + " change" : "No change"}</small></div>`; }).join("")}
    </section>
    ${foot ? `<small class="cpx-at">${foot}</small>` : ""}
  </aside>`;
};
// Main column (sentence + lines) beside the summary card. Compare and the Apply preview both use this.
const cpLayout = (c, s, m, foot, head = "") => `<div class="cpx-cols"><div class="cpx-main">${head}${cpSummary(c, s, m)}${m.changed.length || m.same ? cpGroups(c, s, m) : ""}</div>${cpSide(c, s, m, foot)}</div>`;

/* ---------- The Compare screen ---------- */
/* ---------- Picking the study ----------
   Always one dropdown with search (built for teams with 10+ studies): suggested studies first
   (the ones behind this collection), then the rest by last edited, and studies that share nothing folded away.
   The chip row (cpChips) is kept for reference; set CHIPS_MAX above 0 to bring it back for short lists. */
const CHIPS_MAX = 0;
// Sample studies for the "many studies" state only. They live here, never in STUDIES, so no other screen sees them.
let SAMPLE_STUDIES = null;
const sampleStudies = () => {
  if (SAMPLE_STUDIES) return SAMPLE_STUDIES;
  const review = studyByName("FA26 footwear review"), pricing = studyByName("Price architecture");
  const copy = t => JSON.parse(JSON.stringify(t));
  const defs = [["SS27 running range", "v1", 1], ["Outlet clearance Q1", "none", 2], ["EMEA top sellers", "v2", 3], ["Football boots refresh", "partial", 4],
    ["Kids footwear 2026", "none", 6], ["Basketball line review", "v1", 9], ["Retail window planning", "v2", 12], ["Jordan capsule FW26", "partial", 15],
    ["Lifestyle sneakers audit", "none", 19], ["Trail & outdoor edit", "v2", 23], ["Women's running SS27", "v1", 28], ["Price architecture 2025", "v1", 40],
    ["Markdown candidates", "partial", 47], ["Store grading: A stores", "v2", 55], ["Collab drops tracker", "none", 63], ["Sustainability shortlist", "partial", 70],
    ["Asia Pacific range", "v2", 84], ["Golf footwear review", "none", 96], ["Christie's Old Masters", "christies", 5], ["Christie's design sale", "christies", 33]];
  SAMPLE_STUDIES = defs.map(([name, kind, days]) => {
    const s = mkStudy(name, kind === "christies" ? "christies" : "nike", { edited: `Edited ${days < 7 ? `${days} day${days === 1 ? "" : "s"}` : `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? "" : "s"}`} ago`, sample: true });
    if (kind === "v1") { s.tags = copy(pricing.tags); s.published = ["franchise"]; s.applied = { franchise: "v1" }; }
    if (kind === "v2") { s.tags = copy(review.tags); s.published = ["franchise"]; s.applied = { franchise: "v2" }; }
    if (kind === "partial") { s.tags = { franchise: Object.fromEntries(Object.entries(review.tags.franchise).filter((_, i) => i % 3 === 0)) }; s.published = ["franchise"]; }
    return s;
  });
  return SAMPLE_STUDIES;
};
const cpStudies = () => CP.demo === "many" ? [...STUDIES, ...sampleStudies()] : STUDIES;
const cpFind = name => cpStudies().find(s => s.name === name);
const editedDays = s => { const m = /(\d+) (day|week)/.exec(s.edited || ""); return m ? +m[1] * (m[2] === "week" ? 7 : 1) : 0; };
const cpStatus = (c, s) => { const n = matchCount(c, s), has = s.applied[c.id]; return !n ? "No shared products" : has ? (has === c.v ? `Has ${has} · up to date` : `Has ${has} · behind ${c.v}`) : `Doesn't have ${esc(c.name)}`; };
const sampleTag = s => s.sample ? `<span class="cpx-sampletag">Sample</span>` : "";

const cpChips = (c, list) => `${list.map(s => { const n = matchCount(c, s), on = CP.study === s.name, has = s.applied[c.id]; return `<button class="cpx-chip${on ? " on" : ""}${n ? "" : " off"}" data-a="cpPick" data-v="${esc(s.name)}" role="radio" aria-checked="${on}" title="${esc(COLLAGES[s.collage].name)} · ${n ? `shares ${n} products with this collection` : "shares no products with this collection"}">${esc(s.name)}${!n ? `<small>no shared products</small>` : has && has !== c.v ? `<small>has ${has}</small>` : ""}</button>`; }).join("")}`;

const cpDropdown = (c, list) => {
  const cur = CP.study && cpFind(CP.study), open = App.menu === "cpstudy", q = CP.sq.trim().toLowerCase();
  const item = s => { const n = matchCount(c, s), on = CP.study === s.name, has = s.applied[c.id];
    return `<button role="option" aria-selected="${on}" class="cpx-opt${on ? " cur" : ""}${n ? "" : " off"}" data-a="cpPick" data-v="${esc(s.name)}">
      <span class="cpx-opt-t"><b>${esc(s.name)}</b>${sampleTag(s)}<small>${esc(COLLAGES[s.collage].name)} · ${n ? `${n} shared` : "none shared"} · ${esc(s.edited)}</small></span>
      <span class="cpx-badge${has && has !== c.v ? " behind" : has ? " ok" : ""}">${!n ? "—" : has ? (has === c.v ? "Up to date" : `Has ${has}`) : "Not applied"}</span>${on ? ic.check : ""}</button>`; };
  const hits = list.filter(s => !q || s.name.toLowerCase().includes(q) || COLLAGES[s.collage].name.toLowerCase().includes(q));
  const shares = hits.filter(s => matchCount(c, s)), none = hits.filter(s => !matchCount(c, s));
  const suggested = shares.filter(s => s.applied[c.id] && s.applied[c.id] !== c.v).sort((a, b) => editedDays(a) - editedDays(b));
  const rest = shares.filter(s => !suggested.includes(s)).sort((a, b) => editedDays(a) - editedDays(b));
  const sec = (title, ss, note = "") => ss.length ? `<div class="o-mgroup">${title}<span class="n">${ss.length}</span></div>${note}${ss.map(item).join("")}` : "";
  return `<div class="o-dd cpx-dd"><button class="cpx-select${open ? " open" : ""}" data-a="menu" data-v="cpstudy" aria-haspopup="listbox" aria-expanded="${open}">
      ${cur ? `<b>${esc(cur.name)}</b>${sampleTag(cur)}<small>${cpStatus(c, cur)}</small>` : `<span class="o-muted">Choose one of ${list.length} studies</span>`}${ic.chev}</button>
    ${open ? `<div class="o-menu cpx-menu" role="listbox" aria-label="Studies">
      <label class="o-searchbox cpx-sq" data-keep>${ic.search}<input id="cp-sq" data-in="cpSQ" value="${esc(CP.sq)}" placeholder="Search ${list.length} studies" aria-label="Search studies" autocomplete="off"></label>
      <div class="cpx-opts">
        ${sec("Suggested · behind this collection", suggested)}
        ${sec(q ? "Matching studies" : "Other studies with these products", rest)}
        ${none.length ? `<div data-keep><button class="cpx-offbtn" data-a="cpOffToggle">${CP.showOff ? "Hide" : "Show"} ${none.length} ${none.length === 1 ? "study" : "studies"} with no shared products${ic.chev}</button></div>${CP.showOff || q ? none.map(item).join("") : ""}` : ""}
        ${hits.length ? "" : `<p class="cpx-nohit">No studies match “${esc(CP.sq)}”</p>`}
      </div>
    </div>` : ""}</div>`;
};
const cpPicker = c => { const list = cpStudies(); return `<div class="cpx-pick" role="radiogroup" aria-label="Study to compare with"><span>Compare with</span>${list.length > CHIPS_MAX ? cpDropdown(c, list) : cpChips(c, list)}</div>
  ${CP.demo === "many" ? cpSample(`Sample: ${sampleStudies().length} made-up studies added to show a long list. They only exist on this screen.`) : ""}`; };
const cpEmpty = (icon, title, body, extra = "") => `<div class="o-empty o-empty2 cpx-empty">${icon}<b>${title}</b><span>${body}</span>${extra}</div>`;
const cpSample = label => `<span class="cpx-sample" title="Not live prototype data">${label}</span>`;
const cpBody = (c, s) => {
  if (!c.attrs.length) return `${cpSample("Sample state")}${cpEmpty(ic.tag, "This collection has no attributes", "There's nothing to compare, so applying it would change nothing in any study.")}`;
  if (!s) return cpEmpty(`<span class="cpx-legend-g">⇄</span>`, "Pick a study to compare with", `You'll see its ${c.attrs.length === 1 ? esc(attrLabel(c.attrs[0])) : "values"} as they are now, next to how they'd look after applying ${esc(c.name)}. Comparing is optional.`);
  if (CP.demo === "error") return `${cpSample("Simulated error")}${cpEmpty(ic.warn, `Couldn't compare with ${esc(s.name)}`, "The study's data didn't load. Nothing was changed.", `<button class="btn" data-a="cpRetry">Try again</button>`)}`;
  if (CP.loading) return `${CP.demo === "loading" ? cpSample("Simulated loading") : ""}<div class="cpx-loading" aria-busy="true"><p class="o-muted">Comparing with ${esc(s.name)}…</p>${"<div class=\"cpx-skel\"></div>".repeat(4)}</div>`;
  if (!matchCount(c, s)) return cpEmpty(ic.box, `${esc(s.name)} has none of these products`, `It's built on ${esc(COLLAGES[s.collage].name)}, so applying ${esc(c.name)} there would change nothing.`);
  const m = cpModel(c, s), at = CP.at ? CP.at.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
  return cpLayout(c, s, m, "", cpPicker(c)); // picker inside the main column, so the card starts at the top
};

const MODAL_COMPARE = () => {
  const c = cpColl(), s = CP.study && cpFind(CP.study);
  const ready = s && !CP.loading && CP.demo !== "error" && c.attrs.length && matchCount(c, s), m = ready ? cpModel(c, s) : null;
  return `<div class="o-modal xl cpx" role="dialog" aria-modal="true" aria-label="Compare ${esc(c.name)} with a study">
    <header class="o-mh"><button class="icon-btn" data-a="cpBack" aria-label="Back to collection">${ic.back}</button><h2 class="o-h20">Compare <b>${esc(c.name)}</b> with a study</h2><span class="sp"></span><span class="o-pvtag">${ic.eye}Read-only</span></header>
    <div class="o-scroll grey"><div class="cpx-body">${ready ? "" : cpPicker(c)}${cpBody(c, s)}</div></div>
    <footer class="o-mf"><span class="sp"></span>
      <button class="btn" data-a="cpBack">Back to collection</button>
      ${!c.attrs.length ? `<button class="btn primary" disabled>Apply to a study</button>`
        : !s ? `<button class="btn primary" data-a="toStudyPick">Apply to a study</button>`
        : `<button class="btn primary" data-a="cpApply" ${m && m.changed.length ? "" : "disabled"}>Apply to ${esc(s.name)}</button>`}
    </footer>
  </div>`;
};

/* ---------- Actions ---------- */
const flip = (set, v) => { set.has(v) ? set.delete(v) : set.add(v); };
ACTIONS.cpOpen = () => openCompare();
ACTIONS.cpPick = el => { CP.sq = ""; if (CP.study !== el.dataset.v) { CP.demo = ["noattrs", "many"].includes(CP.demo) ? CP.demo : null; cpLoad(el.dataset.v); } };
INPUTS.cpSQ = el => { CP.sq = el.value; };
ACTIONS.cpOffToggle = () => { CP.showOff = !CP.showOff; };
ACTIONS.cpTab = el => { CP.tab = el.dataset.v; };
ACTIONS.cpOpenT = el => { if (CP.q) return false; CP.touched = true; CP.open = CP.open === el.dataset.v ? null : el.dataset.v; };
ACTIONS.cpAll = el => { flip(CP.all, el.dataset.v); };
ACTIONS.cpMore = el => { flip(CP.more, el.dataset.v); };
ACTIONS.cpSame = el => { flip(CP.same, el.dataset.v); };
INPUTS.cpQ = el => { CP.q = el.value; };
ACTIONS.cpQClear = () => { CP.q = ""; };
ACTIONS.cpRetry = () => { CP.demo = null; cpLoad(CP.study); };
ACTIONS.cpBack = () => { App.modal = "card"; setFlow("card"); };
// Carry the chosen study into the existing Apply flow: straight to its preview, no second pick
ACTIONS.cpApply = () => { if (cpFind(CP.study).sample) { toast("Sample study: applying isn't part of this demo"); return false; } ST.sel = CP.study; ST.q = ""; ST.open = null; ST.fromBoard = false; ST.fromCompare = true; CP.q = ""; setFlow("study"); ACTIONS.pvApply(); }; // straight to the confirmation, or applied if nothing is lost

/* Guide: #compare opens the picker; sub-entries show each state (sample states are labelled as such on screen) */
JUMP.compare = v => {
  App.page = "home"; if (v === "statues") resetAntiquities(); openCard(v === "statues" ? "statues" : "franchise"); openCompare();
  const pick = { search: "Price architecture", changes: "Price architecture", uptodate: "FA26 footwear review", statues: "Antiquities sale 2026", noshared: "Antiquities sale 2026", loading: "Price architecture", error: "Price architecture" }[v];
  if (v === "noattrs") { CP.demo = "noattrs"; CP.study = null; CP.loading = false; }
  if (v === "many") { CP.demo = "many"; CP.loading = false; }
  if (v === "search") { CP.q = "nike calm"; CP.loading = false; }
  if (pick) { CP.study = pick; CP.at = new Date(); CP.loading = v === "loading"; CP.demo = v === "loading" || v === "error" ? v : null; }
  render();
};
