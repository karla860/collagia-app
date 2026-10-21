/* ---------- Guided tour of the Oct 17 Attributes prototype ----------
   A shroud with a spotlight and a short card per step. Each step puts the app in a known state (using the
   app's own functions, no iframes anywhere), then highlights the part being talked about.
   Next / Back / Esc, or ← →. A progress bar instead of dots, because there are many short steps. */

(() => {
  const DONE_KEY = "o17tour:done";
  const q = s => document.querySelector(s);
  const did = t => `<span class="tr-tag did">What changed</span><p>${t}</p>`;
  const why = t => `<span class="tr-tag why">Why</span><p>${t}</p>`;
  const was = t => `<span class="tr-tag was">Before</span><p>${t}</p>`;
  const tryit = t => `<span class="tr-tag try">Try it</span><p>${t}</p>`;

  /* Known states */
  const goBoard = (study = "FA26 footwear review") => { setFlow("board"); App.modal = null; BD.sel.clear(); BD.hl.clear(); BD.filters = {}; BD.tool = "select"; BD.peek = null; BD.matrix = "pareto"; BD.show = "franchise"; App.menu = null; JUMP.board(study); };
  const goBoardSel = () => { goBoard(); BD.matrix = "freestyle"; BD.tool = "attr"; render(); [...document.querySelectorAll("#bd-canvas .bx-tile")].slice(0, 4).forEach(t => BD.sel.add(t.dataset.id)); BD.tag.attr = "Upper material"; BD.tag.value = "Knit"; render(); };
  const goHome = () => { setFlow("home"); App.modal = null; JUMP.home(); };
  const goPick = () => { const s = STUDIES[0]; setFlow("create"); App.page = "home"; openCreate("study"); CR.study = s.name; CR.included = new Set(s.published); CR.peek = null; CR.step = "pick"; };
  const goCard = () => { setFlow("card"); App.page = "home"; openCard("franchise"); App.menu = null; };
  const goCompare = (q = "") => { setFlow("compare"); App.page = "home"; openCard("franchise"); openCompare(); Object.assign(CP, { study: "Price architecture", loading: false, at: new Date(), q, open: null, touched: false }); App.menu = null; };
  const goAccess = () => { setFlow("access"); App.page = "home"; openCard("franchise"); AC.from = "card"; openAccess("franchise"); App.menu = null; };

  const STEPS = [
    { kick: "Start here", title: "Collagia in one paragraph", sel: null, body: `
      <p>Collagia joins product images with business data into a <b>collage</b>. In a <b>study</b> you frame products on a board and tag them: an <b>attribute + value</b>, like Upper material = Knit.</p>
      <p class="tr-hint">Real Nike products; simulated sales.</p>` },
    { kick: "Start here", title: "What an attribute collection is", sel: null, body: `
      <p>A <b>collection</b> lifts a study's attributes out so they can be versioned, shared and applied to other studies.</p>
      <div class="tr-diagram"><span>Study</span><em>⇄</em><span class="lib">Collection</span><em>⇄</em><span>CSV</span></div>
      <p class="tr-hint">A <b>red point</b> means try it yourself. Esc stops the tour; ⌘K restarts it.</p>` },
    { kick: "Start here", title: "What's already in this account", go: () => goHome(), sel: ".h-grid .ccard", place: "right", body: `
      <ul>
        <li><b>4 studies</b>, three on 320 Nike shoes, one on 30 Christie's lots.</li>
        <li><b>2 collections:</b> FA26 line review (v2) and Statue backgrounds.</li>
        <li><b>Price architecture</b> is behind, on v1.</li>
      </ul>` },

    /* ---------- Board ---------- */
    { kick: "Study board", title: "A study is products on a board", go: () => goBoard(), sel: ".bx-top .bx-box:first-child", place: "below", body: `
      ${did("Select, tag, group and filter. Top right: how many attributes are published, and ways to save or apply a collection.")}` },
    { kick: "Study board", title: "Frame what your eye groups together", go: () => goBoardSel(), sel: ".bx-tools button[data-v=\"attr\"]", place: "right", body: `
      ${did("Press <b>F</b>, then drag a frame or click tiles. Four shoes are selected.")}
      ${why("Picking products by how they look is what a spreadsheet can't do.")}` },
    { kick: "Study board", title: "Name the attribute and its value", go: () => { goBoardSel(); BD.tag.value = ""; BD.dd = "val"; render(); }, sel: "#bd-inpop", grow: ".bx-ip-dd", place: "right", body: `
      ${did("A small box beside the tool: Attribute Name and Value Name, each listing what the study already has.")}
      ${why("Picking from the list avoids three spellings of one value.")}` },

    /* ---------- Homepage ---------- */
    { kick: "Attributes page", title: "A card shows what is inside", go: () => goHome(), sel: ".h-grid .ccard", place: "right", body: `
      ${was("A title, “version 1” and two dates.")}
      ${did("The collection's own products, one tag per attribute, its source and its version.")}` },

    /* ---------- Create ---------- */
    { kick: "New collection", title: "Start by saying where the attributes are", go: () => { goHome(); openCreate(null); render(); }, sel: ".o-choose", place: "below", body: `
      ${did("In a study, or in a spreadsheet. Four steps either way.")}` },
    { kick: "New collection", title: "Pick a study: show what is there to take", go: () => { goHome(); openCreate("study"); render(); }, sel: ".o-studies", place: "above", body: `
      ${did("Each study shows its attributes as tags. One with nothing published is greyed out.")}` },
    { kick: "New collection", title: "Review what goes in", go: () => { goPick(); render(); }, sel: ".cr .o-rail.tree", place: "right", body: `
      ${did("Nothing to tick: every published attribute goes in. Browse it exactly as the collection screen shows it.")}
      ${why("A collection takes the whole study, so there is nothing to choose.")}` },
    { kick: "New collection", title: "Name it, and know it is private", go: () => { goPick(); CR.step = "name"; CR.name = ""; render(); }, sel: ".o-nameform", place: "right", body: `
      ${did("A suggested name, an optional description, and a preview of its card.")}
      ${why("It stays private until you share it.")}` },

    /* ---------- Open a collection ---------- */
    { kick: "Open a collection", title: "Two things up top, the rest behind ⋯", go: () => { goCard(); render(); }, sel: ".v2h .o-dd", place: "left", body: `
      ${was("Four identical buttons, bottom right.")}
      ${did("Share up top. Everything else is one short list behind ⋯.")}` },
    { kick: "Open a collection", title: "The one big action", go: () => { goCard(); render(); }, sel: ".v2card .o-mf", place: "above", body: `
      ${did("Apply to a study is the one red button. Compare sits beside it.")}` },
    { kick: "Open a collection", title: "Every version, kept", go: () => { goCard(); CD.histOpen = true; render(); }, sel: ".o-hist", place: "left", body: `
      ${did("Who changed what, when, and which studies use each version. Restore any of them.")}
      ${why("Knowing what changed makes updating a study safe.")}` },
    { kick: "Open a collection", title: "The rail is a view selector, never a checkbox", go: () => { goCard(); render(); }, sel: ".o-rail.tree", place: "right", body: `
      ${was("Tabs and one dropdown: one value's products at a time.")}
      ${did("Attributes and their values, with counts. Pick one; the grid follows.")}` },
    { kick: "Open a collection", title: "Browse by attribute and value", go: () => { goCard(); render(); }, sel: ".o-rail.tree", place: "right", body: `
      ${did("One attribute at a time, so each product shows a single value.")}` },

    /* ---------- Collection edge states: empty, partial and missing data ---------- */
    { kick: "Edge states", title: "When search finds nothing", go: () => { setFlow("edge"); JUMP.edge("nomatch"); }, sel: ".v2card .o-empty2 > span", place: "left", body: `
      ${did("Says what was searched, with one button to clear it.")}` },
    { kick: "Edge states", title: "Products with no value", go: () => { setFlow("edge"); JUMP.edge("novalue"); }, sel: ".v2card .o-notice", place: "below", body: `
      ${did("A “No value” row and a warning before anything is lost.")}` },
    { kick: "Edge states", title: "A value only one product carries", go: () => { setFlow("edge"); JUMP.edge("single"); }, sel: ".v2card .o-pgrid .o-pcard", place: "right", body: `
      ${did("Flagged, since a one-product value is often a typo.")}` },
    { kick: "Edge states", title: "Photos still loading", go: () => { setFlow("edge"); JUMP.edge("nophotos"); }, sel: ".v2card .o-pcard:has(.o-th.loading)", place: "right", body: `
      ${did("Grey cards shimmer; names and values are already there.")}` },
    { kick: "Edge states", title: "A collection with no products", go: () => { setFlow("edge"); JUMP.edge("empty"); }, sel: ".v2card .o-e0-h", place: "left", body: `
      ${did("One message, one action. Compare and Apply are off.")}` },

    /* ---------- Compare with a study (optional, right before applying) ---------- */
    { kick: "Compare with a study", title: "An optional look before you apply", go: () => { goCard(); render(); }, sel: ".v2card .o-mf .o-cmpbtn", place: "above", body: `
      ${was("You only saw the changes by starting the import.")}
      ${did("See what applying would change, without starting anything.")}` },
    { kick: "Compare with a study", title: "Choosing which study to compare with", go: () => { goCompare(); render(); }, sel: ".cpx-pick", place: "below", body: `
      ${did("Every study in one searchable list. Pick any of them.")}` },
    { kick: "Compare with a study", title: "Grouped by what happens, riskiest first", go: () => { goCompare(); render(); }, sel: ".cpx-table", place: "left", body: `
      ${did("Removed, Changed, Added, Unchanged. Each line reads now → after.")}
      ${why("Removals first, because they're what you'd regret.")}` },
    { kick: "Compare with a study", title: "Ask about any product", go: () => { goCompare("nike calm"); render(); }, sel: ".cpx-sr", place: "below", body: `
      ${did("Search any product to see what happens to it.")}` },

    /* ---------- Apply ---------- */
    { kick: "Apply to a study", title: "The collage decides whether anything happens", go: () => { goCard(); setFlow("study"); JUMP.study("pick"); }, sel: ".o-studies .o-study:nth-child(2)", place: "left", body: `
      ${did("Each study shows how many products it shares. One that shares none is greyed out.")}
      ${why("Attributes only land on products both sides have.")}` },
    { kick: "Apply to a study", title: "Then tell them where to look", go: () => { goCard(); ST.sel = "Price architecture"; JUMP.study("done"); }, sel: ".o-success", place: "left", body: `
      ${did("What changed, a button to open the study, and Undo.")}` },

    /* ---------- Share ---------- */
    { kick: "Share", title: "Sharing is a dialog, reached from the collection", go: () => { goAccess(); render(); }, sel: ".o-invite", place: "left", body: `
      ${was("A separate permissions page.")}
      ${did("Invite, roles, requests and activity, over the screen you came from.")}` },

    /* ---------- Wrap ---------- */
    { kick: "Wrap up", title: "What this version fixes", go: () => goHome(), sel: null, body: `
      <ul>
        <li><b>Compare before applying</b>, no confirmation after.</li>
        <li><b>Review, don't pick</b> when saving a collection.</li>
        <li><b>One attribute at a time</b> on the collection screen.</li>
        <li><b>Version history</b> with faces.</li>
        <li><b>Edge states</b> that say what to do.</li>
        <li><b>Share</b> opens where you are.</li>
      </ul>` },
  ];

  /* ---------- Your turn: steps where the person does the thing instead of reading about it ----------
     The card asks for one small action on the highlighted part. The tour watches the app's state and,
     once it's done, confirms what happened. Next is always there as "Skip", so nobody gets stuck. */
  const TASKS = {
    "Two things up top, the rest behind ⋯": { selDone: ".v2h .o-menu", placeDone: "left", at: ".v2h .o-morebtn", ask: "Click <b>⋯</b>.", done: () => App.menu === "more", ok: "Everything that isn't the main job." },
    "Review what goes in": { beside: ".cr .o-rail.tree", at: '.cr .o-tname[data-v="upper-material"]', ask: "Click <b>Upper material</b>, then <b>Knit</b>.", done: () => App.modal === "create" && CD.sel && CD.sel.k === "upper-material" && CD.sel.v, ok: "Just a view: everything still goes in." },
    "Choosing which study to compare with": { selDone: ".cpx-menu", placeDone: "right", at: ".cpx-select", ask: "Open the <b>Compare with</b> list.", done: () => App.menu === "cpstudy", ok: "Any study can be compared." },
    "A card shows what is inside": { free: true, at: ".h-grid .ccard", ask: "Open the <b>FA26 line review</b> collection.", done: () => App.modal === "card", ok: "This is the collection screen." },
    "Browse by attribute and value": { beside: ".o-rail.tree", at: '.o-tname[data-v="upper-material"]', ask: "Click <b>Upper material</b>, then <b>Knit</b>.", done: () => CD.sel && CD.sel.k === "upper-material" && CD.sel.v, ok: "Only those products show." },
    "When search finds nothing": { at: ".o-empty2 [data-a=\"cardQClear\"]", ask: "Press <b>Clear search</b>.", done: () => !CD.q, ok: "All 312 products are back." },
    "An optional look before you apply": { at: "[data-a=\"cpOpen\"]", ask: "Click <b>Compare with a study</b>.", done: () => App.modal === "compare", ok: "Opened on the study that's behind." },
    "Grouped by what happens, riskiest first": { under: true, at: ".cpx-t[data-v*=\"Vomero\"]", ask: "Open <b>Running → Vomero</b>.", done: () => CP.open && CP.open.includes("Vomero"), ok: "Each product shows before → after." },
    "Ask about any product": { at: "#cp-q", ask: "Search for <b>Pegasus</b>.", done: () => /pegasus/i.test(CP.q), ok: "Each match says what happens." },
    "The collage decides whether anything happens": { at: ".o-study[data-v=\"Price architecture\"]", ask: "Choose <b>Price architecture</b>.", done: () => ST.sel === "Price architecture", ok: "Selected." },
  };
  STEPS.forEach(s => { if (TASKS[s.title]) s.task = TASKS[s.title]; });

  /* ---------- Chapters: the steps grouped like an interactive demo, each opening with its goal ---------- */
  const CHAPTERS = {
    "Start here": { goal: "What Collagia and collections are.", what: "Two short reads." },
    "Study board": { goal: "See where attributes come from.", what: "Frame shoes and name them." },
    "Attributes page": { goal: "Tell collections apart.", what: "Open one from its card." },
    "New collection": { goal: "Save a study's attributes as a collection.", what: "Pick, review, name." },
    "Open a collection": { goal: "Read a collection.", what: "Menu, versions, values." },
    "Edge states": { goal: "Awkward data, handled.", what: "Five states, each with a next step." },
    "Compare with a study": { goal: "See changes before applying.", what: "Open, switch, search." },
    "Apply to a study": { goal: "Apply a collection safely.", what: "Apply, with Undo." },
    "Share": { goal: "Share with the right people.", what: "Who has access, and how." },
    "Wrap up": { goal: "Recap what changed.", what: "What changed." },
  };
  const KICKS = [...new Set(STEPS.map(s => s.kick))];
  const chapterOf = k => { const kick = STEPS[k].kick, all = STEPS.map((s, j) => j).filter(j => STEPS[j].kick === kick); return { n: KICKS.indexOf(kick) + 1, of: KICKS.length, at: all.indexOf(k) + 1, len: all.length }; };
  let showToc = false;
  const toc = () => `<ol class="tr-toc">${KICKS.map((k, n) => { const first = STEPS.findIndex(s => s.kick === k), len = STEPS.filter(s => s.kick === k).length, cur = STEPS[i].kick === k;
    return `<li><button data-tr="jump" data-v="${first}" class="${cur ? "cur" : ""}"><span class="tr-toc-n">${n + 1}</span><span><b>${k}</b><small>${CHAPTERS[k] ? CHAPTERS[k].goal : ""}</small></span><span class="tr-toc-c">${len}</span></button></li>`; }).join("")}</ol>`;

  /* ---------- State and DOM ---------- */
  let i = -1, raf = 0, els = null, taskDone = false;
  const build = () => {
    if (els) return els;
    const spot = document.createElement("div"); spot.className = "tr-spot"; spot.hidden = true;
    const card = document.createElement("div"); card.className = "tr-card"; card.hidden = true; card.setAttribute("role", "dialog");
    // Guided mode: a pulsing point on the thing to try, a one-line hint beside it, and a slim bar at the bottom
    const dot = document.createElement("div"); dot.className = "tr-dot"; dot.hidden = true;
    const hint = document.createElement("div"); hint.className = "tr-hint-pop"; hint.hidden = true;
    const bar = document.createElement("div"); bar.className = "tr-bar"; bar.hidden = true; bar.setAttribute("role", "status");
    document.body.append(spot, card, dot, hint, bar);
    return (els = { spot, card, dot, hint, bar });
  };
  // Once a task is done the card anchors to what it opened (a menu, a panel) and sits beside it, not on top
  const target = s => (s.task && taskDone && s.task.selDone && q(s.task.selDone)) || (s.sel ? q(s.sel) : null);

  // Measurements in CSS pixels, so the tour lines up when the interface is zoomed on large screens (core.js fitUI)
  const Z = () => (typeof App !== "undefined" && App.zoom) || 1;
  const R = e => { const r = e.getBoundingClientRect(), z = Z(); return { top: r.top / z, left: r.left / z, right: r.right / z, bottom: r.bottom / z, width: r.width / z, height: r.height / z }; };
  const guided = () => { const s = STEPS[i]; return !!(s && s.task && !taskDone); };
  // Guided mode: no shroud, no card. The point sits on the target's corner, the hint below it (or above if there's no room).
  const placeGuide = () => {
    const s = STEPS[i], { dot, hint } = els, el = (s.task.at && q(s.task.at)) || target(s);
    if (!el) { dot.hidden = true; hint.hidden = true; return; }
    const t = R(el), vw = innerWidth / Z(), vh = innerHeight / Z();
    const x = Math.min(vw - 14, Math.max(14, t.right - 10)), y = Math.min(vh - 14, Math.max(14, t.top + 10));
    dot.hidden = false; dot.style.left = x + "px"; dot.style.top = y + "px";
    hint.hidden = false; const r = R(hint);
    // Some hints sit beside a whole panel (the rail) so everything you need to click stays in view
    const side = s.task.beside && q(s.task.beside);
    if (side) { const p = R(side); hint.classList.remove("up"); hint.style.left = Math.min(vw - r.width - 16, p.right + 16) + "px"; hint.style.top = Math.min(vh - r.height - 16, Math.max(16, t.top - 8)) + "px"; return; }
    // `under` hangs the hint below the whole target, so the line you're asked to open stays readable
    if (s.task.under && t.bottom + 10 + r.height < vh - 16) { hint.classList.remove("up"); hint.style.top = t.bottom + 10 + "px"; hint.style.left = Math.min(vw - r.width - 16, Math.max(16, t.right - r.width)) + "px"; return; }
    const below = y + 18 + r.height < vh - 16;
    hint.classList.toggle("up", !below);
    hint.style.top = (below ? y + 18 : y - 18 - r.height) + "px";
    hint.style.left = Math.min(vw - r.width - 16, Math.max(16, x - r.width + 24)) + "px";
  };
  const place = () => {
    const s = STEPS[i]; if (!s || !els) return;
    if (guided()) return placeGuide();
    els.bar.hidden = true; els.dot.hidden = true; els.hint.hidden = true;
    const { spot, card } = els, el = target(s), vw = innerWidth / Z(), vh = innerHeight / Z(), pad = 8, gap = 16;
    card.classList.toggle("centre", !el);
    // "Free" steps leave the whole screen visible: no shroud, the card parked on the right edge
    if (s.task && taskDone && s.task.free) {
      spot.hidden = true; card.style.maxHeight = Math.max(200, vh - 32) + "px"; card.style.width = "";
      const r = R(card); card.style.left = Math.max(16, vw - r.width - 16) + "px"; card.style.top = Math.max(16, (vh - r.height) / 2) + "px";
      return;
    }
    if (!el) {
      spot.classList.add("none"); spot.hidden = false; spot.style.cssText = "top:50%;left:50%;width:0;height:0;border-radius:0";
      card.style.maxHeight = ""; card.style.width = "";
      const r = R(card);
      card.style.top = Math.max(16, (vh - r.height) / 2) + "px"; card.style.left = Math.max(16, (vw - r.width) / 2) + "px";
      return;
    }
    spot.classList.remove("none"); spot.hidden = false;
    let t = R(el);
    // `grow` widens the spotlight to something that hangs outside the target, like an open dropdown
    const gEl = s.grow && q(s.grow);
    if (gEl) { const g = R(gEl), l = Math.min(t.left, g.left), tp = Math.min(t.top, g.top), rr = Math.max(t.right, g.right), b = Math.max(t.bottom, g.bottom); t = { left: l, top: tp, right: rr, bottom: b, width: rr - l, height: b - tp }; }
    const top = Math.max(0, t.top - pad), left = Math.max(0, t.left - pad);
    const w = Math.min(vw - left, t.width + pad * 2), h = Math.min(vh - top, t.height + pad * 2);
    spot.style.top = top + "px"; spot.style.left = left + "px"; spot.style.width = w + "px"; spot.style.height = h + "px";
    spot.style.borderRadius = getComputedStyle(el).borderRadius || "10px";
    card.style.maxHeight = ""; card.style.width = "";
    let r = R(card), cw = r.width, ch = r.height;
    let pref = (s.task && taskDone && s.task.placeDone) || s.place || "right", x, y;
    const room = { right: vw - (left + w + gap) - 16, left: left - gap - 16, below: vh - (top + h + gap) - 16, above: top - gap - 16 };
    const fits = { right: room.right >= cw, left: room.left >= cw, below: room.below >= ch, above: room.above >= ch };
    if (!fits[pref]) pref = ["right", "left", "below", "above"].find(k => fits[k]) || null;
    if (!pref && Math.max(room.left, room.right) >= 280) {
      pref = room.right >= room.left ? "right" : "left";
      card.style.width = Math.min(400, room[pref]) + "px"; r = R(card); cw = r.width; ch = r.height;
    }
    if (!pref) { pref = room.below >= room.above ? "below" : "above"; card.style.maxHeight = Math.max(200, room[pref]) + "px"; r = R(card); ch = r.height; }
    if (pref === "right") { x = left + w + gap; y = top; }
    else if (pref === "left") { x = left - gap - cw; y = top; }
    else if (pref === "below") { x = left; y = top + h + gap; }
    else { x = left; y = top - gap - ch; }
    x = Math.min(Math.max(16, x), vw - cw - 16); y = Math.min(Math.max(16, y), vh - ch - 16);
    card.style.left = x + "px"; card.style.top = y + "px";
  };

  const renderCard = () => {
    const s = STEPS[i], { card, spot, dot, hint, bar } = els, pct = Math.round(((i + 1) / STEPS.length) * 100), ch = chapterOf(i);
    if (guided()) {
      // Only the point and its hint: no bar over the app. Back / Skip / close live in the hint itself.
      card.hidden = true; spot.hidden = true; bar.hidden = true;
      hint.innerHTML = `<span class="tr-hint-k">Your turn · ${s.kick}</span>${s.task.ask}
        <span class="tr-hint-acts"><button data-tr="back" ${i === 0 ? "disabled" : ""}>Back</button><button data-tr="next">Skip</button><button data-tr="close" aria-label="Close tour">×</button></span>`;
      dot.hidden = false; hint.hidden = false;
      return;
    }
    bar.hidden = true; dot.hidden = true; hint.hidden = true;
    card.innerHTML = `
      <div class="tr-prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <button class="tr-x" data-tr="close" aria-label="Close tour">×</button>
      <div class="tr-kick"><span class="tr-flow">Chapter ${ch.n} · ${s.kick}</span><span class="tr-n">${ch.at} / ${ch.len}</span></div>
      ${ch.at === 1 && CHAPTERS[s.kick] ? `<div class="tr-chap"><span class="tr-chap-k">In this chapter</span><p><b>Goal:</b> ${CHAPTERS[s.kick].goal}</p><p><b>What happens:</b> ${CHAPTERS[s.kick].what}</p></div>` : ""}
      <h3>${s.title}</h3>
      <div class="tr-body">${s.task ? `<div class="tr-task done"><span class="tr-task-k">✓ Done</span><p>${s.task.ok}</p></div>` : ""}${s.body}</div>
      ${showToc ? toc() : ""}
      <div class="tr-foot">
        <button class="tr-btn" data-tr="back" ${i === 0 ? "disabled" : ""}>Back</button>
        <button class="tr-btn ghost" data-tr="toc" aria-expanded="${showToc}">Chapters</button>
        <span class="sp"></span>
        <button class="tr-btn pri" data-tr="next">${i === STEPS.length - 1 ? "Finish" : "Next"}</button>
      </div>`;
    card.hidden = false;
    card.querySelector('[data-tr="next"]').focus({ preventScroll: true });
  };

  const show = k => {
    i = Math.max(0, Math.min(STEPS.length - 1, k));
    const s = STEPS[i];
    build();
    // A step without its own `go` reuses the nearest earlier one, so Back and jumping both land on the right screen
    let g = i; while (g >= 0 && !STEPS[g].go) g--;
    if (g >= 0) { try { STEPS[g].go(); } catch (e) { console.warn("tour: step failed", s.title, e); } }
    taskDone = false;
    renderCard();
    place(); setTimeout(place, 60); setTimeout(place, 300);
    const el = target(s); if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", inline: "nearest" });
    // The thing to click in a "Your turn" step is scrolled into view, even when it sits far down a list
    const at = s.task && s.task.at && q(s.task.at); if (at && at.scrollIntoView) at.scrollIntoView({ block: "center", inline: "nearest" });
  };
  const stop = () => { if (!els) return; els.spot.hidden = true; els.card.hidden = true; els.dot.hidden = true; els.hint.hidden = true; els.bar.hidden = true; i = -1; cancelAnimationFrame(raf); try { localStorage.setItem(DONE_KEY, "1"); } catch {} if (typeof G !== "undefined") { G.open = true; store.set("guideOpen", true); render(); } };
  // Watch for a "Your turn" step being done, then confirm it on the card
  // When the task is done, the full card comes back: what happened first, then the What changed / Why
  const check = () => { const s = STEPS[i]; if (!s || !s.task || taskDone) return; let ok = false; try { ok = !!s.task.done(); } catch {} if (ok) { taskDone = true; setTimeout(() => { if (STEPS[i] === s) { renderCard(); place(); } }, 450); } };
  const loop = () => { if (i >= 0) { check(); place(); } raf = requestAnimationFrame(loop); };
  // Also check right after the person clicks or types, and on a slow timer, in case animation frames are paused
  ["click", "input", "change"].forEach(t => document.addEventListener(t, () => setTimeout(check, 30)));
  setInterval(() => { if (i >= 0) { check(); place(); } }, 400);
  const start = k => { build(); show(k || 0); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-tr]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const a = b.dataset.tr;
    if (a === "toc") { showToc = !showToc; renderCard(); place(); return; }
    if (a === "jump") { showToc = false; show(+b.dataset.v); return; }
    showToc = false;
    if (a === "close") stop(); else if (a === "back") show(i - 1); else if (a === "next") (i === STEPS.length - 1 ? stop() : show(i + 1));
  }, true);
  document.addEventListener("keydown", e => {
    if (i < 0) return;
    if (e.key === "Escape") { stop(); e.stopPropagation(); }
    else if (e.key === "ArrowRight" && !/INPUT|TEXTAREA/.test(e.target.tagName)) show(i + 1);
    else if (e.key === "ArrowLeft" && !/INPUT|TEXTAREA/.test(e.target.tagName)) show(i - 1);
  }, true);
  addEventListener("resize", place);

  const wantsTour = /[?&#]tour\b/.test(location.href);
  const firstStep = Math.min(STEPS.length, Math.max(1, +(location.href.match(/[?&#]tour=(\d+)/) || [])[1] || 1)) - 1; // ?tour=9 opens on step 9
  let seen = false; try { seen = !!localStorage.getItem(DONE_KEY); } catch {}
  /* Figma captures: ?shot=N opens step N's screen with no tour on top. Photos outside the first view are dropped,
     so a capture only carries what is seen when the screen opens. */
  const shotN = +new URLSearchParams(location.search).get("shot") || 0;
  const inView = el => {
    let { top: t, left: l, bottom: b, right: r } = el.getBoundingClientRect();
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflow === "visible") continue;
      const q = p.getBoundingClientRect(); t = Math.max(t, q.top); l = Math.max(l, q.left); b = Math.min(b, q.bottom); r = Math.min(r, q.right);
    }
    return b > t && r > l && b > 0 && r > 0 && t < innerHeight && l < innerWidth;
  };
  const shot = n => {
    document.body.classList.add("shot");
    const s = STEPS[n - 1]; if (s && s.go) s.go(); render();
    setTimeout(() => document.querySelectorAll("img").forEach(img => { if (!inView(img)) img.remove(); }), 2500);
  };
  // The app boots after the catalogue loads; start once it says it is ready
  document.addEventListener("app:ready", () => { if (shotN) return shot(shotN); build(); // A plain link always opens on step 1 of the tour; ?tour=N, ?screen= and #flow links still open where they point
    const deepLink = new URLSearchParams(location.search).has("screen") || location.hash.length > 1;
    if (wantsTour || !deepLink) setTimeout(() => start(wantsTour ? firstStep : 0), 300); });
  window.PrototypeTour = { start, stop, steps: STEPS };
})();
