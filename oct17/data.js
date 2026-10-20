/* ---------- Data ----------
   The model follows Collagia's. A COLLAGE joins an image feed, an item feed and a business feed on product ID.
   A STUDY is a private workspace on a collage: it holds the tags you publish, per product, per attribute.
   An ATTRIBUTE is a column (Pattern), a VALUE is a cell (Striped); a product has at most one value per attribute.
   A COLLECTION lifts a study's tags out: a snapshot of { attribute → { productId → value } } that can be
   versioned, shared and applied to any study whose collage contains those product IDs.

   Products come from assets/nike/catalog.json: a real scrape of nike.com/gb men's footwear (names, style codes,
   prices, colours, photos). units4w and sellThrough are simulated, and say so in the file's meta. */

const PRODUCTS = {};                       // id → product
const PRODUCT_LIST = [];
const NIKE_IDS = [];
const loadCatalog = async () => {
  const d = await (await fetch("assets/nike/catalog.json")).json();
  d.items.forEach(p => { p.img = p.image; PRODUCTS[p.id] = p; PRODUCT_LIST.push(p); NIKE_IDS.push(p.id); });
  CATALOG_META = d.meta;
  buildStudies();
  return d;
};
let CATALOG_META = null;

/* ---------- Attribute definitions (grow as people publish new ones on a board) ---------- */
const ATTRS = {
  franchise: { label: "Franchise", values: ["Air Max", "Air Force 1", "Dunk", "Jordan", "Pegasus", "Mercurial", "Phantom", "Tiempo", "Metcon", "Other"] },
  season:    { label: "Season", values: ["SP27", "HO26", "Carryover"] },
  hero:      { label: "Hero product", values: ["Yes", "No"] },
  bg:        { label: "Background color", values: ["White", "Black", "Grey", "Beige"] },
  stone:     { label: "Material", values: ["Marble", "Bronze", "Terracotta", "Basalt"] },
};
const attrLabel = k => (ATTRS[k] && ATTRS[k].label) || k;
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "attr";
// Register an attribute by label (returns its key); new values are added as they are used
const ensureAttr = (label, k = slug(label)) => { if (!ATTRS[k]) ATTRS[k] = { label, values: [] }; return k; };
const ensureValue = (k, v) => { if (!ATTRS[k].values.includes(v)) ATTRS[k].values.push(v); };

/* Franchise is read off the product name: the one attribute that is factual rather than visual */
const FRANCHISES = [["Air Max", /Air Max|VaporMax/], ["Air Force 1", /Air Force 1/], ["Dunk", /Dunk/], ["Jordan", /Jordan/], ["Blazer", /Blazer/], ["Cortez", /Cortez/], ["Court", /Court|Killshot|Tennis Classic/],
  ["Pegasus", /Pegasus/], ["Vomero", /Vomero/], ["Structure", /Structure|Invincible|Infinity/], ["Vaporfly & Alphafly", /Vaporfly|Alphafly|Streakfly|Dragonfly/], ["Zoom", /Zoom|ZoomX/],
  ["Mercurial", /Mercurial/], ["Phantom", /Phantom/], ["Tiempo", /Tiempo|Premier/], ["Total 90", /Total ?90|T90/],
  ["LeBron", /LeBron/], ["KD", /\bKD\b/], ["Giannis", /Giannis|Freak/], ["Ja", /\bJa\b/], ["Sabrina", /Sabrina/], ["Book", /Book\b/], ["G.T.", /G\.T\./],
  ["Metcon", /Metcon|Free/], ["SB", /\bSB\b|Janoski/], ["Shox", /Shox/], ["P-6000", /P-6000/], ["Calm & Victori", /Calm|Victori|Offcourt|Asuna/], ["Ava", /\bAva\b/], ["Vapor", /Vapor/]];
FRANCHISES.forEach(([f]) => ensureValue("franchise", f));
const franchiseOf = p => { const f = FRANCHISES.find(([, re]) => re.test(p.name)); return f ? f[0] : "Other"; };

/* ---------- Statues (drawn), kept as the "different collage" example ---------- */
const STONES = { Marble: "#EDEAE3", Bronze: "url(#g-bronze)", Terracotta: "#B8643C", Basalt: "#3A3A3C" };
const STATUE_BG = { White: "#FFFFFF", Black: "#161616", Grey: "#B9B9BC", Beige: "#E3D3B5" };
const STATUE_FORMS = [["bust", "bust of a philosopher"], ["figure", "figure of Hermes"], ["torso", "torso of an athlete"], ["vase", "amphora"], ["head", "head of a woman"], ["bust", "bust of Apollo"], ["figure", "figure of Athena"], ["vase", "votive vase"], ["head", "head of a youth"], ["torso", "Venus torso"]];
const STATUE_IDS = [];
Array.from({ length: 30 }, (_, i) => {
  const [s, what] = STATUE_FORMS[i % STATUE_FORMS.length];
  const bg = ATTRS.bg.values[i % 4], stone0 = ATTRS.stone.values[(i + Math.floor(i / 4)) % 4], stone = bg === "Black" && stone0 === "Basalt" ? "Marble" : stone0;
  const p = { id: `ANT_${201 + i}`, name: `${stone} ${what}`, s, c: STONES[stone], bg: STATUE_BG[bg], type: "Antiquities", price: 1200 + i * 350, _bg: bg, _stone: stone };
  PRODUCTS[p.id] = p; STATUE_IDS.push(p.id);
});

/* ---------- Thumbnail ---------- */
const thumb = (p, cls = "") => p.img
  ? `<span class="o-th ${cls}"><img src="${p.img}" alt="" loading="lazy"></span>`
  : `<span class="o-th ${cls}"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${p.bg || "#ECE9E4"}"/><use href="#${p.s}" fill="${p.c}"/></svg></span>`;
const money = n => "£" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");

/* ---------- People ---------- */
const ME = { name: "Roo Armande", email: "roo@collagia.com", role: "Head of Product", org: "Collagia", photo: "assets/brand/avatar.png", you: true };
const PEOPLE = {
  helen: { name: "Helen Brooms", email: "helen.b@collagia.com" }, leyla: { name: "Leyla Benok", email: "leyla.b@collagia.com" },
  franklin: { name: "Franklin Forge", email: "franklin.f@collagia.com" }, greg: { name: "Greg Johnson", email: "greg.j@collagia.com" },
  maya: { name: "Maya Chen", email: "maya.c@collagia.com" }, omar: { name: "Omar Haddad", email: "omar.h@collagia.com" }, sam: { name: "Sam Ortiz", email: "sam.o@collagia.com" },
};

/* ---------- Collages ---------- */
const COLLAGES = {
  nike: { name: "Nike GB Men's Footwear", feeds: ["Product images", "Catalogue (name, style, colour, price)", "Sales (units, sell-through · simulated)"], productIds: NIKE_IDS },
  christies: { name: "Christie's Antiquities", feeds: ["Lot images", "Catalogue (lot, material)"], productIds: STATUE_IDS },
};

/* ---------- Studies ----------
   tags: { attrKey: { productId: value } }   published: attribute keys this study has tags for
   applied: { collectionId: version }        boards: saved board settings */
const STUDIES = [];
const mkStudy = (name, collage, extra = {}) => ({ name, collage, img: collage === "nike" ? "assets/preview-apparel.png" : "assets/preview-statues.png", edited: "Edited today", tags: {}, published: [], applied: {}, ...extra });
const studyProducts = s => COLLAGES[s.collage].productIds.map(id => PRODUCTS[id]);
const studyByName = n => STUDIES.find(s => s.name === n);
const publishTag = (s, k, pid, v) => { (s.tags[k] = s.tags[k] || {})[pid] = v; ensureValue(k, v); if (!s.published.includes(k)) s.published.push(k); };
const unpublishTag = (s, k, pid) => { if (s.tags[k]) { delete s.tags[k][pid]; if (!Object.keys(s.tags[k]).length) { delete s.tags[k]; s.published = s.published.filter(x => x !== k); } } };
const studyValueCounts = (s, k) => { const m = {}; Object.values(s.tags[k] || {}).forEach(v => m[v] = (m[v] || 0) + 1); return Object.entries(m).sort((a, b) => (a[0] === "Other") - (b[0] === "Other") || b[1] - a[1]); }; // "Other" always last

/* ---------- Collections ---------- */
const COLLECTIONS = [];
const collById = id => COLLECTIONS.find(c => c.id === id);
const cProducts = c => c.productIds.map(id => PRODUCTS[id]).filter(Boolean);
const cValue = (c, k, pid) => (c.values[k] || {})[pid];
const valueCounts = (c, k) => { const m = {}; Object.values(c.values[k] || {}).forEach(v => m[v] = (m[v] || 0) + 1); return Object.entries(m).sort((a, b) => (a[0] === "Other") - (b[0] === "Other") || b[1] - a[1]); }; // "Other" always last
/* Colour coding: every value gets a hue, the same everywhere (rail, product chips, cards, apply preview).
   Hues step by the golden angle so neighbouring values never look alike. */
const valHue = (k, v) => { const vs = (ATTRS[k] && ATTRS[k].values) || []; let i = vs.indexOf(v); if (i < 0) i = [...String(v)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7); return Math.round((i * 137.508 + 210) % 360); };
const hue = (k, v) => `style="--h:${valHue(k, v)}"`;
const isPrivate = c => !c.shared.length;
const visLabel = c => isPrivate(c) ? "Private" : `Shared · ${c.shared.length}`;
// Snapshot a study's tags into a collection (create) or into a new version (update)
const snapshot = (s, attrs) => {
  const values = {}; const ids = new Set();
  attrs.forEach(k => { values[k] = { ...(s.tags[k] || {}) }; Object.keys(values[k]).forEach(id => ids.add(id)); });
  return { values, productIds: [...ids] };
};
// How many of a collection's products a study contains
const matchCount = (c, s) => { const set = new Set(COLLAGES[s.collage].productIds); return c.productIds.filter(id => set.has(id)).length; };

/* ---------- Diff: what applying a collection does to a study ----------
   Applying REPLACES the study's version of each attribute in the collection:
   added = study had no value, changed = study had another value, removed = study has a value on a product the collection doesn't. */
const diffFor = (c, s) => {
  const synced = s.applied[c.id] === c.v, inStudy = new Set(COLLAGES[s.collage].productIds);
  return c.attrs.map(k => {
    const added = [], changed = [], removed = [], own = s.tags[k] || {}, mine = c.values[k] || {};
    if (!synced) {
      Object.entries(mine).forEach(([id, to]) => { if (!inStudy.has(id)) return; const from = own[id]; if (!from) added.push({ p: PRODUCTS[id], to }); else if (from !== to) changed.push({ p: PRODUCTS[id], from, to }); });
      Object.entries(own).forEach(([id, from]) => { if (!(id in mine)) removed.push({ p: PRODUCTS[id], from }); });
    }
    const studyValues = [...new Set([...changed.map(x => x.from), ...removed.map(x => x.from)])].filter(v => !valueCounts(c, k).some(([cv]) => cv === v));
    return { k, added, changed, removed, studyValues, total: added.length + changed.length + removed.length };
  });
};
const diffTotals = d => d.reduce((t, a) => ({ added: t.added + a.added.length, changed: t.changed + a.changed.length, removed: t.removed + a.removed.length, items: t.items + a.total }), { added: 0, changed: 0, removed: 0, items: 0 });
const applyCollection = (c, s) => {
  const inStudy = new Set(COLLAGES[s.collage].productIds);
  c.attrs.forEach(k => { ensureAttr(attrLabel(k), k); s.tags[k] = Object.fromEntries(Object.entries(c.values[k] || {}).filter(([id]) => inStudy.has(id))); if (!s.published.includes(k)) s.published.push(k); });
  s.applied[c.id] = c.v;
};

/* ---------- Seed: studies and collections built once the catalogue is loaded ---------- */
const buildStudies = () => {
  const review = mkStudy("FA26 footwear review", "nike", { edited: "Edited 2 days ago" });
  const isSlide = id => PRODUCTS[id].type === "Sandals & Slides"; // v2 stopped tagging slides: they aren't a franchise
  NIKE_IDS.filter(id => !isSlide(id)).forEach(id => publishTag(review, "franchise", id, franchiseOf(PRODUCTS[id])));
  // Price architecture still has v1, which lumped runners together and tagged slides, so applying v2 changes and removes values
  const pricing = mkStudy("Price architecture", "nike", { edited: "Edited 3 weeks ago" });
  NIKE_IDS.forEach(id => { const f = franchiseOf(PRODUCTS[id]); publishTag(pricing, "franchise", id, isSlide(id) ? "Slides" : ["Vomero", "Structure"].includes(f) ? "Running" : f); });
  pricing.applied.franchise = "v1";
  // The line review also judges upper, silhouette and colour story. Price architecture has the older v1 of those too:
  // the same silhouettes, a few uppers judged differently, and colour story missing on some shoes (so applying adds it).
  const hsh = s => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const LINE = [["Upper material", ["Knit", "Mesh", "Leather", "Suede", "Synthetic"]], ["Silhouette", ["Low", "Mid", "High"]], ["Colour story", ["Core neutrals", "Seasonal brights", "Earth tones"]]];
  const lineKeys = LINE.map(([label, vals]) => { const k = ensureAttr(label);
    NIKE_IDS.forEach(id => { const v = vals[hsh(id + label) % vals.length];
      if (!isSlide(id)) publishTag(review, k, id, v);
      if (label === "Upper material" && hsh(id + "v1") % 18 === 0) publishTag(pricing, k, id, vals[(vals.indexOf(v) + 1) % vals.length]);
      else if (label === "Colour story" && hsh(id + "v1") % 12 === 0) return;
      else publishTag(pricing, k, id, v); });
    return k; });
  const christies = mkStudy("Antiquities sale 2026", "christies", { edited: "Edited 2 weeks ago" });
  // A study with many attributes, to show what that looks like when choosing a study. Franchise is read off the name;
  // the rest are spread deterministically over the catalogue (made-up but stable).
  const merch = mkStudy("SS27 merchandising", "nike", { edited: "Edited 5 days ago" });
  const MERCH = [["Season", ["SP27", "SU27", "Carryover"]], ["Hero product", ["Yes", "No"]], ["Upper material", ["Knit", "Mesh", "Leather", "Suede", "Synthetic"]],
    ["Silhouette", ["Low", "Mid", "High"]], ["Colour story", ["Core neutrals", "Seasonal brights", "Earth tones"]]];
  NIKE_IDS.forEach(id => publishTag(merch, "franchise", id, franchiseOf(PRODUCTS[id])));
  MERCH.forEach(([label, vals]) => { const k = ensureAttr(label); NIKE_IDS.forEach(id => publishTag(merch, k, id, vals[hsh(id + label) % vals.length])); });
  STUDIES.push(review, pricing, christies, merch);

  const fr = snapshot(review, ["franchise", ...lineKeys]);
  COLLECTIONS.push({ id: "franchise", name: "FA26 line review", desc: "How the FA26 line was judged: franchise, upper material, silhouette and colour story for every shoe.",
    attrs: ["franchise", ...lineKeys], ...fr, source: { type: "study", name: review.name, collage: "nike" }, owner: ME, shared: [PEOPLE.helen, PEOPLE.leyla], v: "v2", created: "Sep 20, 2026", edited: "Oct 9, 2026" });
  review.applied.franchise = "v2";

  const statues = { values: { bg: {}, stone: {} }, productIds: [...STATUE_IDS] };
  STATUE_IDS.forEach(id => { statues.values.bg[id] = PRODUCTS[id]._bg; statues.values.stone[id] = PRODUCTS[id]._stone; });
  STATUE_IDS.slice(-4).forEach(id => delete statues.values.stone[id]); // the spreadsheet left Material blank for the last four lots (edge state: no value)
  COLLECTIONS.push({ id: "statues", name: "Statue backgrounds", desc: "Background colour and material for each lot, from the photo studio's spreadsheet.",
    attrs: ["bg", "stone"], ...statues, source: { type: "csv", name: "statue_backgrounds.csv" }, owner: PEOPLE.leyla, shared: [ME], v: "v1", created: "Sep 2, 2026", edited: "Sep 30, 2026" });
};

/* Product card attributes, compact: one coloured square per attribute (the value's colour), details on hover */
const swatches = (pairs) => `<span class="o-sws" tabindex="0">${pairs.map(([k, v]) => `<i class="o-sw${!v ? " none" : v === "Other" ? " other" : ""}" ${v && v !== "Other" ? hue(k, v) : ""}></i>`).join("")}
  <span class="o-swtip" role="tooltip">${pairs.map(([k, v]) => `<span><i class="o-sw${!v ? " none" : v === "Other" ? " other" : ""}" ${v && v !== "Other" ? hue(k, v) : ""}></i><small>${esc(attrLabel(k))}</small><b>${v ? esc(v) : "No value"}</b></span>`).join("")}</span></span>`;
