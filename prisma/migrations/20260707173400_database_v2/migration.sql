-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EntryReason" AS ENUM ('TUTOR_PAY', 'ADVISOR_PAY');

-- CreateEnum
CREATE TYPE "PaymentReason" AS ENUM ('CLIENT_PAYMENT', 'EMPLOYEE_PAYMENT', 'EMPLOYEE_BONUS', 'REFERRAL_BONUS', 'CORRECTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "StripeStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "TimesheetStatus" AS ENUM ('PENDING', 'FLAGGED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "Advisor" (
    "advisor_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "stripe_account_id" TEXT,
    "stripe_status" "StripeStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "hours" INTEGER NOT NULL DEFAULT 0,
    "wage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Advisor_pkey" PRIMARY KEY ("advisor_id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "assignment_id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "assignment_grade" INTEGER,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "document_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "date_uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "MeetingTranscript" (
    "transcript_id" SERIAL NOT NULL,
    "document_id" INTEGER,
    "session_id" INTEGER NOT NULL,

    CONSTRAINT "MeetingTranscript_pkey" PRIMARY KEY ("transcript_id")
);

-- CreateTable
CREATE TABLE "PayAdjustment" (
    "pay_adjustment_id" SERIAL NOT NULL,
    "previous_payment_id" INTEGER NOT NULL,
    "new_payment_id" INTEGER NOT NULL,

    CONSTRAINT "PayAdjustment_pkey" PRIMARY KEY ("pay_adjustment_id")
);

-- CreateTable
CREATE TABLE "PayPeriod" (
    "pay_period_id" SERIAL NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,

    CONSTRAINT "PayPeriod_pkey" PRIMARY KEY ("pay_period_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "pay_period_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "stripe_transfer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_reason" "PaymentReason" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "approved_by" INTEGER,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_amount" INTEGER NOT NULL,
    "failure_reason" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "Person" (
    "person_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "reschedules" INTEGER NOT NULL DEFAULT 0,
    "clerk_id" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "reminder_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "reminder_text" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "type" "ReminderType" NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'QUEUED',

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "schedule_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" SERIAL NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "meeting_url" TEXT,
    "meeting_password" TEXT,
    "session_description" TEXT,
    "session_duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "SessionAttendants" (
    "session_attendants_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "arrival_time" TIME(6),
    "leave_time" TIME(6),

    CONSTRAINT "SessionAttendants_pkey" PRIMARY KEY ("session_attendants_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "student_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "parent_phone" VARCHAR(15) NOT NULL,
    "parent_email" TEXT,
    "absences" INTEGER NOT NULL DEFAULT 0,
    "emergency_reschedules" INTEGER NOT NULL DEFAULT 3,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "prepaid_hours" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Test" (
    "test_id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "test_grade" INTEGER,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("test_id")
);

-- CreateTable
CREATE TABLE "TimeMismatch" (
    "time_mismatch_id" SERIAL NOT NULL,
    "timesheet_entry_id" INTEGER NOT NULL,
    "resolution_date" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "resolution_note" TEXT,

    CONSTRAINT "TimeMismatch_pkey" PRIMARY KEY ("time_mismatch_id")
);

-- CreateTable
CREATE TABLE "TimesheetEntry" (
    "timesheet_entry_id" SERIAL NOT NULL,
    "pay_period_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "timesheet_status" "TimesheetStatus" NOT NULL DEFAULT 'PENDING',
    "entry_reason" "EntryReason" NOT NULL,
    "correction" INTEGER,

    CONSTRAINT "TimesheetEntry_pkey" PRIMARY KEY ("timesheet_entry_id")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "tutor_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "stripe_account_id" TEXT,
    "stripe_status" "StripeStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "hours" INTEGER NOT NULL DEFAULT 0,
    "wage" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("tutor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_person_id_key" ON "Admin"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "Advisor_person_id_key" ON "Advisor"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_document_id_key" ON "Assignment"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingTranscript_document_id_key" ON "MeetingTranscript"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingTranscript_session_id_key" ON "MeetingTranscript"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "PayAdjustment_previous_payment_id_key" ON "PayAdjustment"("previous_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "PayAdjustment_new_payment_id_key" ON "PayAdjustment"("new_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Person_phone_key" ON "Person"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Person_username_key" ON "Person"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Person_clerk_id_key" ON "Person"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_person_id_key" ON "Schedule"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAttendants_session_id_person_id_key" ON "SessionAttendants"("session_id", "person_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_person_id_key" ON "Student"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "Test_document_id_key" ON "Test"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "TimeMismatch_timesheet_entry_id_key" ON "TimeMismatch"("timesheet_entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "TimesheetEntry_session_id_key" ON "TimesheetEntry"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_person_id_key" ON "Tutor"("person_id");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTranscript" ADD CONSTRAINT "MeetingTranscript_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("document_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTranscript" ADD CONSTRAINT "MeetingTranscript_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayAdjustment" ADD CONSTRAINT "PayAdjustment_new_payment_id_fkey" FOREIGN KEY ("new_payment_id") REFERENCES "Payment"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayAdjustment" ADD CONSTRAINT "PayAdjustment_previous_payment_id_fkey" FOREIGN KEY ("previous_payment_id") REFERENCES "Payment"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Person"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "PayPeriod"("pay_period_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("schedule_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendants" ADD CONSTRAINT "SessionAttendants_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendants" ADD CONSTRAINT "SessionAttendants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeMismatch" ADD CONSTRAINT "TimeMismatch_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "Person"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeMismatch" ADD CONSTRAINT "TimeMismatch_timesheet_entry_id_fkey" FOREIGN KEY ("timesheet_entry_id") REFERENCES "TimesheetEntry"("timesheet_entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "PayPeriod"("pay_period_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

