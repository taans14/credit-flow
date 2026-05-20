import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import type { Request as ExpressRequest, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);

    return {
      message: 'User registered successfully',
      data: user,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);

    const tokens = await this.authService.login(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
      },
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Token refreshed',
      data: {
        accessToken: tokens.accessToken,
      },
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return {
      message: 'User fetched successfully',
      data: req.user,
    };
  }
}
