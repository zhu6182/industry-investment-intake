import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';

export class CreateVisitDto {
  @IsNumber()
  intakeId: number;

  @IsDateString()
  visitDate: string;

  @IsString()
  visitLocation: string;

  @IsString()
  visitContent: string;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsNumber()
  applicationRegionId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;
}
