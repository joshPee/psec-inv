Build a modern, secure, responsive web application called Security Equipment Management System.

The system will be used by a security department to manage security equipment, issue equipment to guards, receive returned equipment, track outstanding equipment, and maintain a complete equipment movement history.

TECH STACK

Use the following stack:

Frontend:
Next.js with App Router
TypeScript
Tailwind CSS
shadcn/ui

Backend:
Next.js Server Actions or secure API routes

Database:
PostgreSQL

ORM:
Prisma

Authentication:
Secure role-based authentication

GENERAL REQUIREMENTS

Build a clean, professional dashboard suitable for an organisation's internal security department.

The system must be responsive and work well on desktop, tablet, and mobile devices.

Use a modern sidebar layout.

Include:

• Sidebar navigation
• Top navigation bar
• Responsive mobile navigation
• Search functionality
• Filtering
• Pagination where necessary
• Confirmation dialogs for important actions
• Toast notifications
• Form validation
• Loading states
• Empty states
• Error handling

USER ROLES

Create the following roles:

1. Administrator
2. Security Supervisor
3. Equipment Custodian

Administrator permissions:

• Full access to the entire system
• Manage users
• Manage equipment
• View and manage all records
• View reports

Security Supervisor permissions:

• View dashboard
• View equipment inventory
• View active issued equipment
• View guard equipment records
• View movement history
• View damaged and missing equipment
• View reports

Equipment Custodian permissions:

• View dashboard
• Manage equipment inventory
• Add equipment
• Edit equipment
• Issue equipment
• Receive returned equipment
• View active issued equipment
• View movement history

The Equipment Custodian must not be able to delete historical issue or return records.

SYSTEM NAVIGATION

Create the sidebar with the following structure:

Dashboard

EQUIPMENT MANAGEMENT

• Equipment Inventory
• Add Equipment
• Issue Equipment
• Return Equipment
• Active Issued Items

PEOPLE

• Guards

RECORDS

• Equipment Movement History
• Damaged Items
• Missing Items

REPORTS

• Reports

ADMINISTRATION

• User Management
• System Settings

DASHBOARD PAGE

Create a professional dashboard with summary cards showing:

• Total Equipment
• Available Items
• Currently Issued Items
• Damaged Items
• Missing Items

Below the summary cards, display:

Recent Equipment Issues

Columns:

• Item
• Guard
• Quantity
• Date Issued
• Custodian
• Status

Recent Equipment Returns

Columns:

• Item
• Guard
• Quantity
• Date Returned
• Condition

Outstanding Equipment

Show all equipment currently issued and not yet returned.

Include quick action buttons:

• Issue Equipment
• Return Equipment
• Add Equipment

EQUIPMENT INVENTORY PAGE

Create a searchable and filterable equipment inventory table.

Columns:

• Item Code
• Item Name
• Category
• Total Quantity
• Available Quantity
• Issued Quantity
• Damaged Quantity
• Missing Quantity
• Status
• Actions

Actions:

• View
• Edit
• Issue Item
• View History

Filters:

• Search
• Category
• Status

Include an Add Equipment button.

ADD EQUIPMENT PAGE

Create a form with:

• Item Name
• Category
• Item Code
• Quantity
• Condition
• Storage Location
• Remarks

When equipment is added, automatically update inventory totals.

EQUIPMENT DETAILS PAGE

Create a detailed equipment profile page.

Sections:

Equipment Information

• Item Name
• Item Code
• Category
• Storage Location
• Remarks

Inventory Summary

• Total Quantity
• Available Quantity
• Issued Quantity
• Damaged Quantity
• Missing Quantity

Current Issuance

Display guards currently holding this equipment.

Equipment History

Display:

• Date and Time
• Guard
• Action
• Quantity
• Condition
• Custodian
• Remarks

ISSUE EQUIPMENT PAGE

Create an equipment issue form.

Fields:

• Select Guard
• Select Equipment
• Quantity
• Condition at Issue
• Duty Point or Shift
• Remarks

Automatically record:

• Date and Time Issued
• Equipment Custodian who issued the item

Before submitting, display a confirmation dialog showing:

Guard Name
Equipment
Quantity
Condition
Duty Point

After confirmation:

• Reduce available quantity
• Increase issued quantity
• Create an equipment issue record
• Create a movement history record
• Mark the issued equipment as ISSUED

Prevent the custodian from issuing equipment when available quantity is insufficient.

RETURN EQUIPMENT PAGE

Display all currently issued equipment.

Columns:

• Guard Name
• Equipment
• Item Code
• Quantity Issued
• Date Issued
• Condition at Issue
• Duty Point
• Status
• Action

The action should be Process Return.

When selected, open a return form containing:

• Quantity Returned
• Condition on Return
• Remarks

Automatically record:

• Date and Time Returned
• Equipment Custodian receiving the item

After confirmation:

• Reduce issued quantity
• Increase available quantity for equipment returned in good condition
• Create a return movement history record
• Update the issue record

Support partial returns.

If only part of an issued quantity is returned, keep the remaining quantity as ISSUED.

RETURN CONDITIONS

Available conditions:

• Good
• Slightly Damaged
• Damaged
• Missing

Inventory handling rules:

Good:
Returned quantity goes back into Available Quantity.

Slightly Damaged:
Record the condition and allow the administrator or custodian to decide the item's inventory status.

Damaged:
Reduce the issued quantity and add the returned quantity to Damaged Quantity.

Missing:
Reduce the issued quantity and add the missing quantity to Missing Quantity.

ACTIVE ISSUED ITEMS PAGE

Display all equipment currently issued and not fully returned.

Columns:

• Guard Name
• Equipment
• Item Code
• Quantity Outstanding
• Date Issued
• Condition at Issue
• Duty Point
• Custodian
• Status
• Actions

Actions:

• View Details
• Process Return

GUARDS PAGE

Create a guard directory.

Columns:

• Guard Name
• Staff ID
• Current Items Held
• Total Equipment Transactions

Clicking a guard should open a detailed profile.

GUARD PROFILE PAGE

Display:

Guard Information

• Full Name
• Staff ID

Current Equipment Held

Show all currently issued items.

Equipment History

Display:

• Item
• Quantity
• Date Issued
• Date Returned
• Condition at Issue
• Condition on Return
• Status

EQUIPMENT MOVEMENT HISTORY PAGE

Create a complete audit trail.

Columns:

• Date and Time
• Equipment
• Guard
• Action
• Quantity
• Condition
• Custodian
• Duty Point
• Remarks

Movement types:

• ISSUED
• RETURNED
• DAMAGED
• MISSING

Historical movement records must not be deleted by Equipment Custodians.

DAMAGED ITEMS PAGE

Display all damaged equipment.

Columns:

• Equipment
• Item Code
• Quantity
• Guard
• Date Recorded
• Condition
• Remarks
• Status

MISSING ITEMS PAGE

Display all missing equipment.

Columns:

• Equipment
• Item Code
• Quantity
• Last Guard Responsible
• Date Recorded
• Remarks
• Status

REPORTS PAGE

Create reports for:

• Current Issued Equipment
• Equipment Issued by Guard
• Equipment Return History
• Equipment Movement History
• Damaged Equipment
• Missing Equipment
• Inventory Summary

Provide filters for:

• Date Range
• Guard
• Equipment
• Category
• Status

Include actions to:

• View Report
• Print Report
• Export PDF
• Export Excel

USER MANAGEMENT PAGE

Administrators should manage:

• Administrators
• Security Supervisors
• Equipment Custodians

Include:

• Create User
• Edit User
• Activate User
• Deactivate User
• Reset Password
• Assign Role

Do not permanently delete users with historical records.

Instead, allow administrators to deactivate them.

DATABASE DESIGN

Create the database with the following core models:

User

• id
• fullName
• staffId
• username
• passwordHash
• role
• isActive
• createdAt
• updatedAt

Guard

• id
• fullName
• staffId
• isActive
• createdAt
• updatedAt

EquipmentCategory

• id
• name
• description
• createdAt

Equipment

• id
• itemCode
• itemName
• categoryId
• totalQuantity
• availableQuantity
• issuedQuantity
• damagedQuantity
• missingQuantity
• defaultCondition
• storageLocation
• remarks
• createdAt
• updatedAt

EquipmentIssue

• id
• guardId
• custodianId
• issuedAt
• dutyPoint
• remarks
• status
• createdAt
• updatedAt

EquipmentIssueItem

• id
• issueId
• equipmentId
• quantityIssued
• quantityReturned
• quantityOutstanding
• conditionAtIssue
• conditionAtReturn
• returnedAt
• returnedBy
• remarks

EquipmentMovement

• id
• equipmentId
• guardId
• custodianId
• action
• quantity
• condition
• dutyPoint
• remarks
• createdAt

DamagedEquipmentRecord

• id
• equipmentId
• guardId
• quantity
• condition
• remarks
• recordedBy
• recordedAt
• status

MissingEquipmentRecord

• id
• equipmentId
• guardId
• quantity
• remarks
• recordedBy
• recordedAt
• status

SYSTEM LOGIC

Use database transactions for every equipment issue and return operation.

The system must never allow:

• Negative inventory quantities
• Issuing more items than available
• Returning more than the outstanding quantity
• Editing historical movement records without proper permission
• Deleting equipment that has transaction history

Maintain inventory consistency:

Total Quantity = Available Quantity + Issued Quantity + Damaged Quantity + Missing Quantity

Validate this rule after every inventory transaction.

AUDIT AND SECURITY

Implement:

• Role-based access control
• Secure authentication
• Password hashing
• Protected routes
• Server-side validation
• Database transactions
• Audit logging for sensitive actions

Record:

• Who performed the action
• What action was performed
• Date and time
• Related equipment or record

UI DESIGN

Use a professional internal management system design.

Requirements:

• Clean layout
• White or neutral background
• Clear spacing
• Professional typography
• Status badges
• Responsive tables
• Mobile-friendly forms
• Accessible components

Use consistent status badges for:

• Available
• Issued
• Returned
• Damaged
• Missing
• Inactive

FINAL REQUIREMENT

Build the application in a modular and scalable structure.

Use clean architecture and reusable components.

Do not use mock data for the final implementation.

Create proper Prisma migrations and seed data only for initial development and testing.

Start by creating:

1. Database schema
2. Authentication and role system
3. Main application layout
4. Equipment inventory module
5. Equipment issue workflow
6. Equipment return workflow
7. Movement history and audit trail
8. Dashboard
9. Reports
10. User management

Before finalising any inventory transaction, validate all quantities and run the operation inside a database transaction to prevent inconsistent inventory records.