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
  await prisma.$transaction(async (tx) => {
    // Clear database
    await tx.packageFeature.deleteMany();
    await tx.userFeature.deleteMany();
    await tx.creditTransaction.deleteMany();
    await tx.payment.deleteMany();
    await tx.order.deleteMany();

    await tx.userWallet.deleteMany();
    await tx.creditPackage.deleteMany();
    await tx.feature.deleteMany();

    // Seed features
    const features = await Promise.all([
      tx.feature.create({
        data: {
          code: 'IMAGE_GENERATION',
          displayName: 'Image Generation',
          cost: 10,
        },
      }),

      tx.feature.create({
        data: {
          code: 'AUTO_POST',
          displayName: 'Auto Post',
          cost: 2,
        },
      }),

      tx.feature.create({
        data: {
          code: 'ANALYTICS',
          displayName: 'Analytics',
          cost: 1,
        },
      }),
    ]);

    const imageFeature = features[0];
    const autoPostFeature = features[1];
    const analyticsFeature = features[2];

    // Seed credit packages
    const starterPack = await tx.creditPackage.create({
      data: {
        name: 'Starter Pack',
        credits: 50,
        price: 5,
        description: 'Perfect for beginners',
      },
    });

    const basicPack = await tx.creditPackage.create({
      data: {
        name: 'Basic Pack',
        credits: 120,
        price: 10,
        description: 'Best for casual users',
      },
    });

    const proPack = await tx.creditPackage.create({
      data: {
        name: 'Pro Pack',
        credits: 300,
        price: 20,
        description: 'Great for creators and marketers',
      },
    });

    // Connect packages to features
    await tx.packageFeature.createMany({
      data: [
        // Starter
        {
          packageId: starterPack.id,
          featureId: analyticsFeature.id,
        },

        // Basic
        {
          packageId: basicPack.id,
          featureId: analyticsFeature.id,
        },
        {
          packageId: basicPack.id,
          featureId: autoPostFeature.id,
        },

        // Pro
        {
          packageId: proPack.id,
          featureId: analyticsFeature.id,
        },
        {
          packageId: proPack.id,
          featureId: autoPostFeature.id,
        },
        {
          packageId: proPack.id,
          featureId: imageFeature.id,
        },
      ],
    });
  });

  console.log('Database seeded successfully');
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
