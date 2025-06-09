import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category, Pic } from '@prisma/client';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard'; // Added
import { GetUser } from 'src/auth/common/decorator/get-user.decorators';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  async create(@GetUser() user: { sub: string; roles: string[] }, @Body() dto: CreateCategoryDto): Promise<Category | string> {
    const { sub, roles } = user
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.categoryService.create(sub, dto)
    }
    throw new ForbiddenException('Permission denied')
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  async update(@GetUser() user: { sub: string; roles: string[] }, @Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<Category> {
    const { sub, roles } = user
    if (roles.includes('pic')) {
      return this.categoryService.update(sub, id, dto)
    }
    throw new ForbiddenException('Permission denied: Your are not PIC')
  }

  @Patch('assign-pic/:id')
  async assignPic(@GetUser() user: { sub: string, roles: string[] }, @Param('id') id: string, @Body() dto: { assigned_pic: string }): Promise<Category> {
    const { sub, roles } = user
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.categoryService.assignPic(id, sub, dto);
    }
    throw new ForbiddenException('Permission denied')
  }

  @Delete(':id')
  async remove(@GetUser('roles') roles: string[], @Param('id') id: string): Promise<string> {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.categoryService.remove(id);
    }
    throw new ForbiddenException('Permission denied')
  }
}

@UseGuards(JwtAuthGuard)
@Controller('pics')
export class PicController {
  constructor(private readonly categoryService: CategoryService) { }

  @Get()
  async getAllPic(): Promise<Pic[] | string> {
    return this.categoryService.findAllPics();
  }

  @Delete(':id')
  async removePic(@GetUser('roles') roles: string[], @Param('id') id: string): Promise<string> {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.categoryService.removePic(id);
    }
    throw new ForbiddenException('Permission denied')
  }
}