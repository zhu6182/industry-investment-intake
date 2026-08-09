import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVisitDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  intakeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number = 20;
}
