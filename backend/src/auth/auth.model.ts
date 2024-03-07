import { IsInt, IsString, IsNumberString, MinLength, MaxLength, IsAlphanumeric, IsStrongPassword, IsEmail } from 'class-validator';

export class LoginDTO {
    @IsString()
    @MinLength(2)
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(12)
    password: string;
}

export class SignUpDTO {
    @IsString()
    @MinLength(2)
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(12)
    password: string;

    @IsString()
    @IsEmail()
    email: string;
}