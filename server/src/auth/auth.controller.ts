import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);

    const token = await this.authService.login(user);

    return {
      message: 'Login successful',
      data: token,
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
