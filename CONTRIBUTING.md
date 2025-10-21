# Contributing to Streaky

Thanks for your interest in contributing! This document explains how to propose changes and the project standards. Please read it fully before opening an issue or a pull request.

---

## Project Overview

Streaky is a full-stack application that helps developers maintain their GitHub contribution streaks through automated monitoring and notifications.

### Architecture

- **Web App** (Primary): Next.js 15 frontend + Cloudflare Workers backend
- **CLI Tool**: Python-based self-hosted alternative
- **Notification Proxy**: Rust server for secure notification delivery

### Core Principles

- __Purpose__: Reliable GitHub streak monitoring with timely notifications
- __Security__: AES-256-GCM encryption for all credentials, JWT authentication
- __Privacy__: Zero-knowledge architecture, encrypted data at rest
- __Branding__: This repository is owned by 0xReLogic. Do not add personal branding

---

## How to Contribute

1. __Open an issue__ describing the problem or proposed feature
2. __Fork__ the repository and create a feature branch:
   - `git checkout -b feat/short-description`
   - `git checkout -b fix/bug-description`
3. __Make changes__ and update documentation as needed
4. __Open a Pull Request__ with a clear summary

Please be respectful and constructive. Small, focused PRs are easier to review and merge.

---

## Development Setup

### Web Application

**Frontend (Next.js 15)**

```bash
cd web/frontend
npm install

# Copy and configure environment variables
cp env.example .env.local
# Edit .env.local with your values

npm run dev
```

Requirements:
- Node.js 18+
- Environment variables (see `env.example` for details):
  - `NEXT_PUBLIC_API_URL` - Your Cloudflare Worker URL
  - `NEXTAUTH_URL` - Your app URL
  - `NEXTAUTH_SECRET` - JWT signing secret
  - `AUTH_GITHUB_ID` - GitHub OAuth Client ID
  - `AUTH_GITHUB_SECRET` - GitHub OAuth Client Secret
  - `SERVER_SECRET` - Shared secret with backend

**Backend (Cloudflare Workers)**

```bash
cd web/backend
npm install

# Copy and configure environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your values

# Create D1 database
wrangler d1 create streaky-db
# Copy database_id to wrangler.toml

# Run migrations
wrangler d1 migrations apply streaky-db --local

npm run dev
```

Requirements:
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account
- Environment variables (see `.dev.vars.example` for details):
  - `ENCRYPTION_KEY` - AES-256-GCM key for encrypting credentials
  - `NEXTAUTH_SECRET` - Must match frontend
  - `SERVER_SECRET` - Must match frontend
  - `VPS_URL` - Your Rust notification proxy URL
  - `VPS_SECRET` - Shared secret with Rust server

### CLI Tool

```bash
cd cli
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Fill in your credentials
python main.py
```

Requirements:
- Python 3.8+
- GitHub Personal Access Token with `read:user` scope

### Notification Proxy (Rust)

```bash
cd server

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values

cargo build
cargo run
```

Requirements:
- Rust 1.70+
- Environment variables (see `.env.example` for details):
  - `ENCRYPTION_KEY` - Must match backend encryption key
  - `VPS_SECRET` - Must match backend VPS_SECRET
  - `PORT` - Server port (default: 3000)
  - `RUST_LOG` - Log level (info, debug, etc.)

---

## Code Style

### Frontend (TypeScript/React)
- Use TypeScript strict mode
- Follow React 19 best practices
- Use Tailwind CSS for styling
- Prefer server components when possible
- Use shadcn/ui components for consistency

### Backend (TypeScript/Cloudflare)
- Use Hono framework patterns
- Implement proper error handling
- Use TypeScript types for all API responses
- Follow Cloudflare Workers best practices

### CLI (Python)
- Python 3.8+ compatibility
- Follow PEP 8 style guide
- Use type hints where appropriate
- Keep dependencies minimal

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add GitHub star button to navigation`
- `fix: handle API rate-limit error`
- `docs: update setup instructions`
- `refactor: simplify authentication flow`
- `chore: bump dependencies`

---

## Pull Request Checklist

Before submitting:

- [ ] Change is __scoped__ and focused (1 PR = 1 purpose)
- [ ] No secrets or tokens committed
- [ ] Documentation updated if needed
- [ ] Code follows project style guidelines
- [ ] Manual testing completed
- [ ] No personal branding added

### Testing Guidelines

**Web App:**
- Test authentication flow
- Verify API endpoints work correctly
- Check responsive design on mobile/desktop
- Test notification configuration

**CLI:**
- Run `python main.py` with valid `.env`
- Test error handling with invalid credentials
- Verify countdown display near UTC midnight

---

## Proposing Features

For larger additions:
1. Open an issue describing the feature and use case
2. Discuss implementation approach
3. Get approval before starting work
4. Submit PR with clear documentation

Feature guidelines:
- Must align with project goals
- Should not compromise security
- Must maintain backward compatibility when possible
- Include configuration options where appropriate

---

## Reporting Issues

Please include:
- Component affected (Web App, CLI, Backend, etc.)
- OS and relevant version info
- Steps to reproduce
- Expected vs actual behavior
- Logs or screenshots (omit secrets)

---

## Security

If you discover a security vulnerability:
1. **Do not** open a public issue
2. Email the maintainers directly
3. Include detailed reproduction steps
4. Allow time for a fix before disclosure

---

## Questions?

Feel free to open a discussion or issue for:
- Clarification on contribution process
- Architecture questions
- Feature proposals
- General feedback

Thanks for contributing to Streaky!
