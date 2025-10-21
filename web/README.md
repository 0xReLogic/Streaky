# Streaky Web Application

Never lose your GitHub streak again! Get instant Discord & Telegram notifications when your contribution streak is at risk.

## Project Structure

```
web/
├── frontend/          # Next.js frontend (Vercel)
├── backend/           # Cloudflare Worker backend
├── package.json       # Monorepo root configuration
└── README.md          # This file
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel

### Backend
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Cron**: Cloudflare Triggers (8 PM UTC daily)

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Cloudflare account (for backend deployment)
- Vercel account (for frontend deployment)
- GitHub OAuth App credentials

### Installation

1. Install dependencies:
```bash
cd web
npm install
```

2. Set up environment variables:

**Frontend** (`frontend/.env.local`):
```bash
# Copy example file
cp frontend/env.example frontend/.env.local

# Edit .env.local with your values:
# - NEXT_PUBLIC_API_URL (your Cloudflare Worker URL)
# - NEXTAUTH_URL (http://localhost:3000 for dev)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - AUTH_GITHUB_ID (GitHub OAuth App Client ID)
# - AUTH_GITHUB_SECRET (GitHub OAuth App Client Secret)
# - SERVER_SECRET (shared secret with backend)
```

**Backend** (`backend/.dev.vars`):
```bash
# Copy example file
cp backend/.dev.vars.example backend/.dev.vars

# Edit .dev.vars with your values:
# - ENCRYPTION_KEY (generate with: openssl rand -hex 32)
# - NEXTAUTH_SECRET (must match frontend)
# - SERVER_SECRET (must match frontend)
# - VPS_URL (your Rust notification proxy URL)
# - VPS_SECRET (shared secret with Rust server)
```

See `env.example` and `.dev.vars.example` files for detailed instructions.

### Development

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Frontend only (http://localhost:3000)
npm run dev:frontend

# Backend only (http://localhost:8787)
npm run dev:backend
```

### Building

Build both projects:
```bash
npm run build
```

### Deployment

Deploy frontend to Vercel:
```bash
npm run deploy:frontend
```

Deploy backend to Cloudflare:
```bash
npm run deploy:backend
```

## Features

- 🎨 Clean black and white modern design
- 🔐 Secure GitHub OAuth authentication
- 📊 Real-time streak tracking dashboard
- 🔔 Discord & Telegram notifications
- ⏰ Daily automated checks at 12:00 UTC
- 🔒 AES-256-GCM encryption for credentials
- 📱 Fully responsive design
- 🚀 Serverless architecture (Cloudflare + Vercel)

## Documentation

- [Main README](../README.md) - Project overview
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Environment Variables](frontend/env.example) - Frontend configuration
- [Backend Configuration](backend/.dev.vars.example) - Backend setup

## License

MIT
