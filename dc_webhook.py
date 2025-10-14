import requests
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

test_payload = {
    "embeds": [
        {
            "title": "⚠️ GitHub Streak Alert",
            "description": (
                f"You have 0 contributions today ({datetime.datetime.now():%Y-%m-%d}).\n"
                "Time remaining: 8 hours, 45 minutes.\n\n"
                "Push a commit soon to keep your streak alive! 🔥"
            ),
            "color": 15158332,
            "fields": [
                {"name": "Username", "value": GITHUB_USERNAME, "inline": True},
                {"name": "Current Streak", "value": "42 days", "inline": True},
            ],
            "footer": {"text": "GitHub Streak Alert"},
            "timestamp": datetime.datetime.now().isoformat(),
        }
    ],
}

r = requests.post(DISCORD_WEBHOOK_URL, json=test_payload)
if r.status_code == 200 or r.status_code == 204:
    print("success")
