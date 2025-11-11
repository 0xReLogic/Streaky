# Streaky - GitHub Streak Guardian

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/0xReLogic/Streaky?style=social)](https://github.com/0xReLogic/Streaky/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/0xReLogic/Streaky)](https://github.com/0xReLogic/Streaky/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/0xReLogic/Streaky)](https://github.com/0xReLogic/Streaky/pulls)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/0xReLogic/Streaky)

Never lose your GitHub streak again! Get instant notifications when your contribution streak is at risk.

---

## Why Streaky?

GitHub streaks represent consistency in your coding habits. Don't let a busy day break your streak - Streaky keeps you on track with timely reminders.

### Your Data is Safe

We understand you're trusting us with sensitive credentials (GitHub PAT, Discord webhooks, Telegram tokens). Here's how we protect them:

- **AES-256-GCM Encryption** - All tokens encrypted in database with industry-standard encryption
- **Separate Key Storage** - Encryption keys stored separately from database in Cloudflare secrets
- **Even if database leaks** - Your tokens remain useless encrypted blobs without the encryption key
- **Zero knowledge architecture** - We can't access your tokens even if we wanted to
- **Automatic key rotation** - Regular security updates and key rotation support
- **No third-party access** - Your data never leaves Cloudflare and Vercel infrastructure

**Bottom line:** Your GitHub PAT, Discord webhooks, and Telegram tokens are encrypted and secure. A database breach would only expose encrypted gibberish, not your actual credentials.

---

## Web App (Recommended)

**Live at [streakyy.vercel.app](https://streakyy.vercel.app)**

The easiest way to keep your streak alive:

- **Zero setup required** - Sign in with GitHub and start monitoring
- **Always running** - Cloud-based daily checks at 12:00 UTC
- **Distributed architecture** - Scalable with isolated processing
- **Multi-platform notifications** - Discord and Telegram support
- **Clean interface** - Modern black and white design
- **Enterprise-grade security** - JWT authentication, AES-256 encryption, secure key storage
- **Your data stays encrypted** - Database leaks expose only useless encrypted data

---

## CLI (For Developers)

Want full control? Check out the [CLI version](./cli/README.md):

- **Self-hosted** - Run on your own machine
- **Full privacy** - Your data stays local
- **Automation ready** - Perfect for CI/CD workflows
- **Python-based** - Easy to customize and extend

### Quick Start

```bash
git clone https://github.com/0xReLogic/streaky.git
cd streaky/cli
pip install -r requirements.txt
python main.py
```

See the [CLI README](./cli/README.md) for detailed setup instructions.

---

## Contributing

We welcome contributions! Check out our [Contributing Guide](./CONTRIBUTING.md) to get started.

---

## Project Structure

```
streaky/
├── cli/              # Python CLI tool
├── server/           # Rust notification proxy (Axum + Koyeb)
│   ├── src/
│   │   ├── main.rs          # Axum server setup
│   │   ├── handlers.rs      # API endpoints
│   │   ├── encryption.rs    # AES-256-GCM decryption
│   │   ├── discord.rs       # Discord webhook sender
│   │   └── telegram.rs      # Telegram bot API sender
│   └── Dockerfile           # Container deployment config
└── web/              # Full-stack web application (Production)
    ├── frontend/     # Next.js 15 + shadcn/ui
    └── backend/      # Cloudflare Workers + D1 Database
```

---

## Tech Stack

**Frontend:**

- Next.js 15 (React 19, App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- NextAuth.js (OAuth)

**Backend API:**

- Cloudflare Workers (Hono framework)
- Cloudflare D1 (SQLite database)
- Service Bindings (distributed cron processing)
- Analytics Engine (SQL-queryable metrics)
- TypeScript


**Notification Proxy:**

- Rust (Axum web framework)
- Tokio (async runtime)
- AES-256-GCM encryption

**Security:**

- JWT authentication with signature verification
- AES-256-GCM encryption for all sensitive credentials
- End-to-end encryption (Worker → Rust VPS)
- Separate encryption key storage in Cloudflare secrets
- API authentication with secret headers
- CORS strict allowlist
- Rate limiting (60 requests per minute)
- Security headers (HSTS, CSP, X-Frame-Options)
- Stateless VPS design (no data persistence)

---

## Contributors

Thanks to all the amazing people who have contributed to Streaky!

<a href="https://github.com/0xReLogic/streaky/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=0xReLogic/streaky" />
</a>

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details..

