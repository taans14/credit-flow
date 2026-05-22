import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../generated/prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  /**
   * Centralizes authentication concerns (validation, registration, tokens).
   * - Keeps credential checks and token generation together so callers get
   *   an authenticated user and tokens from a single place.
   * - Separates concerns: the `UsersService` owns persistence; `AuthService`
   *   owns auth rules and secrets (loaded from config) so rotation/testing
   *   is easier.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);

    if (exists) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
    });

    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // WHY: We issue short-lived access tokens and longer-lived refresh tokens
    // to reduce blast radius if an access token is leaked while still allowing
    // seamless re-authentication via refresh tokens.
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_EXPIRATION_TIME',
      ) as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      // WHY: Refresh tokens are signed with a separate secret so they can be
      // rotated independently from access tokens (helps with key rotation
      // strategies and reducing scope when secrets are compromised).
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRATION_TIME',
      ) as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user: User) {
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
