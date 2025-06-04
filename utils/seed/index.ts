import { PrismaClient } from '@prisma/client'
import * as argon from 'argon2'
import { seedData } from './data'

const prisma = new PrismaClient()

async function main() {

    const defaultPasswordPattern: string = process.env.DEFAULT_PASSWORD as string
    const defaultAdminEmail: string = process.env.DEFAULT_ADMIN as string
    // add role

    const defaultPassword = await argon.hash(defaultPasswordPattern)

    const result = await prisma.$transaction(async (tx) => {
        const roleName = seedData.email_address === defaultAdminEmail ? 'super_admin' : 'user'

        // create roles
        await tx.role.createMany({
            data: [
                { role_name: 'super_admin' },
                { role_name: 'admin' },
                { role_name: 'pic' },
                { role_name: 'user' }
            ]
        })

        const newUser = await tx.user.create({
            data: {
                first_name: seedData.first_name,
                last_name: seedData.last_name,
                fullname: `${seedData.first_name} ${seedData.last_name}`,
                email_address: seedData.email_address,
                password: defaultPassword,

                Personal: {
                    create: {
                        id_card: seedData.id_card,
                        phone_number: seedData.phone_number,
                        date_of_birth: seedData.date_of_birth,
                        gender: seedData.gender,
                    }
                },
                Employee: {
                    create: {
                        department: {
                            connectOrCreate: {
                                where: {
                                    department_name: seedData.department_name,
                                },
                                create: {
                                    department_name: seedData.department_name,
                                },
                            }
                        },
                        job_title: {
                            connectOrCreate: {
                                where: {
                                    job_title_name: seedData.job_title_name,
                                },
                                create: {
                                    job_title_name: seedData.job_title_name,
                                }
                            }
                        },
                        grade: seedData.grade
                    }
                },
                UserRole: {
                    create: {
                        role: {
                            connect: {
                                role_name: roleName,
                            }
                        }
                    }
                }
            }
        })

        const metaData = await tx.metaData.create({
            data: {
                user_id: newUser.user_id,
                start_date: new Date(),
                end_date: new Date(),
            }
        })

        return { newUser, metaData }
    })

    const { first_name, last_name, email_address } = result.newUser
    const res_newUser = {
        full_name: `${first_name} ${last_name}`,
        email_address
    }

    console.log({ message: 'Super Admin created', res_newUser, metaData: result.metaData })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
