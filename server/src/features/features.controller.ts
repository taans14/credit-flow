import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { FeatureGuard } from '../common/guards/feature.guard';

import { RequireFeature } from '../common/decorators/require-feature.decorator';

import { PrismaService } from '../database/prisma.service';
import { CreditTransactionType } from '../generated/prisma/enums';

@Controller('features')
@UseGuards(JwtAuthGuard, FeatureGuard)
export class FeaturesController {
  constructor(private readonly prisma: PrismaService) {}

  private async spendCredits(userId: string, featureCode: string) {
    const feature = await this.prisma.feature.findUnique({
      where: {
        code: featureCode,
      },
    });

    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    const cost = feature.cost;

    if (cost <= 0) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userWallet.upsert({
        where: { userId },
        create: {
          userId,
          balance: 0,
        },
        update: {},
      });

      const updated = await tx.userWallet.updateMany({
        where: {
          userId,
          balance: {
            gte: cost,
          },
        },
        data: {
          balance: {
            decrement: cost,
          },
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Insufficient credits');
      }

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: cost,
          type: CreditTransactionType.USAGE,
          description: `Used feature ${feature.code}`,
        },
      });
    });
  }

  @Post('generate-image')
  @RequireFeature('IMAGE_GENERATION')
  async generateImage(@Req() req, @Body() body: { prompt: string }) {
    await this.spendCredits(req.user.id, 'IMAGE_GENERATION');

    return {
      success: true,
      message: 'Image generated successfully',

      data: {
        prompt: body.prompt,
        imageUrl: 'https://fake-image-url.com/generated-image.png',
      },
    };
  }

  @Post('auto-post')
  @RequireFeature('AUTO_POST')
  async autoPost(
    @Req() req,
    @Body()
    body: {
      content: string;
    },
  ) {
    await this.spendCredits(req.user.id, 'AUTO_POST');

    return {
      success: true,
      message: 'Post published successfully',

      data: {
        content: body.content,
      },
    };
  }

  @Get('analytics')
  @RequireFeature('ANALYTICS')
  async getAnalytics(@Req() req) {
    await this.spendCredits(req.user.id, 'ANALYTICS');

    return {
      success: true,

      data: {
        totalPosts: 124,
        totalImagesGenerated: 58,
        engagementRate: '12.5%',
        monthlyViews: 15420,
      },
    };
  }
}
