# COCOBOD Application - Features & Functionalities

## Overview

This is a comprehensive dual-purpose web application that combines:
1. **Security Equipment Management System** - For managing security equipment inventory, guards, and equipment distribution
2. **Visitor Management System** - For managing visitors, check-ins, check-outs, meetings, and event attendees

---

## Security Equipment Management System

### 1. Dashboard

**Main Dashboard** (`/dashboard`)
- Real-time inventory overview with 5-pill tracking system
- KPI cards showing:
  - Total Items, Available, Reserved, Issued, Damaged, Missing quantities
  - Active issued units and overdue items count
  - Guards with equipment and equipment percentage
  - Today's transactions (issued/returned)
- Custodian Operations Hub with activity tracking
- Armory Directives board for shift communication
- Live equipment quick search with stock availability
- Category distribution and armory readiness meter
- Active equipment checkouts table
- Recent equipment movements log

### 2. Equipment Inventory Management

**Inventory Page** (`/inventory`)
- View all equipment items with detailed information
- Search by equipment name or code
- Filter by category
- View item details including:
  - Item name, code, and category
  - Total, available, reserved, issued, damaged, missing quantities
  - Storage location and default condition
- Add new equipment items
- Edit existing equipment details
- Delete equipment items

**Categories Page** (`/categories`)
- Manage equipment categories
- Create new categories with name and description
- Edit existing categories
- Delete categories
- View equipment count per category
- Search and filter categories
- Visual category cards with equipment counts

### 3. Equipment Issue & Return

**Issue Equipment** (`/issue`)
- Issue equipment to security guards
- Select equipment from available stock
- Select recipient guard
- Specify quantity, condition, shift, and duty point
- Add remarks/notes
- View all issued equipment history
- Search issued items by equipment, guard, or custodian
- Track issued date and time

**Return Equipment** (`/return`)
- Process equipment returns from guards
- Select outstanding issue to return
- Specify quantity returned
- Record condition at return (Good, Slightly Damaged, Damaged, Missing)
- Add return remarks
- View return history
- Search returned items
- Track return dates

**Active Issues** (`/active`)
- View all currently issued equipment
- Track equipment in circulation
- View guard assignment details
- Monitor overdue items
- Quick access to return functionality

### 4. Equipment Bookings

**Bookings Page** (`/bookings`)
- Guard equipment booking requests
- Approve or reject booking requests
- View booking status (Pending, Approved, Fulfilled, Rejected)
- Track requested for date and time
- View duty point and shift information
- Summary statistics: pending, approved, fulfilled bookings
- Reserved stock tracking

### 5. Guards Management

**Guards Portal** (`/guards`)
- Registry of all security guards
- Add new guards with:
  - Full name, badge ID, staff ID
  - Contact information
  - Team assignment
  - Shift assignment
- View guard details including:
  - Current equipment holdings
  - Shift and duty point
  - Issue history
- Search guards by name, badge ID, or staff ID
- Delete/remove guards (supervisor only)
- Track guards with gear vs without gear

**Guard Portal** (`/guard-portal`)
- Self-service portal for guards
- View own equipment bookings
- View own issue history
- Request equipment bookings
- View available equipment

### 6. Records & Incident Management

**Damaged Equipment Records** (`/records/damaged`)
- Record damaged equipment incidents
- Track equipment, guard, and damage severity
- Add damage notes and reasons
- Resolve damaged records
- Archive resolved incidents
- Option to restore stock when resolved
- Export reports (CSV/PDF)
- Filter by date range and status
- KPI overview: active, resolved, archived counts

**Missing Equipment Records** (`/records/missing`)
- Record missing equipment incidents
- Track missing items and responsible guards
- Resolve missing records
- Archive resolved incidents
- Export reports (CSV/PDF)
- Filter by date range and status

**Movement Records** (`/records/movement`)
- Track all equipment movements
- View complete audit trail
- Filter by action type (Issued, Returned, Damaged, Missing)
- Search by equipment or guard
- Date range filtering

### 7. Reports & Analytics

**Reports Page** (`/reports`)
- Category-wise statistics
- Damage rate per category
- Loss rate per category
- Issue rate per category
- Date range filtering
- Export inventory reports
- Export issue reports
- Export movement reports
- PDF generation for damaged/missing records

### 8. Bulk Operations

**Bulk Operations** (`/bulk-operations`)
- Bulk issue equipment to multiple guards
- Bulk return equipment
- Process multiple transactions efficiently

### 9. Settings & Configuration

**Settings** (available in admin dashboard)
- Event settings configuration
- System-wide parameters
- User management (admin module)

---

## Visitor Management System

### 1. Admin Dashboard

**Admin Dashboard** (`/admin/dashboard`)
- Real-time visitor statistics:
  - Visitors currently on site
  - Today's check-ins
  - Today's check-outs
  - Expected visitors
- Recent activity feed (check-ins/check-outs)
- Peak hours analytics (last 7 days)
- Quick action cards for:
  - Check In visitors
  - View Visitors
  - Check Out visitors

### 2. Visitor Management

**Visitors Page** (`/admin/visitors`)
- Complete visitor registry
- Add new visitors
- Edit visitor information
- Delete visitor records
- Search visitors by name or organization
- View visitor details and status

**Pre-Registration** (`/admin/pre-registration`)
- Pre-register expected visitors
- Set expected arrival dates
- Manage visitor categories
- Send invitations (if applicable)

**Expected Attendees** (`/admin/expected-attendees`)
- View list of expected visitors
- Check in pre-registered visitors
- Track expected vs actual arrivals
- Export expected attendees list

### 3. Check-In & Check-Out

**Check-In** (`/admin/check-in`)
- Register visitor arrival
- Search for pre-registered visitors
- Capture visitor details for walk-ins
- Assign visitor badges/QR codes
- Set check-in time
- Capture visitor photo (if applicable)

**Check-Out** (`/admin/check-out`)
- Register visitor departure
- Search for checked-in visitors
- Process check-out
- Set check-out time
- Update visitor status

**Active Visitors** (`/active` - dual-purpose)
- View visitors currently on site
- Monitor visitor duration
- Quick check-out access

### 4. Meeting Management

**Meetings** (`/admin/meetings`)
- Schedule meetings
- Invite participants
- Track meeting attendees
- Manage meeting rooms/locations
- View meeting calendar

### 5. Attendance & Audit

**Attendance** (`/admin/attendance`)
- Track overall attendance
- View attendance reports
- Generate attendance summaries
- Filter by date ranges

**Audit Log** (`/admin/audit-log`)
- Complete system audit trail
- Track all user actions
- View modification history
- Security and compliance tracking

**Shift Handover** (`/admin/shift-handover`)
- Shift-to-shift communication
- Handover notes
- Outstanding items tracking
- Duty point updates

### 6. Participant Management

**Participants** (`/admin/participants`)
- Manage event participants
- View participant details
- Track participant status
- Bulk import participants
- Export participant lists

**Registrations** (`/admin/registrations`)
- View all registrations
- Registration status tracking
- Approve/reject registrations
- Export registration data

### 7. Additional Admin Features

**Staff Management** (`/admin/hosts-staff`)
- Manage staff accounts
- Assign roles and permissions
- Track staff activities

**Users Management** (`/admin/users`)
- User account management
- Role-based access control
- Password management

**Incidents** (`/admin/incidents`)
- Log security incidents
- Track incident resolution
- Incident reporting

**Watchlist** (`/admin/watchlist`)
- Maintain security watchlist
- Flag suspicious individuals
- Access control for watchlisted persons

**Visitor Categories** (`/admin/visitor-categories`)
- Categorize visitor types
- Custom category creation
- Category-based access rules

**Vehicles** (`/admin/vehicles`)
- Track visitor vehicles
- Vehicle registration
- Parking management

**QR Code Generation** (`/admin/qr-code`)
- Generate QR codes for visitors
- Print visitor badges
- Mobile check-in support

**Visitor History** (`/admin/visitor-history`)
- Complete visitor history
- Past visit records
- Frequency analysis

---

## Authentication & Access Control

### User Roles

1. **SECURITY_SUPERVISOR**
   - Full access to all equipment management features
   - Can add/edit/delete guards
   - Can approve/reject bookings
   - Can manage categories and inventory
   - Full reporting access

2. **EQUIPMENT_CUSTODIAN**
   - Issue and return equipment
   - View inventory and active issues
   - Record damaged/missing items
   - View reports
   - Cannot delete guards or manage users

3. **GUARD**
   - Access to guard portal
   - View own equipment holdings
   - Request equipment bookings
   - View own issue history
   - Limited access to other features

4. **ADMIN** (Visitor Management)
   - Full access to visitor management features
   - Check-in/check-out visitors
   - Manage meetings and events
   - Access all admin dashboard features

### Authentication

- NextAuth.js integration
- Session-based authentication
- Secure password hashing (bcrypt)
- Role-based access control
- Protected routes
- Login page (`/login`)
- Admin login (`/admin/login`)

---

## Technical Features

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)
- **Form Handling**: Native HTML forms with validation
- **Type Safety**: TypeScript

### Backend
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs

### Database Schema
- Equipment and categories
- Guards and staff
- Equipment issues and bookings
- Equipment movements
- Damaged/missing records
- Participants and visitors
- Meetings and events
- Users and roles
- Audit logs

### Export & Reporting
- CSV export functionality
- PDF generation (jsPDF, jsPDF-autotable)
- Date range filtering
- Category-based reports
- Movement tracking reports

### Additional Features
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Real-time data updates
- Search and filtering across all modules
- Toast notifications for user feedback
- Dialog-based forms and confirmations
- Loading states and error handling
- Database connection error handling

---

## API Endpoints

### Equipment Management
- `GET/POST /api/equipment` - Equipment CRUD
- `GET/POST /api/equipment/categories` - Category management
- `POST /api/equipment/issue` - Issue equipment
- `POST /api/equipment/return` - Return equipment
- `POST /api/equipment/bulk-issue` - Bulk issue
- `POST /api/equipment/bulk-return` - Bulk return

### Guards
- `GET/POST /api/guards` - Guard CRUD
- `DELETE /api/guards/[id]` - Delete guard
- `POST /api/guard-auth` - Guard authentication

### Bookings
- `GET/POST /api/bookings` - Booking CRUD
- `PATCH /api/bookings/[id]` - Update booking

### Records
- `GET/POST /api/records/damaged` - Damaged records
- `PATCH /api/records/damaged/[id]` - Resolve damaged
- `GET/POST /api/records/missing` - Missing records
- `PATCH /api/records/missing/[id]` - Resolve missing

### Reports
- `GET /api/reports/export/inventory` - Export inventory
- `GET /api/reports/export/issues` - Export issues
- `GET /api/reports/export/movements` - Export movements
- `GET /api/reports/damaged/export` - Export damaged (CSV)
- `GET /api/reports/damaged/export-pdf` - Export damaged (PDF)
- `GET /api/reports/missing/export` - Export missing (CSV)
- `GET /api/reports/missing/export-pdf` - Export missing (PDF)

### Visitor Management
- `GET/POST /api/participants` - Participant management
- `POST /api/participants/pre-register` - Pre-register
- `POST /api/participants/bulk-import` - Bulk import
- `POST /api/check-in` - Check-in visitor
- `POST /api/check-out` - Check-out visitor
- `GET/POST /api/meetings` - Meeting management
- `GET/POST /api/visitor-categories` - Visitor categories
- `GET/POST /api/watchlist` - Watchlist management

### System
- `POST /api/auth/[...nextauth]` - Authentication
- `GET /api/users/me` - Current user info
- `POST /api/users/change-password` - Change password
- `GET /api/audit-log` - Audit trail
- `GET /api/attendance/stats` - Attendance statistics

---

## User Interface Highlights

### Modern Design Elements
- Gradient headers and cards
- Glassmorphism effects (backdrop blur)
- Smooth transitions and animations
- Responsive grid layouts
- Status badges with color coding
- Icon-based navigation
- Interactive cards with hover effects
- Modal dialogs for forms
- Toast notifications
- Loading skeletons and states

### User Experience
- Intuitive navigation
- Quick search functionality
- Real-time data updates
- Contextual actions
- Confirmation dialogs for destructive actions
- Form validation with error messages
- Empty state designs
- Progressive disclosure of information

---

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based access control (RBAC)
- Protected API routes
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)
- CSRF protection (NextAuth)
- Audit logging for sensitive actions
- Secure file handling (no direct file uploads shown)

---

## Performance Optimizations

- Server-side rendering (SSR) where appropriate
- Client-side rendering for interactive components
- Suspense boundaries for loading states
- Database query optimization with includes
- Pagination for large datasets
- Lazy loading of components
- Efficient state management

---

## Deployment Considerations

- Environment variables for configuration
- Database connection pooling
- API rate limiting (can be added)
- Error handling and logging
- Graceful degradation for database failures
- Responsive design for all devices
