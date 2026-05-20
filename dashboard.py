"""
dashboard.py — generates a self-contained HTML dashboard from the design files.

Production output is JUST the dashboard from the Claude Design preview —
no browser window chrome, no scrubber, no tweaks panel, no menu bar mockup.
Real tracking data is injected from Python.
"""

import json
import os
import subprocess
from datetime import datetime

APP_DIR  = os.path.dirname(os.path.abspath(__file__))
OUT_HTML = os.path.join(APP_DIR, "dashboard.html")

# Only the design files we actually need for the dashboard itself.
# (We drop menubar.jsx and tweaks-panel.jsx — those were preview-only.)
JSX_FILES = ["owl.jsx", "data.jsx", "dashboard.jsx"]
CSS_FILES = ["design-system.css", "styles.css"]


# ── Data conversion ──────────────────────────────────────────────────────────

def normalize(raw_hour):
    """0–23 hour → linear night scale (18 = 6 PM, 24 = midnight, 26 = 2 AM)."""
    if raw_hour is None:
        return None
    return raw_hour + 24 if raw_hour < 12 else raw_hour


def real_week_json(week_data):
    """Convert Python week data into the {label, day, raw} shape the JS expects."""
    DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    rows = []
    for entry in week_data:
        d = datetime.fromisoformat(entry["date"])
        rows.append({
            "label": DAY_ABBR[d.weekday()],
            "day":   d.day,
            "raw":   normalize(entry["raw_hour"]),
        })
    return json.dumps(rows)


# ── Strip browser chrome from the Dashboard component ───────────────────────

def patched_dashboard_jsx():
    """
    The Dashboard component wraps its content in a `.browser` window mock
    (traffic lights, fake URL bar). For production we drop that — we only
    want the inner `.dash` content. This is a literal string swap on the
    component's return block so the JSX stays valid.
    """
    src_path = os.path.join(APP_DIR, "dashboard.jsx")
    with open(src_path) as f:
        src = f.read()

    old_block = (
        'return (\n'
        '    <div className="browser">\n'
        '      <div className="bw-titlebar">\n'
        '        <div className="bw-traffic">\n'
        '          <button className="tl tl-r" onClick={onClose} aria-label="Close"></button>\n'
        '          <button className="tl tl-y" aria-label="Minimize"></button>\n'
        '          <button className="tl tl-g" aria-label="Zoom"></button>\n'
        '        </div>\n'
        '        <div className="bw-nav">\n'
        '          <button><svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1 L 3 5 L 7 9" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg></button>\n'
        '          <button><svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 1 L 7 5 L 3 9" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg></button>\n'
        '        </div>\n'
        '        <div className="bw-address">\n'
        '          <span className="bw-lock">\n'
        '            <svg width="9" height="11" viewBox="0 0 9 11" fill="none"><rect x="1" y="4.5" width="7" height="6" stroke="currentColor"/><path d="M2.5 4.5 V 3 a 2 2 0 0 1 4 0 V 4.5" stroke="currentColor" fill="none"/></svg>\n'
        '          </span>\n'
        '          <span className="bw-url">file:///Users/enzo/NightOwl/dashboard.html</span>\n'
        '        </div>\n'
        '        <div className="bw-spacer"/>\n'
        '      </div>\n'
        '\n'
        '      <div className="bw-body">\n'
        '        <div className="dash">\n'
        '          <DashHeader timeframe={timeframe} hour={hour} mood={mood} owlStyle={owlStyle} />\n'
        '\n'
        '          <TimeframeTabs value={timeframe} onChange={setTimeframe} />\n'
        '\n'
        '          {layout === \'cards\' && <LayoutCards {...props} />}\n'
        '          {layout === \'hero\' && <LayoutHero {...props} />}\n'
        '          {layout === \'timeline\' && <LayoutTimeline {...props} />}\n'
        '        </div>\n'
        '      </div>\n'
        '    </div>\n'
        '  );'
    )

    new_block = (
        'return (\n'
        '    <div className="dash">\n'
        '      <DashHeader timeframe={timeframe} hour={hour} mood={mood} owlStyle={owlStyle} />\n'
        '\n'
        '      <TimeframeTabs value={timeframe} onChange={setTimeframe} />\n'
        '\n'
        '      {layout === \'cards\' && <LayoutCards {...props} />}\n'
        '      {layout === \'hero\' && <LayoutHero {...props} />}\n'
        '      {layout === \'timeline\' && <LayoutTimeline {...props} />}\n'
        '    </div>\n'
        '  );'
    )

    if old_block in src:
        src = src.replace(old_block, new_block, 1)
    # If the swap fails silently, the page still renders — just with browser chrome.
    return src


# ── Minimal production app (no scrubber, no tweaks panel, no menu mockup) ───

PRODUCTION_APP_JSX = """
// Production NightOwl dashboard — just the dashboard content.
function NightOwlApp() {
  const now    = new Date();
  const hour   = now.getHours() + now.getMinutes() / 60;
  const hunger = (window.__REAL_HUNGER != null) ? window.__REAL_HUNGER : 0;
  const mood   = window.owlMood(hour, hunger);
  const week   = window.__REAL_WEEK || window.mockWeek(hour);

  return (
    <div className="prod-shell">
      <Dashboard
        layout="cards"
        week={week}
        hour={hour}
        hunger={hunger}
        mood={mood}
        owlStyle="geometric"
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<NightOwlApp />);
"""

PRODUCTION_CSS_OVERRIDES = """
/* ───────────────────────────────────────────────────────────
   Production overrides — strips the preview-only desktop scene
   ─────────────────────────────────────────────────────────── */
html, body {
  background: var(--bg);
  margin: 0;
  padding: 0;
  min-height: 100vh;
  overflow-x: hidden;
}
.prod-shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: var(--s-6) var(--s-5);
}
.prod-shell .dash {
  border: 1px solid var(--ui);
  background: var(--bg);
}
"""


# ── HTML assembly ────────────────────────────────────────────────────────────

def build_html(week_data, owl_hunger, owl_feeds, owl_died):
    week_json = real_week_json(week_data)

    # Inline CSS
    css_blocks = []
    for fname in CSS_FILES:
        path = os.path.join(APP_DIR, fname)
        if os.path.exists(path):
            with open(path) as f:
                css_blocks.append(f"/* {fname} */\n" + f.read())
    css_blocks.append(PRODUCTION_CSS_OVERRIDES)

    # Inline JSX (dashboard.jsx is patched to drop the browser chrome)
    jsx_blocks = []
    for fname in JSX_FILES:
        if fname == "dashboard.jsx":
            jsx_blocks.append(
                f"/* ── {fname} (patched: browser chrome removed) ── */\n"
                + patched_dashboard_jsx()
            )
        else:
            path = os.path.join(APP_DIR, fname)
            if os.path.exists(path):
                with open(path) as f:
                    jsx_blocks.append(f"/* ── {fname} ── */\n" + f.read())

    css_tag  = "<style>\n" + "\n\n".join(css_blocks) + "\n</style>"
    jsx_tags = "\n".join(
        f'<script type="text/babel">\n{block}\n</script>'
        for block in jsx_blocks
    )
    app_tag  = f'<script type="text/babel">\n{PRODUCTION_APP_JSX}\n</script>'

    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NightOwl</title>
{css_tag}
</head>
<body>
<div id="root"></div>

<!-- Real tracking data injected from Python -->
<script>
window.__REAL_WEEK   = {week_json};
window.__REAL_HUNGER = {owl_hunger};
window.__REAL_FEEDS  = {owl_feeds};
window.__REAL_DIED   = {owl_died};
</script>

<!-- React + Babel from CDN -->
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"
  integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L"
  crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"
  integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm"
  crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
  integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y"
  crossorigin="anonymous"></script>

<!-- Design components -->
{jsx_tags}

<!-- App entry point -->
{app_tag}
</body>
</html>"""


# ── Public entry point ───────────────────────────────────────────────────────

def open_dashboard(week_data, owl):
    html = build_html(
        week_data  = week_data,
        owl_hunger = owl.hunger,
        owl_feeds  = owl.total_feeds,
        owl_died   = owl.times_died,
    )
    with open(OUT_HTML, "w") as f:
        f.write(html)
    subprocess.run(["open", OUT_HTML])
