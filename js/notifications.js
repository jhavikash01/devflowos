import { store } from "./store.js";
const root = ()=>document.getElementById("toast-root");
const ncList = ()=>document.getElementById("nc-list");
const badge = ()=>document.getElementById("notif-badge");

let unread = 0;
function fmtTime(ts){ const d=new Date(ts); return d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }

export function toast({ title, body="", type="info", duration=4000 }){
  if (!store.state.notifications) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="dot"></span><div class="ti"><div class="t"></div><div class="b"></div></div>`;
  el.querySelector(".t").textContent = title;
  el.querySelector(".b").textContent = body;
  root().appendChild(el);
  setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>el.remove(),250); }, duration);
  addToHistory({ title, body, type, ts: Date.now() });
}
function addToHistory(n){
  store.state.notifHistory.unshift(n);
  store.state.notifHistory = store.state.notifHistory.slice(0,30);
  store.save();
  unread++;
  renderBadge();
  renderHistory();
}
function renderBadge(){ const b=badge(); if (!b) return; b.textContent = unread; b.style.display = unread? "flex":"none"; }
export function renderHistory(){
  const l = ncList(); if (!l) return;
  if (!store.state.notifHistory.length){ l.innerHTML = `<div class="nc-empty">No notifications yet</div>`; return; }
  l.innerHTML = store.state.notifHistory.map(n=>`
    <div class="nc-item">
      <div class="t">${escape(n.title)}</div>
      ${n.body?`<div class="b">${escape(n.body)}</div>`:""}
      <div class="ts">${fmtTime(n.ts)}</div>
    </div>`).join("");
}
function escape(s){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
export function clearAll(){ store.state.notifHistory=[]; store.save(); renderHistory(); }
export function markAllRead(){ unread=0; renderBadge(); }
export function initNotifications(){ renderHistory(); renderBadge(); }
