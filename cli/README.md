# GitHub Streak Alert CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/release/python-380/)

A simple but powerful Python script to prevent you from losing your GitHub contribution streak. It uses the official GitHub GraphQL API to check if you've made any contributions for the current day (in UTC) and warns you if you haven't.

The alert includes a countdown timer showing exactly how much time is left until the daily reset, so you know how urgent the situation is.

## Features

- **Reliable**: Uses the official GitHub GraphQL API, not fragile web scraping.
- **Informative**: Tells you if you're safe or at risk.
- **Urgency-Aware**: Shows a countdown timer to the 00:00 UTC reset if you have no contributions.
- **Secure**: Your credentials (username and Personal Access Token) are stored locally in a `.env` file and ignored by Git.
- **Easy to Automate**: Comes with instructions for setting up daily automated checks on Windows, macOS, and Linux.
- **Discord Notifications**: Optional Discord webhook integration for alerts.

---

## Setup Instructions

### 1. Prerequisites

- [Python 3.6+](https://www.python.org/downloads/) installed and added to your system's PATH.
- [Git](https://git-scm.com/downloads/) installed.

### 2. Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/0xReLogic/streaky.git
    cd streaky/cli
    ```

2.  **Set up a virtual environment (recommended):**

    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required packages:**

    ```bash
    pip install -r requirements.txt
    ```

### 3. Configuration

1.  **Create a `.env` file** by copying the example file:

    ```bash
    # For Windows
    copy .env.example .env

    # For macOS/Linux
    cp .env.example .env
    ```

2.  **Generate a GitHub Personal Access Token (PAT):**
    -   Go to [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens) and click **Generate new token**.
    -   Give your token a **Note** (e.g., `StreakAlertScript`).
    -   Set an **Expiration** (e.g., 90 days).
    -   Under **Select scopes**, check the box for `read:user`. This is the only permission needed.
    -   Click **Generate token** and copy the token string.

3.  **Edit the `.env` file:**
    -   Open the `.env` file you created.
    -   Set `GITHUB_USERNAME` to your GitHub username.
    -   Set `GITHUB_PAT` to the token you just copied.

    Your `.env` file should look like this:

    ```
    GITHUB_USERNAME="<YOUR_USERNAME>"
    GITHUB_PAT="<YOUR_PERSONAL_ACCESS_TOKEN>"
    ```

4. **(Optional) Setup Discord Webhook:**
    - Go to a server you own or have the **Manage Webhook** permission in
    - Go to **Server Settings** and under **Apps** go to **Integrations**
    - Go into the **Webhooks** menu and click **New Webhook**
    - Give your new webhook a name and choose the channel it will send the notification in
    - Click **Copy Webhook URL**

5. **(Optional) Edit the `.env` file (Discord setup continued):**
    - Open the `.env` file from the previous steps
    - Set `DISCORD_ENABLED` to 'true'
    - Set `DISCORD_WEBHOOK_URL` to the webhook you copied in step 4
    
    Your `.env` file should look like this:
    
    ```
    GITHUB_USERNAME="<YOUR_USERNAME>"
    GITHUB_PAT="<YOUR_PERSONAL_ACCESS_TOKEN>"
    DISCORD_ENABLED=true
    DISCORD_WEBHOOK_URL="<YOUR_WEBHOOK_URL>"
    ```

### 4. Test the Script

Run the script manually to make sure everything is working correctly.

```bash
python main.py
```

You should see a success or warning message based on your contribution status for the day.

---

## Automation: Run it Daily!

To make this a true alert system, you need to schedule it to run automatically every day. A good time is around 9 PM in your local time, which gives you a few hours' buffer before the day resets on GitHub (00:00 UTC).

### For Windows (using Task Scheduler)

1.  Open **Task Scheduler**.
2.  In the right-hand **Actions** panel, click **Create Basic Task...**.
3.  **Name:** `GitHub Streak Check`.
4.  **Trigger:** `Daily`. Set a time like `21:00:00`.
5.  **Action:** `Start a program`.
6.  **Program/script:** Browse to the `run_checker.bat` file in this project's directory.
7.  Click **Finish**.

#### Windows notes: ensuring the script runs in the correct folder

- __Default (recommended)__: Keep `run_checker.bat` inside the project folder (same folder as `main.py`). The script auto-detects its folder and runs correctly.
- __If you move the batch file__: Edit it with Notepad and set `PROJECT_DIR` to your project path (include a trailing backslash `\`). Example:

    ```bat
    rem Edit the top of run_checker.bat
    set "PROJECT_DIR=C:\\Path\\To\\streaky\\cli\\"
    ```

- __Alternative__: In Task Scheduler, open your task > Actions > Edit..., and set the **Start in (optional)** field to your project directory (e.g., `C:\Path\To\streaky\cli`).


### For macOS / Linux (using Cron)

1.  Open your terminal and edit your crontab file:

    ```bash
    crontab -e
    ```

2.  Add the following line to the file. This example schedules the script to run at 9:05 PM every day.

    ```cron
    # m h  dom mon dow   command
    5 21 * * * /usr/bin/python3 /path/to/streaky/cli/main.py >> /path/to/streaky/cli/cron.log 2>&1
    ```

    **Important:**
    -   Replace `/usr/bin/python3` with the absolute path to your Python interpreter (you can find it with `which python3`).
    -   Replace `/path/to/streaky/cli/` with the absolute path to this CLI directory.
    -   The `>> ... cron.log 2>&1` part is optional but recommended. It saves the output of the script to a log file, which is useful for debugging.

    Save and exit the editor.

---

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
