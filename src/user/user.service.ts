import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService
  ) { }

  async create(userDto: UserDto) {

    const defaultPassword = await argon.hash("P@ssW0rd$1234")
    // check existing user

    try {

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
              }
            }
          },
          UserRole: {
            create: [
              {
                role: {
                  connect: {
                    role_name: userDto.email_address === 'systemadmin@local.com' ? 'super_admin' : 'user'
                  }
                }
              }
            ]
          }
        }
      })

      // create metadata
      const metaData = await this.createMetaData(newUser)

      const { first_name, last_name, email_address } = newUser

      const res_newUser = {
        full_name: `${first_name} ${last_name}`,
        email_address
      }

      delete (newUser as any).password
      return { message: 'user created', res_newUser, metaData }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists')
        }
      }
      throw error
    }
  }

  async createMetaData(newUser: User) {
    try {
      const metaData = await this.prisma.metaData.create({
        data: {
          user: { connect: { user_id: newUser.user_id } },
          start_date: new Date(),
          end_date: new Date(),
        }
      })
      return metaData
    } catch (error) {
      throw error
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, userDto: UserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
