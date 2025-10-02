import { PrismaClient } from '@prisma/client';

function createAccountsData(userId: number) {
  return [
    {
      currencyCode: 'USD',
      currencyName: 'United States Dollar',
      availableBalance: 200,
      pendingBalance: 50,

      userId,
      currencySymbol: '$',
    },
    {
      currencyCode: 'GBP',
      currencyName: 'British Pound',
      availableBalance: 200,
      pendingBalance: 50,
      userId,
      currencySymbol: '£',
    },
    {
      currencyCode: 'EUR',
      currencyName: 'Euro',
      availableBalance: 200,
      pendingBalance: 50,
      userId,
      currencySymbol: '€',
    },
    {
      currencyCode: 'NGN',
      currencyName: 'Nigerian Naira',
      availableBalance: 200,
      pendingBalance: 50,
      userId,
      currencySymbol: '₦',
    },
  ];
}

export async function seedAccounts(prisma: PrismaClient) {
  console.log('About seeding accounts');
  const userIds = (
    await prisma.user.findMany({
      select: {
        id: true,
      },
    })
  ).map((user) => user.id);

  await prisma.account.createMany({
    data: userIds.map((userId) => createAccountsData(userId)).flat(),
    skipDuplicates: true,
  });
}
