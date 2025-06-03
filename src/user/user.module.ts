import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DepartmentController, MyProfileController, UserController } from './user.controller';

@Module({
  controllers: [UserController, MyProfileController, DepartmentController],
  providers: [UserService],
})
export class UserModule {}
