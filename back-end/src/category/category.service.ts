import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path as needed
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category, Pic } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }

  async create(admin_id: string, dto: CreateCategoryDto): Promise<Category> {
    const { category_name, assigned_pic } = dto;
    // validate dto
    if (!category_name || !assigned_pic) {
      throw new NotAcceptableException('Category name and assigned pic are required');
    }

    // check if category name already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { category_name },
    });

    if (existingCategory) {
      throw new NotAcceptableException(`Category name : ${category_name} is already created`);
    }

    // check if assigned_pic exists
    const existingPic = await this.prisma.user.findUnique({
      where: { user_id: assigned_pic },
    })

    if (!existingPic) {
      throw new NotAcceptableException(`Assigned pic with user_id : ${assigned_pic} does not exist`);
    }

    // Create the category with the assigned pic
    try {

      // Using a transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {

        // step 1 check if user is already assigned to role pic
        let existingPic = await tx.pic.findUnique({
          where: { user_id: assigned_pic },
        })

        if (!existingPic) {
          // step 1.1 add role pic to user if not exist
          await tx.role.update({
            where: {
              role_name: 'pic',
            },
            data: {
              UserRole: {
                create: {
                  user_id: assigned_pic, // Assuming assigned_pic is a user_id
                }
              }
            }
          })

          // step 1.2 create new pic
          existingPic = await tx.pic.create({
            data: {
              user_id: assigned_pic,
              assigned_by_user_id: admin_id
            }
          });
        }

        // step 2 create category with assigned pic
        const newCategory = await tx.category.create({
          data: {
            category_name,
            pic: {
              connect: {
                user_id: existingPic.user_id
              }
            }
          }
        })

        // step 3 return the created category
        return newCategory;
      })
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new NotAcceptableException(`Category name : ${category_name} is already created`);
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      include: {
        pic: {
          select: {
            user_id: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
                email_address: true
              }
            },
            assigned_by_user_id: true
          },
        },
        _count: {
          select: {
            items: true
          }
        }
      },
    });
    return categories;
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

  async update(pic_id: string, category_id: string, dto: UpdateCategoryDto): Promise<Category> {

    // check this user is owner of this category
    const category = await this.prisma.category.findUnique({
      where: { category_id },
      include: { pic: true } // Include the pic relation to check ownership
    });

    if (category?.pic?.user_id !== pic_id) {
      throw new NotAcceptableException(`You are not allowed to edit this category`);
    }

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

  // pic
  async assignPic(category_id: string, admin_id: string, dto: { assigned_pic: string }): Promise<Category> {
    const { assigned_pic } = dto;

    // Check if the category exists
    const category = await this.prisma.category.findUnique({
      where: { category_id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${category_id}" not found`);
    }

    // Check if the assigned pic exists
    const existingPic = await this.prisma.user.findUnique({
      where: { user_id: assigned_pic },
    });

    if (!existingPic) {
      throw new NotAcceptableException(`Assigned pic with user_id : ${assigned_pic} does not exist`);
    }

    // Check if the user is already assigned as a pic
    let pic = await this.prisma.pic.findUnique({
      where: { user_id: assigned_pic },
    });

    if (!pic) {
      // Create a new pic if it doesn't exist
      pic = await this.prisma.pic.create({
        data: {
          user_id: assigned_pic,
          assigned_by_user_id: admin_id, // Assuming the pic is assigned by the current pic
        },
      });
    }

    // Update the category to connect to the new pic
    return this.prisma.category.update({
      where: { category_id },
      data: {
        pic: {
          connect: { user_id: pic.user_id },
        },
      },
    });
  }

  async findAllPics() {
    const PICs = await this.prisma.pic.findMany({
      select: {
        user_id: true,
        user: {
          select: {
            first_name: true,
            last_name: true,
            email_address: true
          }
        },
        assigned_by_user_id: true,
        categories: {
          select: {
            category_id: true,
            category_name: true
          }
        }
      }
    })
    return PICs
  }

  async removePic(pic_id: string): Promise<string> {
    try {
      const deletedPic = await this.prisma.pic.findUnique({
        where: { user_id: pic_id },
      });

      if (!deletedPic) {
        throw new NotFoundException(`Pic with ID "${pic_id}" not found`);
      }

      await this.prisma.pic.delete({
        where: { user_id: pic_id },
      });

      return `Delete Pic with ID : ${pic_id} successful`;
    } catch (error) {
      throw error;
    }
  }
}