import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * WHY: This service isolates database access for users so higher-level
   * services (like `AuthService`) can focus on authentication rules and not
   * on persistence details. Keeping this boundary makes it easier to mock
   * user storage for tests and to evolve the schema independently.
   */

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }) {
    return await this.prisma.user.create({
      data,
    });
  }
}
