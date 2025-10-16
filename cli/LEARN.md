# Project Learnings: From Scraping to GraphQL API

This document outlines the technical journey and key decisions made during the development of the GitHub Streak Alert script.

## 1. The Initial Problem

The goal was simple: create an automated alert to prevent losing a GitHub contribution streak. The script needed to check daily if a contribution had been made.

## 2. First Approach: Web Scraping (and Why It Failed)

Our first attempt was to use Python libraries like `requests` and `BeautifulSoup` to scrape the user's GitHub profile page (`https://github.com/username`).

-   **The Logic**: Find the contribution graph on the page and inspect the color or data attributes of the square representing the current day.
-   **The Problem**: This method is extremely fragile. GitHub's website is a dynamic web application built with modern frameworks. The class names, IDs, and HTML structure can (and do) change without notice. Our script broke after a short time because the selectors we relied on were no longer valid.

**Lesson Learned**: Web scraping is not a reliable solution for accessing data from a service that has a public API. It's prone to breaking and is considered a last resort.

## 3. The Better Approach: GitHub's Official GraphQL API

To build a more robust and future-proof solution, we switched to using the official [GitHub GraphQL API](https://docs.github.com/en/graphql).

-   **Why GraphQL?**: It's powerful and efficient. It allows us to request *exactly* the data we need in a single API call, nothing more. In our case, we only needed the total contribution count for a specific date range (today).
-   **Authentication**: The API requires a Personal Access Token (PAT) with the `read:user` scope for authentication. This is a secure and standard way to grant limited access to an application.
-   **The Query**: We constructed a GraphQL query to fetch the `totalContributions` from the user's `contributionsCollection` for a specific `from` and `to` timestamp (the start and end of the current day in UTC).

This approach is far more stable because APIs are designed for programmatic access and have versioning, ensuring that our script won't break unexpectedly.

## 4. Key Features and Decisions

-   **Countdown Timer**: Instead of just saying "no contribution today," we added a countdown timer to show the user exactly how much time they have left until the day resets at 00:00 UTC. This adds a sense of urgency and is more actionable.
-   **Environment Variables (`.env`)**: To keep sensitive data like the `GITHUB_USERNAME` and `GITHUB_PAT` secure and separate from the code, we used a `.env` file. This is a standard practice that prevents credentials from being accidentally committed to version control.
-   **Cross-Platform Automation**: We provided a `run_checker.bat` for Windows users and instructions for `cron` on macOS/Linux to make daily automation easy for everyone.

By transitioning from a fragile scraping script to a robust API-driven solution, we created a tool that is not only functional but also reliable and follows modern development best practices.
