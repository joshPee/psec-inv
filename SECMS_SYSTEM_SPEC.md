# SECMS — Security Equipment Management System

Single-purpose system. No visitor/meeting module. Replaces the paper issue/return logbook.

## Roles

- **Security Supervisor** — full oversight and control: manages staff accounts, equipment, categories, settings, approves/rejects bookings if manual approval is enabled, views everything (dashboard, inventory, guard records, movement history, reports).
- **Equipment Custodian** — day-to-day operations: fulfills bookings, issues and receives equipment, records damaged/missing, manages inventory additions.
- **Guard** — self-service login, can only request items and view own holdings/history.

## Core flow

Book → Issue → Return

1. Guard requests an item for a shift/duty point.
2. System checks Available stock, moves the requested quantity into Reserved, creates a PENDING (or auto-APPROVED) booking.
3. Custodian sees pending bookings, fulfills them when the guard shows up: records condition at issue, creates the EquipmentIssue, flips booking to FULFILLED, moves stock from Reserved to Issued.
4. Unfulfilled bookings auto-expire after a set window, releasing Reserved back to Available.
5. Custodian processes returns as before: records condition at return, updates Available/Damaged/Missing, closes out the EquipmentIssueItem.

## Inventory formula

Total = Available + Reserved + Issued + Damaged + Missing

## Database schema (Prisma)

```prisma
enum UserRole {
  SECURITY_SUPERVISOR
  EQUIPMENT_CUSTODIAN
}

enum GuardStatus {
  ACTIVE
  INACTIVE
}

enum BookingStatus {
  PENDING
  APPROVED
  FULFILLED
  REJECTED
  EXPIRED
  CANCELLED
}

enum IssueStatus {
  ISSUED
  PARTIALLY_RETURNED
  FULLY_RETURNED
}

enum MovementAction {
  BOOKED
  ISSUED
  RETURNED
  DAMAGED
  MISSING
  EXPIRED
}

enum Condition {
  GOOD
  SLIGHTLY_DAMAGED
  DAMAGED
  MISSING
}

enum RecordStatus {
  ACTIVE
  RESOLVED
  ARCHIVED
}

enum NotificationType {
  LOW_STOCK
  BOOKING_REQUEST
  DAMAGED
  MISSING
  ISSUE
  RETURN
  SYSTEM
}

model User {
  id            String   @id @default(cuid())
  fullName      String
  staffId       String   @unique
  username      String   @unique
  passwordHash  String
  role          UserRole
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  issuedEquipment    EquipmentIssue[]        @relation("Custodian")
  movements          EquipmentMovement[]     @relation("MovedBy")
  recordedDamaged    DamagedEquipmentRecord[]
  recordedMissing    MissingEquipmentRecord[]
  decidedBookings    EquipmentBooking[]      @relation("DecidedBy")
  notifications      Notification[]
}

model Guard {
  id           String      @id @default(cuid())
  fullName     String
  staffId      String      @unique
  username     String      @unique
  passwordHash String
  status       GuardStatus @default(ACTIVE)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  bookings   EquipmentBooking[]
  issues     EquipmentIssue[]
  movements  EquipmentMovement[]
  damaged    DamagedEquipmentRecord[]
  missing    MissingEquipmentRecord[]
}

model EquipmentCategory {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())

  equipment Equipment[]
}

model Equipment {
  id               String            @id @default(cuid())
  itemCode         String            @unique
  itemName         String
  categoryId       String
  category         EquipmentCategory @relation(fields: [categoryId], references: [id])
  totalQuantity     Int
  availableQuantity Int
  reservedQuantity  Int @default(0)
  issuedQuantity    Int @default(0)
  damagedQuantity   Int @default(0)
  missingQuantity   Int @default(0)
  lowStockThreshold Int @default(0)
  defaultCondition Condition @default(GOOD)
  storageLocation  String?
  remarks          String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  bookings       EquipmentBooking[]
  issueItems     EquipmentIssueItem[]
  movements      EquipmentMovement[]
  damagedRecords DamagedEquipmentRecord[]
  missingRecords MissingEquipmentRecord[]
}

model EquipmentBooking {
  id               String        @id @default(cuid())
  guardId          String
  guard            Guard         @relation(fields: [guardId], references: [id])
  equipmentId      String
  equipment        Equipment     @relation(fields: [equipmentId], references: [id])
  quantityRequested Int
  requestedFor     DateTime
  dutyPoint        String?
  status           BookingStatus @default(PENDING)
  decidedById      String?
  decidedBy        User?         @relation("DecidedBy", fields: [decidedById], references: [id])
  decidedAt        DateTime?
  expiresAt        DateTime?
  remarks          String?
  createdAt        DateTime      @default(now())

  fulfilledIssueId String?         @unique
  fulfilledIssue   EquipmentIssue? @relation(fields: [fulfilledIssueId], references: [id])
}

model EquipmentIssue {
  id          String      @id @default(cuid())
  guardId     String
  guard       Guard       @relation(fields: [guardId], references: [id])
  custodianId String
  custodian   User        @relation("Custodian", fields: [custodianId], references: [id])
  bookingId   String?     @unique
  booking     EquipmentBooking?
  shift       String?
  dutyPoint   String?
  status      IssueStatus @default(ISSUED)
  issuedAt    DateTime    @default(now())
  remarks     String?

  items EquipmentIssueItem[]
}

model EquipmentIssueItem {
  id            String     @id @default(cuid())
  issueId       String
  issue         EquipmentIssue @relation(fields: [issueId], references: [id])
  equipmentId   String
  equipment     Equipment  @relation(fields: [equipmentId], references: [id])
  quantityIssued    Int
  quantityReturned  Int @default(0)
  quantityOutstanding Int
  conditionAtIssue  Condition
  conditionAtReturn Condition?
  returnedAt        DateTime?
  returnedById      String?
  remarks           String?
}

model EquipmentMovement {
  id          String         @id @default(cuid())
  equipmentId String
  equipment   Equipment      @relation(fields: [equipmentId], references: [id])
  guardId     String?
  guard       Guard?         @relation(fields: [guardId], references: [id])
  movedById   String
  movedBy     User           @relation("MovedBy", fields: [movedById], references: [id])
  action      MovementAction
  quantity    Int
  condition   Condition?
  dutyPoint   String?
  remarks     String?
  createdAt   DateTime       @default(now())
}

model DamagedEquipmentRecord {
  id          String       @id @default(cuid())
  equipmentId String
  equipment   Equipment    @relation(fields: [equipmentId], references: [id])
  guardId     String?
  guard       Guard?       @relation(fields: [guardId], references: [id])
  quantity    Int
  condition   Condition
  remarks     String?
  recordedById String
  recordedBy   User        @relation(fields: [recordedById], references: [id])
  recordedAt   DateTime    @default(now())
  status       RecordStatus @default(ACTIVE)
}

model MissingEquipmentRecord {
  id          String       @id @default(cuid())
  equipmentId String
  equipment   Equipment    @relation(fields: [equipmentId], references: [id])
  guardId     String?
  guard       Guard?       @relation(fields: [guardId], references: [id])
  quantity    Int
  remarks     String?
  recordedById String
  recordedBy   User        @relation(fields: [recordedById], references: [id])
  recordedAt   DateTime    @default(now())
  status       RecordStatus @default(ACTIVE)
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  message   String
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
}
```

## Routes

### Auth
- `/login` — staff login (Security Supervisor, Equipment Custodian)
- `/guard/login` — guard login

### Guard-facing (self-service, scoped to own records only)
- `/guard/dashboard` — current holdings, active bookings
- `/guard/request` — new booking form (item, quantity, needed-for date/shift, duty point)
- `/guard/history` — past bookings and issue/return history

### Dashboard
- `/dashboard` — summary cards (Total, Available, Reserved, Issued, Damaged, Missing), pending bookings queue, recent issues/returns

### Equipment
- `/equipment/inventory`
- `/equipment/add`
- `/equipment/[id]`
- `/equipment/categories`

### Bookings (custodian-facing)
- `/bookings` — queue of PENDING/APPROVED bookings
- `/bookings/[id]` — approve/reject/fulfill a booking

### Issue & return
- `/equipment/issue` — direct issue (bypassing booking, for edge cases) or fulfill-from-booking
- `/equipment/return`
- `/equipment/active`

### People
- `/guards` — guard list, add/edit, activate/deactivate
- `/guards/[id]` — profile, current holdings, history

### Records
- `/records/movement`
- `/records/damaged`
- `/records/missing`

### Reports
- `/reports` — inventory, issue, movement, guard, damaged, missing, booking reports

### Administration (Security Supervisor only)
- `/admin/users`
- `/admin/settings` — org name, categories, low-stock thresholds, booking expiry window

## Notification triggers

- `BOOKING_REQUEST` — new guard booking submitted
- `LOW_STOCK` — available quantity drops below item's threshold
- `ISSUE` / `RETURN` — on fulfillment / return
- `DAMAGED` / `MISSING` — on record creation
- `SYSTEM` — booking expired, account changes

## Environment variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `BOOKING_EXPIRY_HOURS` (default window before an unfulfilled booking auto-expires)
