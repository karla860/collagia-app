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
  const [s, kind, code] = GARMENTS[(i * 3 + prefix.length) % GARMENTS.length];
  const [cn, c] = palette[(i * 5 + prefix.length) % palette.length];
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
].map((p, i) => ({ ...p, design: STUDY_ATTRS[0].values[i % 4], mat1: STUDY_ATTRS[2].values[(i * 3) % 4], mat2: STUDY_ATTRS[3].values[(i * 2) % 3], func: STUDY_ATTRS[4].values[(i + 1) % 3] }));

/* Thumbnail: photo, or garment silhouette with the attribute's pattern on top */
const thumb = (p, cls = "") => p.img
  ? `<span class="o-th ${cls}"><img src="${p.img}" alt="" loading="lazy"></span>`
  : `<span class="o-th ${cls}"><svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#ECE9E4"/><use href="#${p.s}" fill="${p.c}"/>${p.pattern ? `<use href="#${p.s}" fill="url(#p-${p.pattern})"/>` : ""}</svg></span>`;

/* Homepage collections */
const COLLECTIONS = [
  { name: "Statues by BG Color", v: "v1", tags: ["Black & White", "Grey", "Beige"], desc: "A collection that groups statue product images by their background color, used by e-commerce and merchandising teams.", created: "Sep 2, 2026", edited: "Sep 30, 2026", img: "assets/preview-statues.png" },
  { name: "Apparel by Pattern Style", v: "v2", tags: ["Solid", "Striped", "Floral", "Graphic Print", "Multicolored", "Plaid"], desc: "A visual catalog of apparel products organized by surface pattern, enabling designers and online store teams to filter listings.", created: "Aug 19, 2026", edited: "Sep 16, 2026", img: "assets/preview-apparel.png" },
  { name: "Collectibles by Finish Type", v: "v1", tags: ["Glossy", "Matte", "Hand-Painted", "Bronze", "Copper", "Gold Plated", "Gold"], desc: "A merchandise collection that sorts collectible items by surface finish, helping fans and store teams browse, price, and identify listings.", created: "Aug 12, 2026", edited: "Sep 9, 2026", img: "assets/preview-collectibles.png" },
];
const STUDIES = [
  { name: "Statues by BG Color", edited: "Edited 2 weeks ago", img: "assets/preview-statues.png" },
  { name: "Consumer Preferences", edited: "Edited 4 weeks ago", img: "assets/preview-apparel.png" },
  { name: "ECommerce Standout Test", edited: "Edited 5 weeks ago", img: "assets/preview-collectibles.png" },
];
