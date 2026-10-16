/* ---------- Product data ----------
   The 18 real photos come from the Figma file (assets/products-hd). Every other product is a drawn
   garment with the attribute's pattern on top, so each value in the side rail has real items. */

const PHOTOS = {
  TOP_117: "Dri-FIT training tee in Ecru", TAN_118: "Performance tank in Terracotta", WBR_119: "Windbreaker in Sienna",
  TOP_120: "Longsleeve top in Apricot", CRW_121: "Fleece crewneck in Camel", TOP_122: "Dri-FIT training tee in Beige",
  TOP_123: "Dri-FIT training tee in Orange", BRA_124: "Sports Bra in Magenta", JOG_125: "Fleece joggers in Sand",
  SRT_126: "Biker shorts in Cinnamon", PNT_127: "Track pants in Mustard", SWP_128: "Sweatpants in Toffee",
  HOD_129: "Fleece hoodie in Cognac", VST_130: "Puffer vest in Amber", JKT_131: "Track jacket in Brick Red",
  LEG_132: "Training leggings in Rust", PUL_133: "Half-zip pullover in Burnt Sienna", SWP_134: "Sweatpants in Chestnut",
};
const WARM_IDS = ["SRT_126", "TOP_123", "CRW_121", "HOD_129", "PUL_133", "TOP_120", "TAN_118", "VST_130", "BRA_124", "SWP_134", "SWP_128", "JKT_131", "PNT_127", "LEG_132", "WBR_119"];
const NEUTRAL_IDS = ["TOP_117", "TOP_122", "JOG_125"];
// The HD export of SRT_126 holds two products, so it uses the smaller single-product image
const photoSrc = id => id === "SRT_126" ? "assets/products/SRT_126.png" : `assets/products-hd/${id}.jpg`;
const photo = id => ({ id, name: PHOTOS[id], img: photoSrc(id) });

const GARMENTS = [["tee", "training tee", "TOP"], ["long", "longsleeve top", "TOP"], ["tank", "performance tank", "TAN"], ["pants", "track pants", "PNT"], ["shorts", "running shorts", "SRT"], ["bra", "sports bra", "BRA"], ["vest", "puffer vest", "VST"]];
const PALETTE = {
  pattern: [["Navy", "#2b3a67"], ["Forest", "#3f6b4f"], ["Sky", "#8fb7d9"], ["Coral", "#e07a5f"], ["Plum", "#6d3b63"], ["Mustard", "#d9a521"], ["Ecru", "#e9e2d0"], ["Charcoal", "#3d3d3f"], ["Sage", "#93a587"], ["Cobalt", "#2f5bb7"], ["Rust", "#b5532e"], ["Lilac", "#b9a3d3"]],
  cool: [["Navy", "#2b3a67"], ["Sky", "#8fb7d9"], ["Cobalt", "#2f5bb7"], ["Forest", "#3f6b4f"], ["Sage", "#93a587"], ["Teal", "#2f7f7a"], ["Lilac", "#b9a3d3"]],
  neutral: [["Oat", "#d8ccb4"], ["Stone", "#a59f94"], ["Charcoal", "#3d3d3f"], ["Black", "#232121"], ["Grey", "#9b9b9d"], ["Ivory", "#efe9dc"], ["Taupe", "#8b7d6b"]],
};
let skuN = 135;
const drawn = (prefix, i, palette, pattern) => {
  // Colour steps every item, garment steps every full lap of colours, so names don't repeat
  const [s, kind, code] = GARMENTS[(i + Math.floor(i / palette.length) * 3 + prefix.length) % GARMENTS.length];
  const [cn, c] = palette[(i + prefix.length) % palette.length];
  return { id: `${code}_${skuN++}`, name: `${prefix ? prefix + " " + kind : kind[0].toUpperCase() + kind.slice(1)} in ${cn}`, s, c, pattern };
};

/* Collection "Apparel by Pattern Style": 64 products across 6 pattern attributes (counts from the Figma side rail) */
const COLL_ATTRS = [
  { k: "solid", label: "Solid", values: { "Warm colors": 15, "Cool colors": 0, "Neutrals": 3 } },
  { k: "striped", label: "Striped", values: { Breton: 5, Pinstripe: 3, Rugby: 4 } },
  { k: "floral", label: "Floral", values: { Ditsy: 4, Tropical: 3, Botanical: 2 } },
  { k: "graphic", label: "Graphic print", values: { Logo: 5, Typography: 4, Illustration: 2 } },
  { k: "multi", label: "Multicolored", values: { "Color block": 3, "Tie-dye": 3, "Ombré": 2 } },
  { k: "plaid", label: "Plaid", values: { Tartan: 2, Gingham: 2, "Buffalo check": 2 } },
];
const COLL_PRODUCTS = [
  ...WARM_IDS.map(id => ({ ...photo(id), attr: "solid", value: "Warm colors" })),
  ...NEUTRAL_IDS.map(id => ({ ...photo(id), attr: "solid", value: "Neutrals" })),
];
COLL_ATTRS.filter(a => a.k !== "solid").forEach(a => Object.entries(a.values).forEach(([v, n]) => {
  for (let i = 0; i < n; i++) COLL_PRODUCTS.push({ ...drawn(v, i, PALETTE.pattern, a.k), attr: a.k, value: v });
}));

/* Each item's attributes follow from what it is, so any value picked shows items that plausibly have it
   (a puffer vest is Nylon / Recycled / Outdoor, a fleece hoodie is Fleece / Blend / Lifestyle, and so on) */
const traits = name => {
  const n = name.toLowerCase();
  const mat1 = /fleece|hoodie|crewneck|joggers/.test(n) ? "Fleece" : /puffer|windbreaker/.test(n) ? "Nylon" : /tee|longsleeve|sweatpants|pullover/.test(n) ? "Cotton" : "Polyester";
  const mat2 = { Cotton: "Organic", Fleece: "Blend", Nylon: "Recycled", Polyester: "Recycled" }[mat1];
  const func = /puffer|windbreaker|jacket|vest/.test(n) ? "Outdoor" : /hoodie|crewneck|sweatpants|joggers|pullover|longsleeve/.test(n) ? "Lifestyle" : "Training";
  const design = /track|rugby/.test(n) ? "Retro" : /orange|magenta|mustard|cobalt|coral|lilac/.test(n) ? "Bold" : func === "Training" ? "Sporty" : "Minimal";
  return { mat1, mat2, func, design };
};

/* Study "Consumer Preferences": 64 products with custom attributes (Flow 3) */
const STUDY_ATTRS = [
  { k: "design", label: "Design Style", values: ["Minimal", "Sporty", "Retro", "Bold"] },
  { k: "color", label: "Color", values: ["Warm colors", "Cool colors", "Neutrals"] },
  { k: "mat1", label: "Materials 1", values: ["Cotton", "Polyester", "Fleece", "Nylon"] },
  { k: "mat2", label: "Materials 2", values: ["Recycled", "Organic", "Blend"] },
  { k: "func", label: "Function", values: ["Training", "Lifestyle", "Outdoor"] },
];
const STUDY_PRODUCTS = [
  ...WARM_IDS.map(id => ({ ...photo(id), color: "Warm colors" })),
  ...Array.from({ length: 21 }, (_, i) => ({ ...drawn("", i, PALETTE.cool), color: "Cool colors" })),
  ...NEUTRAL_IDS.map(id => ({ ...photo(id), color: "Neutrals" })),
  ...Array.from({ length: 25 }, (_, i) => ({ ...drawn("", i + 3, PALETTE.neutral), color: "Neutrals" })),
].map(p => ({ ...p, ...traits(p.name) }));

/* Thumbnail: photo, or garment silhouette with the attribute's pattern on top */
const thumb = (p, cls = "") => p.img
  ? `<span class="o-th ${cls}"><img src="${p.img}" alt="" loading="lazy"></span>`
  : `<span class="o-th ${cls}"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="${p.bg || "#ECE9E4"}"/><use href="#${p.s}" fill="${p.c}"/>${p.pattern ? `<use href="#${p.s}" fill="url(#p-${p.pattern})"/>` : ""}${p.fx ? `<use href="#${p.s}" fill="url(#${p.fx})"/>` : ""}</svg></span>`;

/* Homepage collections */
const COLLECTIONS = [
  { name: "Statues by BG Color", set: "statues", v: "v1", tags: ["Black & White", "Grey", "Beige"], desc: "A collection that groups statue product images by their background color, used by e-commerce and merchandising teams.", created: "Sep 2, 2026", edited: "Sep 30, 2026", img: "assets/preview-statues.png" },
  { name: "Apparel by Pattern Style", set: "apparel", v: "v2", tags: ["Solid", "Striped", "Floral", "Graphic Print", "Multicolored", "Plaid"], desc: "A visual catalog of apparel products organized by surface pattern, enabling designers and online store teams to filter listings.", created: "Aug 19, 2026", edited: "Sep 16, 2026", img: "assets/preview-apparel.png" },
  { name: "Collectibles by Finish Type", set: "collectibles", v: "v1", tags: ["Glossy", "Matte", "Hand-Painted", "Bronze", "Copper", "Gold Plated", "Gold"], desc: "A merchandise collection that sorts collectible items by surface finish, helping fans and store teams browse, price, and identify listings.", created: "Aug 12, 2026", edited: "Sep 9, 2026", img: "assets/preview-collectibles.png" },
];
/* ---------- Each collection has its own attributes and items ----------
   COLL_ATTRS / COLL_PRODUCTS hold whichever collection is open; useCollection() swaps them in place. */
const STONES = { Marble: "#EDEAE3", Bronze: "url(#g-bronze)", Terracotta: "#B8643C", Basalt: "#3A3A3C", Limestone: "#CFC3A8", Alabaster: "#F4EFE6" };
const STATUE_FORMS = [["bust", "bust of a philosopher"], ["figure", "figure of Hermes"], ["torso", "torso of an athlete"], ["vase", "amphora"], ["head", "head of a woman"], ["bust", "bust of Apollo"], ["figure", "figure of Athena"], ["vase", "votive vase"], ["head", "head of a youth"], ["torso", "Venus torso"]];
// Background shade per value; dark backgrounds get pale stone, light ones get darker stone, so the object always reads
const STATUE_BG = { White: ["#FFFFFF", ["Bronze", "Basalt", "Terracotta"]], Black: ["#161616", ["Marble", "Alabaster", "Limestone"]], "Split black & white": ["url(#g-bw)", ["Terracotta", "Bronze"]],
  "Light grey": ["#DADADC", ["Basalt", "Bronze", "Terracotta"]], "Mid grey": ["#A7A7AA", ["Marble", "Alabaster", "Basalt"]], Charcoal: ["#4A4A4D", ["Marble", "Limestone", "Alabaster"]],
  Sand: ["#E3D3B5", ["Basalt", "Bronze"]], Cream: ["#F1E8D6", ["Terracotta", "Basalt", "Bronze"]], Linen: ["#E8E1D3", ["Bronze", "Basalt"]] };
const STATUE_ATTRS = [
  { k: "bw", label: "Black & White", values: { White: 5, Black: 4, "Split black & white": 2 } },
  { k: "grey", label: "Grey", values: { "Light grey": 4, "Mid grey": 3, Charcoal: 3 } },
  { k: "beige", label: "Beige", values: { Sand: 3, Cream: 4, Linen: 2 } },
];
let statueN = 201, statueI = 0;
const statueNames = new Set();
const STATUE_PRODUCTS = STATUE_ATTRS.flatMap(a => Object.entries(a.values).flatMap(([v, n]) => Array.from({ length: n }, (_, i) => {
  const [bg, mats] = STATUE_BG[v], mat = mats[i % mats.length];
  let s, what; do { [s, what] = STATUE_FORMS[statueI++ % STATUE_FORMS.length]; } while (statueNames.has(`${mat} ${what}`));
  statueNames.add(`${mat} ${what}`);
  return { id: `ANT_${statueN++}`, name: `${mat} ${what}`, s, c: STONES[mat], bg, attr: a.k, value: v };
})));

const FINISH = {
  "High gloss": ["#B3261E", "g-gloss"], Satin: ["#2f5bb7", "g-gloss"], Flat: ["#6E6D7A"], "Soft-touch": ["#93a587"],
  Detailed: ["#F1E8D6", "p-painted"], Washed: ["#E9E2D0", "p-washed"], Patinated: ["url(#g-bronze)", "p-patina"], Polished: ["url(#g-bronze)", "g-gloss"],
  Brushed: ["url(#g-copper)", "p-brushed"], Aged: ["url(#g-copper)", "p-aged"], "24k plated": ["url(#g-gold)", "g-gloss"], "Rose gold plated": ["url(#g-rose)", "g-gloss"],
  "Solid 14k": ["url(#g-gold)"], "Gold leaf": ["url(#g-gold)", "p-brushed"] };
const COLLECTIBLE_FORMS = [["coin", "commemorative coin"], ["dragon", "dragon figurine"], ["watch", "pocket watch"], ["trophy", "trophy cup"], ["owl", "owl statuette"], ["knight", "chess knight"]];
const COLLECTIBLE_ATTRS = [
  { k: "glossy", label: "Glossy", values: { "High gloss": 3, Satin: 2 } },
  { k: "matte", label: "Matte", values: { Flat: 3, "Soft-touch": 2 } },
  { k: "painted", label: "Hand-Painted", values: { Detailed: 3, Washed: 2 } },
  { k: "bronze", label: "Bronze", values: { Patinated: 2, Polished: 2 } },
  { k: "copper", label: "Copper", values: { Brushed: 2, Aged: 2 } },
  { k: "plated", label: "Gold Plated", values: { "24k plated": 3, "Rose gold plated": 2 } },
  { k: "gold", label: "Gold", values: { "Solid 14k": 2, "Gold leaf": 2 } },
];
let colN = 301, colI = 0;
const COLLECTIBLE_PRODUCTS = COLLECTIBLE_ATTRS.flatMap(a => Object.entries(a.values).flatMap(([v, n]) => Array.from({ length: n }, () => {
  const [c, fx] = FINISH[v], [s, what] = COLLECTIBLE_FORMS[colI++ % COLLECTIBLE_FORMS.length];
  return { id: `COL_${colN++}`, name: `${v} ${what}`.replace(/^./, m => m.toUpperCase()), s, c, fx, bg: "#F1EFEC", attr: a.k, value: v };
})));

const COLL_SETS = {
  apparel: { attrs: [...COLL_ATTRS], products: [...COLL_PRODUCTS] },
  statues: { attrs: STATUE_ATTRS, products: STATUE_PRODUCTS },
  collectibles: { attrs: COLLECTIBLE_ATTRS, products: COLLECTIBLE_PRODUCTS },
};
const useCollection = name => {
  const c = COLLECTIONS.find(x => x.name === name), d = COLL_SETS[(c && c.set) || "apparel"];
  COLL_ATTRS.splice(0, COLL_ATTRS.length, ...d.attrs);
  COLL_PRODUCTS.splice(0, COLL_PRODUCTS.length, ...d.products);
};

// match = study products that share a product ID with the collection; applied = collection version already in the study
const STUDIES = [
  { name: "Consumer Preferences", edited: "Edited 4 weeks ago", img: "assets/preview-apparel.png", collage: "Nike Apparel 2026", products: 64, match: 64, applied: null },
  { name: "ECommerce Standout Test", edited: "Edited 5 weeks ago", img: "assets/preview-collectibles.png", collage: "Online Store Listings", products: 120, match: 41, applied: "v1" },
  { name: "Statues by BG Color", edited: "Edited 2 weeks ago", img: "assets/preview-statues.png", collage: "Christies Antiquities", products: 230, match: 0, applied: null },
];
