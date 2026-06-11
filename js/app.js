import { store } from "./store.js";
import { initTheming } from "./themes.js";
import {
  initNotifications,
  toast,
  renderHistory,
  clearAll,
  markAllRead,
} from "./notifications.js";
import { APPS, openApp } from "./apps.js";
import { searchAll } from "./search.js";
import { initWidgets } from "./widgets.js";

/* BOOT SEQUENCE */
window.addEventListener("load", () => {
  initTheming();
  setTimeout(() => {
    document.getElementById("boot-screen").classList.add("hidden");
    document.getElementById("welcome-screen").classList.remove("hidden");
    const update = () => {
      const w = document.getElementById("welcome-time");
      if (w) {
        const n = new Date();
        w.textContent =
          n.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
          }) +
          " · " +
          n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    };
    update();
    const enter = () => {
      document.getElementById("welcome-screen").classList.add("hidden");
      document.getElementById("desktop").classList.remove("hidden");
      bootApp();
    };
    document.getElementById("welcome-enter").addEventListener("click", enter);
    document.addEventListener("keydown", function once(e) {
      if (e.key === "Enter") {
        document.removeEventListener("keydown", once);
        enter();
      }
    });
  }, 2400);
});

function bootApp() {
  initNotifications();
  initWidgets();
  buildStartMenu();
  bindTopbar();
  bindDesktopIcons();
  bindStartMenu();
  bindSpotlight();
  bindNotifCenter();
  bindContextMenu();
  bindShortcuts();
  setTimeout(
    () =>
      toast({
        title: "Welcome to DevFlow OS",
        body: "Try Cmd/Ctrl+K for Spotlight",
        type: "success",
      }),
    600,
  );
  setTimeout(
    () => toast({ title: "Tip", body: "Right-click the desktop for options" }),
    2200,
  );
}

function buildStartMenu() {
  const g = document.getElementById("sm-grid");
  g.innerHTML = Object.entries(APPS)
    .map(
      ([id, a]) =>
        `<button class="sm-tile" data-app="${id}"><div class="icon icon-${id === "calculator" ? "calc" : id}"></div><span>${a.name}</span></button>`,
    )
    .join("");
  g.querySelectorAll(".sm-tile").forEach((t) =>
    t.addEventListener("click", () => {
      openApp(t.dataset.app);
      closeStart();
    }),
  );
}
function bindTopbar() {
  document.getElementById("start-btn").addEventListener("click", toggleStart);
  document.getElementById("theme-btn").addEventListener("click", () => {
    const order = ["light", "dark", "midnight", "cyber"];
    const cur = store.state.theme;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    import("./themes.js").then((m) => m.applyTheme(next));
    toast({ title: "Theme: " + next, type: "success" });
  });
  document
    .getElementById("notif-btn")
    .addEventListener("click", toggleNotifCenter);
  document
    .getElementById("global-search")
    .addEventListener("focus", openSpotlight);
}
function bindDesktopIcons() {
  document
    .querySelectorAll(".desk-icon")
    .forEach((b) =>
      b.addEventListener("dblclick", () => openApp(b.dataset.app)),
    );
  document
    .querySelectorAll(".desk-icon")
    .forEach((b) => b.addEventListener("click", () => openApp(b.dataset.app)));
}
function bindStartMenu() {
  document.getElementById("sm-search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll("#sm-grid .sm-tile").forEach((t) => {
      t.style.display = t.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
  document.getElementById("sm-lock").addEventListener("click", () => {
    closeStart();
    document.getElementById("desktop").classList.add("hidden");
    document.getElementById("welcome-screen").classList.remove("hidden");
  });
  document
    .querySelector('.sm-foot-btn[data-app="settings"]')
    .addEventListener("click", () => {
      openApp("settings");
      closeStart();
    });
}
function toggleStart() {
  const m = document.getElementById("start-menu");
  m.classList.toggle("hidden");
  if (!m.classList.contains("hidden"))
    document.getElementById("sm-search").focus();
}
function closeStart() {
  document.getElementById("start-menu").classList.add("hidden");
}

function openSpotlight() {
  const s = document.getElementById("spotlight");
  s.classList.remove("hidden");
  const q = document.getElementById("spot-q");
  q.value = "";
  q.focus();
  render([], 0);
  document.getElementById("global-search").blur();
}
function closeSpotlight() {
  document.getElementById("spotlight").classList.add("hidden");
}
let spotSel = 0,
  spotItems = [];
function render(items, sel) {
  spotItems = items;
  spotSel = sel;
  const r = document.getElementById("spot-results");
  if (!items.length) {
    r.innerHTML = `<div class="spot-empty">Type to search apps, files, notes…</div>`;
    return;
  }
  r.innerHTML = items
    .map(
      (it, i) =>
        `<div class="spot-row ${i === sel ? "sel" : ""}"><div class="ico">${it.icon}</div><div class="meta"><div class="ttl">${esc(it.title)}</div><div class="sub">${esc(it.sub)}</div></div><span style="font-size:10px;opacity:.6">${it.type}</span></div>`,
    )
    .join("");
  r.querySelectorAll(".spot-row").forEach((row, i) =>
    row.addEventListener("click", () => {
      items[i].action();
      closeSpotlight();
    }),
  );
}
function bindSpotlight() {
  const q = document.getElementById("spot-q");
  q.addEventListener("input", () => render(searchAll(q.value), 0));
  q.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSpotlight();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      spotSel = Math.min(spotItems.length - 1, spotSel + 1);
      render(spotItems, spotSel);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      spotSel = Math.max(0, spotSel - 1);
      render(spotItems, spotSel);
    } else if (e.key === "Enter" && spotItems[spotSel]) {
      spotItems[spotSel].action();
      closeSpotlight();
    }
  });
  document.getElementById("spotlight").addEventListener("click", (e) => {
    if (e.target.id === "spotlight") closeSpotlight();
  });
}

function toggleNotifCenter() {
  const n = document.getElementById("notif-center");
  n.classList.toggle("hidden");
  if (!n.classList.contains("hidden")) {
    renderHistory();
    markAllRead();
  }
}
function bindNotifCenter() {
  document.getElementById("nc-clear").addEventListener("click", () => {
    clearAll();
    toast({ title: "Notifications cleared" });
  });
}

function bindContextMenu() {
  const m = document.getElementById("ctx-menu");
  document.getElementById("desktop").addEventListener("contextmenu", (e) => {
    if (
      e.target.closest(
        ".win,.widget,.taskbar,.topbar,.start-menu,.spotlight,.notif-center",
      )
    )
      return;
    e.preventDefault();
    m.innerHTML = `
      <div class="ctx-item" data-a="new-note">📝 New Note</div>
      <div class="ctx-item" data-a="settings">⚙️ Personalize</div>
      <div class="ctx-sep"></div>
      <div class="ctx-item" data-a="refresh">↻ Refresh</div>`;
    m.style.left = Math.min(window.innerWidth - 220, e.clientX) + "px";
    m.style.top = Math.min(window.innerHeight - 160, e.clientY) + "px";
    m.classList.remove("hidden");
    m.querySelectorAll(".ctx-item").forEach((it) =>
      it.addEventListener("click", () => {
        m.classList.add("hidden");
        if (it.dataset.a === "new-note") {
          const id = Date.now();
          store.state.notes.unshift({ id, title: "New Note", body: "" });
          store.save();
          openApp("notes");
        }
        if (it.dataset.a === "settings") openApp("settings");
        if (it.dataset.a === "refresh")
          toast({ title: "Refreshed", type: "success" });
      }),
    );
  });
  document.addEventListener("click", () => m.classList.add("hidden"));
}

function bindShortcuts() {
  document.addEventListener("keydown", (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSpotlight();
    } else if (meta && e.key === ",") {
      e.preventDefault();
      openApp("settings");
    } else if (e.key === "Escape") {
      closeSpotlight();
      closeStart();
      document.getElementById("notif-center").classList.add("hidden");
      document.getElementById("ctx-menu").classList.add("hidden");
    }
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
