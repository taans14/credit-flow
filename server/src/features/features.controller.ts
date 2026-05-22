import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { FeatureGuard } from '../common/guards/feature.guard';

import { RequireFeature } from '../common/decorators/require-feature.decorator';

@Controller('features')
@UseGuards(JwtAuthGuard, FeatureGuard)
export class FeaturesController {
  @Post('generate-image')
  @RequireFeature('IMAGE_GENERATION')
  generateImage(@Body() body: { prompt: string }) {
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
  autoPost(
    @Body()
    body: {
      content: string;
    },
  ) {
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
  getAnalytics() {
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
