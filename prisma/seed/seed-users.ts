import { hash } from 'argon2';
import { faker } from '@faker-js/faker';
import { PrismaClient, Role } from '@prisma/client';
import { choice } from '@/utils';

export async function seedUsers(prisma: PrismaClient) {
  console.log('About seeding users');

  const adminUsers = [
    {
      email: 'victorughonu@gmail.com',
      password: 'victor12345',
      role: Role.User,
    },
  ];

  const adminProfile = {
    'victorughonu@gmail.com': {
      firstName: 'Victor',
      lastName: 'Ughonu',
    },
    default: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    },
  } as const;

  type ValidAdminEmail = keyof typeof adminProfile;

  const existingUsersEmail = (
    await prisma.user.findMany({
      where: {
        email: {
          in: adminUsers.map((adminUser) => adminUser.email),
        },
      },
      select: {
        email: true,
      },
    })
  ).map((user) => user.email);

  const otherUsers = Array.from({ length: 10 }, () => {
    return {
      email: faker.internet.email(),
      password: 'dummy-password',
      role: choice([Role.User, Role.Admin]),
    };
  });

  let usersToCreate = [...adminUsers, ...otherUsers];

  usersToCreate = usersToCreate.filter(
    (user) => !existingUsersEmail.includes(user.email),
  );

  const userWithHashedPassword = await Promise.all(
    usersToCreate.map(async (user) => {
      const hashedPassword = await hash(user.password);
      return {
        ...user,
        password: hashedPassword,
      };
    }),
  );

  const users = await prisma.user.createManyAndReturn({
    data: userWithHashedPassword,
    skipDuplicates: true,
  });

  await Promise.all([
    prisma.userProfile.createMany({
      data: users.map((user) => {
        return {
          ...(adminProfile[user.email as ValidAdminEmail] ??
            adminProfile['default']),
          userId: user.id,
        };
      }),
      skipDuplicates: true,
    }),
  ]);

  console.log('Seeded users successfully');
}
