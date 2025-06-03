import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { EditPersonalDto, UpdateUserDto, UserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MetaData, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) { }

  async create(userDto: UserDto, user_id: string) {

    // input validation
    if (!user_id || !userDto) {
      throw new BadRequestException('Missing required parameters');
    }

    // create a default password
    const defaultPassword = await argon.hash(this.config.get('DEFAULT_PASSWORD') as string)

    // create a new user
    try {
      // create role
      const role = await this.prisma.role.upsert({
        where: { role_name: 'user' },
        update: {},
        create: {
          role_name: 'user',
        }
      })

      const result = await this.prisma.$transaction(async (tx) => {

        const newUser = await this.prisma.user.create({
          data: {
            first_name: userDto.first_name,
            last_name: userDto.last_name,
            email_address: userDto.email_address,
            password: defaultPassword,

            Personal: {
              create: {
                id_card: userDto.id_card,
                phone_number: userDto.phone_number,
                date_of_birth: userDto.date_of_birth,
                gender: userDto.gender,
              }
            },
            Employee: {
              create: {
                department: {
                  connectOrCreate: {
                    where: {
                      department_name: userDto.department_name,
                    },
                    create: {
                      department_name: userDto.department_name
                    },
                  }
                },
                job_title: {
                  connectOrCreate: {
                    where: {
                      job_title_name: userDto.job_title_name,
                    },
                    create: {
                      job_title_name: userDto.job_title_name
                    }
                  }
                },
                grade: userDto.grade
              }
            },
            UserRole: {
              create: [
                {
                  role_id: role.role_id
                }
              ]
            }
          }
        })

        delete (newUser as any).password;

        // สร้าง MetaData
        const metaData = await tx.metaData.create({
          data: {
            user_id: newUser.user_id,
            start_date: new Date(),
            end_date: new Date(),
            created_by_user_id: user_id,
            last_modified_by_user_id: user_id,
          }
        });

        return { newUser, metaData };
      });

      const { first_name, last_name, email_address } = result.newUser;
      const res_newUser = {
        full_name: `${first_name} ${last_name}`,
        email_address
      };

      return { message: 'user created', res_newUser, metaData: result.metaData };

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (
          error.meta &&
          Array.isArray((error.meta as any).target)
        ) {
          const target = (error.meta as any).target[0];
          switch (target) {
            // if the error is related to unique constraints
            case 'email_address': // email_address is unique
              throw new ForbiddenException('Email already exists');
            case 'id_card': // id_card is unique
              throw new ForbiddenException('ID card already exists');
            case 'phone_number': // phone_number is unique
              throw new ForbiddenException('Phone number already exists');
            default:
              throw new ForbiddenException(`Unique constraint failed on: ${target}`);
          }
        }
      }
      console.error('Unexpected error during user creation:', error);
      throw error;
    }
  }

  async getAll() {

    // get all user from database
    try {
      const allUsers = await this.prisma.employee.findMany({
        select: {
          user_id: true,
          user: {
            select: {
              first_name: true,
              last_name: true,
              email_address: true,
            }
          },
          department: true,
          job_title: true
        }
      })

      return allUsers
    } catch (error) {
      throw error;
    }
  }

  async findOne(roles: string[], user_id: string) {
    // role must be admin
    if (!roles.includes('super_admin') && !roles.includes('admin')) {
      throw new ForbiddenException('Your role are not admin');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          user_id
        },
        select: {
          first_name: true,
          last_name: true,
          email_address: true,
          UserRole: {
            select: {
              role: {
                select: {
                  role_id: true,
                  role_name: true,
                }
              }
            }
          }
        }
      })
      return user
    } catch (error) {
      throw error
    }
  }

  async queryByFilter(filter: { query: string, value: string }) {
    const { query, value } = filter
    const allowedFielsds = ['department_id', 'job_title_id', 'grade'];
    if (!allowedFielsds.includes(query)) {
      throw new BadRequestException(`Invalid query parameter: ${query}. Allowed fields are: ${allowedFielsds.join(', ')}`);
    }
    try {
      const result = await this.prisma.employee.findMany({
        where: {
          [query]: {
            equals: value
          }
        },
        select: {
          user_id: true,
          user: {
            select: {
              first_name: true,
              last_name: true,
              email_address: true,
            }
          },
          department: {
            select: {
              department_name: true,
            }
          },
          job_title: {
            select: {
              job_title_name: true,
            }
          },
          grade: true,
        }
      })
      if (result.length > 0) {
        return result
      } else {
        throw new BadRequestException(`No users found with ${query} = ${value}`);
      }
    } catch (error) {
      throw error
    }
  }

  async getProfile(user_id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id },
        select: {
          first_name: true,
          last_name: true,
          email_address: true,
          created_at: true,
          updated_at: true,
          Personal: true,
          Employee: {
            include: {
              department: true,
              job_title: true
            }
          },
          UserRole: {
            include: {
              role: true
            }
          }
        }
      })
      if (!user) {
        throw new ForbiddenException('User not found')
      }
      return user
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenException('User not found')
        }
      }
      throw error
    }
  }

  async getAllDepartments(roles: string[]) {
    // role must be admin
    if (!roles.includes('super_admin') && !roles.includes('admin')) {
      throw new ForbiddenException('Your role are not admin');
    }

    try {
      const allDepartments = await this.prisma.department.findMany()
      return allDepartments
    } catch (error) {
      throw error
    }
  }

  async editPersonalInfo(user_id: string, editPersonalData: EditPersonalDto,) {
    // validate data
    if (!user_id || !editPersonalData) {
      throw new BadRequestException('Missing required parameters');
    }

    // find user personal data
    try {
      const personalData = await this.prisma.personal.findUnique({
        where: {
          user_id: user_id
        }
      })

      if (!personalData) {
        throw new BadRequestException('Not found personal data')
      }

      // update
      await this.prisma.personal.update({
        where: {
          user_id: user_id
        },
        data: {
          id_card: editPersonalData.id_card,
          phone_number: editPersonalData.phone_number,
          date_of_birth: editPersonalData.date_of_birth,
          gender: editPersonalData.gender
        }
      })

      return {
        message: 'Update Successful'
      }
    } catch (error) {
      throw new error
    }
  }

  async update(user_id: string, userDto: UpdateUserDto) {
    // validate data
    if (!user_id || !userDto) {
      throw new BadRequestException('Missing required parameters');
    }

    // cannot update role to super_admin
    if (userDto.role_name === 'super_admin') {
      throw new ForbiddenException('Cannot update role to super_admin');
    }

    try {
      // update user
      if (userDto.role_name) {
        await this.prisma.$transaction(async (tx) => {

          // check if role exists, if not create it
          const existingRole = await tx.role.findUnique({
            where: {
              role_name: userDto.role_name
            }
          })

          if (!existingRole) {
            // create new role
            const newRole = await tx.role.create({
              data: {
                role_name: userDto.role_name
              }
            })

            // assign the new role to the user
            await tx.userRole.create({
              data: {
                user_id: user_id,
                role_id: newRole.role_id
              }
            })
          }
          else {
            // if role exists, update the user role
            await tx.userRole.upsert({
              where: {
                user_id_role_id: {
                  user_id: user_id,
                  role_id: existingRole.role_id
                }
              },
              update: {},
              create: {
                user_id: user_id,
                role_id: existingRole.role_id
              }
            })
          }
        })
      }
      await this.prisma.user.update({
        where: {
          user_id: user_id
        },
        data: {
          first_name: userDto.first_name,
          last_name: userDto.last_name,
          // update role if provided
        }
      })

      return {
        message: 'User updated successfully',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('User not found');
        }
      }
      throw error;
    }
  }

  async remove(user_id: string) {
    if (!user_id) {
      throw new BadRequestException('Missing user_id parameter');
    }
    try {
      await this.prisma.user.delete({
        where: {
          user_id: user_id
        }
      })
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('User not found');
        }
      }
      throw error;
    }
  }
}
