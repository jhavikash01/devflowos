# Lovable OS

A polished, browser-based operating system experience built with vanilla HTML, CSS, and JavaScript.

## Run locally

No build step. Just open `index.html` in any modern browser.

For the cleanest experience (ES modules require http), run a tiny static server:

```bash
# Python 3
python3 -m http.server 5173
# or Node
npx serve .
```

Then open http://localhost:5173

## Features

- Boot, welcome, and desktop screens with smooth animations
- 4 themes: Light, Dark, Midnight, Cyber (persisted to localStorage)
- 8 wallpapers
- Window manager: drag, resize, minimize, maximize, close, focus
- Taskbar, Start menu, Spotlight search (Cmd/Ctrl+K)
- Notification center + animated toasts
- Apps: Files, Notes, Browser, Terminal, Calculator, Settings
- Desktop widgets: Clock, Weather, Calendar, Quick Notes
- Context menu, keyboard shortcuts, ARIA labels, responsive down to 375px

## Shortcuts

- `Cmd/Ctrl + K` — Spotlight
- `Cmd/Ctrl + ,` — Settings
- `Esc` — Close popups
