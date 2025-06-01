import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path as needed
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      const newCategory = await this.prisma.category.create({
        data: {
          category_name: dto.category_name,
        },
      });
      return newCategory
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new NotAcceptableException(`Category name : ${dto.category_name} is already created`)
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  async findOne(category_id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { category_id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${category_id}" not found`);
    }
    return category;
  }

  async update(category_id: string, dto: UpdateCategoryDto): Promise<Category> {
    try {
      await this.findOne(category_id) // Ensure category exists
      const editedCategory = await this.prisma.category.update({
        where: { category_id },
        data: {
          category_name: dto.category_name
        }
      })
      return editedCategory
    } catch (error) {
      throw error
    }
  }

  async remove(category_id: string): Promise<string> {
    try {
      const deletedCategroy = await this.findOne(category_id) // Ensure category exists 
      await this.prisma.category.delete({
        where: {
          category_id
        }
      })
      return `Delete Category : ${deletedCategroy.category_name} successful`
    } catch (error) {
      throw error
    }
  }
}