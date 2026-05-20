import threading
from datetime import datetime

import objc
import rumps

from dashboard import open_dashboard
from dropdown_html import build_dropdown_html
from obsidian import export_to_obsidian
from owl_pet import OwlPet
from popover import Popover, StatusClickTarget
from shamer import get_shame_message
from tracker import ActivityTracker


class NightOwlApp(rumps.App):
    def __init__(self):
        # quit_button=None so rumps doesn't add its native "Quit" — we handle it.
        super().__init__("🦉", quit_button=None)

        self.tracker        = ActivityTracker()
        self.owl            = OwlPet()
        self.last_shame_key = None

        # No native menu items — we'll show a custom HTML popover on click.
        self.menu = []

        # The popover (lazy-built on first show).
        self.popover = Popover(
            on_action            = self._handle_action,
            status_item_provider = self._status_item,
        )

        # rumps creates the NSStatusItem in applicationDidFinishLaunching_
        # (called after .run() starts the loop). Schedule one-shot setup
        # 0.3s after launch to override the click handler.
        self._setup_timer = rumps.Timer(self._install_click_handler, 0.3)
        self._setup_timer.start()

        # Main 60-second tick
        self.tick_timer = rumps.Timer(self.on_tick, 60)
        self.tick_timer.start()

    # ── Status-item access ──────────────────────────────────────────────────

    def _status_item(self):
        try:
            return self._nsapp.nsstatusitem
        except AttributeError:
            return None

    def _install_click_handler(self, timer):
        """Replace rumps' native menu with our popover trigger."""
        timer.stop()
        item = self._status_item()
        if item is None:
            return
        # Remove the native menu so the system doesn't open one on click
        item.setMenu_(None)
        # Create a proper NSObject target that calls back into Python
        self._click_target = StatusClickTarget.alloc().initWithCallback_(
            self._on_icon_click
        )
        button = item.button()
        if button is not None:
            button.setTarget_(self._click_target)
            button.setAction_(b"clicked:")

    def _on_icon_click(self):
        html = build_dropdown_html(
            hunger      = self.owl.hunger,
            total_feeds = self.owl.total_feeds,
            times_died  = self.owl.times_died,
        )
        self.popover.toggle(html)

    # ── Action handlers (called by the popover JS bridge) ──────────────────

    def _handle_action(self, action):
        if   action == "dashboard": self._open_dashboard()
        elif action == "today":     self._show_today()
        elif action == "pet":       self._show_pet_stats()
        elif action == "feed":      self._feed_owl()
        elif action == "obsidian":  self._export_obsidian()
        elif action == "quit":      rumps.quit_application()

    def _open_dashboard(self):
        threading.Thread(
            target=open_dashboard,
            args=(self.tracker.get_week_data(), self.owl),
            daemon=True,
        ).start()

    def _show_today(self):
        rumps.notification(
            "🦉 NightOwl", "Today's Report",
            self.tracker.get_today_stats(), sound=False,
        )

    def _show_pet_stats(self):
        rumps.notification(
            "🦉 Your Owl", "Pet Status",
            self.owl.pet_stats(), sound=False,
        )

    def _feed_owl(self):
        self.owl.feed()
        h = self.owl.hunger
        msg = (
            "Your owl is happy and full. 🦉" if h < 25
            else "The owl accepts your offering. It is — mostly satisfied."
            if h < 50
            else "The owl ate, but still eyes you suspiciously."
        )
        rumps.notification("🦉 NightOwl", "Owl Fed", msg, sound=False)

    def _export_obsidian(self):
        week  = self.tracker.get_week_data()
        today = self.tracker.get_today_stats()
        threading.Thread(
            target=export_to_obsidian, args=(week, today), daemon=True
        ).start()
        rumps.notification(
            "🦉 NightOwl", "Sent to Obsidian",
            "Opening a new note with this week's summary…", sound=False,
        )

    # ── Background tick ─────────────────────────────────────────────────────

    def on_tick(self, _):
        now       = datetime.now()
        hour      = now.hour
        is_active = self.tracker.record_activity()

        hunger_event = self.owl.tick(hour, is_active)

        if hunger_event:
            title = {
                "hungry":   "🦉 Your owl is hungry",
                "starving": "😤 Your owl is STARVING",
                "critical": "🚨 OWL CRITICAL",
                "dead":     "💀 Your owl died",
            }.get(hunger_event, "🦉 NightOwl")
            rumps.notification(
                "🦉 NightOwl", title,
                self.owl.random_message(hunger_event), sound=True,
            )

        if not is_active:
            return

        # Shame notification — once per hour during late-night
        if hour >= 22 or hour < 6:
            shame_key = now.strftime("%Y-%m-%d-%H")
            if shame_key != self.last_shame_key:
                self.last_shame_key = shame_key
                rumps.notification(
                    "🦉 NightOwl", "Night Owl Report 🚨",
                    get_shame_message(hour), sound=True,
                )


if __name__ == "__main__":
    NightOwlApp().run()
