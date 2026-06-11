let z = 100;
let active = null;
const wins = new Map();
const root = ()=>document.getElementById("windows-root");
const taskList = ()=>document.getElementById("task-list");

export function openWindow({ id, title, icon="🪟", width=560, height=400, content, onMount }){
  if (wins.has(id)){
    const w = wins.get(id);
    if (w.minimized) restoreWindow(id);
    focusWindow(id);
    return w;
  }
  const el = document.createElement("section");
  el.className = "win";
  el.dataset.id = id;
  el.setAttribute("role","dialog");
  el.setAttribute("aria-label", title);
  el.style.width = width+"px";
  el.style.height = height+"px";
  const r = root().getBoundingClientRect();
  const x = Math.max(20, Math.min(r.width - width - 20, (r.width - width)/2 + (Math.random()*60-30)));
  const y = Math.max(20, Math.min(r.height - height - 20, (r.height - height)/2 + (Math.random()*60-30)));
  el.style.left = x+"px"; el.style.top = y+"px";
  el.style.zIndex = ++z;
  el.innerHTML = `
    <header class="win-head" data-drag>
      <div class="win-controls">
        <button class="wc wc-close" aria-label="Close"></button>
        <button class="wc wc-min" aria-label="Minimize"></button>
        <button class="wc wc-max" aria-label="Maximize"></button>
      </div>
      <div class="win-title">${title}</div>
    </header>
    <div class="win-body"></div>
    <div class="win-resize" aria-hidden="true"></div>`;
  el.querySelector(".win-body").appendChild(typeof content === "string" ? Object.assign(document.createElement("div"),{innerHTML:content}) : content);
  root().appendChild(el);
  const win = { id, el, title, icon, minimized:false, maximized:false };
  wins.set(id, win);
  addTaskItem(win);
  bindWindow(win);
  focusWindow(id);
  onMount && onMount(el);
  return win;
}
function addTaskItem(w){
  const tl = taskList(); const empty = tl.querySelector(".task-empty"); if (empty) empty.remove();
  const b = document.createElement("button");
  b.className = "task-item"; b.dataset.id = w.id; b.title = w.title; b.textContent = w.icon;
  b.setAttribute("aria-label", w.title);
  b.addEventListener("click", ()=>{
    const win = wins.get(w.id); if (!win) return;
    if (win.minimized) restoreWindow(w.id);
    else if (active === w.id) minimizeWindow(w.id);
    else focusWindow(w.id);
  });
  tl.appendChild(b);
}
function bindWindow(w){
  const el = w.el;
  el.addEventListener("mousedown", ()=>focusWindow(w.id));
  el.querySelector(".wc-close").addEventListener("click", e=>{e.stopPropagation();closeWindow(w.id);});
  el.querySelector(".wc-min").addEventListener("click", e=>{e.stopPropagation();minimizeWindow(w.id);});
  el.querySelector(".wc-max").addEventListener("click", e=>{e.stopPropagation();toggleMax(w.id);});
  const head = el.querySelector(".win-head");
  head.addEventListener("dblclick", ()=>toggleMax(w.id));
  makeDraggable(el, head);
  makeResizable(el, el.querySelector(".win-resize"));
}
function makeDraggable(el, handle){
  let sx,sy,ox,oy,drag=false;
  const down = (e)=>{
    if (el.classList.contains("maximized")) return;
    drag=true; const p=pt(e); sx=p.x; sy=p.y;
    const r=el.getBoundingClientRect(); ox=r.left; oy=r.top - 44;
    e.preventDefault();
  };
  const move = (e)=>{ if(!drag)return; const p=pt(e); el.style.left = (ox + p.x - sx)+"px"; el.style.top = (oy + p.y - sy)+"px"; };
  const up = ()=>drag=false;
  handle.addEventListener("mousedown", down); handle.addEventListener("touchstart", down,{passive:false});
  window.addEventListener("mousemove", move); window.addEventListener("touchmove", move,{passive:false});
  window.addEventListener("mouseup", up); window.addEventListener("touchend", up);
}
function makeResizable(el, handle){
  let sx,sy,sw,sh,rz=false;
  const down=(e)=>{ rz=true; const p=pt(e); sx=p.x; sy=p.y; const r=el.getBoundingClientRect(); sw=r.width; sh=r.height; e.preventDefault();};
  const move=(e)=>{ if(!rz)return; const p=pt(e); el.style.width=Math.max(280, sw + p.x - sx)+"px"; el.style.height=Math.max(200, sh + p.y - sy)+"px"; };
  const up=()=>rz=false;
  handle.addEventListener("mousedown",down); handle.addEventListener("touchstart",down,{passive:false});
  window.addEventListener("mousemove",move); window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("mouseup",up); window.addEventListener("touchend",up);
}
function pt(e){ if (e.touches) return {x:e.touches[0].clientX,y:e.touches[0].clientY}; return {x:e.clientX,y:e.clientY}; }
export function focusWindow(id){
  const w = wins.get(id); if (!w) return;
  w.el.style.zIndex = ++z;
  active = id;
  taskList().querySelectorAll(".task-item").forEach(t=>t.classList.toggle("active", t.dataset.id===id));
}
export function closeWindow(id){
  const w = wins.get(id); if (!w) return;
  w.el.classList.add("closing");
  setTimeout(()=>{ w.el.remove(); wins.delete(id); const t=taskList().querySelector(`[data-id="${id}"]`); t&&t.remove(); if (active===id) active=null; }, 220);
}
export function minimizeWindow(id){
  const w = wins.get(id); if (!w) return;
  w.minimized = true; w.el.classList.add("minimized");
  setTimeout(()=>{ w.el.style.display="none"; w.el.classList.remove("minimized"); }, 240);
  taskList().querySelector(`[data-id="${id}"]`)?.classList.remove("active");
}
export function restoreWindow(id){
  const w = wins.get(id); if (!w) return;
  w.minimized = false; w.el.style.display=""; focusWindow(id);
}
function toggleMax(id){
  const w = wins.get(id); if (!w) return;
  w.maximized = !w.maximized;
  w.el.classList.toggle("maximized", w.maximized);
}
