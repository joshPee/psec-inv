-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRATOR', 'SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'ISSUED', 'RETURNED', 'DAMAGED', 'MISSING');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('ISSUED', 'PARTIALLY_RETURNED', 'FULLY_RETURNED');

-- CreateEnum
CREATE TYPE "MovementAction" AS ENUM ('ISSUED', 'RETURNED', 'DAMAGED', 'MISSING');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('GOOD', 'SLIGHTLY_DAMAGED', 'DAMAGED', 'MISSING');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOW_STOCK', 'DAMAGED', 'MISSING', 'ISSUE', 'RETURN', 'SYSTEM');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guards" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "issuedQuantity" INTEGER NOT NULL DEFAULT 0,
    "damagedQuantity" INTEGER NOT NULL DEFAULT 0,
    "missingQuantity" INTEGER NOT NULL DEFAULT 0,
    "defaultCondition" "Condition" NOT NULL DEFAULT 'GOOD',
    "storageLocation" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_issues" (
    "id" TEXT NOT NULL,
    "guardId" TEXT NOT NULL,
    "custodianId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dutyPoint" TEXT,
    "remarks" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_issue_items" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantityIssued" INTEGER NOT NULL,
    "quantityReturned" INTEGER NOT NULL DEFAULT 0,
    "quantityOutstanding" INTEGER NOT NULL,
    "conditionAtIssue" "Condition" NOT NULL,
    "conditionAtReturn" "Condition",
    "returnedAt" TIMESTAMP(3),
    "returnedBy" TEXT,
    "remarks" TEXT,

    CONSTRAINT "equipment_issue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_movements" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "guardId" TEXT NOT NULL,
    "custodianId" TEXT NOT NULL,
    "action" "MovementAction" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" "Condition",
    "dutyPoint" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damaged_equipment_records" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "guardId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" "Condition" NOT NULL,
    "remarks" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "damaged_equipment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missing_equipment_records" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "guardId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remarks" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "missing_equipment_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE UNIQUE INDEX "users_staffId_key" ON "users"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "guards_staffId_key" ON "guards"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_categories_name_key" ON "equipment_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_itemCode_key" ON "equipment"("itemCode");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "equipment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_issues" ADD CONSTRAINT "equipment_issues_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "guards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_issues" ADD CONSTRAINT "equipment_issues_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_issue_items" ADD CONSTRAINT "equipment_issue_items_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_issue_items" ADD CONSTRAINT "equipment_issue_items_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "equipment_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_issue_items" ADD CONSTRAINT "equipment_issue_items_returnedBy_fkey" FOREIGN KEY ("returnedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "guards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damaged_equipment_records" ADD CONSTRAINT "damaged_equipment_records_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damaged_equipment_records" ADD CONSTRAINT "damaged_equipment_records_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "guards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damaged_equipment_records" ADD CONSTRAINT "damaged_equipment_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_equipment_records" ADD CONSTRAINT "missing_equipment_records_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_equipment_records" ADD CONSTRAINT "missing_equipment_records_guardId_fkey" FOREIGN KEY ("guardId") REFERENCES "guards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_equipment_records" ADD CONSTRAINT "missing_equipment_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
