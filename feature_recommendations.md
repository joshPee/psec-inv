# Feature Recommendations — COCOBOD SECMS App

## App Overview
A **Security Equipment Management System** (SECMS) for managing security equipment inventory, guard assignments, issue/return workflows, and records — built with Next.js, Prisma/PostgreSQL, NextAuth.

---

## Implementation Status

**✅ Completed (30):** Guard Profile Page, Live Notifications, Low-Stock Alerts, QR Codes, Expected Return Date, Overdue Issues Tracker, Shift Handover Report, Inventory Restock Workflow, Condition Timeline, Bulk CSV Import, Advanced Analytics Charts, Guard Portal Enhancements, Guard Photos, Keyboard Shortcuts, Live Dashboard Updates, Mobile Card View for Tables, Pull-to-Refresh, Mobile Action Sheets, Swipe Actions, Enhanced Mobile Search, Bottom Nav Improvements (badges, haptic feedback), Mobile-Optimized Forms, Mobile Dashboard Sections, Mobile Navigation (breadcrumbs, back button), Virtual Scrolling, Mobile Animations, Mobile Theme Toggle, Mobile Keyboard Handling, Touch Targets (44px minimum), Offline Indicator
**🟡 Partial (0):** None
**❌ Not Started (0):** None

---

## 🔥 High-Impact, High-Priority

### 1. Guard Profile Page (`/guards/[id]`)
**Status:** ✅ **COMPLETED** - Fully implemented at `/guards/[id]` with all requested features including holdings, bookings, damaged/missing records, and deactivate toggle.  
**Why it matters:** Supervisors need to quickly see a guard's entire holdings, booking history, incident history, and status in one place.  
**What to build:** A full-page profile with:
- Current equipment holdings (active issues)
- Past bookings with status breakdown
- Damaged/missing record history
- Activate/deactivate toggle (SECURITY_SUPERVISOR only)

---

### 2. Overdue Issues Tracker & Alerts
**Status:** ✅ **COMPLETED** - Added dedicated tab navigation in `/active` page with "All Items", "Overdue", and "Previous Shift" tabs with badge counts.  
**Why it matters:** Security equipment (weapons, radios, cuffs) must be accounted for at every shift end.  
**What to build:**
- A dedicated **Overdue** tab or badge in `/active` showing issues past expected return time
- Auto-flag issues older than a configurable threshold (e.g., 12 hours for day/night shift)
- Dashboard alert card that counts & links to overdue items
- Optional: notify the supervisor via in-app `Notification` (schema already supports `LOW_STOCK`, `ISSUE` types)

---

### 3. In-App Notifications Panel (Real-time)
**Status:** ✅ **COMPLETED** - Full implementation with NotificationsDropdown, API routes (GET/PATCH/DELETE), polling every 30s, browser notifications, and sound alerts.  
**Why it matters:** Custodians need to know immediately when a guard submits a booking (`BOOKING_REQUEST`), when stock falls below threshold (`LOW_STOCK`), or when a missing/damaged item is recorded.  
**What to build:**
- API route to create notifications on booking submission, low-stock detection after issue, damaged/missing record creation
- Mark-as-read endpoint
- Badge count on the topbar bell icon
- Notification settings page (toggle per type)

---

### 4. Shift Handover Report
**Status:** ✅ **COMPLETED** - Enhanced with PDF generation including equipment-specific summary (issued, returned, damaged, missing items) fetched from movement data.  
**Why it matters:** Physical logbooks typically capture this. The system replaces the logbook but has no shift-close workflow.  
**What to build:**
- A **Generate Shift Report** button (supervisor/custodian) that produces a PDF snapshot of:
  - Items issued this shift
  - Items returned this shift
  - Outstanding (unreturned) items
  - Damaged/missing items recorded
  - Guard count with gear
- Optionally stored as a `ShiftHandover` record in the DB for audit purposes

---

### 5. Low-Stock Threshold Alerts on Dashboard
**Status:** ✅ **COMPLETED** - Dashboard shows low stock alert banner with item details and links to inventory.  
**Why it matters:** Supervisors need to know when to requisition more equipment before stock runs out.  
**What to build:**
- A **Low Stock** warning banner or card on the dashboard
- Highlighted row in the inventory table (amber/red background)
- Admin settings page to configure threshold per item
- Trigger `LOW_STOCK` notification when `availableQuantity` drops below threshold after an issue

---

## 🟡 Medium Priority — Workflow Improvements

### 6. Guard Self-Service Dashboard (`/guard-portal` Enhancements)
**Status:** ✅ **COMPLETED** - Enhanced with countdown to expiry, pre-filled shift/duty point from guard profile, return confirmation request dialog, and notification display.
**What's missing:** The guard portal exists but appears limited. Guards need their own richer experience.
**What to build:**
- Current holdings with visual card layout
- Active booking status with countdown to expiry
- One-tap booking request form (pre-fills shift/duty point from guard profile)
- Equipment return confirmation request (guard initiates, custodian confirms)
- Notification when booking is approved/rejected

---

### 7. Inventory Restock / Stock Adjustment Workflow
**Status:** ✅ **COMPLETED** - Fully implemented with "Adjust Stock" dialog in inventory page supporting Restock (add units) and Write-off (reduce units) operations, with audit trail in EquipmentMovement.  
**Why it matters:** Inventory grows through procurement; existing items need quantity adjustments.  
**What to build:**
- "Adjust Stock" action on each inventory item (supervisor only)
- Two types: **Restock** (add units) and **Write-off** (reduce damaged/missing count after resolution)
- Record adjustment in `EquipmentMovement` with action type `ADJUSTED`
- Audit trail showing who adjusted and why

---

### 8. Equipment Condition History Timeline
**Status:** ✅ **COMPLETED** - Fully implemented with equipment detail page at `/inventory/[id]` featuring visual timeline of all movements with condition changes, guard info, and remarks.  
**What to build:**
- An item-level **Condition Timeline** on the equipment detail page (`/inventory/[id]`)
- Pull from `EquipmentMovement` records filtered to that item
- Visual timeline: Issued (Good) → Returned (Slightly Damaged) → Issued again → Returned (Damaged)

---

### 9. Bulk CSV Import for Guards & Equipment
**Status:** ✅ **COMPLETED** - Fully implemented with CSV upload endpoints for guards and equipment, validation with error reporting, and downloadable templates.  
**Why it matters:** Initial setup (onboarding 100+ guards) is painful without import.  
**What to build:**
- CSV upload endpoint for guards (`/api/guards/import`)
- CSV upload for equipment (`/api/equipment/import`)
- Validation step showing preview + errors before commit
- Download sample CSV template

---

### 10. Advanced Reports & Analytics
**Status:** ✅ **COMPLETED** - Fully implemented with Recharts visualizations including category distribution pie chart and issue rate bar chart by category on the reports page.  
**What to build:**
- **Guard Accountability Score**: % of issues returned on time, damage rate
- **Equipment Utilization Rate**: how often each item is out vs in stock (over 30/90 days)
- **Custodian Performance**: transactions processed per shift/day
- Charts using Recharts (already likely in the project) on the `/reports` page
- Date-range comparison (this month vs last month)

---

## 🟢 Nice-to-Have / Polish

### 11. QR Code / Barcode on Equipment Cards
- Generate a printable QR code for each equipment item linking to its detail page
- Useful for armory labeling
- Can use `qrcode` npm package

### 12. Expected Return Date on Issue
- When issuing equipment, optionally set `expectedReturnDate` (the field already exists in `EquipmentIssue`)
- This enables automated overdue detection (Feature #2)

### 13. Guard Badge ID Photo / Avatar
**Status:** ✅ **COMPLETED** - Added photo upload to Guard model, implemented upload API endpoint, added photo display in guards list and profile pages, and included photo upload in add/edit guard dialogs.
- Allow uploading a guard photo or avatar during registration
- Displayed on guard profile and guard selection dropdowns
- Makes identification faster in high-security environments

### 14. Keyboard Shortcuts for Custodians
**Status:** ✅ **COMPLETED** - Implemented keyboard shortcuts: Ctrl+I opens Issue dialog on issue page, Ctrl+R opens Return dialog on return page, Ctrl+B navigates to Bookings from anywhere in the dashboard.
- Power users (custodians) doing 50+ transactions/day benefit from:
  - `Ctrl+I` → open Issue dialog
  - `Ctrl+R` → open Return dialog
  - `Ctrl+B` → go to Bookings
- Helps reduce mouse-heavy workflow

### 15. Activity Feed / Live Updates
**Status:** ✅ **COMPLETED** - Implemented DashboardLiveUpdates component with 30-second polling interval, automatic refresh of dashboard data, last updated timestamp display, and manual refresh button.
- The dashboard currently uses SSR (static load). Add **polling or SSE** to refresh the "Recent Movements" and "Active Issues" sections every 30–60 seconds
- Gives real-time awareness without full page reload

---

## Summary Table

| # | Feature | Priority | Effort | Impact | Status |
|---|---------|----------|--------|--------|--------|
| 1 | Guard Profile Page | 🔴 High | Medium | High | ✅ Done |
| 2 | Overdue Issues Tracker | 🔴 High | Medium | High | ✅ Done |
| 3 | Live Notifications (wire up) | 🔴 High | Medium | High | ✅ Done |
| 4 | Shift Handover Report | 🔴 High | Medium | High | ✅ Done |
| 5 | Low-Stock Threshold Alerts | 🔴 High | Low | High | ✅ Done |
| 6 | Guard Portal Enhancements | 🟡 Medium | Medium | Medium | ✅ Done |
| 7 | Inventory Restock Workflow | 🟡 Medium | Medium | High | ✅ Done |
| 8 | Condition Timeline | 🟡 Medium | Low | Medium | ✅ Done |
| 9 | Bulk CSV Import | 🟡 Medium | Medium | Medium | ✅ Done |
| 10 | Advanced Analytics Charts | 🟡 Medium | High | Medium | ✅ Done |
| 11 | QR Codes on Equipment | 🟢 Low | Low | Low | ✅ Done |
| 12 | Expected Return Date | 🟢 Low | Low | Medium | ✅ Done |
| 13 | Guard Photo/Avatar | 🟢 Low | Low | Low | ✅ Done |
| 14 | Keyboard Shortcuts | 🟢 Low | Low | Medium | ✅ Done |
| 15 | Live Dashboard Updates | 🟢 Low | Low | Medium | ✅ Done |

---

## 📱 Mobile UI Improvements

### 16. Mobile Card View for Tables
**Status:** ✅ **COMPLETED** - Created `MobileCardView` component that transforms tables into mobile-friendly card views on small screens.
**Why it matters:** Tables are cramped on mobile and require horizontal scrolling. Card views provide better UX.
**What was built:**
- `MobileCardView` component with column configuration
- Automatic animation delays for staggered card appearance
- Responsive: hidden on desktop, visible on mobile
- Support for custom render functions per column

### 17. Pull-to-Refresh
**Status:** ✅ **COMPLETED** - Implemented `PullToRefresh` component with touch gesture support.
**Why it matters:** Mobile users expect pull-to-refresh for real-time data updates.
**What was built:**
- Touch gesture detection (pull down to refresh)
- Visual indicator with progress feedback
- Resistance effect for natural feel
- Auto-refresh callback support
- Only activates at top of page

### 18. Mobile Action Sheets
**Status:** ✅ **COMPLETED** - Created `MobileActionSheet` component for bottom sheet dialogs.
**Why it matters:** Dropdowns and modals can be awkward on mobile. Bottom sheets are more natural.
**What was built:**
- Bottom sheet dialog using Radix UI
- Support for destructive actions (red color)
- Haptic feedback on action selection
- Smooth slide-up animation
- Staggered animation for action items

### 19. Swipe Actions
**Status:** ✅ **COMPLETED** - Implemented `SwipeableListItem` component with gesture support.
**Why it matters:** Mobile users expect swipe gestures for quick actions (like Gmail).
**What was built:**
- Left/right swipe detection using react-swipeable
- Custom action backgrounds (left: green, right: red)
- Haptic feedback on swipe completion
- Smooth translation animations
- Touch action configuration to prevent conflicts

### 20. Enhanced Mobile Search
**Status:** ✅ **COMPLETED** - Created `MobileSearchBar` with expandable full-screen mode.
**Why it matters:** Search bars are often hidden or awkward on mobile.
**What was built:**
- Collapsible search bar (button → expanded input)
- Auto-focus on expansion
- Clear button for quick reset
- Close button to collapse
- Sticky positioning
- 44px minimum touch targets

### 21. Bottom Navigation Improvements
**Status:** ✅ **COMPLETED** - Enhanced `MobileBottomNav` with badge counts and haptic feedback.
**Why it matters:** Users need visibility into pending items and tactile feedback.
**What was built:**
- Badge counts for pending bookings and overdue items
- Auto-refresh badge counts every 30 seconds
- Haptic feedback on navigation (vibrate)
- Theme toggle in More menu (light/dark mode)
- Touch target compliance (44px minimum)

### 22. Mobile-Optimized Forms
**Status:** ✅ **COMPLETED** - Created `MobileFormModal` for full-screen form modals.
**Why it matters:** Forms are cramped on mobile. Full-screen modals provide better UX.
**What was built:**
- Full-screen modals on mobile, normal modals on desktop
- Sticky header on mobile
- Auto-focus first input on open
- Scrollable content area
- Smooth slide-up animation
- Keyboard handling support

### 23. Mobile Dashboard Sections
**Status:** ✅ **COMPLETED** - Created `MobileDashboardSection` for collapsible sections.
**Why it matters:** Dashboard is information-dense on mobile. Collapsible sections help.
**What was built:**
- Collapsible card sections with chevron indicator
- Default open/close configuration
- Smooth rotation animation
- Touch target compliance
- Only visible on mobile

### 24. Mobile Navigation Enhancements
**Status:** ✅ **COMPLETED** - Created `MobileBreadcrumbs` with back button.
**Why it matters:** Deep navigation is difficult on mobile without breadcrumbs.
**What was built:**
- Breadcrumb navigation with path segments
- Back button with browser history
- Path segment display
- Only visible on mobile
- Touch target compliance

### 25. Virtual Scrolling
**Status:** ✅ **COMPLETED** - Created `VirtualizedList` component using @tanstack/react-virtual.
**Why it matters:** Long lists cause performance issues on mobile. Virtual scrolling helps.
**What was built:**
- Virtual scrolling for large lists
- Configurable item height estimation
- Overscan configuration for smooth scrolling
- Customizable render function
- Performance optimization for 100+ items

### 26. Mobile Animations
**Status:** ✅ **COMPLETED** - Added mobile-specific animations to globals.css.
**Why it matters:** Subtle animations make the app feel native on mobile.
**What was built:**
- `mobile-slide-up` - Bottom sheet animation
- `mobile-fade-in` - Fade in animation
- `mobile-scale-in` - Scale in animation
- CSS keyframes for each animation
- Applied to mobile components

### 27. Mobile Theme Toggle
**Status:** ✅ **COMPLETED** - Added theme toggle to MobileBottomNav More menu.
**Why it matters:** Easy dark mode switching is expected on mobile.
**What was built:**
- Theme toggle button in More menu
- Uses next-themes
- Sun/Moon icon based on current theme
- Haptic feedback on toggle
- Touch target compliance

### 28. Mobile Keyboard Handling
**Status:** ✅ **COMPLETED** - Created `useMobileKeyboard` hook and CSS fixes.
**Why it matters:** Mobile keyboard often covers inputs on mobile.
**What was built:**
- `useMobileKeyboard` hook for viewport handling
- CSS variable for viewport height
- Dynamic viewport height updates
- Visual viewport API support
- Orientation change handling

### 29. Touch Targets
**Status:** ✅ **COMPLETED** - Added touch target CSS to globals.css.
**Why it matters:** Apple guidelines require 44px minimum touch targets.
**What was built:**
- `.touch-target` class with 44px minimum
- Applied to buttons, links, inputs, selects, textareas
- Special handling for smaller elements
- Global CSS application

### 30. Offline Indicator
**Status:** ✅ **COMPLETED** - Created `OfflineIndicator` component.
**Why it matters:** Users need to know when they're offline.
**What was built:**
- Network status detection
- Amber warning banner at top
- Wifi icon indicator
- Only visible on mobile
- Safe area top padding
- Auto-update on network change

---

## Mobile UI Summary Table

|| # | Feature | Priority | Effort | Impact | Status |
||---|---------|----------|--------|--------|--------|
|| 16 | Mobile Card View | 🔴 High | Medium | Critical | ✅ Done |
|| 17 | Pull-to-Refresh | 🔴 High | Low | High | ✅ Done |
|| 18 | Mobile Action Sheets | 🔴 High | Medium | High | ✅ Done |
|| 19 | Swipe Actions | 🟡 Medium | High | High | ✅ Done |
|| 20 | Enhanced Mobile Search | 🔴 High | Low | Medium | ✅ Done |
|| 21 | Bottom Nav Improvements | 🟡 Medium | Low | Medium | ✅ Done |
|| 22 | Mobile-Optimized Forms | 🔴 High | Medium | High | ✅ Done |
|| 23 | Mobile Dashboard Sections | 🟡 Medium | Low | High | ✅ Done |
|| 24 | Mobile Navigation | 🟡 Medium | Low | Medium | ✅ Done |
|| 25 | Virtual Scrolling | 🟡 Medium | High | High | ✅ Done |
|| 26 | Mobile Animations | 🟢 Low | Low | Low | ✅ Done |
|| 27 | Mobile Theme Toggle | 🟢 Low | Low | Low | ✅ Done |
|| 28 | Mobile Keyboard Handling | 🟡 Medium | Low | Medium | ✅ Done |
|| 29 | Touch Targets | 🔴 High | Low | Critical | ✅ Done |
|| 30 | Offline Indicator | 🟢 Low | Low | Medium | ✅ Done |
