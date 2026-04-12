# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-12
### Added
- **Tailwind CSS 4 Migration**: Fully adopted the new CSS-first engine with `@theme` and `@plugin` architecture.
- **Rust Edition 2024**: Upgraded the server and CI toolchain to support the latest Rust edition.
- **ESLint Flat Config**: Implemented native Next.js 16 flat configuration for faster and more reliable linting.
- **Automatic Troubleshooting Log**: Added `maintenance_track.md` to track repository maintenance history.

### Changed
- **Next.js 16**: Upgraded the frontend framework to v16 with Turbopack optimizations.
- **Development Environment**: Standardized monorepo dependency management and caching in GitHub Actions.
- **Docker Infrastructure**: Updated server base image to `rust:1.85-slim` for Edition 2024 compatibility.

### Fixed
- **Security Patches**: Resolved 8 critical and high-severity RUSTSEC vulnerabilities (including `aws-lc-sys`, `bytes`, `quinn-proto`, and `rustls-webpki`).
- **CI Workspace Caching**: Fixed dependency caching paths for frontend and backend jobs in a monorepo structure.
- **ESLint Circular Errors**: Resolved "Converting circular structure to JSON" errors by migrating to native Next.js flat config exports.

## [1.1.0] - 2025-12-12
### Added
- Per-user reminder UTC hour setting (0–23).
- Hourly scheduler using Cloudflare Cron Triggers.

### Fixed
- Next.js security patch (CVE-2025-66478).

## [1.0.0] - 2025-10-21
### Added
- Initial stable release of Streaky Web Application.
- Frontend: Next.js 15, React 19, TypeScript.
- Backend: Cloudflare Workers, D1 database.
- Authentication: GitHub OAuth.
- Notifications: Discord and Telegram integration.
- Distributed Architecture with Service Bindings.
- Python-based CLI tool.

---
*Created by Antigravity AI*
