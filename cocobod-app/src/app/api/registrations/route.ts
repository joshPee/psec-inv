import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getCached, setCached } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q') || '';
    const filterStatus = searchParams.get('status') || 'ALL';
    const filterSource = searchParams.get('source') || 'ALL';
    const filterPreset = searchParams.get('preset') || 'ALL';
    const searchByCode = searchParams.get('searchByCode') === 'true';
    const sortBy = searchParams.get('sortBy') || 'sort_order';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    // Create cache key based on query parameters
    const cacheKey = `registrations:${searchQuery}:${filterStatus}:${filterSource}:${filterPreset}:${sortBy}:${sortOrder}`;
    
    // Check cache first (only for non-search queries)
    if (!searchQuery && filterPreset === 'ALL') {
      const cached = getCached(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Build the WHERE clause conditions
    const conditions = ["(event_id = (SELECT id FROM events WHERE status = 'ACTIVE' LIMIT 1) OR event_id IS NULL)"];
    const params: any[] = [];
    let paramIndex = 1;

    // Handle filter presets
    if (filterPreset === 'TODAY') {
      conditions.push(`DATE(registration_date) = CURRENT_DATE`);
    } else if (filterPreset === 'CHECKED_IN') {
      conditions.push(`check_in_status = 'CHECKED_IN'`);
    } else if (filterPreset === 'NOT_CHECKED_IN') {
      conditions.push(`check_in_status = 'NOT_CHECKED_IN'`);
    }

    // Only apply individual filters if no preset is selected
    if (filterPreset === 'ALL') {
      if (searchQuery) {
        const searchTerm = `%${searchQuery.toLowerCase()}%`;
        if (searchByCode) {
          conditions.push(`LOWER(registration_code) LIKE $${paramIndex}`);
        } else {
          conditions.push(`(LOWER(registration_code) LIKE $${paramIndex} OR LOWER(full_name) LIKE $${paramIndex} OR LOWER(organisation) LIKE $${paramIndex} OR LOWER(phone) LIKE $${paramIndex})`);
        }
        params.push(searchTerm);
        paramIndex++;
      }

      if (filterStatus !== 'ALL') {
        conditions.push(`check_in_status = $${paramIndex}`);
        params.push(filterStatus);
        paramIndex++;
      }

      if (filterSource !== 'ALL') {
        conditions.push(`registration_source = $${paramIndex}`);
        params.push(filterSource);
        paramIndex++;
      }
    } else if (searchQuery) {
      // Allow search with preset
      const searchTerm = `%${searchQuery.toLowerCase()}%`;
      if (searchByCode) {
        conditions.push(`LOWER(registration_code) LIKE $${paramIndex}`);
      } else {
        conditions.push(`(LOWER(registration_code) LIKE $${paramIndex} OR LOWER(full_name) LIKE $${paramIndex} OR LOWER(organisation) LIKE $${paramIndex} OR LOWER(phone) LIKE $${paramIndex})`);
      }
      params.push(searchTerm);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate and set sort column
    const validSortColumns = ['registration_code', 'full_name', 'organisation', 'registration_date', 'sort_order'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'sort_order';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Build the full query
    const query = `
      SELECT 
        id,
        registration_code,
        full_name,
        organisation,
        position,
        phone,
        registration_date,
        check_in_status,
        check_in_date,
        registration_source,
        sort_order
      FROM participants
      ${whereClause}
      ORDER BY ${sortColumn} ${order}
    `;

    const result = await pool.query(query, params);

    // Cache the result for non-search queries
    if (!searchQuery && filterPreset === 'ALL') {
      setCached(cacheKey, result.rows);
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
