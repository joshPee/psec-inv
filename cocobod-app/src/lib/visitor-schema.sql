-- Visitor Management System Schema
-- This schema extends the existing system with visitor-specific features

-- Add check-out functionality to participants table (renamed conceptually to visitors)
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS check_out_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS check_out_by INTEGER,
ADD COLUMN IF NOT EXISTS visit_purpose TEXT,
ADD COLUMN IF NOT EXISTS visitor_type VARCHAR(50) DEFAULT 'GENERAL',
ADD COLUMN IF NOT EXISTS host_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS host_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS badge_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS expected_departure TIMESTAMP;

-- Add constraint for visitor types
ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS valid_visitor_type;
ALTER TABLE participants 
ADD CONSTRAINT valid_visitor_type 
CHECK (visitor_type IN ('GENERAL', 'VIP', 'CONTRACTOR', 'DELIVERY', 'INTERVIEW', 'MEETING', 'OTHER'));

-- Update check_in_status to include checked-out
ALTER TABLE participants 
DROP CONSTRAINT IF EXISTS valid_check_in_status;
ALTER TABLE participants 
ADD CONSTRAINT valid_check_in_status 
CHECK (check_in_status IN ('NOT_CHECKED_IN', 'CHECKED_IN', 'CHECKED_OUT'));

-- Create check_outs table for tracking check-out events
CREATE TABLE IF NOT EXISTS check_outs (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER UNIQUE NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_out_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create visitor_types table for configurable visitor types
CREATE TABLE IF NOT EXISTS visitor_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  requires_badge BOOLEAN DEFAULT true,
  requires_host BOOLEAN DEFAULT false,
  requires_pre_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create visitor_logs table for audit trail
CREATE TABLE IF NOT EXISTS visitor_logs (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER REFERENCES participants(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL, -- 'CHECK_IN', 'CHECK_OUT', 'REGISTER', 'UPDATE'
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add constraint for valid actions
ALTER TABLE visitor_logs 
ADD CONSTRAINT valid_action 
CHECK (action IN ('CHECK_IN', 'CHECK_OUT', 'REGISTER', 'UPDATE'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_visitor_type ON participants(visitor_type);
CREATE INDEX IF NOT EXISTS idx_participants_check_out_date ON participants(check_out_date);
CREATE INDEX IF NOT EXISTS idx_participants_host_name ON participants(host_name);
CREATE INDEX IF NOT EXISTS idx_participants_badge_number ON participants(badge_number);
CREATE INDEX IF NOT EXISTS idx_check_outs_participant_id ON check_outs(participant_id);
CREATE INDEX IF NOT EXISTS idx_check_outs_user_id ON check_outs(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_participant_id ON visitor_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_action_time ON visitor_logs(action_time);

-- Create trigger for visitor_logs updated_at
CREATE TRIGGER update_visitor_types_updated_at BEFORE UPDATE ON visitor_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default visitor types
INSERT INTO visitor_types (name, description, requires_badge, requires_host, requires_pre_approval) VALUES
('GENERAL', 'General visitor', true, false, false),
('VIP', 'Very Important Person', true, true, true),
('CONTRACTOR', 'Contractor or service provider', true, true, false),
('DELIVERY', 'Delivery personnel', true, false, false),
('INTERVIEW', 'Job interview candidate', true, true, false),
('MEETING', 'Business meeting attendee', true, true, false),
('OTHER', 'Other type of visitor', true, false, false)
ON CONFLICT (name) DO NOTHING;

-- Create view for active visitors (checked in but not checked out)
CREATE OR REPLACE VIEW active_visitors AS
SELECT 
  p.id,
  p.full_name,
  p.organisation,
  p.position,
  p.email,
  p.phone,
  p.visitor_type,
  p.host_name,
  p.host_department,
  p.badge_number,
  p.visit_purpose,
  p.check_in_date,
  p.expected_departure,
  u.name as checked_in_by,
  e.name as event_name
FROM participants p
JOIN check_ins ci ON p.id = ci.participant_id
LEFT JOIN users u ON ci.user_id = u.id
LEFT JOIN events e ON p.event_id = e.id
WHERE p.check_in_status = 'CHECKED_IN';

-- Create view for visitor history
CREATE OR REPLACE VIEW visitor_history AS
SELECT 
  p.id,
  p.full_name,
  p.organisation,
  p.position,
  p.email,
  p.phone,
  p.visitor_type,
  p.visit_purpose,
  p.check_in_date,
  p.check_out_date,
  EXTRACT(EPOCH FROM (p.check_out_date - p.check_in_date))/3600 as visit_duration_hours,
  u_in.name as checked_in_by,
  u_out.name as checked_out_by
FROM participants p
LEFT JOIN check_ins ci ON p.id = ci.participant_id
LEFT JOIN users u_in ON ci.user_id = u_in.id
LEFT JOIN check_outs co ON p.id = co.participant_id
LEFT JOIN users u_out ON co.user_id = u_out.id
WHERE p.check_in_status = 'CHECKED_OUT'
ORDER BY p.check_in_date DESC;
