/* ---------- Share ----------
   Nothing is discoverable until it is explicitly shared, so sharing is a dialog you reach from the
   collection itself (and from its card). People, pending invites, requests and an activity log.
   Changes apply straight away and are written back to the collection, so cards and headers update. */

const PERMS = { admin: "Admin", editor: "Editor", viewer: "Viewer" };
const PERM_HELP = { viewer: "Can open it and apply it to their own studies", editor: "Can also update it from a study or a CSV", admin: "Can also share it, manage access and delete it" };
const AC = { id: null, people: [], q: "", role: "viewer", err: "", tab: "people", sent: null, requests: [], log: [] };
const DIRECTORY = Object.values(PEOPLE);

const openAccess = id => {
  const c = collById(id);
  const people = [{ ...c.owner, type: "owner", perm: "admin" }, ...c.shared.filter(p => p !== c.owner).map((p, i) => ({ ...p, type: "user", perm: i === 0 ? "editor" : "viewer" }))];
  Object.assign(AC, { id, people, q: "", role: "viewer", err: "", tab: "people", sent: null,
    requests: c.id === "franchise" ? [{ name: "Maya Chen", email: "maya.c@collagia.com", perm: "editor", note: "I'd like to split Other into Blazer and Cortez.", when: "2h ago" }] : [],
    log: [{ who: c.owner.you ? "You" : c.owner.name, what: "created this collection", when: c.created }, ...c.shared.filter(p => p !== c.owner).map(p => ({ who: c.owner.you ? "You" : c.owner.name, what: `shared with ${p.you ? "you" : p.name}`, when: c.edited }))] });
  App.modal = "access"; App.menu = null;
};
const syncShared = () => { const c = collById(AC.id); c.shared = AC.people.filter(p => p.type !== "owner" && !p.invite).map(p => PEOPLE[Object.keys(PEOPLE).find(k => PEOPLE[k].email === p.email)] || (p.email === ME.email ? ME : { name: p.name, email: p.email })); };
const who = p => p.you ? "You" : (p.name || p.email);
const avatarP = p => p.invite ? `<span class="o-av dashed">${ic.send}</span>` : avatar2(p, p.type === "owner" ? "grey" : "");
const permMenu = i => `<div class="o-menu right o-permmenu" role="menu">${Object.entries(PERMS).map(([k, l]) =>
  `<button role="menuitemradio" aria-checked="${AC.people[i].perm === k}" class="${AC.people[i].perm === k ? "cur" : ""}" data-a="setPerm" data-v="${i}:${k}"><span>${l}</span>${AC.people[i].perm === k ? ic.check : ""}</button>`).join("")}
  <button role="menuitem" class="danger" data-a="removePerson" data-v="${i}">Remove access</button></div>`;
const roleDD = (p, i) => p.type === "owner" ? `<span class="o-owner">Owner</span>`
  : `<div class="o-dd"><button class="o-select w100${App.menu === "perm:" + i ? " open" : ""}" data-a="menu" data-v="perm:${i}">${PERMS[p.perm]}${ic.chev}</button>${App.menu === "perm:" + i ? permMenu(i) : ""}</div>`;
const personRow = (p, i) => `<div class="o-prow">${avatarP(p)}<div class="o-pwho"><b>${esc(who(p))}</b><span>${esc(p.email)}</span></div>${roleDD(p, i)}</div>`;

const inviteRow = () => `<div class="o-invite">
    <div class="o-dd o-grow"><input id="ac-q" class="o-input${AC.err ? " bad" : ""}" data-in="acQ" data-enter="acInvite" placeholder="Add people by email" value="${esc(AC.q)}" autocomplete="off" aria-label="Add people by email"></div>
    <div class="o-dd"><button class="o-select w100${App.menu === "inv-role" ? " open" : ""}" data-a="menu" data-v="inv-role" aria-label="Role for new people">${PERMS[AC.role]}${ic.chev}</button>
      ${App.menu === "inv-role" ? `<div class="o-menu right o-permmenu" role="menu">${["viewer", "editor", "admin"].map(k => `<button role="menuitemradio" aria-checked="${AC.role === k}" class="${AC.role === k ? "cur" : ""}" data-a="acRole" data-v="${k}"><span>${PERMS[k]}</span></button>`).join("")}</div>` : ""}</div>
    <button class="btn primary" data-a="acInvite">Invite</button></div>
  ${AC.err ? `<p class="o-err">${AC.err}</p>` : ""}`;

const MODAL_ACCESS = () => {
  const c = collById(AC.id);
  const members = AC.people.map((p, i) => [p, i]).filter(([p]) => !p.invite), invites = AC.people.map((p, i) => [p, i]).filter(([p]) => p.invite);
  const tab = (k, l, n, badge) => `<button role="tab" aria-selected="${AC.tab === k}" class="${AC.tab === k ? "on" : ""}" data-a="acTab" data-v="${k}">${l}${n != null ? `<span class="${badge && n ? "badge" : ""}">${n}</span>` : ""}</button>`;
  const body = {
    people: () => `${inviteRow()}
      <p class="o-share-note">${isPrivate(c) ? `${ic.lock}<span><b>Only you can see this collection.</b> Invite someone and it appears on their Attributes page.</span>` : `${ic.people}<span>Shared with <b>${members.length - 1}</b> ${members.length - 1 === 1 ? "person" : "people"}. Viewers can apply it; Editors can update it; Admins can share and delete it.</span>`}</p>
      <div class="o-plist">${members.map(([p, i]) => personRow(p, i)).join("")}</div>
      ${invites.length ? `<section class="o-pend2" aria-label="Pending invites">
        <div class="o-sec2"><span>Pending invites</span><span class="o-cnt">${invites.length}</span></div>
        ${invites.map(([p, i]) => `<div class="o-invcard">${avatarP(p)}
          <div class="o-pwho"><b>${esc(p.email)}</b><span><span class="o-pill pend">Pending</span>${PERMS[p.perm]} · sent ${AC.sent === i ? "just now" : p.sentAt || "just now"}</span></div>
          <div class="o-iacts">${AC.sent === i ? `<span class="o-sent" title="Invite resent">${ic.check}</span>` : `<button class="icon-btn" data-a="resend" data-v="${i}" aria-label="Resend invite" title="Resend invite">${ic.send}</button>`}
          <button class="icon-btn" data-a="removePerson" data-v="${i}" aria-label="Cancel invite" title="Cancel invite">${ic.close}</button></div>
        </div>`).join("")}</section>` : ""}`,
    requests: () => AC.requests.length ? `<div class="o-reqs">${AC.requests.map((r, i) => `<div class="o-req">${avatar2(r)}
        <div class="o-pwho"><b>${esc(r.name)} <span class="o-asks">asks for ${PERMS[r.perm]} access</span></b><span>${esc(r.email)} · ${r.when}</span><q>${esc(r.note)}</q></div>
        <div class="o-reqbtns"><button class="btn" data-a="acDecline" data-v="${i}">Decline</button><button class="btn primary" data-a="acApprove" data-v="${i}">Approve</button></div></div>`).join("")}</div>`
      : `<div class="o-empty small"><b>No pending requests</b><span>When someone asks for access, you can approve or decline it here.</span></div>`,
    activity: () => `<ol class="o-act2">${AC.log.map(x => { const [icon, cls] = /^invited/.test(x.what) ? ["send", "inv"] : /^(shared|approved)/.test(x.what) ? ["share", "add"] : /^(removed|cancelled|declined)/.test(x.what) ? ["trash", "rm"] : /^created/.test(x.what) ? ["plus", "new"] : ["pencil", "role"];
      return `<li><span class="o-act-ic ${cls}">${ic[icon]}</span><div><p><b>${esc(x.who)}</b> ${esc(x.what)}</p><time>${x.when}</time></div></li>`; }).join("")}</ol>`,
  };
  return `<div class="o-modal share tabs6" role="dialog" aria-modal="true" aria-label="Share ${esc(c.name)}">
  <header class="o-mh small"><button class="icon-btn" data-a="accessBack" aria-label="Back">${ic.back}</button><h2 class="o-h16">Share “${esc(c.name)}”</h2></header>
  <div class="o-atabs" role="tablist">${tab("people", "People", members.length)}${tab("requests", "Requests", AC.requests.length, true)}${tab("activity", "Activity")}</div>
  <div class="o-share-body o-tabbody">${body[AC.tab]()}</div>
</div>`;
};

/* ---------- Actions ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const logAct = what => AC.log.unshift({ who: "You", what, when: "Just now" });
ACTIONS.openAccess = el => { setFlow("access"); openAccess(el.dataset.v); };
ACTIONS.openAccessCur = () => { setFlow("access"); AC.from = "card"; openAccess(CD.id); };
ACTIONS.accessBack = () => { if (AC.from === "card") { AC.from = null; App.modal = "card"; setFlow("card"); } else App.modal = null; };
ACTIONS.setPerm = el => { const [i, k] = el.dataset.v.split(":"), p = AC.people[+i]; p.perm = k; toast(`${who(p)} is now ${PERMS[k]}`); logAct(`made ${who(p)} ${PERMS[k]}`); };
ACTIONS.removePerson = el => { const p = AC.people.splice(+el.dataset.v, 1)[0]; syncShared(); toast(p.invite ? `Cancelled the invite to ${p.email}` : `Removed ${who(p)}`); logAct(p.invite ? `cancelled the invite to ${p.email}` : `removed ${who(p)}`); };
INPUTS.acQ = el => { AC.q = el.value; AC.err = ""; return false; };
ACTIONS.acRole = el => { AC.role = el.dataset.v; };
ACTIONS.acInvite = () => {
  const e = AC.q.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) { AC.err = "Enter a valid email address"; return; }
  if (AC.people.some(p => p.email === e)) { AC.err = "This person already has access"; return; }
  const known = DIRECTORY.find(d => d.email === e);
  const p = known ? { ...known, type: "user", perm: AC.role } : { name: "", email: e, type: "user", perm: AC.role, invite: true, sentAt: "just now" };
  AC.people.push(p); AC.q = ""; AC.err = ""; App.menu = null; syncShared();
  toast(known ? `Shared with ${p.name} as ${PERMS[p.perm]}` : `Invited ${e} as ${PERMS[p.perm]}`); logAct(known ? `shared with ${p.name} as ${PERMS[p.perm]}` : `invited ${e} as ${PERMS[p.perm]}`);
};
ACTIONS.acTab = el => { AC.tab = el.dataset.v; };
ACTIONS.acApprove = el => { const r = AC.requests.splice(+el.dataset.v, 1)[0]; AC.people.push({ name: r.name, email: r.email, type: "user", perm: r.perm }); syncShared(); toast(`${r.name} is now ${PERMS[r.perm]}`); logAct(`approved ${r.name} as ${PERMS[r.perm]}`); };
ACTIONS.acDecline = el => { const r = AC.requests.splice(+el.dataset.v, 1)[0]; toast(`Declined ${r.name}'s request`); logAct(`declined ${r.name}'s request`); };
ACTIONS.resend = el => { AC.sent = +el.dataset.v; toast(`Invite resent to ${AC.people[AC.sent].email}`); };

JUMP.access = () => { App.page = "home"; openCard(collById(CD.id) ? CD.id : COLLECTIONS[0].id); AC.from = "card"; openAccess(CD.id); render(); };
