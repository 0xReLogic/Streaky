-- Migration: Add GitHub PAT column to users table
-- Description: Store user's GitHub Personal Access Token for API access
-- Created: 2025-10-17

ALTER TABLE users ADD COLUMN github_pat TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_github_pat ON users(github_pat);
