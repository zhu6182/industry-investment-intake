import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DuplicateCheckLogsService } from './duplicate-check-logs.service';
import { QueryLogDto } from './dto/query-log.dto';

@Controller('api/duplicate-check-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DuplicateCheckLogsController {
  constructor(private readonly svc: DuplicateCheckLogsService) {}

  @Post('query')
  @Roles('admin', 'middleware_ops')
  query(@Body() params: QueryLogDto) {
    return this.svc.query(params);
  }

  @Get(':id')
  @Roles('admin', 'middleware_ops')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  @Get('stats/summary')
  @Roles('admin', 'middleware_ops')
  summary() {
    return this.svc.summary();
  }
}
