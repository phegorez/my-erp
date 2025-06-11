import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { EditPersonalDto, UpdateUserDto, UserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { ok } from 'assert';

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
            fullname: `${userDto.first_name} ${userDto.last_name}`,
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

        // create MetaData
        const metaData = await tx.metaData.create({
          data: {
            user_id: newUser.user_id,
            start_date: new Date(),
            end_date: new Date(),
            created_by_user_id: user_id,
            last_modified_by_user_id: user_id,
          }
        });

        return { newUser, metaData, };
      });

      const { first_name, last_name, email_address } = result.newUser;
      const res_newUser = {
        full_name: `${first_name} ${last_name}`,
        email_address
      };

      return { message: 'user created', res_newUser, metaData: result.metaData, ok: true };

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
          grade: true,
          user: {
            select: {
              first_name: true,
              last_name: true,
              email_address: true,
              Personal: {
                select: {
                  phone_number: true,
                }
              },
              userMetaData: {
                select: {
                  start_date: true,
                  status: true,
                }
              },
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
          },
          department: true,
          job_title: true,
          
        }
      })

      return {
        data: allUsers,
        ok: true
      }
    } catch (error) {
      throw error;
    }
  }

  async findOne(user_id: string) {

    // validate user_id
    if (!user_id) {
      throw new BadRequestException('Missing user_id parameter');
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
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenException('User not found')
        }
      }
      throw error
    }
  }

  async queryByFilter(filter: { query: string, value: string }) {

    // validate filter
    if (!filter || !filter.query || !filter.value) {
      throw new BadRequestException('Missing required filter parameters');
    }

    const { query, value } = filter
    const allowedFielsds = ['department_id', 'job_title_id', 'grade'];

    // check if query is allowed
    if (!allowedFielsds.includes(query)) {
      throw new BadRequestException(`Invalid query parameter: ${query}. Allowed fields are: ${allowedFielsds.join(', ')}`);
    }

    // get users by filter
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
        return {
          data: result,
          ok: true
        }
      } else {
        throw new BadRequestException(`No users found with ${query} = ${value}`);
      }
    } catch (error) {
      throw error
    }
  }

  // search users by query
  async searchUsers(query: string) {
    // validate query
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }

    try {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { first_name: { contains: query, mode: 'insensitive' } },
            { last_name: { contains: query, mode: 'insensitive' } },
            { email_address: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          email_address: true,
        }
      })
      return users
    } catch (error) {
      throw error
    }
  }

  // for owner user
  async getProfile(user_id: string) {

    // validate user_id
    if (!user_id) {
      throw new BadRequestException('Missing user_id parameter');
    }

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
      return {
        data: user,
        ok: true
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenException('User not found')
        }
      }
      throw error
    }
  }

  async getAllDepartments() {
    try {
      const allDepartments = await this.prisma.department.findMany()
      return { allDepartments, ok: true }
    } catch (error) {
      throw error
    }
  }

  // owner user_id can edit personal info
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
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenException('User not found')
        }
      }
      throw error
    }
  }

  async update(user_id: string, userDto: UpdateUserDto) {
    // validate data
    if (!user_id || !userDto) {
      throw new BadRequestException('Missing required parameters');
    }

    try {

      // update user information
      await this.prisma.user.update({
        where: {
          user_id: user_id
        },
        data: {
          first_name: userDto.first_name,
          last_name: userDto.last_name,
          fullname: `${userDto.first_name} ${userDto.last_name}`,
          UserRole: {
            create: {
              role: {
                connect: {
                  role_name: userDto.role_name
                }
              }
            }
          }
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
      return { message: 'User deleted successfully', ok: true };
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
