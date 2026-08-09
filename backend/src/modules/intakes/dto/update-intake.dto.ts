import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';

export type IntakeStatus =
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'assigned'
  | 'following'
  | 'landed'
  | 'lost';

export class UpdateIntakeDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  creditCode?: string;

  @IsOptional()
  @IsString()
  legalPerson?: string;

  @IsOptional()
  @IsDateString()
  establishDate?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  shareholders?: string;

  @IsOptional()
  @IsNumber()
  applicationRegionId?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsEnum(['pending', 'rejected', 'approved', 'assigned', 'following', 'landed', 'lost'])
  status?: IntakeStatus;

  @IsOptional()
  @IsString()
  rejectReason?: string;

  @IsOptional()
  @IsNumber()
  assignedToId?: number;
}
