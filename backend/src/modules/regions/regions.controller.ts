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
import { RegionsService } from './regions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/regions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @Roles('admin', 'middleware_ops')
  findAll() {
    return this.regionsService.findAll();
  }

  @Get('tree')
  @Roles('admin', 'middleware_ops')
  findTree() {
    return this.regionsService.findTree();
  }

  @Get('level')
  @Roles('admin', 'middleware_ops')
  findByLevel(@Query('level') level: string) {
    return this.regionsService.findByLevel(Number(level));
  }

  @Get(':id')
  @Roles('admin', 'middleware_ops')
  findOne(@Param('id') id: string) {
    return this.regionsService.findOne(Number(id));
  }

  @Get(':id/children')
  @Roles('admin', 'middleware_ops')
  findChildren(@Param('id') id: string) {
    return this.regionsService.findChildren(Number(id));
  }

  @Post()
  @Roles('admin', 'middleware_ops')
  create(@Body() dto: any) {
    return this.regionsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'middleware_ops')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.regionsService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('admin', 'middleware_ops')
  remove(@Param('id') id: string) {
    return this.regionsService.remove(Number(id));
  }
}
