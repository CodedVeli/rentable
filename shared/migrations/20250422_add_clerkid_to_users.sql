-- Add clerkId column to users table for Clerk integration
ALTER TABLE users ADD COLUMN clerk_id TEXT UNIQUE;
