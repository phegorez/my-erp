-- DropForeignKey
ALTER TABLE "MetaData" DROP CONSTRAINT "MetaData_created_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "MetaData" DROP CONSTRAINT "MetaData_last_modified_by_user_id_fkey";

-- AlterTable
ALTER TABLE "MetaData" ALTER COLUMN "created_by_user_id" DROP NOT NULL,
ALTER COLUMN "last_modified_by_user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MetaData" ADD CONSTRAINT "MetaData_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaData" ADD CONSTRAINT "MetaData_last_modified_by_user_id_fkey" FOREIGN KEY ("last_modified_by_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
