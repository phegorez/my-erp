/*
  Warnings:

  - The values [Waiting_Approval] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('Success', 'Reject', 'Revise', 'Canceled', 'Approved', 'Waiting_Manager_Approval', 'Waiting_PIC_Approval');
ALTER TABLE "Request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RequestApproval" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TABLE "RequestApproval" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'Waiting_Manager_Approval';
COMMIT;

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'Waiting_Manager_Approval';

-- AlterTable
ALTER TABLE "RequestApproval" ALTER COLUMN "status" DROP DEFAULT;
