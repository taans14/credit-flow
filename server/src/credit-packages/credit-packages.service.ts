import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

import { CreateCreditPackageDto } from './dto/create-credit-package.dto';
import { UpdateCreditPackageDto } from './dto/update-credit-package.dto';

@Injectable()
export class CreditPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * WHY: This service validates relationships (package <-> features) up-front
   * and performs updates inside transactions so package updates are atomic.
   * Validating feature IDs prevents creating associations to non-existent
   * features which would surface as subtle bugs later in purchase flows.
   */

  async create(dto: CreateCreditPackageDto) {
    const { features = [], ...packageData } = dto;

    if (features.length > 0) {
      const existingFeatures = await this.prisma.feature.findMany({
        where: {
          id: {
            in: features,
          },
        },
      });

      if (existingFeatures.length !== features.length) {
        throw new BadRequestException('Some features do not exist');
      }
    }

    return this.prisma.creditPackage.create({
      data: {
        ...packageData,

        features: {
          create: features.map((featureId) => ({
            featureId,
          })),
        },
      },

      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.creditPackage.findMany({
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const creditPackage = await this.prisma.creditPackage.findUnique({
      where: { id },

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

    return creditPackage;
  }

  async update(id: string, dto: UpdateCreditPackageDto) {
    await this.findOne(id);

    const { features, ...packageData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (features) {
        const existingFeatures = await tx.feature.findMany({
          where: {
            id: {
              in: features,
            },
          },
        });

        if (existingFeatures.length !== features.length) {
          throw new BadRequestException('Some features do not exist');
        }

        await tx.packageFeature.deleteMany({
          where: {
            packageId: id,
          },
        });
      }

      return tx.creditPackage.update({
        where: { id },

        data: {
          ...packageData,

          ...(features && {
            features: {
              create: features.map((featureId) => ({
                featureId,
              })),
            },
          }),
        },

        include: {
          features: {
            include: {
              feature: true,
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.creditPackage.delete({
      where: { id },
    });
  }
}
