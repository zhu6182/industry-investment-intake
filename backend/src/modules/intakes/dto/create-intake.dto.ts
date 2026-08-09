import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';

export class CreateIntakeDto {
  @IsString()
  companyName: string;

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
  @IsNumber()
  referrerId?: number;

  @IsOptional()
  @IsEnum(['referrer', 'inviter', 'partner'])
  referralType?: 'referrer' | 'inviter' | 'partner';
}
