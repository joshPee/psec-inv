-- Watchlist Management System Schema
-- This schema adds watchlist functionality for flagging individuals

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  added_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_full_name ON watchlist(full_name);
CREATE INDEX IF NOT EXISTS idx_watchlist_is_active ON watchlist(is_active);
CREATE INDEX IF NOT EXISTS idx_watchlist_date_added ON watchlist(date_added);

-- Create trigger for watchlist updated_at
CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON watchlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();