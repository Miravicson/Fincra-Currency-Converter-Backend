import { Prisma } from '@prisma/client';
const userWithProfile = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { profile: true },
});
export type UserWithProfile = Prisma.UserGetPayload<typeof userWithProfile>;
