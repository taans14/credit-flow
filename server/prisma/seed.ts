import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.feature.createMany({
    data: [
      {
        code: 'IMAGE_GENERATION',
        displayName: 'Image Generation',
      },
      {
        code: 'AUTO_POST',
        displayName: 'Auto Post',
      },
      {
        code: 'ANALYTICS',
        displayName: 'Analytics',
      },
    ],

    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
