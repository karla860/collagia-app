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
  const goBoardSel = () => { goBoard(); BD.matrix = "freestyle"; BD.tool = "attr"; const ps = bdShown().slice(0, 4); ps.forEach(p => BD.sel.add(p.id)); BD.tag.attr = "Upper material"; BD.tag.value = "Knit"; render(); };
  const goHome = () => { setFlow("home"); App.modal = null; JUMP.home(); };
  const goPick = () => { const s = STUDIES[0]; setFlow("create"); App.page = "home"; openCreate("study"); CR.study = s.name; CR.included = new Set(s.published); CR.peek = null; CR.step = "pick"; };
  const goCard = () => { setFlow("card"); App.page = "home"; openCard("franchise"); CD.sel = null; App.menu = null; };
  const goCompare = (q = "") => { setFlow("compare"); App.page = "home"; openCard("franchise"); openCompare(); Object.assign(CP, { study: "Price architecture", loading: false, at: new Date(), q, open: null, touched: false }); App.menu = null; };
  const goAccess = () => { setFlow("access"); App.page = "home"; openCard("franchise"); openAccess("franchise"); App.menu = null; };

  const STEPS = [
    { kick: "Start here", title: "Collagia in one paragraph", sel: null, body: `
      <p>Collagia joins a company's product images with its business data into a <b>collage</b>, and people explore the collage in a <b>study</b>, a private workspace with boards. On a board you select a group of products and publish a tag: an <b>attribute name + value</b>, like Upper material = Knit. The tag joins the study's filters next to the real data, so something only an eye could spot becomes a column you can group and filter by.</p>
      <p class="tr-hint">The products here are real: 320 men's shoes scraped from nike.com/gb, with their names, style codes, prices and photos. The sales figures are simulated and say so.</p>` },
    { kick: "Start here", title: "What an attribute collection is", sel: null, body: `
      <p>Published tags only live in the study that made them. An <b>attribute collection</b> (today "Label Library") lifts a set of them out so they can be kept, versioned, shared and applied to other studies.</p>
      <div class="tr-diagram"><span>Study</span><em>⇄</em><span class="lib">Collection</span><em>⇄</em><span>CSV</span></div>
      <p>Every button in the feature is one arrow in that picture. This tour follows the loop once: tag on a board, save a collection, open it, compare it with a study, apply it, share it.</p>
      <p class="tr-hint">At some steps the tour steps aside and a <b>red point</b> shows you something to try in the app. Do it and the tour picks up again. Skip is always there.</p>
      <p class="tr-hint">Next and Back move between screens. The prototype stays live underneath, so click around whenever you like. Esc stops the tour; the guide (⌘K, bottom right) restarts it.</p>` },

    /* ---------- Board ---------- */
    { kick: "Study board", title: "A study is products on a board", go: () => goBoard(), sel: ".bx-top .bx-box:first-child", place: "below", body: `
      <p>This is the FA26 footwear review, a study on the Nike GB Men's Footwear collage. Switch study from its name; the collage it sits on is to the left. Like the app, nothing here moves by hand: the board type and the show bar decide the formation.</p>
      ${did("The board is a working tool now: select, tag, group, filter. The top right tells you how many attributes this study has published and gives the two ways out: save them to a collection, or bring a collection in.")}` },
    { kick: "Study board", title: "Frame what your eye groups together", go: () => goBoardSel(), sel: ".bx-tile.on", place: "below", body: `
      <p>Selecting is its own tool, Create custom attribute (<b>F</b>), as in the app. With it on, drag a frame around a group or click tiles. Four shoes are selected now. With the Select tool (<b>V</b>), dragging pans and clicking shows a product card instead.</p>
      ${why("This is the framing tool already in the app. It's the one thing a spreadsheet can never do: pick products by what they look like.")}` },
    { kick: "Study board", title: "Name what you saw: attribute and value", sel: ".bx-panel", place: "left", body: `
      <p>An attribute is what you are judging (Upper material), a value is what you see (Knit). Publish, and every selected product gets that value. Then select the next group and publish Mesh, then Leather. Existing names and values are offered as you type, so spellings stay consistent.</p>
` },
    { kick: "Study board", title: "Four board types, one chip", go: () => { goBoard(); App.menu = "matrix"; render(); }, sel: ".bx-show .o-menu", place: "right", body: `
      <p>Pareto cuts the products into tiers by a metric. Rank sorts them. Group makes a frame per value. Freestyle frames whatever you published and leaves the rest loose. Changing type never moves anything by hand, exactly like the app's Change matrix.</p>
      ${why("Save to a collection and Apply a collection live in the attributes menu, top right, where the published list is. That is the board end of the two-way road.")}` },

    /* ---------- Homepage ---------- */
    { kick: "Attributes page", title: "A card shows what is inside", go: () => goHome(), sel: ".h-grid .ccard", place: "right", body: `
      ${was("On staging, a Label Library card shows a title, “version 1” and two dates, and every card looks the same.")}
      ${did("The cover is the collection's products on a board. Then one tag per attribute with its number of values, where it came from, who has it, and when it last changed.")}` },

    /* ---------- Create ---------- */
    { kick: "New collection", title: "Start by saying where the attributes are", go: () => { goHome(); openCreate(null); render(); }, sel: ".o-choose", place: "below", body: `
      ${did("Two tiles with real sentences: in a study (you tagged products on a board) or in a spreadsheet (a CSV with a style code per row). A stepper shows the four steps.")}` },
    { kick: "New collection", title: "Pick a study: show what is there to take", go: () => { goHome(); openCreate("study"); render(); }, sel: ".o-studies", place: "above", body: `
      ${did("Each study lists the attributes it already has as tags, with how many values each one holds. SS27 merchandising shows a study with six: the first four, then “+2 more”. A study with nothing published is greyed out and says so.")}
      ${why("You pick a study for what's already in it. Tags make that readable at a glance, however many attributes a study has.")}` },
    { kick: "New collection", title: "The core fix: a checkbox means one thing", go: () => { goPick(); render(); }, sel: ".o-rail.picks", place: "right", body: `
      ${was("On staging every attribute pill is a checkbox and a tab, and a dropdown filters the list. That is why it reads as a filter.")}
      ${did("A checkbox means only “this attribute goes into the collection”. The values under it are read-only, with real counts. Each product on the right shows the tag it will carry for every ticked attribute.")}` },
    { kick: "New collection", title: "Name it, and know it is private", go: () => { goPick(); CR.step = "name"; CR.name = ""; render(); }, sel: ".o-nameform", place: "right", body: `
      ${did("A name pre-filled from the attributes, an optional description, a preview of the card it will make, and a plain line: private until you share it.")}
      ${why("Sharing is a separate, deliberate step, so it helps to say so at the moment you make something.")}` },

    /* ---------- Open a collection ---------- */
    { kick: "Open a collection", title: "Two things up top, the rest behind ⋯", go: () => { goCard(); render(); }, sel: ".v2h .o-dd", place: "left", body: `
      ${was("On staging, four identical buttons sit bottom-right: Import Library to Study, Update Library From Study, Update Library from CSV and Export CSV.")}
      ${did("Share sits in the header because it is the deliberate step everyone has to take. Download CSV, the two update moves and version history live behind ⋯, each with a line saying what it does.")}` },
    { kick: "Open a collection", title: "The one big action, and where it has been used", go: () => { goCard(); App.menu = "applied"; render(); }, sel: ".v2card .o-mf", place: "above", body: `
      ${did("Apply to a study is the single red button. Next to it, “Used in” lists the studies that already have this collection and which version each has. Franchise was made from FA26 footwear review, and an older v1 already sits in Price architecture, so both are listed. Applying it somewhere new adds that study here.")}
      ${why("Before applying, it's useful to know where a collection already lives, and which studies are behind.")}` },
    { kick: "Open a collection", title: "Every version, kept", go: () => { goCard(); CD.histOpen = true; render(); }, sel: ".o-hist", place: "left", body: `
      ${was("On staging, a collection says “version 1” and nothing about what changed between versions or which studies have which one.")}
      ${did("Version history lists every version: what changed, who made it, when, and which studies still use it. You can view an older version and restore it as a new one.")}
      ${why("Collections change over time. Knowing which version a study has, and what's different, is what makes updating it safe.")}` },
    { kick: "Open a collection", title: "The rail is a view selector, never a checkbox", go: () => { goCard(); render(); }, sel: ".o-rail.tree", place: "right", body: `
      ${was("On staging, attributes are tabs and values are a single dropdown, so you only ever see one value's products and never the whole collection.")}
      ${did("“Tags in this collection”: a tree of attribute → values, each value with its colour, a bar for its share and a count. One thing selected at a time, the grid follows.")}` },
    { kick: "Open a collection", title: "Pick an attribute and the grid sorts itself by colour", go: () => { goCard(); CD.sel = { k: "franchise", v: null }; render(); }, sel: ".o-vsec-h", place: "below", body: `
      ${did("Clicking an attribute splits the grid into one colour section per value, biggest first. Click a section header to see just that value. Find a product searches by name or style code.")}` },

    /* ---------- Collection edge states: empty, partial and missing data ---------- */
    { kick: "Edge states", title: "When search finds nothing", go: () => { setFlow("edge"); JUMP.edge("nomatch"); }, sel: ".v2card .o-empty2 > span", place: "left", body: `
      ${did("Says what was searched and where (names and style codes in this collection only), with one button to clear it.")}
      ${why("A blank grid looks like a broken screen. Naming the scope tells you whether to rephrase or look elsewhere.")}
      <p class="tr-hint">Every edge state answers three things: why it looks like this, whether anything is lost, and what to do next.</p>` },
    { kick: "Edge states", title: "Products with no value", go: () => { setFlow("edge"); JUMP.edge("novalue"); }, sel: ".v2card .o-notice", place: "below", body: `
      ${did("The rail gets a “No value” row, cards show a dashed “No Material”, and an alert warns that applying clears any Material a study already has on them.")}
      ${why("Gaps are easy to miss when you only see what's there. Calling them out before applying stops a silent loss.")}` },
    { kick: "Edge states", title: "A value only one product carries", go: () => { setFlow("edge"); JUMP.edge("single"); }, sel: ".v2card .o-pgrid .o-pcard", place: "right", body: `
      ${did("Its count turns orange, and a quiet note under the toolbar says a one-product value is often a typo.")}
      ${why("Singletons are usually mistakes. Catching one here is cheaper than fixing it in every study later.")}` },
    { kick: "Edge states", title: "Photos still loading", go: () => { setFlow("edge"); JUMP.edge("nophotos"); }, sel: ".v2card .o-pcard:has(.o-th.loading)", place: "right", body: `
      ${did("Photos that haven't arrived show a grey card with a light sweeping across it. Names, style codes and tags are already there. No banner: the cards say it themselves.")}
      ${why("You can start reading the collection straight away instead of waiting on the slowest photo.")}` },
    { kick: "Edge states", title: "A collection with no products", go: () => { setFlow("edge"); JUMP.edge("empty"); }, sel: ".v2card .o-e0-h", place: "left", body: `
      ${did("One plain message, one reason and one action: Update from a CSV. Compare and Apply are switched off.")}
      ${why("An empty screen should say it's empty and how to fill it, nothing more. Switching off Apply stops you sending nothing to a study.")}` },

    /* ---------- Compare with a study (optional, right before applying) ---------- */
    { kick: "Compare with a study", title: "An optional look before you apply", go: () => { goCard(); render(); }, sel: ".v2card .o-mf .o-cmpbtn", place: "above", body: `
      ${was("On staging, the only way to see what a library would do is to start the import: pick a study, then read a dry-run list with “+1” on every row.")}
      ${did("<b>Compare with a study</b> sits right before Apply as an outlined button. It is read-only and optional: Apply to a study stays the one red button, and you can skip Compare entirely.")}
      ${why("People want to know what a collection will do to their study before they commit. Now they can find out without starting anything.")}` },
    { kick: "Compare with a study", title: "Choosing which study to compare with", go: () => { goCompare(); render(); }, sel: ".cpx-pick", place: "below", body: `
      ${did("One searchable dropdown. It opens on a study with an older version, and lists each study's version and shared products.")}
      ${why("The study that's behind is the one most likely to change, so there's usually nothing to pick. A dropdown stays tidy with 3 studies or 30.")}` },
    { kick: "Compare with a study", title: "Grouped by what happens, riskiest first", go: () => { goCompare(); render(); }, sel: ".cpx-table", place: "left", body: `
      ${was("On staging, the preview marks changes with coloured +, ⇄ and − chips that don't say what they mean, one item per row with a lot of empty space.")}
      ${did("Four sections in plain words: Removed (8 products lose their Franchise), Changed, Added and Stays the same. Each line reads Now → After, like “Slides → No value · 8 products”. Open it and every product shows its own before → after. The values that stay the same sit underneath with their counts, and open too.")}
      ${why("You see the difference, not a list to work through. There is nothing to tick or choose, because applying is all or nothing.")}` },
    { kick: "Compare with a study", title: "Ask about any product", go: () => { goCompare("nike calm"); render(); }, sel: ".cpx-sr", place: "below", body: `
      ${did("Search covers every product in the study and the collection. Each match says what happens to it (Removed, Changed, Added, Stays the same, Not affected or Not in this study) with its value before and after.")}
      ${why("The question people actually have is about their own product. This answers it directly, with no scrolling and no marks to decode.")}` },
    { kick: "Compare with a study", title: "Then apply, already set to that study", go: () => { goCompare(); render(); }, sel: ".cpx .o-mf .btn.primary", place: "above", body: `
      ${did("Apply to Price architecture goes straight to the preview with the study already chosen, so there is no second pick. The preview shows the same view, so it confirms what you just read, and Back returns to Compare.")}
      ${why("Compare is optional but never a detour: it hands you to the next step right where you were.")}` },

    /* ---------- Apply ---------- */
    { kick: "Apply to a study", title: "The collage decides whether anything happens", go: () => { goCard(); setFlow("study"); JUMP.study("pick"); }, sel: ".o-studies .o-study:nth-child(2)", place: "left", body: `
      ${did("Each study shows its collage and how many of the collection's products it contains. One that shares nothing is greyed out with a reason. A study that already has this collection says which version.")}
      ${why("David's example on the kickoff: Christie's attributes applied to a shoes study match nothing.")}` },
    { kick: "Apply to a study", title: "Then tell them where to look", go: () => { goCard(); ST.sel = "Price architecture"; JUMP.study("done"); }, sel: ".o-success", place: "left", body: `
      ${did("The result names the attributes, counts the changes, and says the study now has this version. Open the study board is the primary action, grouped by the new attribute.")}` },

    /* ---------- Applying a collection with more than one attribute ---------- */
    { kick: "Apply to a study", title: "Two attributes in one go", go: () => { setFlow("study"); JUMP.study("multi"); }, sel: ".cpx-table", place: "left", body: `
      ${did("Statue backgrounds carries two attributes, Background color and Material. One preview covers both: every line names its attribute, and the headline counts 30 products and 56 values.")}
      ${why("A collection is a set of columns, not one tag. Seeing every column in one view means one decision, not one per attribute.")}` },
    { kick: "Apply to a study", title: "Both attributes on the board", go: () => { JUMP.study("multiboard"); }, sel: ".bx-world", place: "right", body: `
      ${did("The board opens grouped by Background color, then split by Material inside each frame. Both attributes are now filters and group-by options in Antiquities sale 2026.")}
      ${why("You see every attribute that landed straight away, and how they combine, instead of checking them one at a time.")}` },

    /* ---------- Share ---------- */
    { kick: "Share", title: "Sharing is a dialog, reached from the collection", go: () => { goAccess(); render(); }, sel: ".o-invite", place: "left", body: `
      ${was("“Manage” in a card menu opens a separate page with a permissions form.")}
      ${did("Invite by email with a role, a people list, pending invites, requests and an activity log. It opens from the collection's Share button, its Shared chip, or the card menu.")}` },

    /* ---------- Wrap ---------- */
    { kick: "Wrap up", title: "What this version fixes", go: () => goHome(), sel: null, body: `
      <p class="tr-sub"><b>Earlier version (Jamie, Oct 19)</b></p>
      <ul>
        <li><b>A working board</b> on real Nike products: select, publish attributes, group, filter, then save or apply collections from it.</li>
        <li><b>No iframes.</b> Every screen is one app.</li>
        <li><b>Correct data model.</b> Attribute = column, value = cell, one per product, tags held per study.</li>
        <li><b>Checkboxes mean one thing</b>, only on the create screen.</li>
        <li><b>The collection screen is read-first</b>, all four moves visible and ranked, plus Share.</li>
        <li><b>Cards show what is inside</b>, where it came from and whether it is shared.</li>
        <li><b>The preview leads with a sentence</b>, puts removals first and names the risk.</li>
        <li><b>One + language everywhere.</b> Cards, the collection and the preview all show what gets added, colour-coded per value.</li>
      </ul>
      <p class="tr-sub"><b>This version (Karla)</b></p>
      <ul>
        <li><b>Compare with a study</b>, an optional read-only look before applying: what changes, what's removed, what stays, product by product.</li>
        <li><b>Search any product</b> and see exactly what happens to it.</li>
        <li><b>Built for many studies:</b> one searchable dropdown that opens on the study that's behind.</li>
        <li><b>The Apply preview matches Compare</b>, so the second step confirms the first.</li>
        <li><b>Edge states</b> for the collection: no search match, no value, one-product values, photos loading, no products.</li>
        <li><b>Figma style guide applied:</b> the app's icons, text styles, alert colours and grey attribute tags.</li>
      </ul>
      <p class="tr-hint">Still to confirm with Giorgi: that applying really does replace same-named attributes, what a version means to a user, and whether Manage can become Share. Karla's original files are untouched in <code>oct15/</code>.</p>` },
  ];

  /* ---------- Your turn: steps where the person does the thing instead of reading about it ----------
     The card asks for one small action on the highlighted part. The tour watches the app's state and,
     once it's done, confirms what happened. Next is always there as "Skip", so nobody gets stuck. */
  const TASKS = {
    "Name what you saw: attribute and value": { at: ".bx-pub", ask: "Press <b>Publish</b> to tag the four selected shoes “Upper material: Knit”.", done: () => bdStudy().published.some(k => attrLabel(k).toLowerCase() === "upper material"), ok: "Published. The four shoes now carry Upper material: Knit, and it's a filter and a group on this board." },
    "Four board types, one chip": { at: ".bx-show .o-menu [data-v=\"group\"]", ask: "Pick <b>Group</b> in the menu.", done: () => BD.matrix === "group", ok: "The board is now one frame per product type." },
    "Two things up top, the rest behind ⋯": { selDone: ".v2h .o-menu", placeDone: "left", at: ".v2h .o-morebtn", ask: "Click <b>⋯</b> to see what else you can do with this collection.", done: () => App.menu === "more", ok: "Download, update from a study or a CSV, version history and rename, each with a line saying what it does." },
    "Two attributes in one go": { at: ".preview .o-mf .btn.primary", ask: "Click <b>Add 2 attributes in Antiquities sale 2026</b>.", done: () => App.modal === "success", ok: "Both attributes are in the study: 30 products, 56 values added." },
    "The core fix: a checkbox means one thing": { at: '.o-rrow.attr[data-v="franchise"]', ask: "Untick <b>Franchise</b> and watch the tags on the products.", done: () => !CR.included.has("franchise"), ok: "Franchise is out of the collection, so the products no longer carry it. Tick it again to bring it back." },
    "Choosing which study to compare with": { selDone: ".cpx-menu", placeDone: "right", at: ".cpx-select", ask: "Open the <b>Compare with</b> dropdown to see every study.", done: () => App.menu === "cpstudy", ok: "Studies with an older version come first, each with its version and how many products it shares." },
    "A card shows what is inside": { at: ".h-grid .ccard", ask: "Open the <b>Franchise</b> collection.", done: () => App.modal === "card", ok: "This is the collection screen. Next, a look around it." },
    "Pick an attribute and the grid sorts itself by colour": { at: ".o-vsec-h", ask: "Click the <b>Phantom</b> section header to see only those shoes.", done: () => CD.sel && CD.sel.v, ok: "Just one value now. “Show all” in the bar goes back." },
    "When search finds nothing": { at: ".o-empty2 [data-a=\"cardQClear\"]", ask: "Press <b>Clear search</b>.", done: () => !CD.q, ok: "All 312 products are back." },
    "An optional look before you apply": { at: "[data-a=\"cpOpen\"]", ask: "Click <b>Compare with a study</b>.", done: () => App.modal === "compare", ok: "Compare opened on Price architecture, the study that's behind." },
    "Grouped by what happens, riskiest first": { at: ".cpx-t[data-v*=\"Vomero\"]", ask: "Open the <b>Running → Vomero</b> line to see its 22 products.", done: () => CP.open && CP.open.includes("Vomero"), ok: "Each product shows its own before and after." },
    "Ask about any product": { at: "#cp-q", ask: "Search for <b>Pegasus</b>.", done: () => /pegasus/i.test(CP.q), ok: "Every match says what happens to it." },
    "Then apply, already set to that study": { at: "[data-a=\"cpApply\"]", ask: "Click <b>Apply to Price architecture</b>.", done: () => App.modal === "preview", ok: "Straight to the preview, with the study already chosen." },
    "The collage decides whether anything happens": { at: ".o-study[data-v=\"Price architecture\"]", ask: "Choose <b>Price architecture</b>.", done: () => ST.sel === "Price architecture", ok: "Selected. Preview changes is now available." },
  };
  STEPS.forEach(s => { if (TASKS[s.title]) s.task = TASKS[s.title]; });

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

  const guided = () => { const s = STEPS[i]; return !!(s && s.task && !taskDone); };
  // Guided mode: no shroud, no card. The point sits on the target's corner, the hint below it (or above if there's no room).
  const placeGuide = () => {
    const s = STEPS[i], { dot, hint } = els, el = (s.task.at && q(s.task.at)) || target(s);
    if (!el) { dot.hidden = true; hint.hidden = true; return; }
    const t = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const x = Math.min(vw - 14, Math.max(14, t.right - 10)), y = Math.min(vh - 14, Math.max(14, t.top + 10));
    dot.hidden = false; dot.style.left = x + "px"; dot.style.top = y + "px";
    hint.hidden = false; const r = hint.getBoundingClientRect();
    const below = y + 18 + r.height < vh - 16;
    hint.classList.toggle("up", !below);
    hint.style.top = (below ? y + 18 : y - 18 - r.height) + "px";
    hint.style.left = Math.min(vw - r.width - 16, Math.max(16, x - r.width + 24)) + "px";
  };
  const place = () => {
    const s = STEPS[i]; if (!s || !els) return;
    if (guided()) return placeGuide();
    els.bar.hidden = true; els.dot.hidden = true; els.hint.hidden = true;
    const { spot, card } = els, el = target(s), vw = innerWidth, vh = innerHeight, pad = 8, gap = 16;
    card.classList.toggle("centre", !el);
    if (!el) {
      spot.classList.add("none"); spot.hidden = false; spot.style.cssText = "top:50%;left:50%;width:0;height:0;border-radius:0";
      card.style.maxHeight = ""; card.style.width = "";
      const r = card.getBoundingClientRect();
      card.style.top = Math.max(16, (vh - r.height) / 2) + "px"; card.style.left = Math.max(16, (vw - r.width) / 2) + "px";
      return;
    }
    spot.classList.remove("none"); spot.hidden = false;
    const t = el.getBoundingClientRect();
    const top = Math.max(0, t.top - pad), left = Math.max(0, t.left - pad);
    const w = Math.min(vw - left, t.width + pad * 2), h = Math.min(vh - top, t.height + pad * 2);
    spot.style.top = top + "px"; spot.style.left = left + "px"; spot.style.width = w + "px"; spot.style.height = h + "px";
    spot.style.borderRadius = getComputedStyle(el).borderRadius || "10px";
    card.style.maxHeight = ""; card.style.width = "";
    let r = card.getBoundingClientRect(), cw = r.width, ch = r.height;
    let pref = (s.task && taskDone && s.task.placeDone) || s.place || "right", x, y;
    const room = { right: vw - (left + w + gap) - 16, left: left - gap - 16, below: vh - (top + h + gap) - 16, above: top - gap - 16 };
    const fits = { right: room.right >= cw, left: room.left >= cw, below: room.below >= ch, above: room.above >= ch };
    if (!fits[pref]) pref = ["right", "left", "below", "above"].find(k => fits[k]) || null;
    if (!pref && Math.max(room.left, room.right) >= 280) {
      pref = room.right >= room.left ? "right" : "left";
      card.style.width = Math.min(400, room[pref]) + "px"; r = card.getBoundingClientRect(); cw = r.width; ch = r.height;
    }
    if (!pref) { pref = room.below >= room.above ? "below" : "above"; card.style.maxHeight = Math.max(200, room[pref]) + "px"; r = card.getBoundingClientRect(); ch = r.height; }
    if (pref === "right") { x = left + w + gap; y = top; }
    else if (pref === "left") { x = left - gap - cw; y = top; }
    else if (pref === "below") { x = left; y = top + h + gap; }
    else { x = left; y = top - gap - ch; }
    x = Math.min(Math.max(16, x), vw - cw - 16); y = Math.min(Math.max(16, y), vh - ch - 16);
    card.style.left = x + "px"; card.style.top = y + "px";
  };

  const renderCard = () => {
    const s = STEPS[i], { card, spot, dot, hint, bar } = els, pct = Math.round(((i + 1) / STEPS.length) * 100);
    if (guided()) {
      // Only the point and its hint: no bar over the app. Back / Skip / close live in the hint itself.
      card.hidden = true; spot.hidden = true; bar.hidden = true;
      hint.innerHTML = `<span class="tr-hint-k">Your turn · ${i + 1} / ${STEPS.length}</span>${s.task.ask}
        <span class="tr-hint-acts"><button data-tr="back" ${i === 0 ? "disabled" : ""}>Back</button><button data-tr="next">Skip</button><button data-tr="close" aria-label="Close tour">×</button></span>`;
      dot.hidden = false; hint.hidden = false;
      return;
    }
    bar.hidden = true; dot.hidden = true; hint.hidden = true;
    card.innerHTML = `
      <div class="tr-prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <button class="tr-x" data-tr="close" aria-label="Close tour">×</button>
      <div class="tr-kick"><span class="tr-flow">${s.kick}</span><span class="tr-n">${i + 1} / ${STEPS.length}</span></div>
      <h3>${s.title}</h3>
      <div class="tr-body">${s.task ? `<div class="tr-task done"><span class="tr-task-k">✓ Done</span><p>${s.task.ok}</p></div>` : ""}${s.body}</div>
      <div class="tr-foot">
        <button class="tr-btn" data-tr="back" ${i === 0 ? "disabled" : ""}>Back</button>
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
  };
  const stop = () => { if (!els) return; els.spot.hidden = true; els.card.hidden = true; els.dot.hidden = true; els.hint.hidden = true; els.bar.hidden = true; i = -1; cancelAnimationFrame(raf); try { localStorage.setItem(DONE_KEY, "1"); } catch {} if (typeof G !== "undefined") { G.open = true; store.set("guideOpen", true); render(); } };
  // Watch for a "Your turn" step being done, then confirm it on the card
  // When the task is done, the full card comes back: what happened first, then the What changed / Why
  const check = () => { const s = STEPS[i]; if (!s || !s.task || taskDone) return; let ok = false; try { ok = !!s.task.done(); } catch {} if (ok) { taskDone = true; setTimeout(() => { if (STEPS[i] === s) { renderCard(); place(); } }, 450); } };
  const loop = () => { if (i >= 0) { check(); place(); } raf = requestAnimationFrame(loop); };
  // Also check right after the person clicks or types, and on a slow timer, in case animation frames are paused
  ["click", "input", "change"].forEach(t => document.addEventListener(t, () => setTimeout(check, 30)));
  setInterval(() => { if (i >= 0) check(); }, 400);
  const start = k => { build(); show(k || 0); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-tr]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const a = b.dataset.tr;
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
  // The app boots after the catalogue loads; start once it says it is ready
  document.addEventListener("app:ready", () => { build(); // A plain link always opens on step 1 of the tour; ?tour=N, ?screen= and #flow links still open where they point
    const deepLink = new URLSearchParams(location.search).has("screen") || location.hash.length > 1;
    if (wantsTour || !deepLink) setTimeout(() => start(wantsTour ? firstStep : 0), 300); });
  window.PrototypeTour = { start, stop, steps: STEPS };
})();
