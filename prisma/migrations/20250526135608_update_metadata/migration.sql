-- DropForeignKey
ALTER TABLE "MetaData" DROP CONSTRAINT "MetaData_user_id_fkey";

-- AddForeignKey
ALTER TABLE "MetaData" ADD CONSTRAINT "MetaData_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
