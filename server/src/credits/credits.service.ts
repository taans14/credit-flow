import { Injectable, NotFoundException } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * WHY: `purchasePackage` performs multiple related changes (order, payment,
   * wallet, transactions, feature unlocks) and must be atomic. Wrapping the
   * flow in a DB transaction guarantees consistency: either all side effects
   *   succeed or none do, avoiding partial purchases that could charge
   *   without awarding credits.
   */
  async purchasePackage(userId: string, packageId: string) {
    return this.prisma.$transaction(async (tx) => {
      const creditPackage = await tx.creditPackage.findUnique({
        where: {
          id: packageId,
        },

        include: {
          features: {
            include: {
              feature: true,
            },
          },
        },
      });

      if (!creditPackage) {
        throw new NotFoundException('Package not found');
      }

      const order = await tx.order.create({
        data: {
          userId,
          packageId,
          totalPrice: creditPackage.price,
          status: 'PAID',
        },
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: creditPackage.price,
          status: 'SUCCESS',
          paymentProvider: 'FAKE_PAYMENT',
          transactionId: randomUUID(),
          paidAt: new Date(),
        },
      });

      const existingWallet = await tx.userWallet.findUnique({
        where: {
          userId,
        },
      });

      if (!existingWallet) {
        await tx.userWallet.create({
          data: {
            userId,
            balance: creditPackage.credits,
          },
        });
      } else {
        await tx.userWallet.update({
          where: {
            userId,
          },

          data: {
            balance: {
              increment: creditPackage.credits,
            },
          },
        });
      }

      await tx.creditTransaction.create({
        data: {
          userId,
          orderId: order.id,
          amount: creditPackage.credits,
          type: 'PURCHASE',
          description: `Purchased ${creditPackage.name}`,
        },
      });

      if (creditPackage.features.length > 0) {
        await tx.userFeature.createMany({
          data: creditPackage.features.map((packageFeature) => ({
            userId,
            featureId: packageFeature.featureId,
          })),

          skipDuplicates: true,
        });
      }

      const updatedWallet = await tx.userWallet.findUnique({
        where: {
          userId,
        },
      });

      return {
        success: true,
        message: 'Package purchased successfully',

        data: {
          package: creditPackage.name,

          creditsAdded: creditPackage.credits,

          currentBalance: updatedWallet?.balance ?? 0,

          unlockedFeatures: creditPackage.features.map(
            (packageFeature) => packageFeature.feature.code,
          ),
        },
      };
    });
  }

  async getMyCredits(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        wallet: true,

        userFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    return {
      balance: user?.wallet?.balance ?? 0,

      features:
        user?.userFeatures.map((userFeature) => userFeature.feature.code) ?? [],
    };
  }

  async getPurchaseHistory(userId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },

      include: {
        creditPackage: true,
        payment: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
