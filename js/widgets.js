import { store } from "./store.js";

function tick(){
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  const date = now.toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" });
  const trayClock = document.getElementById("tray-clock");
  if (trayClock) trayClock.innerHTML = `<div>${time}</div><div style="font-size:10px;font-weight:500;color:var(--muted)">${date}</div>`;
  const wt = document.getElementById("w-clock-time"); if (wt) wt.textContent = now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  const wd = document.getElementById("w-clock-date"); if (wd) wd.textContent = date;
  const cm = document.getElementById("w-cal-month"); if (cm) cm.textContent = now.toLocaleDateString([], { month:"long" });
  const cd = document.getElementById("w-cal-day"); if (cd) cd.textContent = now.getDate();
  const cw = document.getElementById("w-cal-weekday"); if (cw) cw.textContent = now.toLocaleDateString([], { weekday:"long" });
  const wtime = document.getElementById("welcome-time"); if (wtime) wtime.textContent = now.toLocaleDateString([], { weekday:"long", month:"long", day:"numeric" }) + " · " + time;
}

export function initWidgets(){
  tick(); setInterval(tick, 1000);
  const qn = document.getElementById("quick-notes");
  if (qn){
    qn.value = store.state.quickNotes || "";
    qn.addEventListener("input", ()=>{ store.state.quickNotes = qn.value; store.save(); });
  }
  document.querySelectorAll(".widget").forEach(w=>makeWidgetDraggable(w));
}
function makeWidgetDraggable(el){
  const handle = el.querySelector(".widget-handle"); if (!handle) return;
  let sx,sy,ox,oy,drag=false;
  handle.addEventListener("mousedown",(e)=>{
    drag=true; sx=e.clientX; sy=e.clientY;
    const r=el.getBoundingClientRect(); ox=r.left; oy=r.top;
    el.style.position="fixed"; el.style.left=ox+"px"; el.style.top=oy+"px"; el.style.zIndex=40; el.style.margin=0;
    e.preventDefault();
  });
  window.addEventListener("mousemove",(e)=>{ if(!drag)return; el.style.left=(ox+e.clientX-sx)+"px"; el.style.top=(oy+e.clientY-sy)+"px"; });
  window.addEventListener("mouseup",()=>drag=false);
}
