import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!sql) {
      return NextResponse.json([]);
    }

    let result: any[];

    if (startDate || endDate) {
      result = await sql`
        SELECT 
          p.id,
          p.registration_code,
          p.full_name,
          p.organisation,
          p.position,
          p.phone,
          p.is_recurring,
          p.check_in_date,
          p.check_out_date,
          p.check_in_status,
          p.registration_source,
          CASE 
            WHEN p.check_out_date IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (p.check_out_date - p.check_in_date))/3600 
            ELSE NULL 
          END as visit_duration_hours,
          u_in.name as checked_in_by,
          u_out.name as checked_out_by,
          co.notes as check_out_notes
        FROM participants p
        LEFT JOIN check_ins ci ON p.id = ci.participant_id
        LEFT JOIN users u_in ON ci.user_id = u_in.id
        LEFT JOIN check_outs co ON p.id = co.participant_id
        LEFT JOIN users u_out ON co.user_id = u_out.id
        WHERE p.check_in_date IS NOT NULL
        ${startDate ? sql`AND p.check_in_date >= ${startDate}` : sql``}
        ${endDate ? sql`AND p.check_in_date <= ${endDate}` : sql``}
        ORDER BY p.check_in_date DESC
        LIMIT 1000
      `;
    } else {
      result = await sql`
        SELECT 
          p.id,
          p.registration_code,
          p.full_name,
          p.organisation,
          p.position,
          p.phone,
          p.is_recurring,
          p.check_in_date,
          p.check_out_date,
          p.check_in_status,
          p.registration_source,
          CASE 
            WHEN p.check_out_date IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (p.check_out_date - p.check_in_date))/3600 
            ELSE NULL 
          END as visit_duration_hours,
          u_in.name as checked_in_by,
          u_out.name as checked_out_by,
          co.notes as check_out_notes
        FROM participants p
        LEFT JOIN check_ins ci ON p.id = ci.participant_id
        LEFT JOIN users u_in ON ci.user_id = u_in.id
        LEFT JOIN check_outs co ON p.id = co.participant_id
        LEFT JOIN users u_out ON co.user_id = u_out.id
        WHERE p.check_in_date IS NOT NULL
        ORDER BY p.check_in_date DESC
        LIMIT 1000
      `;
    }

    console.log('Visitor history result count:', result.length);
    return NextResponse.json(result || []);
  } catch (error) {
    console.error('Error fetching visitor history:', error);
    return NextResponse.json([]);
  }
}
