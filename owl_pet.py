import json
import os
import random

from paths import DATA_DIR
PET_FILE = os.path.join(DATA_DIR, "pet.json")

HUNGER_PER_TICK  = 4   # points per 60-second tick while active
LATE_BONUS       = 3   # extra hunger after 10 PM (owl hates late nights)
IDLE_RECOVERY    = 2   # hunger drops slowly while you're idle
FEED_AMOUNT      = 45  # how much one feed reduces hunger

HUNGER_LINES = {
    "hungry": [
        "Your owl is getting peckish 🦉 — click 'Feed 🦉' before it gets ugly.",
        "The owl is side-eyeing you. It wants a snack.",
        "Hunger level: medium. The owl is judging you in silence.",
        "A small rumbling from the menu bar. Your owl demands tribute.",
    ],
    "starving": [
        "YOUR OWL IS STARVING 😤 — Click 'Feed 🦉' RIGHT NOW.",
        "The owl has started eating your WiFi signal. Feed it immediately.",
        "STARVING ALERT: The owl is eyeing your trackpad as a potential meal.",
        "Desperate times. The owl has sold your search history for mice futures.",
    ],
    "critical": [
        "🚨 OWL CRITICAL 🚨 — One more minute and it's gone forever.",
        "THE OWL IS DYING. FEED. IT. NOW.",
        "Your owl has written a will. You're not in it. FEED IT.",
        "Critical hunger. The owl has begun its five stages of grief.",
    ],
    "dead": [
        "Your owl died. 💀 You monster. It has respawned, but it remembers.",
        "RIP 🦉 (2026–2026). Killed by neglect and bad sleep hygiene.",
        "The owl perished. Its ghost now haunts your late-night commits.",
        "Gone. Your owl has ascended. You have not.",
    ],
}


class OwlPet:
    def __init__(self):
        self._load()

    def _load(self):
        try:
            if os.path.exists(PET_FILE):
                with open(PET_FILE, "r", encoding="utf-8") as f:
                    d = json.load(f)
                    self.hunger      = d.get("hunger", 0)
                    self.total_feeds = d.get("total_feeds", 0)
                    self.times_died  = d.get("times_died", 0)
                    return
        except Exception:
            pass
        self.hunger = 0
        self.total_feeds = 0
        self.times_died  = 0

    def _save(self):
        with open(PET_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "hunger":      self.hunger,
                "total_feeds": self.total_feeds,
                "times_died":  self.times_died,
            }, f)

    def tick(self, hour, is_active):
        """
        Call every 60 seconds.
        Returns one of: None | "hungry" | "starving" | "critical" | "dead"
        Only returns a value when a new threshold is freshly crossed.
        """
        prev = self.hunger

        if not is_active:
            self.hunger = max(0, self.hunger - IDLE_RECOVERY)
            self._save()
            return None

        bonus = LATE_BONUS if (hour >= 22 or hour < 6) else 0
        self.hunger = min(100, self.hunger + HUNGER_PER_TICK + bonus)

        if self.hunger >= 100:
            self.times_died += 1
            self.hunger = 70  # respawn with partial hunger
            self._save()
            return "dead"

        self._save()

        # Only fire a notification when crossing a threshold from below
        if prev < 90 and self.hunger >= 90: return "critical"
        if prev < 75 and self.hunger >= 75: return "starving"
        if prev < 50 and self.hunger >= 50: return "hungry"
        return None

    def feed(self):
        self.hunger = max(0, self.hunger - FEED_AMOUNT)
        self.total_feeds += 1
        self._save()

    def random_message(self, level):
        return random.choice(HUNGER_LINES.get(level, HUNGER_LINES["hungry"]))

    # ── Display helpers ──────────────────────────────────────────────────────

    def menu_icon(self, hour):
        """Menu bar emoji: hunger takes priority over time-of-night."""
        h = self.hunger
        if h >= 90:               return "💀"
        if h >= 75:               return "🦉😤"
        if h >= 50:               return "🦉🍖"
        if hour >= 2 and hour < 6: return "💀"
        if hour == 0 or hour == 1: return "🦉🔴"
        if hour >= 22:             return "🦉⚠️"
        return "🦉"

    def hunger_bar(self):
        filled = round(self.hunger / 20)  # 0-5 blocks
        empty  = 5 - filled
        if self.hunger >= 90:   bar = "🟥" * filled + "⬜" * empty + " CRITICAL"
        elif self.hunger >= 75: bar = "🟧" * filled + "⬜" * empty + " Starving"
        elif self.hunger >= 50: bar = "🟨" * filled + "⬜" * empty + " Hungry"
        elif self.hunger >= 25: bar = "🟩" * filled + "⬜" * empty + " Content"
        else:                   bar = "🟩" * filled + "⬜" * empty + " Happy"
        return bar

    def pet_stats(self):
        return (
            f"Hunger: {self.hunger_bar()}\n"
            f"Feeds given: {self.total_feeds}\n"
            f"Times you killed it: {self.times_died}"
        )
