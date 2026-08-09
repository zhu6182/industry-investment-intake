import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('roleId') roleId?: string,
    @Query('regionId') regionId?: string,
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      keyword,
      roleId: roleId ? Number(roleId) : undefined,
      regionId: regionId ? Number(regionId) : undefined,
    });
  }

  @Get('investment-staff')
  @Roles('admin', 'middleware_ops', 'investment_manager')
  findInvestmentStaff() {
    return this.usersService.findInvestmentStaff();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: any) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(Number(id));
  }

  @Patch(':id/reset-password')
  @Roles('admin')
  resetPassword(@Param('id') id: string, @Body() body: { password?: string }) {
    const pwd = body?.password || '123456';
    return this.usersService.resetPassword(Number(id), pwd);
  }

  @Post(':id/roles')
  @Roles('admin')
  assignRoles(@Param('id') id: string, @Body() body: { roleIds: number[] }) {
    return this.usersService.assignRoles(Number(id), body.roleIds);
  }
}
