import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateFollowUpDto {
  @IsNumber()
  intakeId: number;

  @IsEnum(['phone', 'wechat', 'email', 'onsite', 'other'])
  method: string;

  @IsString()
  content: string;

  @IsDateString()
  followDate: string;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsEnum(['interested', 'negotiating', 'pending_decision', 'not_interested', 'undecided'])
  result?: string;

  @IsOptional()
  @IsString()
  nextStep?: string;
}
