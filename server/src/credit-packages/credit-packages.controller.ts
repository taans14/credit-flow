import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreditPackagesService } from './credit-packages.service';

import { CreateCreditPackageDto } from './dto/create-credit-package.dto';
import { UpdateCreditPackageDto } from './dto/update-credit-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../generated/prisma/browser';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('credit-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreditPackagesController {
  constructor(private readonly creditPackagesService: CreditPackagesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCreditPackageDto) {
    return this.creditPackagesService.create(dto);
  }

  @Get()
  findAll() {
    return this.creditPackagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditPackagesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCreditPackageDto) {
    return this.creditPackagesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.creditPackagesService.remove(id);
  }
}
