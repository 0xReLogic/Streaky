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
- **3D Animation**: Spline React
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
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8787
```

**Backend** (`backend/.dev.vars`):
```env
ENCRYPTION_KEY=your-32-character-encryption-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

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

- 🎨 Beautiful 3D landing page with Spline animations
- 🔐 Secure GitHub OAuth authentication
- 📊 Real-time streak tracking dashboard
- 🔔 Discord & Telegram notifications
- ⏰ Daily automated checks at 8 PM UTC
- 📱 Fully responsive design
- 🚀 Serverless architecture (zero cost for <100k users)

## Documentation

- [Requirements](../../.kiro/specs/streaky-web-app/requirements.md)
- [Design](../../.kiro/specs/streaky-web-app/design.md)
- [Implementation Tasks](../../.kiro/specs/streaky-web-app/tasks.md)

## License

MIT
