-- Staff/Host Management System Schema
-- This schema adds staff/host management for the visitor management system

-- Create staff table for PCC staff members
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_full_name ON staff(full_name);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);

-- Create trigger for staff updated_at
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();