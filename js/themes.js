import { store } from "./store.js";
export const THEMES = [
  { id:"light", name:"Light", colors:["#f4f5f9","#5b6cff","#23d3ff"] },
  { id:"dark", name:"Dark", colors:["#0b0d18","#7c5cff","#23d3ff"] },
  { id:"midnight", name:"Midnight", colors:["#03050d","#3b82f6","#06b6d4"] },
  { id:"cyber", name:"Cyber", colors:["#0a0014","#ff2bd6","#00ffe1"] },
];
export const WALLPAPERS = [
  { id:"aurora", name:"Aurora", bg:"linear-gradient(135deg,#7c5cff 0%,#23d3ff 50%,#ff2bd6 100%)" },
  { id:"ocean", name:"Ocean", bg:"linear-gradient(135deg,#0a2540 0%,#1e7fa3 100%)" },
  { id:"sunset", name:"Sunset", bg:"linear-gradient(135deg,#ff6e7f 0%,#bfe9ff 100%)" },
  { id:"mountain", name:"Mountain", bg:"linear-gradient(180deg,#0f2027 0%,#203a43 50%,#2c5364 100%)" },
  { id:"forest", name:"Forest", bg:"linear-gradient(135deg,#134e5e 0%,#71b280 100%)" },
  { id:"pastel", name:"Pastel", bg:"linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 50%,#fbc2eb 100%)" },
  { id:"midnight", name:"Midnight", bg:"radial-gradient(1200px 700px at 20% 10%,#1a1f4d 0%,transparent 60%),radial-gradient(900px 600px at 80% 80%,#2a1257 0%,transparent 55%),linear-gradient(135deg,#0a0d1f,#0f1330)" },
  { id:"neon", name:"Neon", bg:"radial-gradient(1000px 700px at 20% 10%,#3a006b 0%,transparent 60%),radial-gradient(900px 600px at 80% 90%,#00566b 0%,transparent 55%),linear-gradient(180deg,#0a0014,#15002a)" },
];
export function applyTheme(id){
  document.documentElement.setAttribute("data-theme", id);
  store.set({ theme: id });
}
export function applyWallpaper(id){
  const w = WALLPAPERS.find(x=>x.id===id) || WALLPAPERS[0];
  document.getElementById("wallpaper").style.background = w.bg;
  document.getElementById("wallpaper").style.backgroundSize = "cover";
  store.set({ wallpaper: id });
}
export function initTheming(){
  applyTheme(store.state.theme);
  applyWallpaper(store.state.wallpaper);
}
