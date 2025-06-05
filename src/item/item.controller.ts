import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto, UpdateItemDto } from './dto';
import { Item } from '@prisma/client';
import { JwtAuthGuard } from '../auth/common/guards/jwt-auth.guard'; // Added
import { GetUser } from 'src/auth/common/decorator/get-user.decorators'; // Added - not used if item ops not user-specific

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) { }

  @UseGuards(JwtAuthGuard) // Protected
  @Post()
  create(@GetUser() user: {sub: string, roles: string[]}, @Body() dto: CreateItemDto): Promise<Item> {
    const { sub, roles } = user;
    if (roles.includes('pic')) {
      return this.itemService.create(sub, dto);
    }
    throw new ForbiddenException('You are not allowed to add a item')
  }

  @Get()
  findAll(): Promise<Item[]> {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Item> {
    return this.itemService.findOne(id);
  }

  @UseGuards(JwtAuthGuard) // Protected
  @Patch(':id')
  update(@GetUser('roles') roles: string[], @Param('id') id: string, @Body() dto: UpdateItemDto): Promise<Item> {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.itemService.update(id, dto);
    }
    throw new ForbiddenException('You are not allowed to update a item')
  }

  @UseGuards(JwtAuthGuard) // Protected
  @Delete(':id')
  remove(@GetUser('roles') roles: string[], @Param('id') id: string): Promise<Item> {
    if (roles.includes('super_admin') || roles.includes('admin')) {
      return this.itemService.remove(id);
    }
    throw new ForbiddenException('You are not allowed to delete a item')

  }
}
