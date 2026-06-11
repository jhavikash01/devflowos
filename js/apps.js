import { openWindow } from "./windows.js";
import { store } from "./store.js";
import { toast } from "./notifications.js";
import { THEMES, WALLPAPERS, applyTheme, applyWallpaper } from "./themes.js";

export const APPS = {
  files: { name: "Files", icon: "📁", open: openFiles },
  notes: { name: "Notes", icon: "📝", open: openNotes },
  browser: { name: "Browser", icon: "🌐", open: openBrowser },
  terminal: { name: "Terminal", icon: ">_", open: openTerminal },
  settings: { name: "Settings", icon: "⚙️", open: openSettings },
  calculator: { name: "Calculator", icon: "🧮", open: openCalc },
};

export function openApp(id) {
  const a = APPS[id];
  if (a) a.open();
}

/* ---------- FILES ---------- */
function openFiles() {
  const wrap = document.createElement("div");
  wrap.className = "app-files";
  wrap.innerHTML = `
    <aside class="fs-side">
      <h5>Locations</h5>
      <div class="fs-side-item active">🏠 Home</div>
      <div class="fs-side-item">📄 Documents</div>
      <div class="fs-side-item">🖼️ Pictures</div>
      <div class="fs-side-item">⬇️ Downloads</div>
      <div class="fs-side-item">🗑️ Trash</div>
    </aside>
    <main class="fs-main"><div class="fs-grid" id="fs-grid"></div></main>`;
  const icons = {
    folder: "📁",
    pdf: "📕",
    archive: "🗜️",
    sheet: "📊",
    doc: "📄",
  };
  const renderGrid = () => {
    const g = wrap.querySelector("#fs-grid");
    if (!store.state.files.length) {
      g.innerHTML = `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)">No files yet</div>`;
      return;
    }
    g.innerHTML = store.state.files
      .map(
        (f) =>
          `<div class="fs-tile"><div class="fi">${icons[f.type] || "📄"}</div><span>${f.name}</span></div>`,
      )
      .join("");
    g.querySelectorAll(".fs-tile").forEach((t, i) =>
      t.addEventListener("dblclick", () =>
        toast({ title: "Opened " + store.state.files[i].name }),
      ),
    );
  };
  openWindow({
    id: "files",
    title: "Files",
    icon: "📁",
    width: 680,
    height: 440,
    content: wrap,
    onMount: renderGrid,
  });
}

/* ---------- NOTES ---------- */
function openNotes() {
  const wrap = document.createElement("div");
  wrap.className = "app-notes";
  wrap.innerHTML = `
    <div class="notes-toolbar"><button id="n-new">+ New Note</button><button id="n-del">Delete</button></div>
    <div class="notes-area">
      <aside class="notes-list" id="n-list"></aside>
      <main class="notes-editor"><input id="n-title" placeholder="Title"/><textarea id="n-body" placeholder="Start writing…"></textarea></main>
    </div>`;
  let sel = store.state.notes[0]?.id;
  const renderList = () => {
    const l = wrap.querySelector("#n-list");
    l.innerHTML = store.state.notes
      .map(
        (n) =>
          `<div class="note-it ${n.id === sel ? "active" : ""}" data-id="${n.id}"><div class="nt">${esc(n.title || "Untitled")}</div><div class="np">${esc((n.body || "").slice(0, 40))}</div></div>`,
      )
      .join("");
    l.querySelectorAll(".note-it").forEach((it) =>
      it.addEventListener("click", () => {
        sel = +it.dataset.id;
        loadSel();
        renderList();
      }),
    );
  };
  const loadSel = () => {
    const n = store.state.notes.find((x) => x.id === sel);
    if (!n) return;
    wrap.querySelector("#n-title").value = n.title;
    wrap.querySelector("#n-body").value = n.body;
  };
  const saveSel = () => {
    const n = store.state.notes.find((x) => x.id === sel);
    if (!n) return;
    n.title = wrap.querySelector("#n-title").value;
    n.body = wrap.querySelector("#n-body").value;
    store.save();
    renderList();
  };
  openWindow({
    id: "notes",
    title: "Notes",
    icon: "📝",
    width: 640,
    height: 420,
    content: wrap,
    onMount: (el) => {
      renderList();
      loadSel();
      el.querySelector("#n-title").addEventListener("input", saveSel);
      el.querySelector("#n-body").addEventListener("input", saveSel);
      el.querySelector("#n-new").addEventListener("click", () => {
        const id = Date.now();
        store.state.notes.unshift({ id, title: "New Note", body: "" });
        store.save();
        sel = id;
        renderList();
        loadSel();
      });
      el.querySelector("#n-del").addEventListener("click", () => {
        store.state.notes = store.state.notes.filter((n) => n.id !== sel);
        store.save();
        sel = store.state.notes[0]?.id;
        renderList();
        loadSel();
      });
    },
  });
}

/* ---------- BROWSER ---------- */
function openBrowser() {
  const wrap = document.createElement("div");
  wrap.className = "app-browser";
  wrap.innerHTML = `
    <div class="bw-bar">
      <button class="bw-btn">←</button><button class="bw-btn">→</button><button class="bw-btn">↻</button>
      <div class="bw-url">https://devflow.dev</div>
    </div>
    <div class="bw-content">
      <div style="font-size:60px">🌐</div>
      <h2>Welcome to DevFlow Browser</h2>
      <p style="color:#666">A demo browser surface — wire up an iframe to your favorite URL.</p>
    </div>`;
  openWindow({
    id: "browser",
    title: "Browser",
    icon: "🌐",
    width: 760,
    height: 500,
    content: wrap,
  });
}

/* ---------- TERMINAL ---------- */
function openTerminal() {
  const wrap = document.createElement("div");
  wrap.className = "app-term";
  wrap.innerHTML = `<div id="term-out"></div><div class="term-input"><span class="term-prompt">DevFlow@os:~$</span><input id="term-in" autocomplete="off" spellcheck="false" aria-label="Terminal input"/></div>`;
  const print = (out, s) => {
    const d = document.createElement("div");
    d.className = "term-line";
    d.innerHTML = s;
    out.appendChild(d);
    out.parentElement.scrollTop = out.parentElement.scrollHeight;
  };
  const cmds = {
    help: () =>
      "Available: help, about, theme [light|dark|midnight|cyber], date, whoami, ls, clear, echo",
    about: () => "DevFlow OS v1.0 — a polished web desktop experience.",
    date: () => new Date().toString(),
    whoami: () => "DevFlow",
    ls: () => store.state.files.map((f) => f.name).join("  "),
    echo: (a) => a.join(" "),
  };
  openWindow({
    id: "terminal",
    title: "Terminal",
    icon: ">_",
    width: 600,
    height: 380,
    content: wrap,
    onMount: (el) => {
      const out = el.querySelector("#term-out"),
        inp = el.querySelector("#term-in");
      print(
        out,
        `<span style="color:#7c5cff">DevFlow OS</span> Terminal — type <span style="color:#22c55e">help</span>`,
      );
      inp.focus();
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const v = inp.value.trim();
          print(
            out,
            `<span class="term-prompt">DevFlow@os:~$</span> <span class="term-cmd">${esc(v)}</span>`,
          );
          const [c, ...a] = v.split(/\s+/);
          if (c === "clear") {
            out.innerHTML = "";
          } else if (c === "theme" && a[0]) {
            applyTheme(a[0]);
            print(out, `theme set to ${esc(a[0])}`);
          } else if (cmds[c]) print(out, esc(cmds[c](a)));
          else if (v) print(out, `command not found: ${esc(c)}`);
          inp.value = "";
        }
      });
      el.addEventListener("click", () => inp.focus());
    },
  });
}

/* ---------- CALCULATOR ---------- */
function openCalc() {
  const wrap = document.createElement("div");
  wrap.className = "app-calc";
  const keys = [
    "C",
    "±",
    "%",
    "÷",
    "7",
    "8",
    "9",
    "×",
    "4",
    "5",
    "6",
    "−",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
  ];
  wrap.innerHTML = `<div class="calc-display" id="cd">0</div><div class="calc-grid" id="cg"></div>`;
  let cur = "0",
    prev = null,
    op = null,
    reset = false;
  const upd = () =>
    (wrap.querySelector("#cd").textContent =
      cur.length > 12 ? Number(cur).toExponential(6) : cur);
  const calc = (a, b, o) => {
    a = +a;
    b = +b;
    return o === "+"
      ? a + b
      : o === "−"
        ? a - b
        : o === "×"
          ? a * b
          : o === "÷"
            ? b === 0
              ? "Error"
              : a / b
            : b;
  };
  openWindow({
    id: "calculator",
    title: "Calculator",
    icon: "🧮",
    width: 300,
    height: 380,
    content: wrap,
    onMount: (el) => {
      const g = el.querySelector("#cg");
      keys.forEach((k) => {
        const b = document.createElement("button");
        b.className =
          "calc-btn" +
          ("÷×−+".includes(k) ? " op" : "") +
          (k === "=" ? " eq" : "");
        b.textContent = k;
        b.addEventListener("click", () => {
          if (/\d/.test(k)) {
            cur = reset || cur === "0" ? k : cur + k;
            reset = false;
          } else if (k === ".") {
            if (!cur.includes(".")) cur += ".";
          } else if (k === "C") {
            cur = "0";
            prev = null;
            op = null;
          } else if (k === "±") {
            cur = String(-parseFloat(cur));
          } else if (k === "%") {
            cur = String(parseFloat(cur) / 100);
          } else if ("÷×−+".includes(k)) {
            if (op && prev !== null && !reset) {
              cur = String(calc(prev, cur, op));
            }
            prev = cur;
            op = k;
            reset = true;
          } else if (k === "=") {
            if (op && prev !== null) {
              cur = String(calc(prev, cur, op));
              op = null;
              prev = null;
              reset = true;
            }
          }
          upd();
        });
        g.appendChild(b);
      });
    },
  });
}

/* ---------- SETTINGS ---------- */
function openSettings() {
  const wrap = document.createElement("div");
  wrap.className = "app-settings";
  wrap.innerHTML = `
    <aside class="set-side">
      <h5>Personalization</h5>
      <button class="set-tab active" data-t="theme">🎨 Theme</button>
      <button class="set-tab" data-t="wp">🖼️ Wallpaper</button>
      <button class="set-tab" data-t="sys">⚙️ System</button>
      <button class="set-tab" data-t="about">ℹ️ About</button>
    </aside>
    <main class="set-main" id="set-main"></main>`;
  const panes = {
    theme: () =>
      `<div class="set-section"><h3>Choose a theme</h3><div class="theme-grid">${THEMES.map(
        (t) => `
      <div class="theme-tile ${t.id === store.state.theme ? "active" : ""}" data-id="${t.id}">
        <div class="theme-prev" style="background:linear-gradient(135deg,${t.colors[0]},${t.colors[1]},${t.colors[2]})"></div>
        <span>${t.name}</span>
      </div>`,
      ).join("")}</div></div>`,
    wp: () =>
      `<div class="set-section"><h3>Wallpaper</h3><div class="wp-grid">${WALLPAPERS.map(
        (w) => `
      <div class="wp-tile ${w.id === store.state.wallpaper ? "active" : ""}" data-id="${w.id}" style="background:${w.bg}" aria-label="${w.name}" role="button" tabindex="0"></div>`,
      ).join("")}</div></div>`,
    sys: () => `
      <div class="set-section"><h3>System</h3>
        <div class="set-row"><div><div class="lbl">Notifications</div><div class="desc">Show toast notifications</div></div><div class="switch ${store.state.notifications ? "on" : ""}" data-k="notifications" role="switch" aria-checked="${store.state.notifications}" tabindex="0"></div></div>
        <div class="set-row"><div><div class="lbl">Reduce motion</div><div class="desc">Minimize animations</div></div><div class="switch ${store.state.reduceMotion ? "on" : ""}" data-k="reduceMotion" role="switch" aria-checked="${store.state.reduceMotion}" tabindex="0"></div></div>
      </div>`,
    about: () => `<div class="set-section"><h3>About DevFlow OS</h3>
      <p style="font-size:13px;color:var(--muted);line-height:1.7">A polished web operating system showcase. Built with vanilla HTML, CSS, and JavaScript. No frameworks. No build tools. Just craft.</p>
      <div style="margin-top:14px;padding:14px;background:rgba(127,127,127,.08);border-radius:10px;font-size:12px">
        <div><strong>Version:</strong> 1.0.0</div>
        <div><strong>Build:</strong> ${new Date().getFullYear()}.06</div>
        <div><strong>Engine:</strong> DevFlow WebKit</div>
      </div></div>`,
  };
  const render = (tab) => {
    const m = wrap.querySelector("#set-main");
    m.innerHTML = panes[tab]();
    if (tab === "theme")
      m.querySelectorAll(".theme-tile").forEach((t) =>
        t.addEventListener("click", () => {
          applyTheme(t.dataset.id);
          render("theme");
          toast({
            title: "Theme updated",
            body: t.dataset.id,
            type: "success",
          });
        }),
      );
    if (tab === "wp")
      m.querySelectorAll(".wp-tile").forEach((t) =>
        t.addEventListener("click", () => {
          applyWallpaper(t.dataset.id);
          render("wp");
          toast({ title: "Wallpaper updated", type: "success" });
        }),
      );
    if (tab === "sys")
      m.querySelectorAll(".switch").forEach((s) =>
        s.addEventListener("click", () => {
          const k = s.dataset.k;
          store.state[k] = !store.state[k];
          store.save();
          render("sys");
          document.documentElement.classList.toggle(
            "reduce-motion",
            !!store.state.reduceMotion,
          );
        }),
      );
  };
  openWindow({
    id: "settings",
    title: "Settings",
    icon: "⚙️",
    width: 680,
    height: 480,
    content: wrap,
    onMount: (el) => {
      el.querySelectorAll(".set-tab").forEach((t) =>
        t.addEventListener("click", () => {
          el.querySelectorAll(".set-tab").forEach((x) =>
            x.classList.remove("active"),
          );
          t.classList.add("active");
          render(t.dataset.t);
        }),
      );
      render("theme");
    },
  });
}

function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
