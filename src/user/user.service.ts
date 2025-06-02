import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { EditPersonalDto, UserDto } from './dto';
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

  async create(userDto: UserDto, user_id: string, roles: string[]) {

    // input validation
    if (!user_id || !userDto) {
      throw new BadRequestException('Missing required parameters');
    }

    // check if the user is super admin
    if (!roles.includes('super_admin')) {
      throw new ForbiddenException('You are not allowed to create a user');
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

  async getAll(roles: string[]) {

    // role must be admin
    if (!roles.includes('super_admin') && !roles.includes('admin')) {
      throw new ForbiddenException('Your role are not admin');
    }

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
          UserRole: {
            include: {
              role: {
                select: {
                  role_name: true
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

  async queryByFilter(filter: { query: string, value: string }, roles: string[]) {
    const { query, value } = filter
    if (!roles.includes('super_admin') && !roles.includes('admin') && query === 'id') {
      throw new ForbiddenException('Your role are not admin');
    }
    if (query === 'grade') {
      return await this.queryByGrade(value)
    }
  }

  async queryByGrade(value: string) {
    try {
      const result = await this.prisma.employee.findMany({
        where: {
          grade: {
            equals: value
          }
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email_address: true,
            }
          }
        }
      })
      return result
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

  update(id: number, userDto: UserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
