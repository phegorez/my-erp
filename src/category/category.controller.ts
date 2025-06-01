import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from '@prisma/client';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard'; // Added
import { GetUser } from 'src/auth/common/decorator/get-user.decorators';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @UseGuards(JwtAuthGuard) // Protected
  @Post()
  async create(@GetUser('roles') roles: string[], @Body() dto: CreateCategoryDto): Promise<Category | string> {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.categoryService.create(dto)
    }
    throw new ForbiddenException('You are not allowed to create a category')
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @UseGuards(JwtAuthGuard) // Protected
  @Patch(':id')
  async update(@GetUser('roles') roles: string[], @Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<Category> {
    if ((roles.includes('super_admin') || roles.includes('admin'))) {
      return this.categoryService.update(id, dto)
    }
    throw new ForbiddenException('You are not allowed to edit a category')
  }

  @UseGuards(JwtAuthGuard) // Protected
  @Delete(':id')
  async remove(@GetUser('roles') roles: string[], @Param('id') id: string): Promise<string> {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.categoryService.remove(id);
    }
    throw new ForbiddenException('You are not allowed to delete a category')
  }
}