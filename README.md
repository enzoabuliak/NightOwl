<div align="center">

# 🦉 &nbsp; NightOwl

**A macOS menu bar app that tracks how late you stay up working — and roasts you for it.**

A dark-mode tracker with a Tamagotchi-style owl who gets hungry, judges you, and dies if you ignore it.
Designed around the [Flexoki](https://stephango.com/flexoki) palette and Swiss/Bauhaus typography.

<sub>`Space Grotesk` · `JetBrains Mono` · `flx-orange-400` · `flx-black`</sub>

</div>

---

## 01 — What it does

- Detects real keyboard / mouse activity (idle > 5 min pauses the clock)
- Stores when you stopped working each night in `data.json`
- Sends one creative shame notification per hour after 10 PM
- Includes a virtual owl that gets hungry, demands food, and dies if you neglect it
- Exports a weekly summary to Obsidian as a new note
- Shows a full dashboard with three layouts and five timeframes

---

## 02 — Install

You need Python 3. Check with:

```bash
python3 --version
```

If that prints a version, clone and set up:

```bash
git clone https://github.com/YOUR_USERNAME/nightowl.git
cd nightowl
bash setup.sh
```

`setup.sh` creates a virtual environment in `./venv` and installs three packages: `rumps`, `matplotlib`, `pyobjc-framework-WebKit`.

---

## 03 — Run

```bash
bash launch.sh
```

A **🦉** appears in your menu bar near the clock. Click it to open the dropdown.

> Leave Terminal open in the background. Closing it stops the app. <br>
> (Or build the `.app` bundle — see section `08`.)

---

## 04 — The menu

Click the owl in your menu bar. A styled HTML popover slides down with these items:

| `01` | Open dashboard      | `⌘D` |
|------|---------------------|------|
| `02` | Today's stats       | `→`  |
| `03` | Pet stats           | `→`  |
| `04` | Feed the owl        |      |
| `05` | Export to Obsidian  | `↗`  |
| `06` | Quit NightOwl       | `⌘Q` |

The popover is not a native macOS menu — it's a borderless `NSPanel` containing a `WKWebView`, rendered with HTML + CSS so it can match the design exactly. Clicks fire back to Python via `WKScriptMessageHandler`.

---

## 05 — The dashboard

Opens in your browser. Three switchable layouts:

- **Cards** &nbsp; — &nbsp; Stat row + mid panels + chart
- **Hero** &nbsp; — &nbsp; Giant shame score with mini-stats and a verdict
- **Timeline** &nbsp; — &nbsp; Day-by-day list with inline bars

Five timeframes: `Today` · `Week` · `Month` · `6 months` · `All time`.

Color tone runs across the four severity levels:

| Tone       | Hex        | Meaning           |
|------------|------------|-------------------|
| 🟢 `--gr`  | `#879A39`  | Before 10 PM      |
| 🟡 `--ye`  | `#D0A215`  | 10 PM – Midnight  |
| 🟠 `--or`  | `#DA702C`  | Midnight – 2 AM   |
| 🔴 `--re`  | `#D14D41`  | After 2 AM        |

---

## 06 — The owl

The owl is a real Tamagotchi.

- Hunger climbs while you're active. Climbs faster after 10 PM.
- Eight moods — `happy` · `content` · `suspicious` · `worried` · `hungry` · `starving` · `critical` · `dead` — drive the menu-bar icon and the SVG character inside the dropdown.
- At hunger `100`, the owl dies. It respawns at `70`. It remembers.

Feed it via the menu. Each feed reduces hunger by `45`.

---

## 07 — File layout

```
nightowl/
├── nightowl.py           — main rumps app, ticks every 60s
├── tracker.py            — ioreg HIDIdleTime polling, JSON storage
├── owl_pet.py            — hunger / mood / feeding state machine
├── shamer.py             — shame notification library (sharp · dry · gentle)
├── popover.py            — custom NSPanel + WKWebView popover
├── dropdown_html.py      — generates the styled dropdown HTML
├── dashboard.py          — generates the React dashboard HTML
├── obsidian.py           — exports weekly summary via obsidian:// URI
│
├── design-system.css     — Flexoki tokens + typography
├── styles.css            — component styles (Swiss/Bauhaus restraint)
├── owl.jsx               — geometric owl SVG component
├── data.jsx              — mock data + helpers (shame score, mood, tone)
├── dashboard.jsx         — three dashboard layouts + chart
├── menubar.jsx           — preview-only (not used in production)
├── app.jsx               — preview-only
└── tweaks-panel.jsx      — preview-only
```

---

## 08 — Build a standalone `.app`

Coming soon — a `setup_app.py` using `py2app` lets you build a double-clickable `NightOwl.app`. Friends drag it to `/Applications` and launch it like any other app.

> Note: because the app isn't signed with a paid Apple Developer ID, macOS will warn "unidentified developer" the first time. Friends right-click → Open to bypass it once.

---

## 09 — Tech stack

| Layer            | Stack                                                    |
|------------------|----------------------------------------------------------|
| Menu bar         | `rumps` (`NSStatusBar` wrapper)                           |
| Popover          | `PyObjC` + `NSPanel` + `WKWebView`                        |
| Dashboard        | React 18 + Babel Standalone, self-contained HTML          |
| Chart            | Inline SVG, no chart library                              |
| Activity sensor  | `ioreg -c IOHIDSystem` → `HIDIdleTime`                    |
| Notifications    | `NSUserNotificationCenter` via `rumps.notification`       |
| Storage          | Plain JSON files (`data.json`, `pet.json`)                |
| Design system    | [Flexoki](https://stephango.com/flexoki) by Steph Ango    |

---

## License

`MIT`. Do what you want. Sleep when you can.
