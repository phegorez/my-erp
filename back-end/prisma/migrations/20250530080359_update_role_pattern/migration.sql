/*
  Warnings:

  - You are about to drop the column `is_admin` on the `MetaData` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MetaData" DROP COLUMN "is_admin";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "description";
