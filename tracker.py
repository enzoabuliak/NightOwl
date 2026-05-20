import json
import os
import re
import subprocess
from datetime import datetime, date, timedelta

from paths import DATA_DIR
DATA_FILE = os.path.join(DATA_DIR, "data.json")


def get_idle_seconds():
    try:
        result = subprocess.run(
            ["ioreg", "-c", "IOHIDSystem"],
            capture_output=True, text=True, timeout=5
        )
        match = re.search(r'"HIDIdleTime"\s*=\s*(\d+)', result.stdout)
        if match:
            return int(match.group(1)) / 1_000_000_000
    except Exception:
        pass
    return 0


class ActivityTracker:
    def __init__(self):
        self.data = self._load()

    def _load(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def _save(self):
        with open(DATA_FILE, "w") as f:
            json.dump(self.data, f, indent=2)

    def record_activity(self):
        """Check if user is active and record it. Returns True if active."""
        if get_idle_seconds() > 300:  # idle more than 5 minutes = not active
            return False

        today = date.today().isoformat()
        now_str = datetime.now().isoformat()

        if today not in self.data:
            self.data[today] = {"first_active": now_str, "latest_active": now_str}
        else:
            self.data[today]["latest_active"] = now_str
            if "first_active" not in self.data[today]:
                self.data[today]["first_active"] = now_str

        self._save()
        return True

    def get_today_stats(self):
        today = date.today().isoformat()
        if today not in self.data:
            return "No activity recorded today yet.\nStart working and I'll begin tracking!"

        day = self.data[today]
        latest = datetime.fromisoformat(day["latest_active"])
        first = datetime.fromisoformat(day.get("first_active", day["latest_active"]))

        h = latest.hour
        if 2 <= h < 6:
            verdict = "💀 GOBLIN MODE ACTIVATED"
        elif h == 0 or h == 1:
            verdict = "🔴 Deeply irresponsible"
        elif h >= 22:
            verdict = "🟡 Night owl territory"
        else:
            verdict = "🟢 Respectable human hours"

        return (
            f"Started: {first.strftime('%I:%M %p')}\n"
            f"Last active: {latest.strftime('%I:%M %p')}\n"
            f"Status: {verdict}"
        )

    def get_week_data(self):
        """Return last 7 days with latest_active time as a float hour (0-23 scale)."""
        result = []
        for i in range(6, -1, -1):
            day_str = (date.today() - timedelta(days=i)).isoformat()
            entry = {"date": day_str, "raw_hour": None, "latest_str": "—"}
            if day_str in self.data:
                latest_str = self.data[day_str].get("latest_active")
                if latest_str:
                    t = datetime.fromisoformat(latest_str)
                    entry["raw_hour"] = t.hour + t.minute / 60
                    entry["latest_str"] = t.strftime("%I:%M %p")
            result.append(entry)
        return result
