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

import type { Response, Request } from 'express';

@Injectable()
export class AuthService {
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

    return {
      message: 'User registered successfully',
      data: safeUser,
    };
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_EXPIRATION_TIME',
      ) as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
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

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  async login(dto: { email: string; password: string }, res: Response) {
    const user = await this.validateUser(dto.email, dto.password);

    const tokens = await this.generateTokens(user);

    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
      },
    };
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokens(user);

      this.setRefreshTokenCookie(res, tokens.refreshToken);

      return {
        message: 'Token refreshed',
        data: {
          accessToken: tokens.accessToken,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return {
      message: 'Logout successful',
    };
  }

  getMe(user: User) {
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }
}
