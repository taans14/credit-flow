import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CreditPackagesModule } from './credit-packages/credit-packages.module';
import { CreditsModule } from './credits/credits.module';
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    CreditPackagesModule,
    CreditsModule,
    FeaturesModule,
  ],
})
export class AppModule {}
