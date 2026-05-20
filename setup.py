"""
setup.py — build NightOwl.app with py2app.

Usage (from the project root, inside the venv):

    venv/bin/python setup.py py2app

Produces:
    dist/NightOwl.app   — the bundle to share with friends.

Notes:
- LSUIElement: true → no Dock icon (menu-bar-only app).
- Data files (CSS, JSX) are copied into Contents/Resources/ so the runtime
  paths.py helper can find them via NSBundle.mainBundle().resourcePath().
- Friends will see "unidentified developer" the first time because we don't
  sign with a paid Apple Developer ID. Right-click → Open bypasses it once.
"""

from setuptools import setup

APP        = ["nightowl.py"]
DATA_FILES = [
    "design-system.css",
    "styles.css",
    "owl.jsx",
    "data.jsx",
    "dashboard.jsx",
]

PLIST = {
    "CFBundleName":               "NightOwl",
    "CFBundleDisplayName":        "NightOwl",
    "CFBundleIdentifier":         "com.enzoabuliak.nightowl",
    "CFBundleVersion":            "1.0.0",
    "CFBundleShortVersionString": "1.0.0",
    "NSHumanReadableCopyright":   "© 2026 Enzo Abuliak",
    # Menu-bar-only — no Dock icon, no app-switcher entry
    "LSUIElement":                True,
    # Allow modern macOS appearance
    "NSRequiresAquaSystemAppearance": False,
    # Minimum macOS
    "LSMinimumSystemVersion":     "11.0",
}

OPTIONS = {
    "argv_emulation": False,        # rumps doesn't need it; setting True breaks signal handling
    "plist":          PLIST,
    "packages":       ["rumps", "matplotlib"],
    "includes":       ["objc", "Foundation", "AppKit", "WebKit"],
    "excludes":       ["tkinter", "PyQt5", "PyQt6", "PySide2", "PySide6"],
    # Skip the optional iconfile for now; can add NightOwl.icns later.
}

setup(
    app           = APP,
    name          = "NightOwl",
    data_files    = DATA_FILES,
    options       = {"py2app": OPTIONS},
    setup_requires= ["py2app"],
)
