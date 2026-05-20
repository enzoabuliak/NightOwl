"""
popover.py — Custom HTML popover that drops down from the menu bar icon.

Replaces the native NSMenu so we can render the Claude Design dropdown
pixel-perfectly using HTML/CSS in a WKWebView. Communicates back to Python
via WKScriptMessageHandler when the user clicks a menu item.
"""

import objc
from AppKit import (
    NSPanel, NSColor, NSBackingStoreBuffered, NSEvent, NSScreen,
)
from Foundation import NSObject, NSMakeRect, NSMakePoint
from WebKit import WKWebView, WKWebViewConfiguration, WKUserContentController

# AppKit constants (older Pythonista-style names work across PyObjC versions)
NSBorderlessWindowMask        = 0
NSNonactivatingPanelMask      = 1 << 7
NSPopUpMenuWindowLevel        = 101
NSEventMaskLeftMouseDown      = 1 << 1
NSEventMaskRightMouseDown     = 1 << 3


# ── Status-bar click target (so the icon click can call a Python fn) ─────────

class StatusClickTarget(NSObject):
    def initWithCallback_(self, callback):
        self = objc.super(StatusClickTarget, self).init()
        if self is None:
            return None
        self._callback = callback
        return self

    def clicked_(self, sender):
        try:
            self._callback()
        except Exception as e:
            print(f"[popover] click handler error: {e!r}")


# ── Script-message handler (JS → Python bridge) ──────────────────────────────

class _MessageHandler(NSObject):
    def initWithCallback_(self, callback):
        self = objc.super(_MessageHandler, self).init()
        if self is None:
            return None
        self._callback = callback
        return self

    # WKScriptMessageHandler protocol method — name is exact
    def userContentController_didReceiveScriptMessage_(self, controller, message):
        body = message.body()
        try:
            self._callback(str(body))
        except Exception as e:
            print(f"[popover] action handler error: {e!r}")


# ── Public Popover wrapper (called from rumps app) ──────────────────────────

class Popover:
    """
    A borderless NSPanel containing a WKWebView. Opens below the menu bar
    icon; closes when the user clicks anywhere outside.
    """

    def __init__(self, on_action, status_item_provider,
                 width=300, height=470):
        self._on_action            = on_action            # fn(action: str) -> None
        self._status_item_provider = status_item_provider  # fn() -> NSStatusItem
        self._w, self._h           = width, height

        self._window         = None
        self._webview        = None
        self._handler        = None
        self._monitor_global = None
        self._monitor_local  = None
        self._visible        = False

    # ── lazy window setup ───────────────────────────────────────────────────

    def _build_window(self):
        rect = NSMakeRect(0, 0, self._w, self._h)

        self._window = (
            NSPanel.alloc()
            .initWithContentRect_styleMask_backing_defer_(
                rect,
                NSBorderlessWindowMask | NSNonactivatingPanelMask,
                NSBackingStoreBuffered,
                False,
            )
        )
        self._window.setBackgroundColor_(NSColor.clearColor())
        self._window.setOpaque_(False)
        self._window.setHasShadow_(True)
        self._window.setLevel_(NSPopUpMenuWindowLevel)
        self._window.setMovable_(False)
        self._window.setHidesOnDeactivate_(False)

        # WebView with JS → Python bridge
        self._handler = _MessageHandler.alloc().initWithCallback_(self._handle_action)

        config = WKWebViewConfiguration.alloc().init()
        ucc    = WKUserContentController.alloc().init()
        ucc.addScriptMessageHandler_name_(self._handler, "nightowl")
        config.setUserContentController_(ucc)

        self._webview = (
            WKWebView.alloc().initWithFrame_configuration_(rect, config)
        )
        try:
            # Transparent webview background so the rounded panel can show through
            self._webview.setValue_forKey_(False, "drawsBackground")
        except Exception:
            pass

        self._window.setContentView_(self._webview)

    # ── action plumbing ─────────────────────────────────────────────────────

    def _handle_action(self, action):
        # Always close on any action (matches native menu UX)
        self.hide()
        self._on_action(action)

    # ── show / hide ─────────────────────────────────────────────────────────

    def _origin_below_status_item(self):
        item = self._status_item_provider()
        if item is None:
            screen = NSScreen.mainScreen().frame()
            return (screen.size.width - self._w - 16, screen.size.height - self._h - 30)

        button = item.button()
        if button is None or button.window() is None:
            screen = NSScreen.mainScreen().frame()
            return (screen.size.width - self._w - 16, screen.size.height - self._h - 30)

        rect = button.window().convertRectToScreen_(button.frame())
        # Center the popover under the icon, just below the menu bar
        x = rect.origin.x + rect.size.width / 2.0 - self._w / 2.0
        y = rect.origin.y - self._h - 4
        # Keep on screen horizontally
        scr = NSScreen.mainScreen().visibleFrame()
        x = max(scr.origin.x + 4, min(x, scr.origin.x + scr.size.width - self._w - 4))
        return (x, y)

    def show(self, html):
        if self._window is None:
            self._build_window()

        # Load the HTML
        self._webview.loadHTMLString_baseURL_(html, None)

        x, y = self._origin_below_status_item()
        self._window.setFrameOrigin_(NSMakePoint(x, y))
        self._window.makeKeyAndOrderFront_(None)
        self._visible = True

        # Outside-click dismissal — need BOTH monitors:
        #   global = clicks in other apps
        #   local  = clicks in our own app (e.g. the dashboard window)
        self._teardown_monitors()
        mask = NSEventMaskLeftMouseDown | NSEventMaskRightMouseDown

        def on_global(_evt):
            self.hide()

        def on_local(evt):
            # If the click is inside our popover window, let it through
            evt_window = evt.window()
            if evt_window is None or evt_window != self._window:
                self.hide()
            return evt

        self._monitor_global = NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(
            mask, on_global
        )
        self._monitor_local = NSEvent.addLocalMonitorForEventsMatchingMask_handler_(
            mask, on_local
        )

    def _teardown_monitors(self):
        if self._monitor_global is not None:
            NSEvent.removeMonitor_(self._monitor_global)
            self._monitor_global = None
        if self._monitor_local is not None:
            NSEvent.removeMonitor_(self._monitor_local)
            self._monitor_local = None

    def hide(self):
        if not self._visible:
            return
        if self._window is not None:
            self._window.orderOut_(None)
        self._teardown_monitors()
        self._visible = False

    def toggle(self, html):
        if self._visible:
            self.hide()
        else:
            self.show(html)
