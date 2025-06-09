/*
  Warnings:

  - You are about to drop the column `description` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `job_description` on the `JobTitle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Personal" DROP CONSTRAINT "Personal_user_id_fkey";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "JobTitle" DROP COLUMN "job_description";

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
