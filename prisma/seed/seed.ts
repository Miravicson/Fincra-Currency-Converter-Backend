import { seedUsers } from './seed-users';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  await seedUsers(prisma);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit();
  });
