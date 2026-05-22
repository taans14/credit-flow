import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { CreditsService } from './credits.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../generated/prisma/browser';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('credits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post('purchase/:packageId')
  @Roles(UserRole.USER)
  purchasePackage(@Req() req, @Param('packageId') packageId: string) {
    return this.creditsService.purchasePackage(req.user.id, packageId);
  }

  @Get('me')
  @Roles(UserRole.USER)
  getMyCredits(@Req() req) {
    return this.creditsService.getMyCredits(req.user.id);
  }

  @Get('history')
  @Roles(UserRole.USER)
  getPurchaseHistory(@Req() req) {
    return this.creditsService.getPurchaseHistory(req.user.id);
  }
}
