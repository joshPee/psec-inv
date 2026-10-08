-- Clear all visitor-related data for fresh start
-- This script deletes all visitor data without re-inserting any predefined participants

-- Delete all check-ins
DELETE FROM check_ins;

-- Delete all check-outs
DELETE FROM check_outs;

-- Delete all visitor logs
DELETE FROM visitor_logs;

-- Delete all participants
DELETE FROM participants;

-- Reset sequences if they exist
-- ALTER SEQUENCE participants_id_seq RESTART WITH 1;
