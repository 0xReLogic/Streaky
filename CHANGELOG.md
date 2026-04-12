# Release Notes - v1.2.0 (2026-04-12)

## Overview
Major technical maintenance and modernization update. This release migrates the entire project to the latest framework versions and resolves critical security vulnerabilities.

## Technical Changes

### Frontend
- Tailwind CSS 4 Migration: Fully adopted the new CSS-first engine.
- Next.js 16: Upgraded framework with Turbopack support.
- ESLint Flat Config: Native Next.js 16 flat configuration implemented.

### Backend and Server
- Rust Edition 2024: Upgraded server toolchain.
- Docker Infrastructure: Updated base image to rust:1.86-slim.

### Security and CI/CD
- Security Patches: Fixed 8 RUSTSEC vulnerabilities (aws-lc-sys, bytes, quinn, etc.).
- Monorepo Caching: Optimized GitHub Actions dependency paths.
