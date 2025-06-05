import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestApprovalController, RequestController } from './request.controller';

@Module({
  controllers: [RequestController, RequestApprovalController],
  providers: [RequestService],
})
export class RequestModule {}
