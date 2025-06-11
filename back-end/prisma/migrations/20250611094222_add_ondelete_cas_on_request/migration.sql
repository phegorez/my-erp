-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
