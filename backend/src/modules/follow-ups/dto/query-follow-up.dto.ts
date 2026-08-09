import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFollowUpDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  intakeId?: number;

  @IsOptional()
  @IsEnum(['phone', 'wechat', 'email', 'onsite', 'other'])
  method?: string;

  @IsOptional()
  @IsEnum(['interested', 'negotiating', 'pending_decision', 'not_interested', 'undecided'])
  result?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number = 20;
}
