/*
  Warnings:

  - Made the column `lastPassword_changeDate` on table `AuthenLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AuthenLog" ALTER COLUMN "lastPassword_changeDate" SET NOT NULL,
ALTER COLUMN "lastPassword_changeDate" SET DEFAULT CURRENT_TIMESTAMP;
