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
      <p class="tr-hint">Next and Back move between screens. The prototype stays live underneath, so click around whenever you like. Esc stops the tour; the guide (⌘K, bottom right) restarts it.</p>` },

    /* ---------- Board ---------- */
    { kick: "Study board", title: "A study is products on a board", go: () => goBoard(), sel: ".bx-top .bx-box:first-child", place: "below", body: `
      <p>This is the FA26 footwear review, a study on the Nike GB Men's Footwear collage. Switch study from its name; the collage it sits on is to the left. Like the app, nothing here moves by hand: the board type and the show bar decide the formation.</p>
      ${did("The board is a working tool now: select, tag, group, filter. The top right tells you how many attributes this study has published and gives the two ways out: save them to a collection, or bring a collection in.")}` },
    { kick: "Study board", title: "Group by anything, including your own tags", sel: ".bx-show .bx-box:first-child", place: "above", body: `
      <p>The show bar, as in the app and the Phase 1 redesign. The red chip is the current board: Pareto (tiers by a metric, with the two cut points on the slider), Rank, Group or Freestyle. Then Filter, the metric and aggregation, Add group, and on the right tile size and the Data table. The numbers bottom-left are items in view, like the app.</p>
      ${tryit("Drag a bucket on the slider, add one with +, drag one off the end to remove it. Hover any tool on the left to see what it does and its shortcut.")}` },
    { kick: "Study board", title: "Frame what your eye groups together", go: () => goBoardSel(), sel: ".bx-tile.on", place: "below", body: `
      <p>Selecting is its own tool, Create custom attribute (<b>F</b>), as in the app. With it on, drag a frame around a group or click tiles. Four shoes are selected now. With the Select tool (<b>V</b>), dragging pans and clicking shows a product card instead.</p>
      ${why("This is Giorgi's framing tool from the app. It is the one thing a spreadsheet can never do: pick products by what they look like.")}` },
    { kick: "Study board", title: "Name what you saw: attribute and value", sel: ".bx-panel", place: "left", body: `
      <p>An attribute is what you are judging (Upper material), a value is what you see (Knit). Publish, and every selected product gets that value. Then select the next group and publish Mesh, then Leather. Existing names and values are offered as you type, so spellings stay consistent.</p>
      ${tryit("Press Publish. In Freestyle the four shoes get their own frame, “Upper material: Knit”, and the rest stay loose.")}` },
    { kick: "Study board", title: "Published attributes become filters and groups", go: () => { goBoard(); App.menu = "attrs"; render(); }, sel: ".bx-top .o-menu", place: "left", body: `
      <p>Everything this study has published, with its values and counts, and shortcuts to group or show each one. Franchise was read off the product names to give the study a starting point; everything else is yours.</p>
      ${did("On staging the only trace of a published attribute is a row in the filter box. Here the study shows what it holds and what to do with it.")}` },
    { kick: "Study board", title: "Four board types, one chip", go: () => { goBoard(); App.menu = "matrix"; render(); }, sel: ".bx-show .o-menu", place: "right", body: `
      <p>Pareto cuts the products into tiers by a metric. Rank sorts them. Group makes a frame per value. Freestyle frames whatever you published and leaves the rest loose. Changing type never moves anything by hand, exactly like the app's Change matrix.</p>
      ${why("Save to a collection and Apply a collection live in the attributes menu, top right, where the published list is. That is the board end of the two-way road.")}` },

    /* ---------- Homepage ---------- */
    { kick: "Attributes page", title: "The sidebar is cut to what people use", go: () => goHome(), sel: ".sidebar", place: "right", body: `
      ${was("Eight items in one flat list: Studies, Collages, Connections, Label Library, Models, Imports, Groups, Settings.")}
      ${did("Studies, Collages and Attributes, with Settings and support at the bottom. Attributes sits with the things people use every day.")}` },
    { kick: "Attributes page", title: "A card shows what is inside", sel: ".h-grid .ccard", place: "right", body: `
      ${was("A title, “version 1” and two dates. Karla's version added a screenshot of a board, but a collection isn't a board.")}
      ${did("Five product photos, then a green “+” chip per attribute it adds, with a dot for each value's colour. Below: where it came from, owner, Private or Shared, version and age. You can tell what a collection does without opening it.")}` },
    { kick: "Attributes page", title: "One primary action, with the two ways to start", sel: ".h-head .o-dd:last-child", place: "below", body: `
      ${did("“New collection” opens a short menu: From a study, From a CSV. Each option says in a few words what it is for.")}` },

    /* ---------- Create ---------- */
    { kick: "New collection", title: "Start by saying where the attributes are", go: () => { goHome(); openCreate(null); render(); }, sel: ".o-choose", place: "below", body: `
      ${did("Two tiles with real sentences: in a study (you tagged products on a board) or in a spreadsheet (a CSV with a style code per row). A stepper shows the four steps.")}` },
    { kick: "New collection", title: "Pick a study: show what is there to take", go: () => { goHome(); openCreate("study"); render(); }, sel: ".o-studies", place: "above", body: `
      ${did("Each study shows how many attributes it has published and names them. A study with nothing published is greyed out and says so.")}` },
    { kick: "New collection", title: "The core fix: a checkbox means one thing", go: () => { goPick(); render(); }, sel: ".o-rail.picks", place: "right", body: `
      ${was("On staging every attribute pill is a checkbox and a tab, and a dropdown filters the list. That is why it reads as a filter.")}
      ${did("A checkbox means only “this attribute goes into the collection”. The values under it are read-only pills with real counts, because every value comes with its attribute. There is nothing else to decide.")}` },
    { kick: "New collection", title: "Previewing is visibly not choosing", go: () => { goPick(); const k = STUDIES[0].published[0]; const v = studyValueCounts(STUDIES[0], k)[0][0]; CR.peek = { k, v }; render(); }, sel: ".o-rail.picks .o-vpills", place: "right", body: `
      ${did("Click a value pill and the grid shows only those products, with a banner that says previewing changes nothing. Pills are dashed and round; checkboxes are square.")}` },
    { kick: "New collection", title: "Products show the tags they will carry", go: () => { goPick(); render(); }, sel: ".cr .o-pgrid", place: "left", body: `
      ${did("Each product shows its value for every ticked attribute. The live list shows name and ID 66 times and never the tag itself, which is the whole point.")}` },
    { kick: "New collection", title: "Name it, and know it is private", go: () => { goPick(); CR.step = "name"; CR.name = ""; render(); }, sel: ".o-nameform", place: "right", body: `
      ${did("A name pre-filled from the attributes, an optional description, and a plain line: private until you share it.")}
      ${why("Giorgi's Loom: sharing is a separate, deliberate step. People need to hear that at the moment they make something.")}` },
    { kick: "New collection", title: "See the card before you make it", sel: ".o-namecard", place: "left", body: `
      ${did("A live preview of the card as it will appear on the Attributes page. Create opens the new collection straight away.")}` },

    /* ---------- Open a collection ---------- */
    { kick: "Open a collection", title: "Opening a collection is reading, not importing", go: () => { goCard(); render(); }, sel: ".o-ident", place: "below", body: `
      ${was("Karla's version framed this screen as step 1 of 3 of an import wizard.")}
      ${did("The header is the collection's identity: name, owner, Private / Shared, version, and where it came from. No wizard.")}` },
    { kick: "Open a collection", title: "Two things up top, the rest behind ⋯", go: () => { goCard(); App.menu = "more"; render(); }, sel: ".v2h .o-dd", place: "left", body: `
      ${was("Four identical buttons bottom-right: Import Library to Study, Update Library From Study, Update Library from CSV, Export CSV. Giorgi called them the most confusing part.")}
      ${did("Share sits in the header because it is the deliberate step everyone has to take. Download CSV, the two update moves and version history live behind ⋯, each with a line saying what it does.")}` },
    { kick: "Open a collection", title: "The one big action, and where it has been used", go: () => { goCard(); App.menu = "applied"; render(); }, sel: ".v2card .o-mf", place: "above", body: `
      ${did("Apply to a study is the single red button. Next to it, “Applied in N studies” opens a list of those studies with the version each one has, and a click takes you to that board.")}` },
    { kick: "Open a collection", title: "The rail is a view selector, never a checkbox", sel: ".o-rail.tree", place: "right", body: `
      ${was("Karla's rail was headed “Attributes” with a checkbox on every value, so it read as a filter, not as what the collection holds.")}
      ${did("“Tags in this collection”: a tree of attribute → values, each value with its colour, a bar for its share and a count. One thing selected at a time, the grid follows.")}` },
    { kick: "Open a collection", title: "Every product shows what it gets", go: () => { goCard(); render(); }, sel: ".o-selbar", place: "below", body: `
      ${was("Products showed only image, name and ID, so nothing said what applying the collection would actually do.")}
      ${did("One sentence up top: applying this adds Franchise to 312 products. Then every product carries a “+ Franchise: Phantom” chip, the same + language as the apply preview, tinted with that value's colour.")}` },
    { kick: "Open a collection", title: "Pick an attribute and the grid sorts itself by colour", go: () => { goCard(); CD.sel = { k: "franchise", v: null }; render(); }, sel: ".o-vsec", place: "below", body: `
      ${did("Clicking an attribute splits the grid into one colour section per value, biggest first. Click a section header to see just that value. Find a product searches by name or style code.")}` },

    /* ---------- Collection edge states: empty, partial and missing data ---------- */
    { kick: "Edge states", title: "When search finds nothing", go: () => { setFlow("edge"); JUMP.edge("nomatch"); }, sel: ".v2card .o-empty2 > span", place: "left", body: `
      ${did("Says what was searched and where (names and style codes in this collection only), with one button to clear it.")}
      ${why("A blank grid looks like a broken screen. Naming the scope tells you whether to rephrase or look elsewhere.")}
      <p class="tr-hint">Every edge state answers three things: why it looks like this, whether anything is lost, and what to do next.</p>` },
    { kick: "Edge states", title: "Products with no value", go: () => { setFlow("edge"); JUMP.edge("novalue"); }, sel: ".v2card .o-notice", place: "below", body: `
      ${did("The rail gets a “No value” row, cards show a dashed “No Material”, and an alert warns that applying clears any Material a study already has on them.")}
      ${why("Gaps are easy to miss when you only see what's there. Calling them out before applying stops a silent loss.")}` },
    { kick: "Edge states", title: "A value only one product carries", go: () => { setFlow("edge"); JUMP.edge("single"); }, sel: ".v2card .o-notice", place: "below", body: `
      ${did("Its count turns orange, and a quiet note under the toolbar says a one-product value is often a typo.")}
      ${why("Singletons are usually mistakes. Catching one here is cheaper than fixing it in every study later.")}` },
    { kick: "Edge states", title: "Photos still loading", go: () => { setFlow("edge"); JUMP.edge("nophotos"); }, sel: ".v2card .o-notice", place: "below", body: `
      ${did("Thumbnails that haven't arrived shimmer in place. Names, style codes and tags are already there, and a note says how many photos are still coming.")}
      ${why("You can start reading the collection straight away instead of waiting on the slowest photo.")}` },
    { kick: "Edge states", title: "A collection with no products", go: () => { setFlow("edge"); JUMP.edge("empty"); }, sel: ".v2card .o-e0-why", place: "left", body: `
      ${did("Says plainly that the collection has no products, shows why (the sheet's lot numbers next to the product IDs Collagia matches) and the fix in three steps. Compare and Apply are switched off.")}
      ${why("Seeing the mismatch makes the fix obvious. Switching off Apply stops you sending nothing to a study.")}` },

    /* ---------- Compare with a study (optional, right before applying) ---------- */
    { kick: "Compare with a study", title: "An optional look before you apply", go: () => { goCard(); render(); }, sel: ".v2card .o-mf .o-cmpbtn", place: "above", body: `
      ${was("The only way to see what a collection would do was to start the import: pick a study, then read a dry-run list with “+1” on every row. On the kickoff Roo asked: “am I supposed to do something here?”")}
      ${did("<b>Compare with a study</b> sits right before Apply as an outlined button. It is read-only and optional: Apply to a study stays the one red button, and you can skip Compare entirely.")}
      ${why("People want to know what a collection will do to their study before they commit. Now they can find out without starting anything.")}` },
    { kick: "Compare with a study", title: "Choosing which study to compare with", go: () => { goCompare(); render(); }, sel: ".cpx-pick", place: "below", body: `
      ${did("One searchable dropdown. It opens on a study with an older version, and lists each study's version and shared products.")}
      ${why("The study that's behind is the one most likely to change, so there's usually nothing to pick. A dropdown stays tidy with 3 studies or 30.")}` },
    { kick: "Compare with a study", title: "One headline, the numbers beside it", go: () => { goCompare(); render(); }, sel: ".cpx-side", place: "left", body: `
      ${was("The live preview lists every item with no summary, so you count the changes yourself.")}
      ${did("One headline, “38 products would change in Price architecture”. Beside it, a card names the study and its version (Has v1 · this is v2), then At a glance: 38 change, 8 lose their Franchise, 282 stay the same.")}
      ${why("It answers “what will this do to my study?” in one look, and shows any data loss in red before anything else.")}` },
    { kick: "Compare with a study", title: "Grouped by what happens, riskiest first", go: () => { goCompare(); render(); }, sel: ".cpx-table", place: "left", body: `
      ${was("Giorgi's walkthrough: the live preview's +, ⇄ and − chips are “a little bit too colourful”, don't say what they mean, and waste a lot of space.")}
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
    { kick: "Apply to a study", title: "Always a preview, never a toggle", sel: ".pick .o-mf", place: "above", body: `
      ${was("Staging has a Dry run switch a user can turn off before seeing anything.")}
      ${did("The only button is Preview changes.")}` },
    { kick: "Apply to a study", title: "Lead with one honest sentence", go: () => { goCard(); ST.sel = "Price architecture"; JUMP.study("preview"); }, sel: ".cpx-verdict", place: "below", body: `
      ${did("One sentence that says whether it adds or replaces, in which study, and how many tags are added, changed or removed. If values would be lost, it says so in bold.")}
      ${why("The real dry run on staging deleted 17 values the study had and the library didn't. Applying replaces the study's version of each attribute. The preview has to say so.")}` },
    { kick: "Apply to a study", title: "Totals first, then the detail", sel: ".cpx-table", place: "left", body: `
      ${was("The live preview repeats “+ BW” 113 times with no summary. Roo: “am I supposed to do something here?”")}
      ${did("One line per change, “Slides → No value · 8 products”, in sections by outcome, removals first. The same view as Compare with a study. The answer to Roo's question is: no, read this, then confirm.")}` },
    { kick: "Apply to a study", title: "The button says what it does", sel: ".preview .o-mf .btn.primary", place: "above", body: `
      ${did("“Replace 1 attribute in Price architecture” or “Add…”, never “Import”. When nothing would change it says already up to date.")}` },
    { kick: "Apply to a study", title: "Then tell them where to look", go: () => { goCard(); ST.sel = "Price architecture"; JUMP.study("done"); }, sel: ".o-success", place: "left", body: `
      ${did("The result names the attributes, counts the changes, and says the study now has this version. Open the study board is the primary action, grouped by the new attribute.")}` },

    /* ---------- Share ---------- */
    { kick: "Share", title: "Sharing is a dialog, reached from the collection", go: () => { goAccess(); render(); }, sel: ".o-invite", place: "left", body: `
      ${was("“Manage” in a card menu opens a separate page with a permissions form.")}
      ${did("Invite by email with a role, a people list, pending invites, requests and an activity log. It opens from the collection's Share button, its Shared chip, or the card menu.")}` },
    { kick: "Share", title: "Roles explained where you choose them", go: () => { goAccess(); App.menu = "inv-role"; render(); }, sel: ".o-invite .o-menu", place: "left", body: `
      ${did("Viewer can open and apply. Editor can also update. Admin can also share and delete. One line each, inside the menu.")}` },
    { kick: "Share", title: "Changes write back everywhere", go: () => { goAccess(); render(); }, sel: ".o-share-note", place: "left", body: `
      ${did("Invite someone and the collection's chip becomes Shared on the card and in its header. The state is real, not decoration.")}` },

    /* ---------- Wrap ---------- */
    { kick: "Wrap up", title: "What this version fixes", go: () => goHome(), sel: null, body: `
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
      <p class="tr-hint">Still to confirm with Giorgi: that applying really does replace same-named attributes, what a version means to a user, and whether Manage can become Share. Karla's original files are untouched in <code>oct15/</code>.</p>` },
  ];

  /* ---------- State and DOM ---------- */
  let i = -1, raf = 0, els = null;
  const build = () => {
    if (els) return els;
    const spot = document.createElement("div"); spot.className = "tr-spot"; spot.hidden = true;
    const card = document.createElement("div"); card.className = "tr-card"; card.hidden = true; card.setAttribute("role", "dialog");
    document.body.append(spot, card);
    return (els = { spot, card });
  };
  const target = s => s.sel ? q(s.sel) : null;

  const place = () => {
    const s = STEPS[i]; if (!s || !els) return;
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
    let pref = s.place || "right", x, y;
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
    const s = STEPS[i], { card } = els, pct = Math.round(((i + 1) / STEPS.length) * 100);
    card.innerHTML = `
      <div class="tr-prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <button class="tr-x" data-tr="close" aria-label="Close tour">×</button>
      <div class="tr-kick"><span class="tr-flow">${s.kick}</span><span class="tr-n">${i + 1} / ${STEPS.length}</span></div>
      <h3>${s.title}</h3>
      <div class="tr-body">${s.body}</div>
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
    renderCard();
    place(); setTimeout(place, 60); setTimeout(place, 300);
    const el = target(s); if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  const stop = () => { if (!els) return; els.spot.hidden = true; els.card.hidden = true; i = -1; cancelAnimationFrame(raf); try { localStorage.setItem(DONE_KEY, "1"); } catch {} if (typeof G !== "undefined") { G.open = true; store.set("guideOpen", true); render(); } };
  const loop = () => { if (i >= 0) place(); raf = requestAnimationFrame(loop); };
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
  document.addEventListener("app:ready", () => { build(); if (wantsTour || (!seen && !new URLSearchParams(location.search).has("screen"))) setTimeout(() => start(wantsTour ? firstStep : 0), 300); });
  window.PrototypeTour = { start, stop, steps: STEPS };
})();
