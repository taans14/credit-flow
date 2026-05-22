import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../database/prisma.service';

import { FEATURE_KEY } from '../decorators/require-feature.decorator';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * WHY: This guard enforces per-user feature unlocks (a lightweight feature
   * flag system stored in the database). We check metadata via the reflector
   * so controllers remain declarative (`@RequireFeature('X')`) and the guard
   * performs the minimal check against `userFeature` to decide access.
   *
   * Rationale: keeping feature checks in a guard centralizes access control
   * and avoids sprinkling permission checks inside business logic.
   */

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const userFeature = await this.prisma.userFeature.findFirst({
      where: {
        userId: user.id,

        feature: {
          code: requiredFeature,
        },
      },
    });

    if (!userFeature) {
      throw new ForbiddenException(
        `Feature "${requiredFeature}" is not unlocked`,
      );
    }

    return true;
  }
}
