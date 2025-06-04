import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController, PicController } from './category.controller';

@Module({
  controllers: [CategoryController, PicController],
  providers: [CategoryService],
})
export class CategoryModule {}
