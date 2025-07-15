/*
  Warnings:

  - You are about to drop the column `item_type` on the `Item` table. All the data in the column will be lost.
  - Added the required column `item_type` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "item_type" "ItemType" NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "item_type";
