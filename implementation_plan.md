# Implementation Plan: Guard Advance Booking & Requisition System

This plan details the end-to-end implementation of the **Guard Advance Booking & Requisition System** for SECMS, fulfilling the core *Book → Issue → Return* architectural pipeline specified in `SECMS_SYSTEM_SPEC.md`.

---

## User Review Required

> [!IMPORTANT]
> **Stock Reservation Mechanism**:
> When a booking is submitted, the requested quantity is immediately deducted from `availableQuantity` and added to `reservedQuantity`. This guarantees that gear promised for an upcoming guard shift cannot be accidentally issued to walk-ins by another custodian. If a booking is rejected, cancelled, or expires uncollected, the units automatically return from `reservedQuantity` to `availableQuantity`. Upon fulfillment, stock shifts seamlessly from `reservedQuantity` to `issuedQuantity`.

---

## Proposed Changes

### 1. Database Schema & Prisma Client

#### [MODIFY] [schema.prisma](file:///c:/Users/quame/Desktop/psec-inv/cocobod-app/prisma/schema.prisma)
- Add `BookingStatus` enum: `PENDING`, `APPROVED`, `FULFILLED`, `REJECTED`, `EXPIRED`, `CANCELLED`.
- Add `BOOKED` and `EXPIRED` to `MovementAction` enum.
- Add `EquipmentBooking` model with relations to `Guard`, `Equipment`, `User` (decidedBy), and `EquipmentIssue` (fulfilledIssue).
- Add reverse relations in `User`, `Guard`, `Equipment`, and `EquipmentIssue`.
- Execute `npx prisma db push` and `npx prisma generate`.

---

### 2. Backend Booking APIs

#### [NEW] [api/bookings/route.ts](file:///c:/Users/quame/Desktop/psec-inv/cocobod-app/src/app/api/bookings/route.ts)
- `GET`: Retrieve bookings with status filtering (`PENDING`, `APPROVED`, `FULFILLED`, `ALL`), search by guard or equipment, and auto-expire overdue bookings before returning.
- `POST`: Create a new booking:
  - Validates stock availability (`availableQuantity >= requested`).
  - Atomically decrements `availableQuantity` and increments `reservedQuantity`.
  - Computes `expiresAt` (configurable window, default 24h or shift time + 2h).
  - Triggers in-app notification to all Custodians (`notifyBookingRequest`).

#### [NEW] [api/bookings/[id]/route.ts](file:///c:/Users/quame/Desktop/psec-inv/cocobod-app/src/app/api/bookings/%5Bid%5D/route.ts)
- `PATCH`: Handles lifecycle state transitions:
  - **`APPROVE`**: Flips status to `APPROVED` (ready for pickup).
  - **`REJECT`**: Reverts `reservedQuantity` back to `availableQuantity`, marks `REJECTED`.
  - **`CANCEL`**: Reverts `reservedQuantity` back to `availableQuantity`, marks `CANCELLED`.
  - **`FULFILL`**: Custodian dispenses the reserved gear to the guard:
    - Creates `EquipmentIssue` & `EquipmentIssueItem` records.
    - Atomically decrements `reservedQuantity` and increments `issuedQuantity`.
    - Marks booking as `FULFILLED`.
    - Creates `EquipmentMovement` (`ISSUED`).
    - Triggers real-time issue notification to Supervisor.

---

### 3. Navigation & Custodian Hub Integration

#### [MODIFY] [DashboardSidebar.tsx](file:///c:/Users/quame/Desktop/psec-inv/cocobod-app/src/components/DashboardSidebar.tsx)
- Add **Bookings Queue** (`/bookings`) under `OVERVIEW` and `TRANSACTIONS` with live badge indicator.

#### [MODIFY] [CustodianHubCard.tsx](file:///c:/Users/quame/Desktop/psec-inv/cocobod-app/src/components/dashboard/CustodianHubCard.tsx)
- Add "Fulfill Bookings" action button linking directly to the pending reservation queue.

---

### 4. Booking Queue & Fulfillment Interface

#### [NEW] [bookings/page.tsx](file:///c:/Users/quame/Desktop/psec-inv/cocobod-app/src/app/(dashboard)/bookings/page.tsx)
#### [NEW] [bookings/BookingsClient.tsx](file:///c:/Users/quame/Desktop/psec-inv/cocobod-app/src/app/(dashboard)/bookings/BookingsClient.tsx)
- **Queue Overview**:
  - Summary KPI cards: *Pending Requests*, *Reserved Stock*, *Ready for Pickup*, *Fulfilled Today*.
  - Tabbed table view: `Pending Approval`, `Ready for Pickup`, `Completed / Fulfilled`, `Cancelled & Expired`.
- **Fulfillment Modal**:
  - 1-click modal for Custodian: confirms guard badge, records equipment condition at issue (`GOOD`, `SLIGHTLY_DAMAGED`), assigns shift/duty point, and fulfills the issue.
- **New Booking Modal**:
  - Allows staff to book equipment in advance for guards (selecting Guard, Equipment, Quantity, Shift, Needed-for Date/Time, and Duty Point).

---

## Verification Plan

### Automated Verification
- `npx prisma validate`
- `npx prisma db push`
- `npx tsc --noEmit` (ensuring 0 type errors across all new and modified files).

### Manual Lifecycle Verification
1. **Submit Booking**: Book 2x Protective Vests for a guard -> verify `availableQuantity` decreases by 2, `reservedQuantity` increases by 2, and formula balance $Total = Available + Reserved + Issued + Damaged + Missing$ remains intact.
2. **Notification**: Verify Custodian receives a notification of the new booking request.
3. **Fulfill Booking**: Custodian opens `/bookings`, clicks "Fulfill & Issue" -> verify equipment is marked issued, booking flips to `FULFILLED`, `reservedQuantity` decreases by 2, and `issuedQuantity` increases by 2.
4. **Rejection/Cancellation**: Submit another booking and click "Reject" -> verify the reserved units immediately return to `availableQuantity`.
