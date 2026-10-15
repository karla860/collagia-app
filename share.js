/* ---------- Share an attribute collection (opened from a card's ⋯ menu) ---------- */
// Uses read/save from app.js and esc/toast/COLLECTIONS from home.js

const SHARE_ITERS = { "1": "Refined list", "2": "Invite with suggestions", "3": "Grouped by role", "4": "Link access", "5": "Review changes" };
const ROLES = {
  admin:  { l: "Admin", d: "Manage access, edit and delete the collection" },
  editor: { l: "Editor", d: "Edit attributes and values, publish new versions" },
  viewer: { l: "View only", d: "Browse the collection and pull it into studies" },
};
// Collagia workspace directory, used for name suggestions (iteration 2)
const TEAM = [
  { name: "Jamie McArdle", email: "jamie.m@collagia.com" },
  { name: "Helen Brooms", email: "helen.b@collagia.com" },
  { name: "Franklin Forge", email: "franklin.f@collagia.com" },
  { name: "Leyla Benok", email: "leyla.b@collagia.com" },
  { name: "Greg Johnson", email: "greg.j@collagia.com" },
  { name: "Maya Chen", email: "maya.c@collagia.com" },
  { name: "Omar Haddad", email: "omar.h@collagia.com" },
  { name: "Priya Raman", email: "priya.r@collagia.com" },
  { name: "Sam Ortiz", email: "sam.o@collagia.com" },
  { name: "Grace Lindqvist", email: "grace.l@collagia.com" },
];
const START_ACCESS = [
  { name: "Jamie McArdle", email: "jamie.m@collagia.com", role: "admin", you: true },
  { name: "Helen Brooms", email: "helen.b@collagia.com", role: "admin", ws: true },
  { name: "Franklin Forge", email: "franklin.f@collagia.com", role: "editor" },
  { name: "Leyla Benok", email: "leyla.b@collagia.com", role: "editor" },
  { name: "Greg Johnson", email: "greg.j@collagia.com", role: "viewer" },
];

const si = {
  close: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>',
  chev: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 6.5 3.5 3.5 3.5-3.5"/></svg>',
  check: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>',
  lock: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
  link: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.3 9a2.6 2.6 0 0 0 3.7 3.7l.8-.8"/></svg>',
  people: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="6" cy="5.5" r="2.3"/><path d="M1.8 13.5a4.2 4.2 0 0 1 8.4 0M10.5 3.4a2.3 2.3 0 0 1 0 4.4M12 9.6a4.2 4.2 0 0 1 2.2 3.9"/></svg>',
  building: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M3 14V3h7v11M10 6.5h3V14M1.5 14h13M5.5 5.5h2M5.5 8h2M5.5 10.5h2"/></svg>',
  share: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5h4v4M13.5 2.5 8 8M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3"/></svg>',
  mail: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="2" y="3.5" width="12" height="9" rx="1.2"/><path d="m2.5 4.5 5.5 4 5.5-4"/></svg>',
  edit: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M10.5 2.5 13.5 5.5 6 13H3v-3z"/></svg>',
  copy: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5.5" y="5.5" width="8" height="8" rx="1.2"/><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg>',
  trash: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9"/></svg>',
  download: '<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M2.5 13.5h11"/></svg>',
};

const Sh = { iter: read("shareIter", SHARE_ITERS, "1"), name: "", people: [], base: [], q: "", chips: [], role: "viewer", err: "", menu: null, hi: 0, removed: null, link: "restricted", linkRole: "viewer", notify: true };

const resetShare = name => Object.assign(Sh, {
  name, people: START_ACCESS.map(p => ({ ...p })), base: START_ACCESS.map(p => ({ ...p })),
  q: "", chips: [], role: "viewer", err: "", menu: null, hi: 0, removed: null, link: "restricted", linkRole: "viewer", notify: true,
});

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const initials = n => n.split(/[\s.]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
const findPerson = e => Sh.people.find(p => p.email === e);
const active = () => Sh.people.filter(p => !p.removed);
const baseOf = p => Sh.base.find(b => b.email === p.email);
const fromEmail = email => {
  const t = TEAM.find(m => m.email === email);
  return t ? { ...t } : { name: email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()), email, pending: true };
};
const suggestions = () => {
  const q = Sh.q.trim().toLowerCase(); if (!q) return [];
  return TEAM.filter(m => !findPerson(m.email) && !Sh.chips.includes(m.email) && (m.name.toLowerCase().includes(q) || m.email.includes(q))).slice(0, 5);
};
// Iteration 5 compares against the access list as it was when the modal opened
const changes = () => Sh.people.filter(p => { const b = baseOf(p); return p.removed || !b || b.role !== p.role; });

/* ---------- Pieces ---------- */
const avatar = p => `<span class="sh-av${p.you ? " me" : ""}${p.pending ? " pend" : ""}" aria-hidden="true">${initials(p.name)}</span>`;
const roleMenu = (cur, act, id, up, removable) => `<div class="sh-menu${up ? " up" : ""}" role="menu">${Object.entries(ROLES).map(([k, r]) =>
  `<button role="menuitemradio" aria-checked="${k === cur}" data-s="${act}" data-id="${esc(id)}" data-r="${k}"><span class="sh-tick">${k === cur ? si.check : ""}</span><span><b>${r.l}</b><small>${r.d}</small></span></button>`).join("")}
  ${removable ? `<hr><button class="danger" data-s="remove" data-id="${esc(id)}"><span class="sh-tick">${si.trash}</span><span><b>Remove access</b></span></button>` : ""}</div>`;
const roleBtn = (cur, act, id, up, removable, extra = "") => `<div class="sh-dd${extra}">
  <button class="sh-rolebtn${Sh.menu === id ? " open" : ""}" data-s="menu" data-id="${esc(id)}" aria-haspopup="menu" aria-expanded="${Sh.menu === id}">${ROLES[cur].l}${si.chev}</button>
  ${Sh.menu === id ? roleMenu(cur, act, id, up, removable) : ""}</div>`;

const roleControl = (p, up) => {
  if (p.you) return `<span class="sh-fixed" title="You can't change your own access">${ROLES[p.role].l}</span>`;
  if (p.ws) return `<span class="sh-fixed" title="Workspace admins always have full access">${si.lock}${ROLES[p.role].l}</span>`;
  if (p.removed) return `<span class="sh-was">Access removed</span><button class="sh-link" data-s="restore" data-id="${esc(p.email)}">Undo</button>`;
  const b = baseOf(p);
  const was = Sh.iter === "5" && b && b.role !== p.role ? `<span class="sh-was">was ${ROLES[b.role].l}</span>` : "";
  return was + roleBtn(p.role, "set-role", p.email, up, true);
};
const pills = p => (p.you ? `<span class="sh-pill">You</span>` : "") + (p.ws ? `<span class="sh-pill">Workspace admin</span>` : "")
  + (p.pending ? `<span class="sh-pill pend">Invite pending</span>` : "")
  + (Sh.iter === "5" && !baseOf(p) ? `<span class="sh-pill new">New</span>` : "");
const personRow = (p, up) => `<li class="sh-row${p.removed ? " removed" : ""}">
  ${avatar(p)}
  <div class="sh-who"><div class="sh-name"><span>${esc(p.name)}</span>${pills(p)}</div><div class="sh-mail">${esc(p.email)}</div></div>
  <div class="sh-ctl">${roleControl(p, up)}</div></li>`;
const personList = list => `<ul class="sh-list">${list.map((p, i) => personRow(p, list.length > 3 && i >= list.length - 2)).join("")}</ul>`;

const head = (sub = "") => `<header class="sh-head">
  <div><h2>Share “${esc(Sh.name)}”</h2>${sub ? `<p>${sub}</p>` : ""}</div>
  <button class="icon-btn" data-s="close" aria-label="Close">${si.close}</button></header>`;

// Email field with the role new people get, picked before sending
const inviteRow = (label = "Invite people", cta = `Share${si.share}`) => {
  const ok = EMAIL.test(Sh.q.trim());
  return `<div class="sh-sec"><label class="sh-label" for="sh-q">${label}</label>
  <div class="sh-invite">
    <div class="sh-field${Sh.err ? " bad" : ""}">
      <input id="sh-q" data-f="q" value="${esc(Sh.q)}" placeholder="Enter an email, e.g. name@collagia.com" autocomplete="off" aria-invalid="${!!Sh.err}" aria-describedby="sh-err">
      ${roleBtn(Sh.role, "invite-role", "invite", false, false, " in-field")}
    </div>
    <button class="btn primary" data-s="invite" ${ok ? "" : "disabled"}>${cta}</button>
  </div>
  <p class="sh-err" id="sh-err" role="alert">${Sh.err || ""}</p></div>`;
};

const undoBar = () => Sh.removed ? `<div class="sh-undo" role="status"><span>Removed <b>${esc(Sh.removed.p.name)}</b></span><button class="sh-link" data-s="undo">Undo</button></div>` : "";
const foot = (left, right) => `<footer class="sh-foot">${undoBar() || `<span class="sh-hint">${left}</span>`}<span class="sp"></span>${right}</footer>`;
const doneBtn = `<button class="btn" data-s="close">Done</button>`;
const countLabel = n => `${n} ${n === 1 ? "person has" : "people have"} access`;

/* ---------- Iterations ---------- */
const VIEWS = {
  // 1 · The current layout, cleaned up: one role column, owner/self locked, remove lives in the role menu
  "1": () => `${head()}
    <div class="sh-body">
      ${inviteRow()}
      <div class="sh-sec"><div class="sh-label">${countLabel(active().length)}</div>${personList(active())}</div>
    </div>
    ${foot(`${si.mail}People are notified by email`, doneBtn)}`,

  // 2 · Add several people at once, by name or email, from the Collagia directory
  "2": () => {
    const sug = suggestions();
    const n = Sh.chips.length;
    return `${head()}
    <div class="sh-body">
      <div class="sh-sec"><label class="sh-label" for="sh-q">Invite people</label>
        <div class="sh-invite">
          <div class="sh-field tokens${Sh.err ? " bad" : ""}">
            <div class="sh-tokens">${Sh.chips.map(e => { const m = TEAM.find(t => t.email === e); return `<span class="sh-chip${m ? "" : " ext"}">${esc(m ? m.name : e)}<button data-s="chip-x" data-id="${esc(e)}" aria-label="Remove ${esc(e)}">${si.close}</button></span>`; }).join("")}
            <input id="sh-q" data-f="q" value="${esc(Sh.q)}" placeholder="${n ? "" : "Add names or emails"}" autocomplete="off" role="combobox" aria-expanded="${sug.length > 0}" aria-controls="sh-sug"></div>
            ${roleBtn(Sh.role, "invite-role", "invite", false, false, " in-field")}
            ${sug.length ? `<ul class="sh-sug" id="sh-sug" role="listbox">${sug.map((m, i) => `<li role="option" aria-selected="${i === Sh.hi}" class="${i === Sh.hi ? "on" : ""}" data-s="pick" data-id="${m.email}">${avatar(m)}<span><b>${esc(m.name)}</b><small>${m.email}</small></span></li>`).join("")}</ul>` : ""}
          </div>
          <button class="btn primary" data-s="invite" ${n || EMAIL.test(Sh.q.trim()) ? "" : "disabled"}>${n > 1 ? `Share with ${n}` : "Share"}${si.share}</button>
        </div>
        <p class="sh-err" id="sh-err" role="alert">${Sh.err || ""}</p>
        ${Sh.chips.some(e => !TEAM.find(t => t.email === e)) ? `<p class="sh-note">Highlighted emails are outside the Collagia team and get an invite email to join first</p>` : ""}
        ${n ?`<label class="sh-check"><input type="checkbox" data-s="notify" ${Sh.notify ? "checked" : ""}> Notify ${n === 1 ? "this person" : `these ${n} people`} by email</label>` : ""}
      </div>
      <div class="sh-sec"><div class="sh-label">${countLabel(active().length)}</div>${personList(active())}</div>
    </div>
    ${foot("Search the team by name, or paste several emails", doneBtn)}`;
  },

  // 3 · People grouped by role, each group says what that role can do
  "3": () => `${head()}
    <div class="sh-body">
      ${inviteRow()}
      ${Object.entries(ROLES).map(([k, r]) => {
        const list = active().filter(p => p.role === k);
        return `<div class="sh-sec sh-group">
          <div class="sh-ghead"><span class="sh-label">${r.l} <span class="sh-count">${list.length}</span></span><span class="sh-gdesc">${r.d}</span></div>
          ${list.length ? personList(list) : `<p class="sh-empty">No one has ${r.l.toLowerCase()} access yet</p>`}</div>`;
      }).join("")}
    </div>
    ${foot(countLabel(active().length), doneBtn)}`,

  // 4 · People plus a workspace-wide link, so a whole team can get access without one invite each
  "4": () => `${head()}
    <div class="sh-body">
      ${inviteRow()}
      <div class="sh-sec"><div class="sh-label">${countLabel(active().length)}</div>${personList(active())}</div>
      <div class="sh-sec sh-general"><div class="sh-label">General access</div>
        <div class="sh-row">
          <span class="sh-av icon${Sh.link === "workspace" ? " on" : ""}">${Sh.link === "workspace" ? si.building : si.lock}</span>
          <div class="sh-who">
            <div class="sh-dd"><button class="sh-plain${Sh.menu === "link" ? " open" : ""}" data-s="menu" data-id="link" aria-haspopup="menu">${Sh.link === "workspace" ? "Anyone at Collagia" : "Only people added"}${si.chev}</button>
            ${Sh.menu === "link" ? `<div class="sh-menu up left" role="menu">
              <button role="menuitemradio" aria-checked="${Sh.link === "restricted"}" data-s="set-link" data-r="restricted"><span class="sh-tick">${Sh.link === "restricted" ? si.check : ""}</span><span><b>Only people added</b><small>Only the people listed above can open it</small></span></button>
              <button role="menuitemradio" aria-checked="${Sh.link === "workspace"}" data-s="set-link" data-r="workspace"><span class="sh-tick">${Sh.link === "workspace" ? si.check : ""}</span><span><b>Anyone at Collagia</b><small>Everyone in the workspace with the link</small></span></button>
            </div>` : ""}</div>
            <div class="sh-mail">${Sh.link === "workspace" ? "Anyone in the Collagia workspace with the link can open it" : "Only the people listed above can open this collection"}</div>
          </div>
          ${Sh.link === "workspace" ? `<div class="sh-ctl">${roleBtn(Sh.linkRole === "admin" ? "viewer" : Sh.linkRole, "link-role", "linkrole", true, false, " no-admin")}</div>` : ""}
        </div>
      </div>
    </div>
    ${foot("", `<button class="btn" data-s="copy">${si.link}Copy link</button>${doneBtn}`)}`,

  // 5 · Nothing changes until Save: edits are marked so they can be checked first
  "5": () => {
    const ch = changes();
    return `${head()}
    <div class="sh-body">
      ${inviteRow("Add people", "Add")}
      <div class="sh-sec"><div class="sh-label">People with access <span class="sh-count">${active().length}</span></div>${personList(Sh.people)}</div>
    </div>
    <footer class="sh-foot">
      ${ch.length ? `<label class="sh-check"><input type="checkbox" data-s="notify" ${Sh.notify ? "checked" : ""}> Notify people by email</label>` : `<span class="sh-hint">Changes apply when you save</span>`}
      <span class="sp"></span>
      ${ch.length ? `<span class="sh-pending">${ch.length} unsaved ${ch.length === 1 ? "change" : "changes"}</span>` : ""}
      <button class="btn" data-s="close">Cancel</button>
      <button class="btn primary" data-s="save" ${ch.length ? "" : "disabled"}>Save changes</button>
    </footer>`;
  },
};

/* ---------- Render ---------- */
const shOverlay = document.getElementById("share-overlay");
const shRoot = document.getElementById("share-root");
const shProto = document.getElementById("share-proto");

const renderShare = () => {
  const f = document.activeElement && document.activeElement.dataset.f, pos = f ? document.activeElement.selectionStart : null;
  shRoot.innerHTML = `<div class="sh sh-${Sh.iter}">${VIEWS[Sh.iter]()}</div>`;
  shProto.innerHTML = `<span class="plabel">Share modal</span><div class="seg small">${Object.entries(SHARE_ITERS).map(([id, l]) =>
    `<button class="${Sh.iter === id ? "on" : ""}" data-si="${id}"><b>${id}</b> ${l}</button>`).join("")}</div>`;
  if (f) { const el = shRoot.querySelector(`[data-f="${f}"]`); if (el) { el.focus(); el.setSelectionRange(pos, pos); } }
};

let shLastFocus = null;
const openShare = name => {
  shLastFocus = document.activeElement;
  resetShare(name);
  shOverlay.hidden = false;
  document.body.classList.add("locked");
  renderShare();
  shRoot.querySelector("#sh-q").focus();
};
const closeShare = () => {
  shOverlay.hidden = true;
  document.body.classList.remove("locked");
  if (shLastFocus) shLastFocus.focus();
};

/* ---------- Actions ---------- */
let undoTimer;
const addPeople = emails => {
  const added = [];
  for (const e of emails) {
    const p = findPerson(e);
    if (p && p.removed) { p.removed = false; p.role = Sh.role; added.push(p); continue; }
    if (p) continue;
    const np = { ...fromEmail(e), role: Sh.role };
    Sh.people.push(np); added.push(np);
  }
  return added;
};
const invite = () => {
  const raw = [...Sh.chips, ...Sh.q.split(/[\s,;]+/)].map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!raw.length) return;
  const bad = raw.find(e => !EMAIL.test(e));
  if (bad) { Sh.err = `“${esc(bad)}” isn't a valid email address`; return; }
  const dup = raw.filter(e => findPerson(e) && !findPerson(e).removed);
  if (dup.length === raw.length) { Sh.err = `${esc(findPerson(dup[0]).name)} already has access`; return; }
  const added = addPeople(raw);
  Sh.q = ""; Sh.chips = []; Sh.err = "";
  if (Sh.iter !== "5") toast(added.length === 1 ? `${added[0].name} can now ${Sh.role === "viewer" ? "view" : "edit"} “${Sh.name}”` : `Shared with ${added.length} people`);
};
const remove = email => {
  const i = Sh.people.findIndex(p => p.email === email); if (i < 0) return;
  if (Sh.iter === "5") { const p = Sh.people[i]; if (baseOf(p)) p.removed = true; else Sh.people.splice(i, 1); return; }
  Sh.removed = { p: Sh.people[i], i };
  Sh.people.splice(i, 1);
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => { Sh.removed = null; if (!shOverlay.hidden) renderShare(); }, 6000);
};

let shPressedOnBackdrop = false;
shOverlay.addEventListener("mousedown", e => { shPressedOnBackdrop = e.target === shOverlay; });
shOverlay.addEventListener("click", e => { if (e.target === shOverlay && shPressedOnBackdrop) closeShare(); shPressedOnBackdrop = false; });

shProto.addEventListener("click", e => {
  const b = e.target.closest("[data-si]"); if (!b) return;
  const name = Sh.name; Sh.iter = b.dataset.si; save("shareIter", Sh.iter); resetShare(name); renderShare();
});

shRoot.addEventListener("click", e => {
  const a = e.target.closest("[data-s]");
  if (!a) { if (Sh.menu && !e.target.closest(".sh-menu")) { Sh.menu = null; renderShare(); } return; }
  const { s: act, id, r } = a.dataset;
  if (act === "notify") { Sh.notify = a.checked; return; }
  if (act !== "menu") Sh.menu = null;
  switch (act) {
    case "close": closeShare(); return;
    case "menu": Sh.menu = Sh.menu === id ? null : id; break;
    case "set-role": findPerson(id).role = r; break;
    case "invite-role": Sh.role = r; break;
    case "link-role": Sh.linkRole = r; break;
    case "set-link": Sh.link = r; break;
    case "remove": remove(id); break;
    case "restore": findPerson(id).removed = false; break;
    case "undo": if (Sh.removed) { Sh.people.splice(Sh.removed.i, 0, Sh.removed.p); Sh.removed = null; } break;
    case "invite": invite(); break;
    case "pick": Sh.chips.push(id); Sh.q = ""; Sh.hi = 0; Sh.err = ""; renderShare(); shRoot.querySelector("#sh-q").focus(); return;
    case "chip-x": Sh.chips = Sh.chips.filter(c => c !== id); break;
    case "copy": toast(Sh.link === "workspace" ? "Link copied · anyone at Collagia can open it" : "Link copied · only people added can open it"); return;
    case "save": {
      const n = changes().length;
      Sh.people = Sh.people.filter(p => !p.removed);
      Sh.base = Sh.people.map(p => ({ ...p }));
      toast(`${n} ${n === 1 ? "change" : "changes"} saved${Sh.notify ? " · people were notified" : ""}`);
      break;
    }
    default: return;
  }
  renderShare();
});

shRoot.addEventListener("input", e => {
  const f = e.target.dataset.f; if (!f) return;
  Sh[f] = e.target.value; Sh.err = ""; Sh.hi = 0;
  // Typing a comma or space turns a finished email into a chip (iteration 2)
  if (Sh.iter === "2" && /[,;\s]$/.test(Sh.q)) {
    const e2 = Sh.q.slice(0, -1).trim().toLowerCase();
    if (EMAIL.test(e2) && !Sh.chips.includes(e2)) { Sh.chips.push(e2); Sh.q = ""; } else if (!e2) Sh.q = "";
  }
  renderShare();
});

shRoot.addEventListener("keydown", e => {
  if (!e.target.matches("#sh-q")) return;
  const sug = Sh.iter === "2" ? suggestions() : [];
  if (sug.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    e.preventDefault(); Sh.hi = (Sh.hi + (e.key === "ArrowDown" ? 1 : -1) + sug.length) % sug.length; renderShare(); return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    if (sug.length) { Sh.chips.push(sug[Sh.hi].email); Sh.q = ""; Sh.hi = 0; }
    else if (Sh.iter === "2" && EMAIL.test(Sh.q.trim())) { Sh.chips.push(Sh.q.trim().toLowerCase()); Sh.q = ""; }
    else invite();
    renderShare(); return;
  }
  if (e.key === "Backspace" && !Sh.q && Sh.chips.length) { Sh.chips.pop(); renderShare(); }
});

document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || shOverlay.hidden) return;
  if (Sh.menu) { Sh.menu = null; renderShare(); } else closeShare();
});

/* ---------- Card ⋯ menu on the homepage ---------- */
const cardMenu = document.getElementById("card-menu");
const openCardMenu = btn => {
  const name = btn.dataset.name;
  const r = btn.getBoundingClientRect();
  cardMenu.dataset.name = name;
  cardMenu.innerHTML = `
    <button role="menuitem" data-cm="share">${si.people}Share</button>
    <button role="menuitem" data-cm="rename">${si.edit}Rename</button>
    <button role="menuitem" data-cm="duplicate">${si.copy}Duplicate</button>
    <button role="menuitem" data-cm="export">${si.download}Export CSV</button>
    <hr><button role="menuitem" class="danger" data-cm="delete">${si.trash}Delete</button>`;
  cardMenu.hidden = false;
  const w = cardMenu.offsetWidth;
  cardMenu.style.top = `${r.bottom + 6}px`;
  cardMenu.style.left = `${Math.max(8, Math.min(r.right - w, innerWidth - w - 8))}px`;
  cardMenu.querySelector("button").focus();
};
const closeCardMenu = () => { cardMenu.hidden = true; };
cardMenu.addEventListener("click", e => {
  const b = e.target.closest("[data-cm]"); if (!b) return;
  const name = cardMenu.dataset.name;
  closeCardMenu();
  if (b.dataset.cm === "share") openShare(name);
  else toast(`Prototype: “${b.textContent.trim()}” isn't part of this flow`);
});
document.addEventListener("click", e => { if (!cardMenu.hidden && !e.target.closest("#card-menu, [data-h=more]")) closeCardMenu(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !cardMenu.hidden) closeCardMenu(); });
addEventListener("scroll", closeCardMenu, true);
addEventListener("resize", closeCardMenu);

// Prototype shortcut: index.html#share-3 opens iteration 3 for "Apparel by Pattern Style"
const shareHash = location.hash.match(/^#share-([1-5])$/);
if (shareHash) { Sh.iter = shareHash[1]; openShare("Apparel by Pattern Style"); }
