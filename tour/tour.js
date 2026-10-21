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
  const goPick = () => { const s = STUDIES[0]; setFlow("create"); App.page = "home"; openCreate("study"); CR.study = s.name; CR.included = new Set(s.published); CR.step = "pick"; };
  // After saving from the board: back on it, grouped by the collection's first attribute
  const goMade = () => { goBoard(); Object.assign(BD, { matrix: "group", groupBy: "franchise", show: "franchise" }); render(); };
  const goCard = () => { setFlow("card"); App.page = "home"; openCard("franchise"); App.menu = null; };
  const goCompare = (q = "") => { setFlow("compare"); App.page = "home"; openCard("franchise"); openCompare(); Object.assign(CP, { study: "Price architecture", loading: false, at: new Date(), q, open: null, touched: false }); App.menu = null; };

  const STEPS = [
    { kick: "Start here", title: "A quick tour", sel: null, body: `
      <p>Attributes are tags you add to products on a study's board, like Upper material = Knit. A <b>collection</b> saves them so they can be shared and added to other studies.</p>
      <div class="tr-diagram"><span>Study</span><em>⇄</em><span class="lib">Collection</span><em>⇄</em><span>CSV</span></div>
      <p class="tr-hint">A <b>red point</b> means try it yourself. Esc stops the tour; ⌘K restarts it.</p>` },

    /* ---------- The board: attributes are made here, with the attribute tool's box (Figma 4392:1295) ---------- */
    { kick: "The board", title: "Frame what your eye groups together", go: () => goBoardSel(), sel: ".bx-tools button[data-v=\"attr\"]", place: "right", body: `
      ${did("Press <b>F</b>, then drag a frame or click products. Four are selected.")}` },
    { kick: "The board", title: "Name the attribute and its value", go: () => { goBoardSel(); BD.tag.value = ""; BD.dd = "val"; render(); }, sel: "#bd-inpop", grow: ".bx-ip-dd", place: "right", body: `
      ${did("Pick an attribute and a value, or type new ones. Choosing the value tags the framed products.")}` },
    { kick: "The board", title: "Your attribute collections", go: () => goHome(), sel: ".h-grid .ccard", place: "right", body: `
      ${did("The Attributes page: every collection as a card.")}` },

    /* ---------- New collection ---------- */
    { kick: "New collection", title: "Start a collection", go: () => goHome(), sel: '[data-v="newmenu"]', place: "below", body: `
      ${did("New collection, from a study or a CSV.")}` },
    { kick: "New collection", title: "Pick a study", go: () => { goHome(); openCreate("study"); render(); }, sel: ".o-studies", place: "above", body: `
      ${did("Each study shows the attributes it has.")}` },
    { kick: "New collection", title: "Review what goes in", go: () => { goPick(); render(); }, sel: ".cr .o-rail.tree", place: "right", body: `
      ${did("Every attribute goes in. Browse it as the collection will show it.")}` },
    { kick: "New collection", title: "Name it", go: () => { goPick(); CR.step = "name"; CR.name = ""; render(); }, sel: ".o-nameform", place: "right", body: `
      ${did("A suggested name, and a preview of its card. Private until you share it.")}` },
    { kick: "New collection", title: "Back on the board", go: () => goMade(), sel: null, body: `
      <p>The study now uses the collection, grouped by its first attribute.</p>` },

    /* ---------- Opening a collection ---------- */
    { kick: "Open a collection", title: "A card shows what is inside", go: () => goHome(), sel: ".h-grid .ccard", place: "right", body: `
      ${did("Click a card to open the collection.")}` },
    { kick: "Open a collection", title: "Browse by attribute and value", go: () => { goCard(); render(); }, sel: ".o-rail.tree", place: "right", body: `
      ${did("One attribute at a time. Pick a value to see only its products.")}` },
    { kick: "Open a collection", title: "Two buttons, the rest behind ⋯", go: () => { goCard(); render(); }, sel: ".v2card .o-mf", place: "above", body: `
      ${did("Import to a study, or update it from one. CSV, versions and rename sit behind ⋯.")}` },

    /* ---------- Adding attributes to a study ---------- */
    { kick: "Add to a study", title: "Import to a study", go: () => { goCard(); render(); }, sel: ".v2card .o-mf .o-cta", place: "above", body: `
      ${did("Brings this collection's attributes into a study.")}` },
    { kick: "Add to a study", title: "Pick any study", go: () => { goCard(); openCompare(); render(); }, sel: ".cpx-studies", place: "below", body: `
      ${did("Every study you have, as a card.")}` },
    { kick: "Add to a study", title: "See what changes", go: () => { goCompare(); render(); }, sel: ".cpx-table", place: "left", body: `
      ${did("Removed, changed and added, product by product. Nothing has changed yet.")}` },
    { kick: "Add to a study", title: "Import", go: () => { goCompare(); render(); }, sel: ".cpx .o-mf", place: "above", body: `
      ${did("Import applies it. Back to collection leaves the study as it is.")}` },
    { kick: "Add to a study", title: "Done", go: () => { goCard(); ST.sel = "Price architecture"; JUMP.study("done"); }, sel: ".o-success", place: "left", body: `
      ${did("Open the study to see its new attributes, or undo.")}` },
  ];

  /* ---------- Your turn: steps where the person does the thing instead of reading about it ----------
     The card asks for one small action on the highlighted part. The tour watches the app's state and,
     once it's done, confirms what happened. Next is always there as "Skip", so nobody gets stuck. */
  const TASKS = {
    "Start a collection": { selDone: ".o-newmenu", placeDone: "left", at: '[data-v="newmenu"]', ask: "Click <b>New collection</b>.", done: () => App.menu === "newmenu", ok: "From a study, or from a CSV." },
    "Review what goes in": { beside: ".cr .o-rail.tree", at: '.cr .o-tname[data-v="upper-material"]', ask: "Click <b>Upper material</b>, then <b>Knit</b>.", done: () => App.modal === "create" && CD.sel && CD.sel.k === "upper-material" && CD.sel.v, ok: "Just a view: everything still goes in." },
    "A card shows what is inside": { free: true, at: ".h-grid .ccard", ask: "Open the <b>FA26 line review</b> collection.", done: () => App.modal === "card", ok: "This is the collection." },
    "Browse by attribute and value": { beside: ".o-rail.tree", at: '.o-tname[data-v="upper-material"]', ask: "Click <b>Upper material</b>, then <b>Knit</b>.", done: () => App.modal === "card" && CD.sel && CD.sel.k === "upper-material" && CD.sel.v, ok: "Only those products show." },
    "Two buttons, the rest behind ⋯": { selDone: ".v2h .o-menu", placeDone: "left", at: ".v2h .o-morebtn", ask: "Click <b>⋯</b>.", done: () => App.menu === "more", ok: "Everything else." },
    "Import to a study": { at: ".v2card .o-mf .o-cta", ask: "Click <b>Import to a study</b>.", done: () => App.modal === "compare", ok: "Now pick a study." },
    "Pick any study": { at: '.cpx-studies [data-v="Price architecture"]', ask: "Pick <b>Price architecture</b>.", done: () => CP.study === "Price architecture", ok: "Here's what would change." },
  };
  STEPS.forEach(s => { if (TASKS[s.title]) s.task = TASKS[s.title]; });

  /* ---------- Chapters: the steps grouped like an interactive demo, each opening with its goal ---------- */
  const CHAPTERS = {
    "Start here": { goal: "What attributes and collections are.", what: "One short read." },
    "The board": { goal: "Tag products on a board, then find your collections.", what: "Frame products, name the attribute and value." },
    "New collection": { goal: "Save a study's attributes as a collection.", what: "Pick a study, review, name it." },
    "Open a collection": { goal: "What's inside a collection.", what: "Open one and browse it." },
    "Add to a study": { goal: "Bring a collection's attributes into a study.", what: "Pick a study, see the changes, import." },
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
