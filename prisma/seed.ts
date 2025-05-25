// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const roles = ['super_admin', 'admin', 'user'] as const;

    for (const role_name of roles) {
        await prisma.role.upsert({
            where: { role_name },
            update: {},
            create: {
                role_name,
                description: `${role_name} role`,
            },
        });
    }

    console.log('✅ Roles seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
