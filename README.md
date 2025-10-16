# Streaky - GitHub Streak Guardian

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Never lose your GitHub streak again! Get instant notifications when your contribution streak is at risk.

---

## Why Streaky?

GitHub streaks represent consistency in your coding habits. Don't let a busy day break your streak - Streaky keeps you on track with timely reminders.

---

## Web App (Recommended)

**Coming Soon!** The easiest way to keep your streak alive:

- **Zero setup required** - Sign in with GitHub and start monitoring
- **Always running** - Cloud-based daily checks at 8 PM UTC
- **Multi-platform notifications** - Discord and Telegram support
- **Beautiful interface** - Modern design with smooth animations

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
├── web/              # Web application (coming soon)
│   ├── frontend/     # Next.js
│   ├── backend/      # Cloudflare Workers
│   └── database/     # D1 SQLite schemas
└── docs/             # Documentation
```

---

## Contributors

Thanks to all the amazing people who have contributed to Streaky!

<a href="https://github.com/0xReLogic/streaky/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=0xReLogic/streaky" />
</a>

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with love by the GitHub Streak Alert contributors
</p>
