/*
  Warnings:

  - Added the required column `item_type` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('It_Assets', 'Non_It_Assets');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "item_type" "ItemType" NOT NULL;
