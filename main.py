import os
import requests
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get credentials from environment variables
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
GITHUB_TOKEN = os.getenv("GITHUB_PAT")
GITHUB_API_URL = "https://api.github.com/graphql"

def get_todays_contribution_count(username, token):
    """Fetches the total contribution count for today using the GitHub GraphQL API."""
    if not username or not token:
        print("Error: GITHUB_USERNAME or GITHUB_PAT not found in .env file.")
        print("Please create a .env file from .env.example and add your credentials.")
        return None

    # GraphQL query to get contributions for a specific date range
    query = """
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
    """

    # Define the start and end of today in UTC
    now_utc = datetime.now(timezone.utc)
    start_of_day_utc = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day_utc = now_utc.replace(hour=23, minute=59, second=59, microsecond=999999)

    variables = {
        "username": username,
        "from": start_of_day_utc.isoformat(),
        "to": end_of_day_utc.isoformat()
    }

    headers = {"Authorization": f"bearer {token}"}

    try:
        response = requests.post(GITHUB_API_URL, json={'query': query, 'variables': variables}, headers=headers)
        response.raise_for_status()
        data = response.json()

        if 'errors' in data:
            error_message = data['errors'][0]['message']
            print(f"GraphQL API Error: {error_message}")
            return None

        total_contributions = data['data']['user']['contributionsCollection']['contributionCalendar']['totalContributions']
        return total_contributions

    except requests.exceptions.RequestException as e:
        print(f"Error contacting GitHub API: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def main():
    today_utc_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    print(f"Checking contributions for {GITHUB_USERNAME} on {today_utc_str} (UTC)...")
    
    contribution_count = get_todays_contribution_count(GITHUB_USERNAME, GITHUB_TOKEN)

    if contribution_count is None:
        # Error message was already printed by the function
        return

    if contribution_count > 0:
        print(f"\nSuccess! You have made {contribution_count} contributions today.")
        print("Your streak is safe. Keep up the great work! 🔥")
    else:
        # Calculate time remaining until the next reset
        now_utc = datetime.now(timezone.utc)
        reset_time_utc = (now_utc + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        time_remaining = reset_time_utc - now_utc
        
        hours, remainder = divmod(time_remaining.seconds, 3600)
        minutes, _ = divmod(remainder, 60)

        print(f"\nWARNING! You have 0 contributions on GitHub today ({today_utc_str}).")
        print(f"Time remaining until reset: {hours} hours, {minutes} minutes.")
        print("Push a commit soon to keep your streak alive! 😨")

if __name__ == "__main__":
    main()

