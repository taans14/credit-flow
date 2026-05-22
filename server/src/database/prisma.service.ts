import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * WHY: The `PrismaPg` adapter is configured here with a connection string
   * from the `ConfigService` so the database connection is constructed once
   * and injected across the app. Placing lifecycle hooks on the service
   * (`onModuleInit` / `onModuleDestroy`) ensures we explicitly connect and
   * disconnect in Nest's lifecycle rather than relying on implicit side
   * effects, making startup/shutdown behavior predictable for tests and
   * deployments.
   */
  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL');

    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected');
  }
}
