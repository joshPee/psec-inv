# PSEC-INV System Overview

## System Description

PSEC-INV is a comprehensive security management system that combines two major functional areas:

1. **Security Equipment Management System** - Manages security equipment inventory, issuance to guards, returns, and tracking
2. **Visitor/Meeting Management System** - Handles participant registration, check-in, and attendance tracking for events and meetings

The system is built for security departments and organizations like COCOBOD Training School to streamline their operations.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Backend
- **Server**: Next.js Server Actions and API Routes
- **Authentication**: NextAuth.js with credentials provider
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma

### Additional Libraries
- **PDF Generation**: jsPDF, jsPDF-autotable
- **QR Code**: qrcode
- **Date Handling**: date-fns
- **Password Hashing**: bcryptjs

---

# Part 1: Security Equipment Management System

## Overview

The Security Equipment Management System enables security departments to:
- Maintain an accurate inventory of security equipment
- Issue equipment to guards for duty
- Track equipment returns and conditions
- Monitor damaged and missing equipment
- Maintain complete audit trails of all equipment movements
- Generate comprehensive reports

## User Roles

### 1. Administrator
- Full system access
- Manage users (create, edit, deactivate)
- Manage all equipment operations
- View and manage all records
- Access system settings
- View all reports

### 2. Security Supervisor
- View dashboard statistics
- View equipment inventory
- View active issued equipment
- View guard equipment records
- View movement history
- View damaged and missing equipment
- View reports

### 3. Equipment Custodian
- View dashboard
- Manage equipment inventory (add, edit)
- Issue equipment to guards
- Receive returned equipment
- Record damaged and missing equipment
- View active issued equipment
- View movement history
- View reports

**Note**: Equipment Custodians cannot delete historical issue or return records.

---

## Core Features

### 1. Authentication & Access Control

#### Login Page (`/login`)
- Username and password authentication
- NextAuth.js credential-based sign-in
- Role-based session management
- Demo credentials for testing
- Error handling for invalid credentials
- Secure session management with cookies

#### User Management (`/admin/users`)
- Create new users with:
  - Full Name
  - Staff ID
  - Username
  - Password (hashed with bcrypt)
  - Role assignment
- View all users in a table
- Edit user information
- Deactivate users (soft delete to preserve historical records)
- Role-based access control enforcement

---

### 2. Dashboard (`/dashboard`)

The main dashboard provides a comprehensive overview of the system:

**Summary Cards**:
- Total Equipment count
- Available Equipment
- Currently Issued Equipment
- Damaged Equipment
- Missing Equipment

**Quick Actions**:
- Issue Equipment
- Return Equipment
- Add Equipment

**Recent Activity**:
- Recent Equipment Issues table
- Recent Equipment Returns table
- Outstanding Equipment list

---

### 3. Equipment Management

#### Equipment Inventory (`/equipment/inventory`)
- View all equipment in the system
- Search by item name or item code
- Filter by equipment category
- Display columns:
  - Item Code
  - Item Name
  - Category
  - Total Quantity
  - Available Quantity
  - Issued Quantity
  - Damaged Quantity
  - Missing Quantity
  - Status (Available, Issued, Damaged, Missing)
- Actions:
  - View equipment details
  - Edit equipment
  - Issue equipment
  - View movement history

#### Add Equipment (`/equipment/add`)
Form to add new equipment to inventory:
- Item Name (required)
- Item Code (required, unique)
- Category (required, dropdown selection)
- Quantity (required, number)
- Default Condition (required: Good, Slightly Damaged, Damaged, Missing)
- Storage Location (optional)
- Remarks (optional)
- Automatic inventory quantity updates
- Server-side form validation

#### Equipment Details (`/equipment/[id]`)
Detailed equipment profile with:
- **Equipment Information**:
  - Item Name, Item Code, Category
  - Storage Location, Default Condition, Remarks
- **Inventory Summary**:
  - Total Quantity
  - Available Quantity
  - Issued Quantity
  - Damaged Quantity
  - Missing Quantity
- **Current Issuance**:
  - Guards currently holding this equipment
- **Equipment History**:
  - Complete movement history
  - Date and Time
  - Guard
  - Action (Issued, Returned, Damaged, Missing)
  - Quantity
  - Condition
  - Custodian
  - Remarks

#### Issue Equipment (`/equipment/issue`)
Form to issue equipment to guards:
- Guard selection (dropdown)
- Equipment selection (dropdown with availability)
- Quantity (number)
- Condition at Issue (dropdown)
- Duty Point/Shift (optional)
- Remarks (optional)
- Transaction logic ensures inventory consistency
- Automatic updates:
  - Decrements available quantity
  - Increments issued quantity
  - Creates EquipmentIssue record
  - Creates EquipmentIssueItem records
  - Creates movement history record
- Prevents issuing more than available quantity

#### Return Equipment (`/equipment/return`)
Process equipment returns from guards:
- Displays all outstanding equipment items
- For each item shows:
  - Equipment name and code
  - Guard name
  - Date issued
  - Outstanding quantity
  - Condition at issue
  - Duty point
- Return form:
  - Quantity to Return
  - Condition at Return (Good, Slightly Damaged, Damaged, Missing)
  - Remarks
- Supports partial returns
- Inventory handling based on condition:
  - **Good**: Returns to Available Quantity
  - **Slightly Damaged**: Records condition for admin review
  - **Damaged**: Adds to Damaged Quantity
  - **Missing**: Adds to Missing Quantity
- Automatic issue status updates (Partially Returned, Fully Returned)
- Creates movement history record

#### Active Issued Items (`/equipment/active`)
View all equipment currently issued and not fully returned:
- Guard Name
- Equipment
- Item Code
- Quantity Outstanding
- Date Issued
- Condition at Issue
- Duty Point
- Custodian
- Status (Partially Returned, Issued)
- Actions:
  - View equipment details
  - Process return

---

### 4. People Management

#### Guards List (`/guards`)
- View all security guards
- Search by name or staff ID
- Display columns:
  - Full Name
  - Staff ID
  - Status (Active/Inactive)
  - Created Date
- Action: View guard profile
- Add Guard functionality

#### Guard Profile (`/guards/[id]`)
Detailed guard information:
- **Guard Information**:
  - Full Name
  - Staff ID
  - Status
  - Created Date
- **Current Equipment Held**:
  - All currently issued items
  - Outstanding quantities
- **Equipment History**:
  - Issue Date
  - Status
  - Duty Point
  - Remarks
- Quick Actions:
  - Issue Equipment
  - Return Equipment
  - View Movement History

---

### 5. Records & Audit Trail

#### Equipment Movement History (`/records/movement`)
Complete audit trail of all equipment movements:
- Date and Time
- Action (Issued, Returned, Damaged, Missing)
- Equipment
- Guard
- Custodian
- Quantity
- Condition
- Duty Point
- Remarks
- Color-coded action badges
- Search and filter functionality

#### Damaged Items (`/records/damaged`)
Record and track damaged equipment:
- **Record New Damage**:
  - Equipment selection
  - Guard selection
  - Quantity
  - Condition (Slightly Damaged, Damaged, Missing)
  - Remarks
- **Active Records Table**:
  - Date
  - Equipment
  - Guard
  - Quantity
  - Condition
  - Recorded By
  - Remarks
  - Status
- Transaction logic updates inventory (increments damaged quantity)

#### Missing Items (`/records/missing`)
Record and track missing equipment:
- **Record Missing Items**:
  - Equipment selection
  - Guard selection
  - Quantity
  - Remarks
- **Active Records Table**:
  - Date
  - Equipment
  - Guard
  - Quantity
  - Recorded By
  - Remarks
  - Status
- Transaction logic updates inventory (increments missing quantity)

---

### 6. Reports (`/reports`)

Comprehensive reporting capabilities:

**Available Reports**:
- Equipment Inventory Report
- Equipment Issue Report
- Movement History Report
- Guard Report
- Damaged Items Report
- Missing Items Report

**Report Features**:
- Description for each report type
- Export to CSV
- Export to PDF
- Date range filtering
- Guard filtering
- Equipment filtering
- Category filtering
- Status filtering

**System Summary**:
- Total Equipment Items
- Total Guards
- Total Issues
- Total Movements

---

### 7. Administration

#### User Management (`/admin/users`)
- Add new users
- Edit existing users
- Deactivate users (preserves historical records)
- Role assignment
- Password reset functionality
- User table with all relevant information

#### System Settings (`/admin/settings`)
- General Settings:
  - System Name
  - Organization Name
- Equipment Categories management
- System Information:
  - Version
  - Database (PostgreSQL/Neon)
  - ORM (Prisma)
  - Framework (Next.js)

---

## Database Schema (Equipment Management)

### Core Models

**User**
- id, fullName, staffId, username, passwordHash, role, isActive, timestamps
- Relations: issuedEquipment, receivedEquipment, movements, recordedDamaged, recordedMissing, notifications

**Guard**
- id, fullName, staffId, isActive, timestamps
- Relations: issues, movements, damaged, missing

**EquipmentCategory**
- id, name, description, timestamp
- Relations: equipment

**Equipment**
- id, itemCode (unique), itemName, categoryId
- Quantities: total, available, issued, damaged, missing
- defaultCondition, storageLocation, remarks, timestamps
- Relations: category, issueItems, movements, damagedRecords, missingRecords

**EquipmentIssue**
- id, guardId, custodianId, shift, issuedAt, dutyPoint, remarks, status, timestamps
- Relations: guard, custodian, items

**EquipmentIssueItem**
- id, issueId, equipmentId
- Quantities: issued, returned, outstanding
- Conditions: atIssue, atReturn
- returnedAt, returnedBy, remarks
- Relations: issue, issueRecord, equipment, custodian

**EquipmentMovement**
- id, equipmentId, guardId, custodianId
- action (ISSUED, RETURNED, DAMAGED, MISSING)
- quantity, condition, dutyPoint, remarks, createdAt
- Relations: equipment, guard, custodian

**DamagedEquipmentRecord**
- id, equipmentId, guardId, quantity, condition, remarks, recordedBy, recordedAt, status
- Relations: equipment, guard, recorder

**MissingEquipmentRecord**
- id, equipmentId, guardId, quantity, remarks, recordedBy, recordedAt, status
- Relations: equipment, guard, recorder

**Notification**
- id, userId, type, title, message, read, createdAt
- Relations: user

### Enums

**UserRole**: ADMINISTRATOR, SECURITY_SUPERVISOR, EQUIPMENT_CUSTODIAN

**EquipmentStatus**: AVAILABLE, ISSUED, RETURNED, DAMAGED, MISSING

**IssueStatus**: ISSUED, PARTIALLY_RETURNED, FULLY_RETURNED

**MovementAction**: ISSUED, RETURNED, DAMAGED, MISSING

**Condition**: GOOD, SLIGHTLY_DAMAGED, DAMAGED, MISSING

**RecordStatus**: ACTIVE, RESOLVED, ARCHIVED

**NotificationType**: LOW_STOCK, DAMAGED, MISSING, ISSUE, RETURN, SYSTEM

---

## System Logic & Validation

### Inventory Consistency Rules
- Total Quantity = Available + Issued + Damaged + Missing
- Cannot issue more than available quantity
- Cannot return more than outstanding quantity
- All operations use database transactions
- Transaction rollback on errors

### Security Features
- Role-based access control on all routes
- Server-side validation
- Password hashing with bcrypt
- Protected API routes
- Audit logging for sensitive actions
- SQL injection protection via Prisma

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Loading states for all operations
- Error handling with user-friendly messages
- Confirmation dialogs for important actions
- Toast notifications
- Empty states
- Search and filtering
- Pagination where needed
- Professional internal management system design
- Status badges for quick scanning

---

# Part 2: Visitor/Meeting Management System

## Overview

The Visitor/Meeting Management System handles event registration, check-in, and attendance tracking. It's designed for organizations like COCOBOD Training School to manage meeting participants efficiently.

## User Types

### 1. Participant (Public)
- No account or login required
- Registers via public form
- Receives unique registration code
- Presents code at check-in

### 2. HR Administrator
- Secure dashboard access
- Manages registrations
- Performs check-ins
- Views attendance reports
- Manages event settings

---

## Core Features

### 1. Participant Registration Flow

#### Landing Page (`/`)
- Event branding with logo
- Event name and date
- Registration call-to-action
- Instructions for registered participants

#### Registration Form (`/register`)
Simple 3-field form for fast registration:
- Full Name (required)
- Organisation (required)
- Position (required)
- Form validation (non-empty, trimmed, no junk input)
- Duplicate detection with warning (soft block)
- Generates unique registration code (format: CTS-XXXXX)
- Random numeric portion (not sequential)
- Collision detection and regeneration

#### Confirmation Page (`/register/success`)
- Registration success message
- Participant name
- Unique registration code
- Instructions to present code at check-in
- Save Registration action (download/screenshot)

### 2. HR Administration

#### Admin Login (`/admin/login`)
- Email and password authentication
- NextAuth.js secure session handling
- Server-side route protection

#### Admin Dashboard (`/admin/dashboard`)
- Event information display
- Summary cards:
  - Total Registered
  - Checked In
  - Not Yet Arrived
  - Attendance Percentage
- Navigation: Dashboard, Check-In, Registrations, Attendance, Settings, Logout
- Mobile-responsive navigation

#### Check-In Screen (`/admin/check-in`)
- Auto-focused search input on load
- Search by:
  - Registration code
  - Full name
  - Organisation
- Verification card showing:
  - Full Name
  - Organisation
  - Position
  - Registration Code
  - Check-In Status
- Check-in process:
  - Transaction-based duplicate prevention
  - Server timestamp recording
  - HR admin attribution
  - Status update to CHECKED IN
- Success confirmation with time
- Already checked-in handling with previous check-in details

#### Registrations Page (`/admin/registrations`)
- Searchable, filterable table
- Columns:
  - Registration Code
  - Full Name
  - Organisation
  - Position
  - Registration Date
  - Check-In Status
  - Check-In Time
  - Source (Online/Walk-in)
- Features:
  - Search
  - Filter by check-in status
  - Filter by source
  - Sort by date
  - View
  - Edit
  - Export to CSV

#### Attendance Page (`/admin/attendance`)
- Summary statistics:
  - Total Registered
  - Total Checked In
  - Total Not Checked In
  - Attendance Percentage
- Table with same columns as registrations
- Filters: All / Checked In / Not Checked In
- Search functionality
- CSV export

#### Walk-in Registration
- Add walk-in participants from check-in or registrations page
- Same 3 fields (name, organisation, position)
- HR creates record with unique code generation
- Immediate check-in capability
- Marked as WALK-IN source

#### Event Settings (`/admin/settings`)
- Event name
- Event date
- Venue
- Registration open/closed toggle
- Event logo management
- When closed: public page shows registration closed message

---

## Database Schema (Visitor Management)

### Core Models

**Event**
- id, name, date, venue, description, status, createdAt
- Stores event configuration (not hard-coded)

**Participant**
- id, registrationCode (unique), fullName, organisation, position
- registrationDate, registrationStatus, checkInStatus
- checkInDate, checkedInBy (user reference)
- registrationSource (ONLINE/WALK-IN)
- timestamps
- Belongs to Event

**CheckIn**
- id, participantId (unique constraint), userId (HR admin)
- checkInTime, timestamp
- References Participant and User
- Unique constraint prevents duplicate check-ins

**User** (HR Admins)
- id, email (unique), passwordHash, role, timestamps
- NextAuth integration

### Key Constraints
- Unique registration code
- Unique user email
- Unique participantId in CheckIn (prevents duplicate check-ins)
- Indexes: registration code, full name, organisation, check-in status

---

## Security Features

### Authentication
- NextAuth.js with credentials provider
- Secure session management
- Password hashing
- Server-side auth checks on all admin routes

### Input Validation
- Zod validation on client and server
- Never trust client-side validation alone
- SQL injection protection via Prisma

### Rate Limiting
- Rate limiting on public registration endpoint
- Rate limiting on login endpoint
- Implemented with Upstash Redis or edge-compatible store

### Data Protection
- Environment variables for secrets
- No database credentials exposed to browser
- Secure cookies/session handling

---

## UX & Responsiveness

### Design Principles
- Participant registration under 1 minute (3 fields only)
- Check-in page loads fast with auto-focus
- Large touch-friendly buttons
- Obvious success/error feedback
- Minimal animations
- Professional COCOBOD/QCC visual identity
- Deep green, gold, white, dark charcoal color scheme

### Responsive Design
- Tested at: 360px, 390px, 430px (mobile)
- Tablet and desktop layouts
- Mobile-first approach
- Collapsible sidebar navigation

### Error States
Clear messages for:
- Invalid code
- Registration not found
- Already checked in
- Registration closed
- Duplicate registration
- Network failure
- Database failure
- Invalid form data
- Expired session
- Unauthorized access

### Loading States
- Registration submission
- Search operations
- Check-in process
- CSV export
- Prevent duplicate submissions on double-click

---

## Additional Features

### Audit Log (Optional MVP)
Records:
- User who performed action
- Action type
- Participant affected
- Timestamp
Actions tracked:
- Participant created
- Participant edited
- Participant checked in
- Participant deleted
- Event settings changed

### Reporting (Optional MVP)
- Total registrations
- Total checked in
- Attendance percentage
- Registrations by organisation
- Check-ins by time
- CSV export

### Seed Data
- One event record
- One HR admin account
- Sample participants:
  - Registered but not checked in
  - Checked in
  - Walk-in

---

# Part 3: Combined System Features

## Navigation Structure

### Sidebar Navigation
- Dashboard
- Equipment Management:
  - Inventory
  - Add Equipment
  - Issue Equipment
  - Return Equipment
  - Active Issued
- People:
  - Guards
- Records:
  - Movement History
  - Damaged Items
  - Missing Items
- Reports
- Administration:
  - User Management
  - System Settings
- Event Management (if visitor system enabled):
  - Dashboard
  - Check-In
  - Registrations
  - Attendance
  - Settings

### Top Bar
- System title
- Current user's full name
- Current user's role
- Sign-out button
- Notification indicator

---

## Notification System

### Notification Types
- LOW_STOCK: When equipment availability is low
- DAMAGED: When damaged equipment is recorded
- MISSING: When missing equipment is recorded
- ISSUE: When equipment is issued
- RETURN: When equipment is returned
- SYSTEM: System-level notifications

### Notification Features
- User-specific notifications
- Read/unread status
- Timestamp
- Type-based categorization
- Real-time updates

---

## Export Capabilities

### CSV Export
- Equipment inventory
- Movement history
- Damaged items
- Missing items
- Registrations
- Attendance records

### PDF Export
- Reports with professional formatting
- Tables with headers
- Company branding
- Date ranges

---

## Deployment

### Platform
- Vercel for hosting
- Neon PostgreSQL for database

### Environment Variables
- DATABASE_URL
- AUTH_SECRET
- NEXT_PUBLIC_APP_URL

### Build Process
- `npm install` - Install dependencies
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server

---

## Acceptance Criteria

### Equipment Management
- Equipment can be added to inventory
- Equipment can be issued to guards with quantity validation
- Equipment can be returned with condition tracking
- Inventory quantities remain consistent
- Movement history is accurately recorded
- Users can only access features based on their role
- Reports can be generated and exported

### Visitor Management
- Participant registers with 3 fields and receives unique code
- HR admin can search by code or name
- Check-in records exact time and admin
- Duplicate check-in is rejected
- Attendance list can be exported
- System works on mobile, tablet, and desktop

---

## Implementation Priority

### Phase 1: Core Equipment Management
1. Database schema and Prisma setup
2. Authentication and role system
3. Equipment inventory CRUD
4. Equipment issue workflow
5. Equipment return workflow
6. Movement history and audit trail

### Phase 2: Equipment Management Features
7. Dashboard
8. Reports
9. User management
10. Damaged/missing item recording
11. Active issued items tracking

### Phase 3: Visitor Management (if needed)
12. Event configuration
13. Participant registration
14. Unique code generation
15. HR check-in workflow
16. Attendance tracking
17. CSV export

### Phase 4: Polish
18. UI polish
19. Additional reporting
20. Audit log
21. Performance optimization
22. Testing

---

## File Structure

```
cocobod-app/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   ├── issue/
│   │   │   ├── return/
│   │   │   ├── active/
│   │   │   ├── guards/
│   │   │   ├── records/
│   │   │   ├── reports/
│   │   │   └── admin/
│   │   ├── api/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   └── types/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
└── package.json
```

---

## Conclusion

PSEC-INV is a comprehensive, production-ready security management system that combines equipment inventory management with visitor/meeting management capabilities. Built with modern technologies (Next.js, TypeScript, Prisma, PostgreSQL), it provides role-based access control, complete audit trails, responsive design, and robust security features suitable for organizational security departments and event management.
