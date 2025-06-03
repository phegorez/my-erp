/*
  Warnings:

  - You are about to drop the column `approved_by` on the `RequestApproval` table. All the data in the column will be lost.
  - Added the required column `user_manager_id` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `approver_id` to the `RequestApproval` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `RequestApproval` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ApproverRole" AS ENUM ('Manager', 'PIC');

-- DropForeignKey
ALTER TABLE "RequestApproval" DROP CONSTRAINT "RequestApproval_approved_by_fkey";

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "user_manager_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RequestApproval" DROP COLUMN "approved_by",
ADD COLUMN     "approver_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "role",
ADD COLUMN     "role" "ApproverRole" NOT NULL;

-- AddForeignKey
ALTER TABLE "RequestApproval" ADD CONSTRAINT "RequestApproval_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
