# COCOBOD Training School Meeting - Registration and Check-In App

Build a complete, production-ready web application for COCOBOD Training School to manage participant registration and check-in for a meeting on 19 August 2026.

The app must be responsive and work well on Android phones, tablets, laptops, and desktop computers.

## Stack

Frontend:
- Next.js with App Router
- TypeScript
- Tailwind CSS
- Responsive mobile-first UI

Backend:
- Next.js server-side functionality and API routes
- PostgreSQL database
- Prisma ORM

Database:
- Neon PostgreSQL

Authentication:
- HR administrators only, using NextAuth
- Participants must NOT create accounts or log in

Deployment:
- Vercel
- Neon PostgreSQL

## Branding

Use the uploaded QCC logo as the primary event logo. Professional COCOBOD/QCC visual identity: deep green, gold, white, dark charcoal. Clean, uncluttered interface. Do not distort the logo. Store it as a proper static asset in the project.

## Core concept

Two user types only:
1. Participant (public registration page, no login)
2. HR Admin (secure dashboard)

Participants never access the admin dashboard.

## Participant flow

Participant opens the registration link on their phone.

Display:

```
COCOBOD TRAINING SCHOOL
MEETING REGISTRATION
19 AUGUST 2026

Please complete the form below. After registration, you'll receive
a registration code. Keep it and give it at the registration desk
on arrival.
```

### Registration form

Only three fields, all required:
- Full Name
- Organisation
- Position

No phone, no email, no region, no category, no vehicle registration. Keep it fast to fill and light on personal data.

Validate that all three fields are non-empty. Trim whitespace. Reject obviously junk input (single characters, all-numeric names) with a clear message.

Duplicate detection: flag a likely duplicate when full name and organisation both closely match an existing registration, but don't hard-block it. Show a warning ("A similar registration already exists, submit anyway?") and let the participant confirm and proceed. This avoids blocking two different people who happen to share a name.

### Registration code

Generate a unique code on submission, format:

```
CTS-4827
```

Numeric portion should be random, not sequential. On generation, check the database for a collision and regenerate if one occurs. Store the code in PostgreSQL with a unique constraint.

No QR code. The registration code itself is the only identifier, used for both self-service reference and HR check-in search.

### Confirmation

```
REGISTRATION SUCCESSFUL

Thank you, [Participant Name].
Your registration has been confirmed.

REGISTRATION CODE
CTS-4827

Please remember this code. Give it at the registration desk on
19 August 2026.
```

Provide a "Save Registration" action (downloads or screenshots the confirmation). No print action needed since there's no tag or QR to render.

### Participant record

Store:
- ID
- Registration code
- Full name
- Organisation
- Position
- Registration date/time
- Registration status
- Check-in status
- Check-in date/time
- Checked-in-by HR user
- Registration source (ONLINE / WALK-IN)
- Created timestamp
- Updated timestamp

## HR admin login

`/admin/login` - email and password, NextAuth, secure session handling.

Protect every admin route server-side:
```
/admin
/admin/dashboard
/admin/registrations
/admin/check-in
/admin/attendance
/admin/settings
```

## HR dashboard

```
COCOBOD TRAINING SCHOOL
MEETING ADMINISTRATION
19 AUGUST 2026
```

Cards: Total Registered, Checked In, Not Yet Arrived, plus an attendance percentage. Numbers come directly from PostgreSQL.

Navigation: Dashboard, Check-In, Registrations, Attendance, Settings, Logout. Clean mobile nav on small screens.

## Check-in screen

`/admin/check-in` - the most important HR page. Auto-focus a search input on load.

```
CHECK-IN PARTICIPANT

[ Enter Registration Code or Name ]
[ SEARCH ]
```

Manual entry only, no QR scanning since there's no QR code anymore. Support search by:
- Registration code
- Full name
- Organisation

Return enough info to identify the right person without over-fetching. On match, show a verification card:

```
FULL NAME       John Mensah
ORGANISATION    ABC Company
POSITION        Senior Manager
REGISTRATION CODE   CTS-4827
CHECK-IN STATUS     NOT CHECKED IN

[ CONFIRM & CHECK IN ]
```

### Check-in process

On confirm:
1. Re-verify the participant exists and is registered.
2. Re-verify they haven't already checked in (do this inside a DB transaction with a unique constraint on the check-in relation, not just an application-level check, to prevent a race between two admins checking the same person in at once).
3. Record server timestamp and the authenticated HR admin.
4. Set status to CHECKED IN.
5. Show success.

```
CHECK-IN SUCCESSFUL

John Mensah
CTS-4827
Checked in at 8:42 AM
```

If already checked in:

```
ALREADY CHECKED IN

John Mensah
Checked in at 8:42 AM
Checked in by HR Admin
```

Do not create a duplicate check-in record.

## Registrations page

`/admin/registrations` - searchable, filterable table.

Columns: Registration Code, Full Name, Organisation, Position, Registration Date, Check-In Status, Check-In Time, Source (Online/Walk-in).

Features: search, filter by check-in status, filter by source, sort by date, view, edit, export to CSV.

## Attendance page

`/admin/attendance` - Total Registered, Total Checked In, Total Not Checked In, Attendance Percentage. Table with the same columns as above, filterable (All / Checked In / Not Checked In), searchable, CSV export.

## Walk-in registration

`[ ADD WALK-IN ]` on the check-in or registrations page. Same three fields (name, organisation, position). HR creates the record, system generates a unique code, HR can immediately check the person in. Mark source as WALK-IN.

## Database design

Models: `User` (HR admins), `Participant`, `CheckIn`, `Event`.

`Event`: id, name, date, venue, description, status, created timestamp.

`Participant` belongs to an `Event`.

`CheckIn` references `Participant` and `User`, with a unique constraint on `participantId` so a participant can only have one check-in record ever, enforced at the database level.

Unique constraints: registration code, user email.

Indexes: registration code, full name, organisation, check-in status.

## Event configuration

Don't hard-code event details. Store in an `Event` record:
- Name: COCOBOD Training School Meeting
- Date: 19 August 2026
- Venue: COCOBOD Training School

Editable from Settings.

## Admin settings

`/admin/settings` - event name, date, venue, registration open/closed toggle, event logo.

When registration is closed, participant page shows:

```
REGISTRATION CLOSED
Please contact the organisers for assistance.
```

## Security requirements

- Secure password hashing (NextAuth default or bcrypt)
- Server-side auth checks on every admin route
- Input validation client and server side (Zod)
- SQL injection protection via Prisma
- Rate limiting on public registration and login endpoints, implemented with Upstash Redis or equivalent edge-compatible store, not just a TODO comment
- Secure cookies/session handling
- No database credentials exposed to the browser
- Environment variables for secrets, never committed

## UX and responsiveness

Participant registration should take under a minute given only three fields. Check-in page should load fast, auto-focus search, give obvious success/error feedback, avoid animation, use large touch-friendly buttons.

Test at 360px, 390px, 430px mobile widths, plus tablet, laptop, desktop.

## Error states

Invalid code, registration not found, already checked in, registration closed, duplicate registration, network failure, database failure, invalid form data, expired session, unauthorized admin access. Clear, human-readable messages for each.

## Loading states

Add to: registration submission, search, check-in, CSV export. Prevent duplicate submissions on double-click.

## Audit log

Optional for MVP, add if time allows after core flow works. Record user, action, participant, timestamp for: participant created, participant edited, participant checked in, participant deleted, event settings changed.

## Reporting

Optional for MVP. If time allows: total registrations, total checked in, attendance percentage, registrations by organisation, check-ins by time, CSV export.

## Seed data

One event (COCOBOD Training School Meeting), one HR admin account, several sample participants covering: registered but not checked in, checked in, walk-in.

## Environment variables

`.env.example` with placeholders for `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`. No real credentials in source.

## Project structure

Separate components, pages, API/server actions, database, authentication, validation, utilities, types.

## Validation

Zod on both client and server. Never trust client-side validation alone.

## Landing page

```
QCC LOGO
COCOBOD TRAINING SCHOOL
MEETING REGISTRATION
19 AUGUST 2026

[ REGISTER NOW ]

Already registered? Keep your code and present it at the
registration desk.
```

## Important product decisions

- No participant accounts, no passwords, no login
- No app download required, browser only
- No QR code, no printed tag
- Registration code is the single identifier for lookup

## Implementation priority

1. PostgreSQL database and Prisma schema
2. Authentication (NextAuth)
3. Participant registration (3 fields)
4. Unique registration code generation with collision handling
5. Confirmation page
6. HR dashboard
7. Code/name search
8. Check-in with transactional duplicate prevention
9. Attendance view
10. CSV export
11. Walk-in registration
12. Settings
13. Audit log and reporting (if time allows)
14. UI polish

Get registration through check-in working end to end before touching anything below item 10.

## Deliverables

Complete source code, Prisma schema, migrations, seed script, auth, all pages, API/server actions, responsive UI, CSV export, `.env.example`, README with deployment instructions for Neon and Vercel.

Must run with `npm install` and `npm run dev`, and `npm run build` must succeed without errors.

## Testing

Test the full flow: registration → code generation → confirmation → HR login → search → verification → check-in → duplicate check-in rejection → attendance update → CSV export. Test on a mobile viewport.

Fix all TypeScript, Prisma, build, runtime, and responsive UI errors before finishing.

## Acceptance criteria

A participant registers on a phone with just name, organisation, and position, no login. They get a unique code and a confirmation page. HR logs in, searches by code or name, sees the participant's details, confirms check-in, and the exact time and admin are recorded. A second check-in attempt on the same person is rejected. HR can export the attendance list. The app works on mobile, tablet, and desktop.
