"""
paths.py — resolve the right directories whether running from source
or from a py2app-bundled NightOwl.app.

  APP_DIR   = read-only bundled resources (CSS, JSX). Inside a .app this
              points at NightOwl.app/Contents/Resources. In dev it's the
              source directory.

  DATA_DIR  = user-writable storage (data.json, pet.json, generated
              dashboard.html). Inside a .app this is
              ~/Library/Application Support/NightOwl. In dev it's the
              source directory so you can inspect files easily.
"""

import os
import sys


def _is_frozen():
    return getattr(sys, "frozen", False)


def app_resources_dir():
    if _is_frozen():
        try:
            from Foundation import NSBundle
            p = NSBundle.mainBundle().resourcePath()
            if p:
                return str(p)
        except Exception:
            pass
    return os.path.dirname(os.path.abspath(__file__))


def user_data_dir():
    if _is_frozen():
        path = os.path.expanduser("~/Library/Application Support/NightOwl")
    else:
        path = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(path, exist_ok=True)
    return path


APP_DIR  = app_resources_dir()
DATA_DIR = user_data_dir()
