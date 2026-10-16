/* ---------- Flow 1: Access Management ----------
   Option 1 · Access Management: details + split permission buttons; changes apply on Save Changes
   Option 2 · Share: invite by email, permission dropdowns apply straight away
   Option 3 · Side panel: sharing slides in from the right, summary of who has access, saves as you go
   Option 4 · Roles explained: View / Edit / Admin switch per row, capability table, Save with a change count
   Option 5 · Floating panel: opens on the right without dimming the page, which stays usable
   Option 6 · Requests & activity: tabs for People (with pending invites), access Requests, and an Activity log */

const PERMS = { admin: "Admin", editor: "Editor", viewer: "View Only" };
const AC = { name: "Apparel by Pattern Style", people: [], email: "", err: "", sent: null };
// Known people, so an invited email shows their name
const DIRECTORY = [
  { name: "Maya Chen", email: "maya.c@collagia.com" }, { name: "Omar Haddad", email: "omar.h@collagia.com" },
  { name: "Priya Raman", email: "priya.r@collagia.com" }, { name: "Sam Ortiz", email: "sam.o@collagia.com" },
];
const startPeople = opt => opt === "1" ? [
  { name: "Helen Brooms", email: "helen.b@collagia.com", type: "admin", perm: "admin" },
  { name: "Franklin Forge", email: "franklin.f@collagia.com", type: "user", perm: "viewer" },
  { name: "Leyla Benok", email: "leyla.b@collagia.com", type: "user", perm: "editor" },
  { name: "", email: "greg.j@collagia.com", type: "user", perm: "viewer", invite: true },
] : [
  { name: "Helen Brooms", email: "helen.b@collagia.com", type: "admin", perm: "admin" },
  { name: "Franklin Forge", email: "franklin.f@collagia.com", type: "user", perm: "editor" },
  { name: "Leyla Benok", email: "leyla.b@collagia.com", type: "user", perm: "editor" },
  { name: "Greg Johnson", email: "greg.j@collagia.com", type: "user", perm: "viewer" },
  ...(opt === "6" ? [{ name: "", email: "sam.o@collagia.com", type: "user", perm: "viewer", invite: true, sentAt: "3 days ago" }] : []),
];
const openAccess = name => {
  const people = startPeople(App.opt.access);
  Object.assign(AC, {
    name: name || AC.name, people, email: "", err: "", sent: null,
    q: "", role: "viewer", tab: "people",
    base: Object.fromEntries(people.map(p => [p.email, p.perm])),   // Option 4 counts unsaved changes against this
    requests: [
      { name: "Maya Chen", email: "maya.c@collagia.com", perm: "editor", note: "I’d like to add the Tie-dye and Ombré values.", when: "2h ago" },
      { name: "Omar Haddad", email: "omar.h@collagia.com", perm: "viewer", note: "Pulling this into the Spring Launch study.", when: "Yesterday" },
    ],
    log: [
      { who: "Helen Brooms", what: "made Leyla Benok an Editor", when: "Sep 30" },
      { who: "Helen Brooms", what: "invited sam.o@collagia.com as View Only", when: "Sep 28" },
      { who: "Helen Brooms", what: "shared with Greg Johnson as View Only", when: "Sep 22" },
      { who: "Helen Brooms", what: "created this collection", when: "Sep 10" },
    ],
  });
  App.modal = "access"; App.menu = null;
};
const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
const avatar = p => p.invite ? `<span class="o-av ghost"></span>` : `<span class="o-av${p.type === "admin" ? " grey" : ""}">${initials(p.name)}</span>`;
const typeBadge = (p, iconic) => iconic
  ? `<span class="o-type">${p.type === "admin" ? ic.admin : ic.user}${p.type === "admin" ? "Admin" : "User"}</span>`
  : `<span class="o-type flat">${p.type === "admin" ? "Admin" : "User"}</span>`;

// The permissions list from the Figma "Permissions Dropdown" frame: Admin, Editor, View Only, Remove
const permMenu = (i, cur, cls = "") => `<div class="o-menu ${cls}" role="menu">${Object.entries(PERMS).map(([k, l]) =>
  `<button role="menuitemradio" aria-checked="${k === cur}" class="${k === cur ? "cur" : ""}" data-a="setPerm" data-v="${i}:${k}">${l}</button>`).join("")}
  <button role="menuitem" class="danger" data-a="removePerson" data-v="${i}">Remove</button></div>`;

const ACCESS_V1 = () => `<div class="o-modal am" role="dialog" aria-modal="true" aria-label="Access Management">
  <header class="o-mh plain"><button class="icon-btn" data-a="closeModal" aria-label="Back">${ic.back}</button><h2 class="o-h24">Access Management</h2></header>
  <div class="o-am-body">
    <div class="o-details"><span class="o-sl">Details</span>
      <div><small>Version</small>v1.0</div><div><small>Created</small>Sep 10, 2026</div><div class="r"><small>Updated</small>1 min ago</div></div>
    <div class="o-auth"><span class="o-sl">Authorization</span>
      <div class="o-atable">
        <div class="o-ath"><span>Account</span><span>Type</span><span class="r">Permission</span></div>
        ${AC.people.map((p, i) => `<div class="o-atr">
          <div class="o-acct">${avatar(p)}<div>${p.invite ? `<small class="o-newinv">New invite</small>` : `<b>${esc(p.name)}</b>`}<span>${esc(p.email)}</span></div></div>
          <div>${typeBadge(p, true)}</div>
          <div class="r">${p.type === "admin" ? "" : p.invite
            ? `<button class="btn o-big" data-a="resend" data-v="${i}">${AC.sent === i ? `${ic.check}Invite sent` : `Resend Invite${ic.send}`}</button>`
            : `<div class="o-dd"><div class="o-split"><button class="btn o-big" data-a="menu" data-v="perm:${i}">${p.perm === "editor" ? ic.pencil : p.perm === "admin" ? ic.admin : ic.eye}${p.perm === "viewer" ? "Viewer" : PERMS[p.perm]}</button><button class="btn o-big caret" data-a="menu" data-v="perm:${i}" aria-label="Change permission">${ic.chev}</button></div>
              ${App.menu === "perm:" + i ? permMenu(i, p.perm, "right") : ""}</div>`}</div>
        </div>`).join("")}
      </div>
    </div>
  </div>
  <footer class="o-mf flat"><span class="sp"></span><button class="btn o-big" data-a="closeModal">Cancel</button><button class="btn primary o-big" data-a="saveAccess">Save Changes</button></footer>
</div>`;

const ACCESS_V2 = () => `<div class="o-modal share" role="dialog" aria-modal="true" aria-label="Share ${esc(AC.name)}">
  <header class="o-mh small"><button class="icon-btn" data-a="closeModal" aria-label="Back">${ic.back}</button><h2 class="o-h16">Share “${esc(AC.name)}” Attribute Collection</h2></header>
  <div class="o-share-body">
    <div class="o-h14">Invite</div>
    <div class="o-invite"><input id="ac-email" class="o-input${AC.err ? " bad" : ""}" data-in="acEmail" data-enter="share" placeholder="Enter an email" value="${esc(AC.email)}" autocomplete="off">
      <button class="btn primary" data-a="share">Share${ic.share}</button></div>
    ${AC.err ? `<p class="o-err">${AC.err}</p>` : ""}
    <div class="o-stable">
      <div class="o-sth"><span>Accounts with access</span><span>Type</span><span>Permissions</span></div>
      ${AC.people.map((p, i) => `<div class="o-str">
        <div class="o-acct">${avatar(p)}<div><b>${esc(p.name)}</b><span>${esc(p.email)}</span></div></div>
        <div>${typeBadge(p, false)}</div>
        <div class="o-dd">${p.type === "admin" ? `<button class="o-select w100" disabled>Admin${ic.chev}</button>`
          : `<button class="o-select w100${App.menu === "perm:" + i ? " open" : ""}" data-a="menu" data-v="perm:${i}">${PERMS[p.perm]}${ic.chev}</button>${App.menu === "perm:" + i ? permMenu(i, p.perm, "full") : ""}`}</div>
      </div>`).join("")}
    </div>
  </div>
</div>`;

/* ---------- Pieces shared by Options 3–6 ---------- */
const who = p => p.name || p.email;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const personRow = (p, i, right) => `<div class="o-prow">${avatar(p)}
  <div class="o-pwho"><b>${esc(who(p))}</b><span>${esc(p.invite ? `Invited ${p.sentAt || ""}` : p.email)}</span></div>
  ${right}</div>`;
const roleDD = (p, i) => p.type === "admin" ? `<span class="o-owner">Owner</span>`
  : `<div class="o-dd"><button class="o-select w100${App.menu === "perm:" + i ? " open" : ""}" data-a="menu" data-v="perm:${i}">${PERMS[p.perm]}${ic.chev}</button>${App.menu === "perm:" + i ? permMenu(i, p.perm, "right") : ""}</div>`;

// Invite field + role for new people
const inviteRow = (placeholder = "Add people by email") => {
  return `<div class="o-invite">
    <div class="o-dd o-grow"><input id="ac-q" class="o-input${AC.err ? " bad" : ""}" data-in="acQ" data-enter="acInvite" placeholder="${placeholder}" value="${esc(AC.q)}" autocomplete="off" aria-label="${placeholder}"></div>
    <div class="o-dd"><button class="o-select w100${App.menu === "inv-role" ? " open" : ""}" data-a="menu" data-v="inv-role" aria-label="Role for new people">${PERMS[AC.role]}${ic.chev}</button>
      ${App.menu === "inv-role" ? `<div class="o-menu right" role="menu">${["viewer", "editor"].map(k => `<button role="menuitemradio" aria-checked="${AC.role === k}" class="${AC.role === k ? "cur" : ""}" data-a="acRole" data-v="${k}">${PERMS[k]}</button>`).join("")}</div>` : ""}</div>
    <button class="btn primary" data-a="acInvite">Invite</button></div>
  ${AC.err ? `<p class="o-err">${AC.err}</p>` : ""}`;
};
const shareHead = (title = `Share “${esc(AC.name)}”`) => `<header class="o-mh small"><button class="icon-btn" data-a="closeModal" aria-label="Back">${ic.back}</button><h2 class="o-h16">${title}</h2></header>`;

/* Option 3 · Side panel */
const ACCESS_V3 = () => `<aside class="o-modal o-drawer" role="dialog" aria-modal="true" aria-label="Share ${esc(AC.name)}">
  <header class="o-dh"><h2 class="o-h16">Share</h2><span class="sp"></span>
    <button class="icon-btn" data-a="closeModal" aria-label="Close">${ic.close}</button></header>
  <div class="o-dbody">
    <div class="o-sec-l">Invite</div>${inviteRow()}
    <div class="o-sec-l">People with access</div>
    <div class="o-plist">${AC.people.map((p, i) => personRow(p, i, roleDD(p, i))).join("")}</div>
  </div>
  <footer class="o-mf"><span class="sp"></span><button class="btn primary" data-a="closeModal">Done</button></footer>
</aside>`;

/* Option 4 · Roles explained: nothing changes until Save */
const SHORT = { viewer: "View", editor: "Edit", admin: "Admin" };
const changeCount = () => {
  const now = Object.fromEntries(AC.people.map(p => [p.email, p.perm]));
  const keys = new Set([...Object.keys(AC.base), ...Object.keys(now)]);
  return [...keys].filter(k => AC.base[k] !== now[k]).length;
};
const ACCESS_V4 = () => {
  const n = changeCount();
  return `<div class="o-modal roles" role="dialog" aria-modal="true" aria-label="Share ${esc(AC.name)}">
  ${shareHead()}
  <div class="o-share-body">
    ${inviteRow()}
    <div class="o-plist">${AC.people.map((p, i) => personRow(p, i, p.type === "admin" ? `<span class="o-owner">Owner</span>` : `
      <div class="o-rseg" role="radiogroup" aria-label="Role for ${esc(who(p))}">${["viewer", "editor", "admin"].map(k =>
        `<button role="radio" aria-checked="${p.perm === k}" class="${p.perm === k ? "on" : ""}" data-a="segPerm" data-v="${i}:${k}">${SHORT[k]}</button>`).join("")}</div>
      <button class="icon-btn o-rm" data-a="removePerson" data-v="${i}" aria-label="Remove ${esc(who(p))}" title="Remove">${ic.trash}</button>`)).join("")}</div>
  </div>
  <footer class="o-mf"><span class="o-muted">${n ? `<b class="o-unsaved">${plural(n, "unsaved change")}</b>` : "No changes yet"}</span><span class="sp"></span>
    <button class="btn" data-a="closeModal">Cancel</button><button class="btn primary" data-a="saveRoles" ${n ? "" : "disabled"}>Save changes</button></footer>
</div>`;
};

/* Option 5 · Floating panel: no dimmed backdrop, the page stays usable, and the shared collection is outlined */
const ACCESS_V5 = () => {
  const c = COLLECTIONS.find(x => x.name === AC.name);
  return `<aside class="o-modal o-floatpanel" role="dialog" aria-label="Share ${esc(AC.name)}">
  <header class="o-dh"><h2 class="o-h16">Share</h2><span class="sp"></span>
    <button class="icon-btn" data-a="closeModal" aria-label="Close">${ic.close}</button></header>
  <div class="o-dbody">
    ${c ? `<div class="o-fp-coll"><img src="${c.img}" alt=""><div><b>${esc(c.name)}</b><span>${plural(c.tags.length, "attribute")} · edited ${ago(c.edited).toLowerCase()}</span></div></div>` : ""}
    ${inviteRow()}
    <div class="o-plist">${AC.people.map((p, i) => personRow(p, i, roleDD(p, i))).join("")}</div>
  </div>
</aside>`;
};

/* Option 6 · Requests & activity */
const ACCESS_V6 = () => {
  const members = AC.people.map((p, i) => [p, i]).filter(([p]) => !p.invite), invites = AC.people.map((p, i) => [p, i]).filter(([p]) => p.invite);
  const tab = (k, l, n, badge) => `<button role="tab" aria-selected="${AC.tab === k}" class="${AC.tab === k ? "on" : ""}" data-a="acTab" data-v="${k}">${l}${n != null ? `<span class="${badge && n ? "badge" : ""}">${n}</span>` : ""}</button>`;
  const body = {
    people: () => `${inviteRow()}
      <div class="o-plist">${members.map(([p, i]) => personRow(p, i, roleDD(p, i))).join("")}</div>
      ${invites.length ? `<section class="o-pend2" aria-label="Pending invites">
        <div class="o-sec2"><span>Pending invites</span><span class="o-cnt">${invites.length}</span></div>
        ${invites.map(([p, i]) => `<div class="o-pcard">
          <span class="o-av dashed">${ic.send}</span>
          <div class="o-pwho"><b>${esc(p.email)}</b><span><span class="o-pill pend">Pending</span>${PERMS[p.perm]} · sent ${AC.sent === i ? "just now" : p.sentAt || "just now"}</span></div>
          <div class="o-iacts">${AC.sent === i ? `<span class="o-sent" title="Invite resent">${ic.check}</span>` : `<button class="icon-btn" data-a="resend" data-v="${i}" aria-label="Resend invite to ${esc(p.email)}" title="Resend invite">${ic.send}</button>`}
          <button class="icon-btn" data-a="removePerson" data-v="${i}" aria-label="Cancel invite to ${esc(p.email)}" title="Cancel invite">${ic.close}</button></div>
        </div>`).join("")}
      </section>` : ""}`,
    requests: () => AC.requests.length ? `<div class="o-reqs">${AC.requests.map((r, i) => `<div class="o-req">${avatar(r)}
        <div class="o-pwho"><b>${esc(r.name)} <span class="o-asks">asks for ${PERMS[r.perm] === "View Only" ? "view" : "edit"} access</span></b><span>${esc(r.email)} · ${r.when}</span><q>${esc(r.note)}</q></div>
        <div class="o-reqbtns"><button class="btn" data-a="acDecline" data-v="${i}">Decline</button><button class="btn primary" data-a="acApprove" data-v="${i}">Approve</button></div></div>`).join("")}</div>`
      : `<div class="o-empty small"><b>No pending requests</b><span>When someone asks for access, you can approve or decline it here.</span></div>`,
    // Activity: grouped by when, each entry gets an icon for its kind of change, joined by a timeline
    activity: () => {
      const kind = w => /^invited/.test(w) ? ["send", "inv"] : /^(shared|approved)/.test(w) ? ["share", "add"] : /^(removed|cancelled|declined)/.test(w) ? ["trash", "rm"]
        : /^created/.test(w) ? ["plus", "new"] : ["pencil", "role"];
      const groups = [["Today", AC.log.filter(l => l.when === "Just now")], ["September", AC.log.filter(l => l.when !== "Just now")]].filter(([, l]) => l.length);
      return groups.map(([g, l]) => `<div class="o-sec2"><span>${g}</span></div><ol class="o-act2">${l.map(x => { const [icon, cls] = kind(x.what); return `<li>
        <span class="o-act-ic ${cls}">${ic[icon]}</span>
        <div><p><b>${esc(x.who)}</b> ${esc(x.what)}</p><time>${x.when}</time></div></li>`; }).join("")}</ol>`).join("");
    },
  };
  return `<div class="o-modal share tabs6" role="dialog" aria-modal="true" aria-label="Share ${esc(AC.name)}">
  ${shareHead()}
  <div class="o-atabs" role="tablist">${tab("people", "People", members.length)}${tab("requests", "Requests", AC.requests.length, true)}${tab("activity", "Activity")}</div>
  <div class="o-share-body o-tabbody">${body[AC.tab]()}</div>
</div>`;
};
const ACCESS_VIEWS = { "1": () => ACCESS_V1(), "2": () => ACCESS_V2(), "3": ACCESS_V3, "4": ACCESS_V4, "5": ACCESS_V5, "6": ACCESS_V6 };

/* ---------- Actions ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Options 1 and 4 wait for Save; the others apply each change straight away and log it
const saves = () => App.opt.access === "1" || App.opt.access === "4";
const logAct = what => AC.log.unshift({ who: "You", what, when: "Just now" });
ACTIONS.openAccess = el => { setFlow("access"); openAccess(COLLECTIONS[+el.dataset.v].name); };
ACTIONS.setPerm = el => {
  const [i, k] = el.dataset.v.split(":"), p = AC.people[+i]; p.perm = k;
  if (!saves()) { toast(`${who(p)} is now ${PERMS[k]}`); logAct(`changed ${who(p)} to ${PERMS[k]}`); }
};
ACTIONS.segPerm = el => ACTIONS.setPerm(el);
ACTIONS.removePerson = el => {
  const p = AC.people.splice(+el.dataset.v, 1)[0];
  if (saves()) { if (App.opt.access === "1") toast(`${who(p)} will lose access when you save`); return; }
  toast(p.invite ? `Cancelled the invite to ${p.email}` : `Removed ${who(p)}`); logAct(p.invite ? `cancelled the invite to ${p.email}` : `removed ${who(p)}`);
};
ACTIONS.saveRoles = () => { const n = changeCount(); App.modal = null; toast(`Saved ${plural(n, "change")} to “${AC.name}”`); };
INPUTS.acQ = el => {
  AC.q = el.value; AC.err = "";
  return false;
};
ACTIONS.acRole = el => { AC.role = el.dataset.v; };
const addPerson = p => {
  AC.people.push(p); AC.q = ""; AC.err = ""; App.menu = null;
  if (saves()) return;
  toast(`Shared “${AC.name}” with ${who(p)} as ${PERMS[p.perm]}`); logAct(`shared with ${who(p)} as ${PERMS[p.perm]}`);
};
ACTIONS.acInvite = () => {
  const e = AC.q.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) { AC.err = "Enter a valid email address"; return; }
  if (AC.people.some(p => p.email === e)) { AC.err = "This account already has access"; return; }
  const known = DIRECTORY.find(d => d.email === e);
  addPerson({ name: known ? known.name : e.split("@")[0].split(/[._-]/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" "), email: e, type: "user", perm: AC.role });
};
ACTIONS.acTab = el => { AC.tab = el.dataset.v; };
ACTIONS.acApprove = el => {
  const r = AC.requests.splice(+el.dataset.v, 1)[0];
  AC.people.push({ name: r.name, email: r.email, type: "user", perm: r.perm });
  toast(`${r.name} can now ${r.perm === "viewer" ? "view" : "edit"} “${AC.name}”`); logAct(`approved ${r.name} as ${PERMS[r.perm]}`);
};
ACTIONS.acDecline = el => { const r = AC.requests.splice(+el.dataset.v, 1)[0]; toast(`Declined ${r.name}’s request`); logAct(`declined ${r.name}’s request`); };
ACTIONS.resend = el => { AC.sent = +el.dataset.v; toast(`Invite resent to ${AC.people[AC.sent].email}`); };
ACTIONS.saveAccess = () => { App.modal = null; toast(`Access updated for “${AC.name}”`); };
INPUTS.acEmail = el => { AC.email = el.value; if (AC.err) { AC.err = ""; return true; } return false; };
ACTIONS.share = () => {
  const e = AC.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { AC.err = "Enter a valid email address"; return; }
  if (AC.people.some(p => p.email === e)) { AC.err = "This account already has access"; return; }
  const local = e.split("@")[0].split(/[._-]/).filter(Boolean);
  const name = local.map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  AC.people.push({ name, email: e, type: "user", perm: "viewer" });
  AC.email = ""; AC.err = "";
  toast(`Shared “${AC.name}” with ${e} as View Only`);
};

JUMP.access = v => {
  if (v) setOpt("access", v);
  App.page = "home"; openAccess(AC.name);
  render();
};
