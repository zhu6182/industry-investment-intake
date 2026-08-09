import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewIntakeDto {
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @IsOptional()
  reason?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignToUserId?: number;
}
