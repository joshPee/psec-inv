# Security Equipment Management System - UI Features and Functions

## Authentication & Access Control

### Login Page
- **Location**: `/login`
- **Features**:
  - Username and password authentication
  - Credential-based sign-in using NextAuth.js
  - Role-based session management
  - Demo credentials display for testing
  - Error handling for invalid credentials

### User Roles
- **Administrator**: Full system access including user management, system settings, and all equipment operations
- **Equipment Custodian**: Inventory management, equipment CRUD operations, recording damaged/missing items, viewing reports

---

## Dashboard

### Main Dashboard
- **Location**: `/dashboard`
- **Features**:
  - Summary cards showing equipment statistics:
    - Total equipment count
    - Available equipment
    - Issued equipment
    - Damaged equipment
    - Missing equipment
  - Quick action buttons:
    - Issue Equipment
    - Return Equipment
    - Add Equipment
  - System status information

---

## Equipment Management

### Equipment Inventory
- **Location**: `/equipment/inventory`
- **Features**:
  - View all equipment in the system
  - Search by item name or item code
  - Filter by equipment category
  - Display table with columns:
    - Item Code
    - Item Name
    - Category
    - Total Quantity
    - Available Quantity
    - Issued Quantity
    - Damaged Quantity
    - Missing Quantity
    - Status (Available, Issued, Damaged, Missing)
  - Action buttons:
    - View equipment details
    - Edit equipment
    - Issue equipment
    - View movement history

### Add Equipment
- **Location**: `/equipment/add`
- **Features**:
  - Form to add new equipment to inventory
  - Fields:
    - Item Name (required)
    - Item Code (required)
    - Category (required, dropdown)
    - Quantity (required, number)
    - Default Condition (required, dropdown: Good, Slightly Damaged, Damaged, Missing)
    - Storage Location (optional)
    - Remarks (optional)
  - Server-side form validation
  - Automatic inventory quantity updates

### Equipment Details
- **Location**: `/equipment/[id]`
- **Features**:
  - View detailed equipment information
  - Display:
    - Item Name, Item Code, Category
    - Storage Location, Default Condition, Remarks
    - Inventory Summary (Total, Available, Issued, Damaged, Missing)
  - Action buttons:
    - Edit equipment
    - View movement history
  - Current Issuance section
  - Equipment History section

### Issue Equipment
- **Location**: `/equipment/issue`
- **Features**:
  - Form to issue equipment to guards
  - Fields:
    - Guard (required, dropdown)
    - Equipment (required, dropdown with availability)
    - Quantity (required, number)
    - Condition at Issue (required, dropdown)
    - Duty Point/Shift (optional)
    - Remarks (optional)
  - Transaction logic to ensure inventory consistency
  - Automatic inventory updates (decrement available, increment issued)
  - Creates EquipmentIssue and EquipmentIssueItem records
  - Creates movement history record

### Return Equipment
- **Location**: `/equipment/return`
- **Features**:
  - Process equipment returns from guards
  - Displays outstanding equipment items
  - For each item:
    - Show equipment name, code, guard, issue date, outstanding quantity
    - Form to process return:
      - Quantity to Return
      - Condition at Return (Good, Slightly Damaged, Damaged, Missing)
      - Remarks
  - Partial return support
  - Transaction logic for inventory updates based on condition
  - Automatic issue status updates (Partially Returned, Fully Returned)
  - Creates movement history record

### Active Issued Items
- **Location**: `/equipment/active`
- **Features**:
  - View all equipment currently issued and not fully returned
  - Display table with columns:
    - Guard Name
    - Equipment
    - Item Code
    - Quantity Outstanding
    - Date Issued
    - Condition at Issue
    - Duty Point
    - Custodian
    - Status (Partially Returned, Issued)
  - Action buttons:
    - View equipment details
    - Return equipment

---

## People Management

### Guards List
- **Location**: `/guards`
- **Features**:
  - View all security guards
  - Search by name or staff ID
  - Display table with columns:
    - Full Name
    - Staff ID
    - Status (Active/Inactive)
    - Created Date
  - Action button:
    - View guard profile
  - Add Guard button (placeholder)

### Guard Profile
- **Location**: `/guards/[id]`
- **Features**:
  - View detailed guard information
  - Display:
    - Full Name, Staff ID, Status, Created Date
  - Equipment History table:
    - Issue Date
    - Status
    - Duty Point
    - Remarks
  - Quick Actions:
    - Issue Equipment
    - Return Equipment
    - View Movement History

---

## Records & Audit Trail

### Equipment Movement History
- **Location**: `/records/movement`
- **Features**:
  - Complete audit trail of all equipment movements
  - Display table with columns:
    - Date
    - Action (Issued, Returned, Damaged, Missing)
    - Equipment
    - Guard
    - Custodian
    - Quantity
    - Condition
    - Duty Point
    - Remarks
  - Color-coded action badges
  - Search functionality (placeholder)

### Damaged Items
- **Location**: `/records/damaged`
- **Features**:
  - Record new damaged equipment
  - Form to record damage:
    - Equipment (required, dropdown)
    - Guard (required, dropdown)
    - Quantity (required, number)
    - Condition (Slightly Damaged, Damaged, Missing)
    - Remarks (optional)
  - Active damaged records table:
    - Date
    - Equipment
    - Guard
    - Quantity
    - Condition
    - Recorded By
    - Remarks
    - Status
  - Transaction logic to update inventory (increment damaged quantity)

### Missing Items
- **Location**: `/records/missing`
- **Features**:
  - Record missing equipment
  - Form to record missing items:
    - Equipment (required, dropdown)
    - Guard (required, dropdown)
    - Quantity (required, number)
    - Remarks (optional)
  - Active missing records table:
    - Date
    - Equipment
    - Guard
    - Quantity
    - Recorded By
    - Remarks
    - Status
  - Transaction logic to update inventory (increment missing quantity)

---

## Reports

### Reports Page
- **Location**: `/reports`
- **Features**:
  - Report generation cards with export functionality:
    - Equipment Inventory Report
    - Equipment Issue Report
    - Movement History Report
    - Guard Report
    - Damaged Items Report
    - Missing Items Report
  - Each report has:
    - Description
    - Export CSV button (placeholder)
  - System Summary statistics:
    - Total Equipment Items
    - Total Guards
    - Total Issues
    - Total Movements

---

## Administration

### User Management
- **Location**: `/admin/users`
- **Features**:
  - Add new user form:
    - Full Name (required)
    - Staff ID (required)
    - Username (required)
    - Password (required)
    - Role (Administrator, Security Supervisor, Equipment Custodian)
  - Users table with columns:
    - Full Name
    - Staff ID
    - Username
    - Role (color-coded)
    - Status (Active/Inactive)
    - Created Date
  - Action buttons:
    - Edit user (placeholder)
    - Delete user
  - Password hashing with bcrypt

### System Settings
- **Location**: `/admin/settings`
- **Features**:
  - General Settings:
    - System Name
    - Organization Name
    - Save Settings button
  - Equipment Categories information
  - System Information:
    - Version
    - Database (PostgreSQL/Neon)
    - ORM (Prisma)
    - Framework (Next.js 14)

---

## Navigation & Layout

### Sidebar Navigation
- **Sections**:
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
- Active link highlighting
- Icons for each navigation item

### Top Bar
- System title
- Current user's full name
- Current user's role
- Sign-out button

---

## Technical Features

### Data Management
- Prisma ORM with PostgreSQL (Neon)
- Transaction-based operations for data consistency
- Automatic inventory updates on issue/return
- Audit trail through movement history

### Authentication
- NextAuth.js with credentials provider
- Role-based access control
- Session management
- Password hashing with bcrypt

### UI Components
- shadcn/ui component library
- Tailwind CSS for styling
- Responsive design
- Server and client components as appropriate

### Error Handling
- Form validation
- Transaction rollback on errors
- Error messages for invalid operations
- Toast notifications (placeholder for implementation)
