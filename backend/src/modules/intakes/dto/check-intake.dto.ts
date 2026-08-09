import { IsString } from 'class-validator';

export class CheckIntakeDto {
  @IsString()
  companyName: string;
}
