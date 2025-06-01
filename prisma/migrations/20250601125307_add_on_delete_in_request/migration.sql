-- DropForeignKey
ALTER TABLE "RequestApproval" DROP CONSTRAINT "RequestApproval_request_id_fkey";

-- DropForeignKey
ALTER TABLE "RequestItem" DROP CONSTRAINT "RequestItem_request_id_fkey";

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("request_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestApproval" ADD CONSTRAINT "RequestApproval_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "Request"("request_id") ON DELETE CASCADE ON UPDATE CASCADE;
