-- Add TMA Team Members
-- Registration codes format: TMA-XXXX (4 random digits)

INSERT INTO participants (
  registration_code,
  full_name,
  organisation,
  position,
  participant_status,
  registration_date,
  registration_status
) VALUES
  ('TMA-' || floor(random() * 9000 + 1000)::text, 'Hon. Ebi Bright', 'TMA', 'MCE', 'EXPECTED', CURRENT_TIMESTAMP, 'PENDING'),
  ('TMA-' || floor(random() * 9000 + 1000)::text, 'Francis Mensah', 'TMA', 'MCD', 'EXPECTED', CURRENT_TIMESTAMP, 'PENDING'),
  ('TMA-' || floor(random() * 9000 + 1000)::text, 'Jeremiah Amoafo', 'TMA', 'Metro Development Planner', 'EXPECTED', CURRENT_TIMESTAMP, 'PENDING'),
  ('TMA-' || floor(random() * 9000 + 1000)::text, 'Eden Gbekorvor', 'TMA', 'Metro Physical Planner', 'EXPECTED', CURRENT_TIMESTAMP, 'PENDING'),
  ('TMA-' || floor(random() * 9000 + 1000)::text, 'Frank Asante', 'TMA', 'PRO', 'EXPECTED', CURRENT_TIMESTAMP, 'PENDING'),
  ('TMA-' || floor(random() * 9000 + 1000)::text, 'Augustine Pepraf', 'TMA', 'Incoming MCD', 'EXPECTED', CURRENT_TIMESTAMP, 'PENDING')
ON CONFLICT (registration_code) DO NOTHING;
