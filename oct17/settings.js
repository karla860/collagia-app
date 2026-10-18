/* ---------- Settings ----------
   The live portal's Settings is one long page: Change password, Two-factor authentication, a "Refresh Token"
   button and a raw "My Roles" diagnostic. Same content here, organised into Profile, Security and
   Access & session, written for people rather than for the developers who debug roles. */

const SET = { tab: "profile", pw: { cur: "", next: "", confirm: "", show: false }, mfa: "off", code: "", refreshed: "Today, 09:12", name: "", title: "", saved: false };
const PW_RULES = [
  ["At least 12 characters", v => v.length >= 12],
  ["An uppercase letter (A–Z)", v => /[A-Z]/.test(v)],
  ["A lowercase letter (a–z)", v => /[a-z]/.test(v)],
  ["A number (0–9)", v => /\d/.test(v)],
  ["A special character, like ! @ # $ %", v => /[^A-Za-z0-9]/.test(v)],
];
const ROLES = [
  { scope: "Organisation", name: "Collagia", role: "Admin", note: "Manage people, groups and every collage" },
  { scope: "Collage", name: "Nike GB Men's Footwear", role: "Editor", note: "Create studies and publish attributes" },
  { scope: "Collage", name: "Christie's Antiquities", role: "Viewer", note: "Open studies shared with you" },
];
const SET_TABS = { profile: ["Profile", ic.user], security: ["Security", ic.lock], access: ["Access & session", ic.people] };

const qrSvg = () => { // a stand-in QR: deterministic squares, three finder patterns
  let cells = ""; const n = 25;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17); if (finder) continue;
    if ((x * 7 + y * 13 + x * y) % 5 < 2) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg viewBox="-1 -1 27 27" width="148" height="148" fill="#232121" shape-rendering="crispEdges"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/>${cells}${f(0, 0)}${f(18, 0)}${f(0, 18)}</svg>`;
};

const PROFILE = () => `
  <section class="st-card">
    <div class="st-h"><h2>Profile</h2><p>How you appear to people you share studies and collections with.</p></div>
    <div class="st-profile">
      ${ME.photo ? `<img class="st-avatar" src="${ME.photo}" alt="">` : `<span class="st-avatar">${ME.name.split(" ").map(w => w[0]).join("")}</span>`}
      <div><b>${esc(ME.name)}</b><span>${esc(ME.email)}</span><button class="o-clear" data-a="setToast" data-v="Photo upload">Change photo</button></div>
    </div>
    <div class="st-grid">
      <label class="o-field"><span>Full name</span><input class="o-input" id="st-name" data-in="stName" value="${esc(SET.name || ME.name)}"></label>
      <label class="o-field"><span>Job title <small>optional</small></span><input class="o-input" id="st-title" data-in="stTitle" value="${esc(SET.title || ME.role || "")}"></label>
      <label class="o-field"><span>Email</span><input class="o-input" value="${esc(ME.email)}" disabled><small class="st-hint">Your email is managed by your organisation's single sign-on.</small></label>
      <label class="o-field"><span>Organisation</span><input class="o-input" value="${esc(ME.org || "Collagia")}" disabled></label>
    </div>
    <div class="st-actions">${SET.saved ? `<span class="st-ok">${ic.check}Saved</span>` : ""}<button class="btn primary" data-a="stSaveProfile">Save changes</button></div>
  </section>`;

const SECURITY = () => {
  const v = SET.pw.next, passed = PW_RULES.filter(([, t]) => t(v)).length, strong = passed === PW_RULES.length;
  const match = SET.pw.confirm && SET.pw.confirm === v, ready = SET.pw.cur && strong && match;
  const type = SET.pw.show ? "text" : "password";
  const mfa = {
    off: `<p class="st-status off">${ic.warn}<span><b>Not turned on.</b> Add a second step at sign-in: a 6-digit code from an authenticator app such as 1Password, Google Authenticator or Authy.</span></p>
      <div class="st-actions left"><button class="btn primary" data-a="stMfaStart">${ic.lock}Set up two-factor authentication</button></div>`,
    setup: `<ol class="st-steps">
        <li><b>Scan this code with your authenticator app</b><div class="st-qr">${qrSvg()}<div><span class="st-muted">Can't scan it? Enter this key instead:</span><code class="st-secret">JBSW Y3DP EHPK 3PXP</code><button class="o-clear" data-a="setToast" data-v="Copied the setup key">Copy key</button></div></div></li>
        <li><b>Enter the 6-digit code it shows</b><input class="o-input st-code" id="st-code" data-in="stCode" data-enter="stMfaVerify" inputmode="numeric" maxlength="6" placeholder="000000" value="${esc(SET.code)}" autocomplete="one-time-code"></li>
      </ol>
      <div class="st-actions left"><button class="btn" data-a="stMfaCancel">Cancel</button><button class="btn primary" data-a="stMfaVerify" ${/^\d{6}$/.test(SET.code) ? "" : "disabled"}>Verify and turn on</button></div>`,
    on: `<p class="st-status on">${ic.check}<span><b>On.</b> You'll be asked for a code from your authenticator app each time you sign in on a new device.</span></p>
      <div class="st-actions left"><button class="btn" data-a="setToast" data-v="Recovery codes downloaded">Download recovery codes</button><button class="btn danger-ghost" data-a="stMfaOff">Turn off</button></div>`,
  }[SET.mfa];
  return `
  <section class="st-card">
    <div class="st-h"><h2>Password</h2><p>Last changed 3 months ago.</p></div>
    <div class="st-grid one">
      <label class="o-field"><span>Current password</span><input class="o-input" type="${type}" id="st-cur" data-in="stPwCur" value="${esc(SET.pw.cur)}" autocomplete="current-password"></label>
      <label class="o-field"><span>New password</span><input class="o-input" type="${type}" id="st-next" data-in="stPwNext" value="${esc(v)}" autocomplete="new-password"></label>
      <div class="st-meter s${v ? passed : 0}"><i></i><i></i><i></i><i></i><i></i><span>${!v ? "" : strong ? "Strong" : passed >= 3 ? "Almost there" : "Too weak"}</span></div>
      <ul class="st-rules">${PW_RULES.map(([l, t]) => `<li class="${v && t(v) ? "ok" : ""}">${v && t(v) ? ic.check : `<i></i>`}${l}</li>`).join("")}</ul>
      <label class="o-field"><span>Confirm new password</span><input class="o-input${SET.pw.confirm && !match ? " bad" : ""}" type="${type}" id="st-confirm" data-in="stPwConfirm" value="${esc(SET.pw.confirm)}" autocomplete="new-password">${SET.pw.confirm && !match ? `<small class="st-err">The passwords don't match yet</small>` : ""}</label>
      <label class="st-check"><input type="checkbox" data-in="stPwShow" ${SET.pw.show ? "checked" : ""}> Show passwords</label>
    </div>
    <div class="st-actions"><button class="btn primary" data-a="stPwSave" ${ready ? "" : "disabled"}>Change password</button></div>
  </section>
  <section class="st-card">
    <div class="st-h"><h2>Two-factor authentication</h2><p>A second step at sign-in keeps your studies safe if your password leaks.</p></div>
    ${mfa}
  </section>`;
};

const ACCESS = () => `
  <section class="st-card">
    <div class="st-h"><h2>Your access</h2><p>What you can do, and where. Ask an organisation admin if something's missing.</p></div>
    <div class="st-roles">${ROLES.map(r => `<div class="st-role"><span class="st-scope">${r.scope}</span><b>${esc(r.name)}</b><span class="st-rolechip r-${r.role.toLowerCase()}">${r.role}</span><small>${r.note}</small></div>`).join("")}</div>
  </section>
  <section class="st-card">
    <div class="st-h"><h2>Session</h2><p>If an admin has just changed your access, refresh your session to pick it up without signing out.</p></div>
    <div class="st-session"><div><b>This browser</b><span>Chrome on macOS · signed in since 08:40</span><span class="st-muted">Session last refreshed ${esc(SET.refreshed)}</span></div>
      <button class="btn" data-a="stRefresh">${ic.history}Refresh session</button></div>
    <div class="st-actions left"><button class="btn danger-ghost" data-a="setToast" data-v="Signed out (prototype)">Sign out</button></div>
  </section>`;

RENDER.settings = () => {
  markNav();
  $("#home").innerHTML = `
    <div class="h-head"><h1>Settings</h1></div>
    <div class="st-wrap">
      <nav class="st-nav">${Object.entries(SET_TABS).map(([k, [l, i]]) => `<button class="${SET.tab === k ? "on" : ""}" data-a="stTab" data-v="${k}">${i}${l}</button>`).join("")}</nav>
      <div class="st-body">${{ profile: PROFILE, security: SECURITY, access: ACCESS }[SET.tab]()}</div>
    </div>`;
};

/* ---------- Actions ---------- */
ACTIONS.stTab = el => { SET.tab = el.dataset.v; SET.saved = false; };
ACTIONS.setToast = el => { toast(el.dataset.v); return false; };
INPUTS.stName = el => { SET.name = el.value; SET.saved = false; return false; };
INPUTS.stTitle = el => { SET.title = el.value; SET.saved = false; return false; };
ACTIONS.stSaveProfile = () => {
  const n = (SET.name || ME.name).trim(); if (n) ME.name = n; ME.role = (SET.title || ME.role || "").trim();
  const pr = $(".sidebar .profile-t b"); if (pr) pr.textContent = ME.name;
  SET.saved = true; toast("Profile saved");
};
INPUTS.stPwCur = el => { SET.pw.cur = el.value; };
INPUTS.stPwNext = el => { SET.pw.next = el.value; };
INPUTS.stPwConfirm = el => { SET.pw.confirm = el.value; };
INPUTS.stPwShow = el => { SET.pw.show = el.checked; };
ACTIONS.stPwSave = () => { SET.pw = { cur: "", next: "", confirm: "", show: false }; toast("Password changed. Other devices will be asked to sign in again."); };
ACTIONS.stMfaStart = () => { SET.mfa = "setup"; SET.code = ""; setTimeout(() => { const i = $("#st-code"); if (i) i.focus(); }); };
ACTIONS.stMfaCancel = () => { SET.mfa = "off"; };
INPUTS.stCode = el => { SET.code = el.value.replace(/\D/g, "").slice(0, 6); };
ACTIONS.stMfaVerify = () => { if (!/^\d{6}$/.test(SET.code)) return false; SET.mfa = "on"; toast("Two-factor authentication is on"); };
ACTIONS.stMfaOff = () => { SET.mfa = "off"; toast("Two-factor authentication turned off"); };
ACTIONS.stRefresh = () => { SET.refreshed = "just now"; toast("Session refreshed. Your access is up to date."); };

JUMP.settings = () => { App.page = "settings"; App.modal = null; App.menu = null; render(); };
