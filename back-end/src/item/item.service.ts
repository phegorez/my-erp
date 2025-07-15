import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path
import { CreateItemDto, UpdateItemDto } from './dto';
import { Item } from '@prisma/client';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) { }

  async create(pic_id: string, dto: CreateItemDto): Promise<Item> {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { category_id: dto.category_id },
      include: { pic: true }, // Include PIC details if needed
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${dto.category_id}" not found.`);
    }

    // Check if the user is a PIC (Person In Charge)
    if (category?.pic?.user_id !== pic_id) {
      throw new NotFoundException(`User with ID "${pic_id}" is not assigned as PIC for this category.`);
    }

    return this.prisma.item.create({
      data: {
        item_name: dto.item_name,
        description: dto.description,
        category_id: dto.category_id,
        serial_number: dto.serial_number,
        imei: dto.imei,
        is_available: dto.is_available === undefined ? true : dto.is_available, // Default to true
      },
      include: { category: true }, // Include category details in the response
    });
  }

  async findAll(): Promise<{ ok: boolean; data: Item[] }> {
    const items = await this.prisma.item.findMany()
    return {
      ok: true,
      data: items
    }
  }
  async findOne(item_id: string): Promise<Item> {
    const item = await this.prisma.item.findUnique({
      where: { item_id },
      include: { category: true },
    });
    if (!item) {
      throw new NotFoundException(`Item with ID "${item_id}" not found`);
    }
    return item;
  }

  async update(item_id: string, dto: UpdateItemDto): Promise<{ ok: boolean; data: Item }> {
    await this.findOne(item_id); // Ensure item exists

    if (dto.category_id) {
      const category = await this.prisma.category.findUnique({
        where: { category_id: dto.category_id },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID "${dto.category_id}" not found.`);
      }
    }

    const editedItem = await this.prisma.item.update({
      where: { item_id },
      data: {
        ...dto,
      },
      include: { category: true },
    });

    return {
      ok: true,
      data: editedItem,
    };
  }

  async remove(item_id: string, pic_id: string): Promise<{ ok: boolean; data: Item }> {
    const selectedItem = await this.findOne(item_id); // Ensure item exists
    if (!selectedItem) {
      throw new NotFoundException(`Item with ID "${item_id}" not found`);
    }
    const deletedItem = await this.prisma.item.delete({
      where: { item_id },
    });
    return {
      ok: true,
      data: deletedItem,
    }
  }
}