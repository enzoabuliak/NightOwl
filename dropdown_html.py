"""
dropdown_html.py — Generates the styled menu-bar dropdown HTML from the
Claude Design `OwlDropdown` component. Rendered inside the popover WKWebView.

Static HTML + inline CSS (no React needed for this small surface). The
design tokens are imported from design-system.css; the dropdown rules from
styles.css. Action clicks call `act('name')` which posts to Python via
window.webkit.messageHandlers.nightowl.
"""

import os
from datetime import datetime

from paths import APP_DIR


# ── Owl SVG (geometric Bauhaus, mirrors owl.jsx) ─────────────────────────────

def owl_svg(mood, size=42):
    """Hand-converted from the Owl React component for static HTML render."""
    is_dead = mood == "dead"
    # Pupil sizing per mood (matches the JSX defaults)
    if mood in ("hungry", "starving"):
        pupil_r, pupil_dx_l, pupil_dx_r, pupil_dy = 5, 0, 0, 0
    elif mood == "critical":
        pupil_r, pupil_dx_l, pupil_dx_r, pupil_dy = 1.4, 0, 0, 0
    elif mood == "suspicious":
        pupil_r, pupil_dx_l, pupil_dx_r, pupil_dy = 3, 2, -2, 0
    elif mood == "worried":
        pupil_r, pupil_dx_l, pupil_dx_r, pupil_dy = 3, 0, 0, 2
    else:
        pupil_r, pupil_dx_l, pupil_dx_r, pupil_dy = 3, 0, 0, 0

    # Brow
    brow_svg = ""
    if mood in ("suspicious", "critical", "starving"):  # down/angry
        brow_svg = (
            '<path d="M 31 27 L 44 33" stroke="var(--flx-base-700)" stroke-width="2" fill="none"/>'
            '<path d="M 69 27 L 56 33" stroke="var(--flx-base-700)" stroke-width="2" fill="none"/>'
        )
    elif mood == "worried":  # up/raised
        brow_svg = (
            '<path d="M 31 32 L 44 27" stroke="var(--flx-base-700)" stroke-width="2" fill="none"/>'
            '<path d="M 69 32 L 56 27" stroke="var(--flx-base-700)" stroke-width="2" fill="none"/>'
        )

    # Beak
    if mood in ("hungry", "starving", "critical"):  # open mouth
        beak = '<path d="M 46 49 L 54 49 L 50 58 Z" fill="var(--or)" />'
    else:
        beak = '<path d="M 46 48 L 54 48 L 50 54 Z" fill="var(--or)" />'

    # Eyes (X if dead, otherwise circle + pupil)
    if is_dead:
        eyes = (
            '<g stroke="var(--flx-base-700)" stroke-width="2" stroke-linecap="square">'
            '<line x1="33" y1="33" x2="43" y2="43"/>'
            '<line x1="43" y1="33" x2="33" y2="43"/>'
            '<line x1="57" y1="33" x2="67" y2="43"/>'
            '<line x1="67" y1="33" x2="57" y2="43"/>'
            '</g>'
        )
    else:
        eyes = (
            f'<circle cx="38" cy="38" r="8" fill="var(--flx-black)" stroke="var(--flx-base-700)" stroke-width="1"/>'
            f'<circle cx="{38 + pupil_dx_l}" cy="{38 + pupil_dy}" r="{pupil_r}" fill="var(--or)"/>'
            f'<circle cx="62" cy="38" r="8" fill="var(--flx-black)" stroke="var(--flx-base-700)" stroke-width="1"/>'
            f'<circle cx="{62 + pupil_dx_r}" cy="{38 + pupil_dy}" r="{pupil_r}" fill="var(--or)"/>'
        )

    height = int(size * 1.1)
    return f'''<svg viewBox="0 0 100 110" width="{size}" height="{height}" style="display:block;overflow:visible" aria-hidden="true">
  <g stroke="var(--or)" stroke-width="1.8" stroke-linecap="square" fill="none">
    <path d="M 40 102 V 108 M 44 102 V 108 M 48 102 V 108"/>
    <path d="M 52 102 V 108 M 56 102 V 108 M 60 102 V 108"/>
  </g>
  <rect x="22" y="58" width="56" height="46" fill="var(--flx-base-200)" stroke="var(--flx-base-700)" stroke-width="1"/>
  <g stroke="var(--flx-base-700)" stroke-width="0.8" fill="none" opacity="0.4">
    <line x1="32" y1="72" x2="68" y2="72"/>
    <line x1="32" y1="80" x2="68" y2="80"/>
    <line x1="32" y1="88" x2="68" y2="88"/>
    <line x1="32" y1="96" x2="68" y2="96"/>
  </g>
  <path d="M 22 58 L 22 95 L 14 78 Z" fill="var(--flx-base-700)"/>
  <path d="M 78 58 L 78 95 L 86 78 Z" fill="var(--flx-base-700)"/>
  <circle cx="50" cy="38" r="28" fill="var(--flx-base-200)" stroke="var(--flx-base-700)" stroke-width="1"/>
  <path d="M 28 16 L 22 6 L 34 14 Z" fill="var(--flx-base-700)"/>
  <path d="M 72 16 L 78 6 L 66 14 Z" fill="var(--flx-base-700)"/>
  {eyes}
  {brow_svg}
  {beak}
  <rect x="46" y="62" width="8" height="8" fill="var(--or)"/>
</svg>'''


# ── Mood + status helpers (mirror data.jsx) ──────────────────────────────────

def owl_mood(hour, hunger):
    if hunger >= 100:                  return "dead"
    if hunger >= 90:                   return "critical"
    if hunger >= 75:                   return "starving"
    if hunger >= 50:                   return "hungry"
    h = int(hour) % 24
    if 2 <= h < 6:                     return "critical"
    if h == 0 or h == 1:               return "worried"
    if h >= 22:                        return "suspicious"
    return "content"


def status_text(hour):
    h = int(hour) % 24
    if 2 <= h < 6:        return "Goblin mode"
    if h == 0 or h == 1:  return "Deeply irresponsible"
    if h >= 22:           return "Night owl territory"
    return "Human hours"


def hunger_tone(hunger):
    if hunger >= 75: return "tone-danger"
    if hunger >= 50: return "tone-bad"
    if hunger >= 25: return "tone-mid"
    return "tone-ok"


# ── Page CSS — only the rules we actually need for the dropdown ─────────────

def _inline_css():
    """Read design-system.css + the dropdown rules from styles.css."""
    paths = [os.path.join(APP_DIR, "design-system.css"),
             os.path.join(APP_DIR, "styles.css")]
    blobs = []
    for p in paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                blobs.append(f.read())
    return "\n".join(blobs)


# ── Public ───────────────────────────────────────────────────────────────────

def build_dropdown_html(hunger, total_feeds, times_died):
    now    = datetime.now()
    hour   = now.hour + now.minute / 60
    mood   = owl_mood(hour, hunger)
    status = status_text(hour)
    htone  = hunger_tone(hunger)
    owl    = owl_svg(mood, size=42)

    base_css = _inline_css()

    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<style>
{base_css}

/* ── Popover-specific overrides ─────────────────────────────────────────── */
html, body {{
  margin: 0;
  padding: 0;
  background: transparent;
  overflow: hidden;
  font-family: var(--font-sans);
  user-select: none;
  -webkit-user-select: none;
}}

/* Override the design's absolute positioning — the popover IS the dropdown */
.owl-dropdown {{
  position: static;
  top: auto;
  right: auto;
  width: 300px;
  margin: 0;
  border-radius: 12px;
  background: color-mix(in oklab, var(--bg-2) 96%, transparent);
  border: 1px solid var(--ui-3);
  box-shadow: 0 8px 32px -4px rgba(0,0,0,0.7);
  -webkit-backdrop-filter: saturate(160%) blur(24px);
  backdrop-filter: saturate(160%) blur(24px);
  animation: none;
  overflow: hidden;
}}
</style>
</head>
<body>

<div class="owl-dropdown">
  <div class="dd-header">
    <div class="dd-owl">{owl}</div>
    <div class="dd-meta">
      <div class="dd-name">NightOwl</div>
      <div class="dd-status">{status}</div>
    </div>
  </div>

  <div class="dd-section-label">— Reports</div>
  <button class="dd-item" onclick="act('dashboard')">
    <span class="dd-item-idx">01</span>
    <span>Open dashboard</span>
    <span class="dd-shortcut">⌘D</span>
  </button>
  <button class="dd-item" onclick="act('today')">
    <span class="dd-item-idx">02</span>
    <span>Today's stats</span>
    <span class="dd-arrow">→</span>
  </button>
  <button class="dd-item" onclick="act('pet')">
    <span class="dd-item-idx">03</span>
    <span>Pet stats</span>
    <span class="dd-arrow">→</span>
  </button>

  <div class="dd-sep"></div>

  <div class="dd-section-label">— Care</div>
  <button class="dd-feed-row" onclick="act('feed')">
    <span class="dd-item-idx">04</span>
    <div class="dd-feed-meta">
      <div class="dd-feed-title">Feed the owl</div>
      <div class="dd-feed-bar">
        <div class="dd-hunger-track">
          <div class="dd-hunger-fill bar-fill {htone}" style="width:{hunger}%"></div>
        </div>
        <div class="dd-hunger-num">{hunger}</div>
      </div>
    </div>
  </button>

  <div class="dd-sep"></div>

  <div class="dd-section-label">— Export</div>
  <button class="dd-item" onclick="act('obsidian')">
    <span class="dd-item-idx">05</span>
    <span>Export to Obsidian</span>
    <span class="dd-arrow">↗</span>
  </button>

  <div class="dd-sep"></div>

  <button class="dd-item dd-quit" onclick="act('quit')">
    <span class="dd-item-idx">06</span>
    <span>Quit NightOwl</span>
    <span class="dd-shortcut">⌘Q</span>
  </button>
</div>

<script>
function act(name) {{
  try {{
    window.webkit.messageHandlers.nightowl.postMessage(name);
  }} catch (e) {{
    console.error('No bridge:', e);
  }}
}}
</script>
</body>
</html>"""
