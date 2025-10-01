import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async () => {
  await prisma.$transaction([
    prisma.hospitalParent.deleteMany(),
    prisma.hospital.deleteMany(),
    prisma.user.deleteMany(),
    prisma.hospitalChild.deleteMany(),
  ]);
};
