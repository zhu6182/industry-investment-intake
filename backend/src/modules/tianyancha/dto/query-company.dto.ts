import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class QueryCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
