/* ---------- Flow 1: Collage Board ----------
   Groups of products on a canvas. Select a group, open the Attribute tool (tag icon), name the attribute
   and pick a value: every group takes the attribute name, the selected group gets the value. */

const BD = {
  zoom: 32.2, sel: "big", tagOpen: false, attr: "", val: "", tool: "tag",
  groups: [
    { id: "small", label: "Multicolored", val: "True", n: 13, cols: 4, x: 350, y: 212 },
    { id: "big", label: "Warm Colors", val: "False", n: 100, cols: 10, x: 658, y: 108 },
  ],
};
const BOARD_ATTRS = ["Visible Tech Features", "Warm Colors", "Multicolored", "Logo Placement"];
const BOARD_PICS = WARM_IDS.concat(NEUTRAL_IDS);

const tools = [["select", '<path d="M3 2l9 5-4 1.2L6.8 12z" fill="currentColor"/>'], ["image", '<rect x="2" y="3" width="11" height="10" rx="1.5"/><path d="m2 11 3-3 3 3 2-2 3 3"/><circle cx="10.5" cy="5.5" r="1" fill="currentColor"/>'],
  ["zoom", '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3M5 7h4M7 5v4"/>'], ["frame", '<rect x="2.5" y="2.5" width="9" height="9" rx="1"/><path d="m9 9 4.5 4.5"/>'],
  ["tag", '<path d="M2 2.5h5.5L14 9l-5 5-6.5-6.5z" fill="currentColor" stroke="none"/><circle cx="5.5" cy="5.5" r="1.1" fill="#fff" stroke="none"/>'],
  ["chart", '<path d="M3 13V8M8 13V3M13 13V6" stroke-width="2.2"/>'], ["comment", '<path d="M8 2.5a5.5 5 0 0 1 0 10l-3.5 1.5.6-2.6A5 5 0 0 1 8 2.5z" fill="currentColor" stroke="none"/>']];

const groupHtml = g => {
  const rows = Math.ceil(g.n / g.cols), tile = 34, gap = 5, pad = 18;
  const w = g.cols * tile + (g.cols - 1) * gap + pad * 2, h = rows * tile + (rows - 1) * gap + pad * 2;
  const pics = Array.from({ length: g.n }, (_, i) => `<span class="o-bt"><img src="${photoSrc(BOARD_PICS[(i * 7 + g.n) % BOARD_PICS.length])}" alt="" loading="lazy"></span>`).join("");
  return `<div class="o-bgroup${BD.sel === g.id ? " sel" : ""}" style="left:${g.x}px;top:${g.y}px" data-a="boardSel" data-v="${g.id}">
    <div class="o-blabel"><span>${esc(g.label)}</span><code>${esc(g.val)}: ${g.n}</code></div>
    <div class="o-bframe" style="width:${w}px;height:${h}px;grid-template-columns:repeat(${g.cols},${tile}px)">${pics}</div>
    ${BD.sel === g.id ? '<i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>' : ""}
  </div>`;
};

const tagPop = () => `<div class="o-tagpop" data-keep>
  <label class="o-tl" for="bd-attr">Attribute Name</label>
  <div class="o-dd"><div class="o-combo"><input id="bd-attr" data-in="bdAttr" data-enter="bdAttrDone" placeholder="Type Name*" value="${esc(BD.attr)}" autocomplete="off"><button data-a="menu" data-v="bd-attr" aria-label="Show attributes">${ic.chev}</button></div>
    ${App.menu === "bd-attr" ? `<div class="o-menu full" role="listbox">${BOARD_ATTRS.filter(a => !BD.attr || a.toLowerCase().includes(BD.attr.toLowerCase())).map(a => `<button data-a="bdAttrPick" data-v="${esc(a)}">${esc(a)}</button>`).join("")}</div>` : ""}</div>
  <label class="o-tl" for="bd-val">Value Name</label>
  <div class="o-dd"><div class="o-combo"><input id="bd-val" data-in="bdVal" data-enter="bdApply" placeholder="Type Name*" value="${esc(BD.val)}" autocomplete="off"><button data-a="menu" data-v="bd-val" aria-label="Show values">${ic.chev}</button></div>
    ${App.menu === "bd-val" ? `<div class="o-menu full flush" role="listbox">${["True", "False"].map(v => `<button class="${BD.val === v ? "cur" : ""}" data-a="bdValPick" data-v="${v}">${v}</button>`).join("")}</div>` : ""}</div>
</div>`;

RENDER.board = () => {
  const sc = BD.zoom / 32.2;
  $("#board").innerHTML = `
  <div class="o-canvas"><div class="o-world" style="transform:scale(${sc})">${BD.groups.map(groupHtml).join("")}</div></div>
  <div class="o-bbar top-left">
    <button class="o-blogo" data-a="nav" data-v="attributes" aria-label="Collagia home">Collagia</button>
    <button class="o-bb" data-a="bdToast" data-v="Switch workspace">Nike${ic.chev}</button>
    <button class="o-bb" data-a="bdToast" data-v="Switch board"><svg class="i" viewBox="0 0 16 16"><path d="M3 13V9M8 13V4M13 13V7" stroke="currentColor" stroke-width="2.2"/></svg>Nike Products by Color${ic.chev}</button>
    <button class="o-bb icon" data-a="bdToast" data-v="Board info"><svg class="i" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="currentColor"/><path d="M8 7v4" stroke="#fff" stroke-width="1.6"/><circle cx="8" cy="5" r=".9" fill="#fff"/></svg></button>
    <button class="o-bb icon dim" data-a="bdToast" data-v="Toggle panel"><svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/><path d="M6 2.5v11"/></svg></button>
  </div>
  <div class="o-bbar top-right">
    <button class="o-bb" data-a="bdToast" data-v="Resources">Resources${ic.chev}</button>
    <button class="o-bb" data-a="bdToast" data-v="Present"><svg class="i" viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>${ic.chev}</button>
    <button class="o-bb" data-a="bdToast" data-v="Display settings"><svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 5h12M2 11h12"/><circle cx="6" cy="5" r="1.6" fill="#fff"/><circle cx="10" cy="11" r="1.6" fill="#fff"/></svg>${ic.chev}</button>
    <button class="o-bb icon" data-a="bdToast" data-v="Assistant"><svg class="i" viewBox="0 0 16 16"><rect x="3" y="4" width="10" height="9" rx="3" fill="currentColor"/><circle cx="6.3" cy="8.5" r="1" fill="#fff"/><circle cx="9.7" cy="8.5" r="1" fill="#fff"/><path d="M8 1.5V4" stroke="currentColor" stroke-width="1.4"/></svg></button>
    <button class="o-bb" data-a="bdToast" data-v="Account"><span class="o-bav">JM</span>${ic.chev}</button>
  </div>
  <div class="o-tools" role="toolbar" aria-label="Board tools">${tools.map(([k, d]) =>
    `<button class="${(k === "tag" ? BD.tagOpen : BD.tool === k && !BD.tagOpen) ? "on" : ""}" data-a="bdTool" data-v="${k}" aria-label="${k === "tag" ? "Create an attribute" : k}"><svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">${d}</svg></button>`).join("")}</div>
  ${BD.tagOpen ? tagPop() : ""}
  <button class="o-fab" data-a="bdToast" data-v="Help" aria-label="Help"><svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.5 8a5.5 5.5 0 1 1-2-4.3"/><path d="M11.5 2v2.5H14M8 6v4M6 8h4"/></svg></button>
  <div class="o-bbar bottom">
    <button class="o-cur" data-a="bdToast" data-v="Switch board"><svg class="i" viewBox="0 0 16 16"><path d="M3 13V9M8 13V4M13 13V7" stroke="currentColor" stroke-width="2.2"/></svg><span><small>Current board</small>Nike Products by Color</span>${sv('<path d="m5 6 3-3 3 3M5 10l3 3 3-3"/>')}</button>
    <button class="o-bb" data-a="bdToast" data-v="Filter">${sv('<path d="M2 3h12l-4.5 5.5V13l-3-1.5V8.5z"/>')}Filter</button>
    <div class="o-sum"><button class="o-sumsel" data-a="bdToast" data-v="Aggregation">SUM <svg class="i" viewBox="0 0 16 16"><path d="M4 6h8l-4 5z" fill="currentColor"/></svg></button><span>hammer_used</span><span class="o-by">by</span>
      <div class="o-slider"><span class="o-bubble" style="left:${(BD.zoom - 10) / 90 * 100}%">${BD.zoom.toFixed(1)}%</span><input type="range" min="10" max="100" step="0.1" value="${BD.zoom}" data-in="bdZoom" aria-label="Zoom"></div></div>
    <button class="o-bb" data-a="bdAddGroup">${ic.plus}Add Group</button>
    <button class="o-bb icon" data-a="bdToast" data-v="More">${ic.more}</button>
    <span class="sp"></span>
    <button class="o-bb icon boxed" data-a="bdToast" data-v="Image view">${sv('<rect x="2" y="3.5" width="12" height="9" rx="1"/><path d="M5 9.5h3M5 7h6"/>')}</button>
    <button class="o-bb icon boxed" data-a="bdToast" data-v="Compare">${sv('<rect x="2" y="3" width="5" height="10" rx="1"/><rect x="9" y="3" width="5" height="10" rx="1"/>')}</button>
    <button class="o-bb boxed" data-a="bdToast" data-v="Sort">${sv('<path d="M2.5 4h7M2.5 8h11M2.5 12h5"/>')}${sv('<path d="m5 6 3-3 3 3M5 10l3 3 3-3"/>')}</button>
    <button class="o-bb boxed" data-a="bdToast" data-v="Data Table">${sv('<rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 6.5h12M2 10h12M6 3v10"/>')}Data Table</button>
  </div>`;
};

/* ---------- Actions ---------- */
ACTIONS.bdToast = el => { toast(`Prototype: ${el.dataset.v} isn't part of this flow`); return false; };
ACTIONS.boardSel = el => { BD.sel = el.dataset.v; };
ACTIONS.bdTool = el => {
  const k = el.dataset.v;
  if (k === "tag") { BD.tagOpen = !BD.tagOpen; if (BD.tagOpen) setTimeout(() => { const i = $("#bd-attr"); if (i) i.focus(); }); }
  else { BD.tool = k; BD.tagOpen = false; }
};
INPUTS.bdAttr = el => { BD.attr = el.value; if (App.menu !== "bd-attr") { App.menu = "bd-attr"; return true; } return true; };
INPUTS.bdVal = el => { BD.val = el.value; return false; };
// Zoom updates in place so the slider keeps working while dragging
INPUTS.bdZoom = el => {
  BD.zoom = +el.value;
  $(".o-world").style.transform = `scale(${BD.zoom / 32.2})`;
  const b = $(".o-bubble"); b.textContent = BD.zoom.toFixed(1) + "%"; b.style.left = (BD.zoom - 10) / 90 * 100 + "%";
  return false;
};
ACTIONS.bdAttrPick = el => { BD.attr = el.dataset.v; setTimeout(() => { const i = $("#bd-val"); if (i) i.focus(); }); };
ACTIONS.bdAttrDone = () => { App.menu = "bd-val"; setTimeout(() => { const i = $("#bd-val"); if (i) i.focus(); }); };
ACTIONS.bdValPick = el => { BD.val = el.dataset.v; ACTIONS.bdApply(); };
ACTIONS.bdApply = () => {
  const name = BD.attr.trim(), val = BD.val.trim();
  if (!name) { toast("Type an attribute name first"); return; }
  if (!val) { toast("Pick a value for the selected group"); return; }
  const g = BD.groups.find(x => x.id === BD.sel) || BD.groups[0];
  BD.groups.forEach(x => {
    x.label = name;
    if (x === g) x.val = val;
    else if (val === "True" || val === "False") x.val = val === "True" ? "False" : "True";
  });
  BD.tagOpen = false; App.menu = null; BD.attr = ""; BD.val = "";
  toast(`Created “${name}” on the board · ${g.n} products set to ${val}`);
};
ACTIONS.bdAddGroup = () => { toast("Prototype: drag products onto the board to start a new group"); return false; };

JUMP.board = v => {
  App.page = "board"; App.modal = null; App.menu = null;
  if (v) BD.tagOpen = v === "tag";
  if (BD.tagOpen) setTimeout(() => { const i = $("#bd-attr"); if (i) i.focus(); });
  render();
};
