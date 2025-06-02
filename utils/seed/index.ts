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

        const role = await tx.role.upsert({
            where: { role_name: roleName },
            update: {},
            create: {
                role_name: roleName,
            }
        })

        const newUser = await tx.user.create({
            data: {
                first_name: seedData.first_name,
                last_name: seedData.last_name,
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
                    create: [
                        {
                            role_id: role.role_id
                        }
                    ]
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
