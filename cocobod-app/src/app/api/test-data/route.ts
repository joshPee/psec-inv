import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const firstNames = ['Kwame', 'Ama', 'Kofi', 'Adwoa', 'Emmanuel', 'Grace', 'Samuel', 'Beatrice', 'Daniel', 'Esther', 'Peter', 'Ruth', 'Thomas', 'Victoria', 'Francis', 'Elizabeth', 'John', 'Mary', 'David', 'Sarah', 'Michael', 'Patricia', 'Robert', 'Jennifer', 'William'];
const lastNames = ['Mensah', 'Serwaa', 'Asante', 'Frempong', 'Osei', 'Ansah', 'Addo', 'Owusu', 'Boateng', 'Darko', 'Agyeman', 'Ofori', 'Kwarteng', 'Amoah', 'Asamoah', 'Frimpong', 'Dankwa', 'Owusu', 'Ampofo', 'Barnes', 'Cobbina', 'Doe', 'Essien', 'Fosu', 'Gyasi'];
const locations = ['Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Cape Coast', 'Sunyani', 'Ho', 'Wa', 'Bolgatanga', 'Koforidua', 'Obuasi', 'Tema', 'Kasoa', 'Madina', 'Lapaz', 'Tema', 'Ashiaman', 'Nkawkaw', 'Sefwi', 'Goaso'];
const organisations = ['COCOBOD', 'World Bank', 'UNDP', 'FAO', 'IFAD', 'ADB', 'AfDB', 'ECOWAS', 'Gold Fields', 'GPHA', 'Ghana Ports', 'Ghana Revenue', 'Ghana Immigration', 'Customs', 'GSA', 'FDA', 'EPA', 'Ghana Water', 'Ministry', 'Private'];
const positions = ['Manager', 'Director', 'Officer', 'Consultant', 'Coordinator', 'Specialist', 'Analyst', 'Economist', 'Advisor', 'Engineer', 'Supervisor', 'Auditor', 'Admin', 'Executive', 'Assistant', 'Tech', 'Researcher', 'Planner', 'Staff', 'Lead'];
const hostNames = ['Osei', 'Agyeman', 'Boateng', 'Mensah', 'Amoah', 'Kwarteng', 'Ofori', 'Darko', 'Asamoah', 'Frimpong', 'Ofori', 'Owusu', 'Agyeman', 'Addo', 'Owusu'];
const departments = ['Finance', 'Research', 'Operations', 'Planning', 'Projects', 'Agriculture', 'Programs', 'Technical', 'Economics', 'Regional', 'Port Ops', 'Logistics', 'Audit', 'Security', 'Admin', 'HR', 'Legal', 'Marketing', 'IT', 'Procurement'];
const visitPurposes = ['Meeting', 'Inspection', 'Training', 'Consultation', 'Review', 'Support', 'Monitoring', 'Financial', 'Research', 'Policy', 'Site Visit', 'Coordination', 'Audit', 'Security', 'Contract', 'Discussion', 'Testing', 'Assessment', 'Planning', 'Review'];

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomPhone() {
  const prefixes = ['024', '025', '026', '027', '028', '029', '020', '050', '054', '055', '059', '023'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 9000000 + 1000000).toString();
  return (prefix + suffix).substring(0, 10);
}

function generateVehicleReg() {
  const regions = ['AW', 'GR', 'GW', 'AE', 'CR', 'BA', 'VR', 'WR', 'UE', 'ER', 'AS', 'TM', 'CA', 'MA', 'LA', 'GC', 'GN', 'ST', 'SN', 'GS'];
  const region = regions[Math.floor(Math.random() * regions.length)];
  const numbers = Math.floor(Math.random() * 900 + 100);
  const letters = Math.floor(Math.random() * 90 + 10);
  return `${region}-${numbers}-${letters}`;
}

export async function POST(request: NextRequest) {
  try {
    const { count = 15 } = await request.json();
    const visitorsToCreate = Math.min(count, 50);
    const createdVisitors = [];
    const errors = [];

    for (let i = 0; i < visitorsToCreate; i++) {
      const fullName = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
      const registrationCode = `PCC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const visitor = {
        full_name: fullName,
        phone: generateRandomPhone(),
        location: getRandomItem(locations),
        organisation: getRandomItem(organisations),
        position: getRandomItem(positions),
        host_name: getRandomItem(hostNames),
        host_department: getRandomItem(departments),
        visit_purpose: getRandomItem(visitPurposes),
        vehicle_registration: generateVehicleReg(),
      };
      
      try {
        const result = await sql`
          INSERT INTO participants (
            full_name, phone, location, organisation, position, 
            host_name, host_department, visit_purpose, vehicle_registration,
            registration_code, registration_date, check_in_status, check_in_date
          )
          VALUES (
            ${visitor.full_name}, ${visitor.phone}, ${visitor.location}, ${visitor.organisation}, ${visitor.position},
            ${visitor.host_name}, ${visitor.host_department}, ${visitor.visit_purpose}, ${visitor.vehicle_registration},
            ${registrationCode}, NOW(), 'CHECKED_IN', NOW()
          )
          RETURNING id, registration_code, full_name
        `;
        
        createdVisitors.push(result[0]);
      } catch (insertError) {
        console.error('Error inserting visitor:', insertError);
        errors.push({ visitor: fullName, error: insertError instanceof Error ? insertError.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdVisitors.length} random test visitors`,
      visitors: createdVisitors,
      errors: errors
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { error: 'Failed to create test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
