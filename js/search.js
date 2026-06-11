import { store } from "./store.js";
import { APPS, openApp } from "./apps.js";

export function searchAll(q){
  q = q.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  Object.entries(APPS).forEach(([id,a])=>{ if (a.name.toLowerCase().includes(q)) out.push({type:"App",icon:a.icon,title:a.name,sub:"Application",action:()=>openApp(id)}); });
  store.state.files.forEach(f=>{ if (f.name.toLowerCase().includes(q)) out.push({type:"File",icon:"📄",title:f.name,sub:"File",action:()=>openApp("files")}); });
  store.state.notes.forEach(n=>{ if ((n.title+" "+n.body).toLowerCase().includes(q)) out.push({type:"Note",icon:"📝",title:n.title||"Untitled",sub:(n.body||"").slice(0,60),action:()=>openApp("notes")}); });
  return out.slice(0,12);
}
