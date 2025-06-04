/*
  Warnings:

  - You are about to drop the column `category_id` on the `Pic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pic" DROP CONSTRAINT "Pic_category_id_fkey";

-- DropIndex
DROP INDEX "Pic_category_id_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "picId" TEXT;

-- AlterTable
ALTER TABLE "Pic" DROP COLUMN "category_id";

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_picId_fkey" FOREIGN KEY ("picId") REFERENCES "Pic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
