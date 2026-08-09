import { IsString, IsPhoneNumber, MinLength, IsOptional, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsPhoneNumber('CN')
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
