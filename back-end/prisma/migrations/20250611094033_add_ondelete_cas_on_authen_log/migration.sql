-- DropForeignKey
ALTER TABLE "AuthenLog" DROP CONSTRAINT "AuthenLog_user_id_fkey";

-- AddForeignKey
ALTER TABLE "AuthenLog" ADD CONSTRAINT "AuthenLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
