const KEY = "DevFlow-os-state-v1";
const def = {
  theme: "dark",
  wallpaper: "aurora",
  notifications: true,
  reduceMotion: false,
  notes: [
    { id: 1, title: "Welcome to DevFlow OS", body: "This is your first note. Edit me!" },
    { id: 2, title: "Shortcuts", body: "Cmd/Ctrl+K — Spotlight\nCmd/Ctrl+, — Settings\nEsc — Close popups" },
  ],
  quickNotes: "",
  files: [
    { name: "Resume.pdf", type: "pdf" },
    { name: "Photos", type: "folder" },
    { name: "Project.zip", type: "archive" },
    { name: "Budget.xlsx", type: "sheet" },
    { name: "Music", type: "folder" },
    { name: "Readme.md", type: "doc" },
  ],
  widgets: { clock:{x:null,y:null}, weather:{x:null,y:null}, calendar:{x:null,y:null}, notes:{x:null,y:null} },
  notifHistory: [],
};
export const store = {
  state: load(),
  save(){ try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch {} },
  set(patch){ Object.assign(this.state, patch); this.save(); },
};
function load(){
  try { const r = localStorage.getItem(KEY); if (r) return { ...def, ...JSON.parse(r) }; } catch {}
  return structuredClone(def);
}
