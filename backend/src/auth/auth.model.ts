import { IsInt, IsString, IsNumberString, MinLength, MaxLength, IsAlphanumeric, IsStrongPassword, IsEmail, IsAlpha, Matches } from 'class-validator';

export class LoginDTO {
    @IsString()
    @MinLength(2)
    @Matches(/^[a-zA-Z]+[a-zA-Z0-9]*$/)
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password: string;
}

export class SignUpDTO {
    @IsString()
    @MinLength(2)
    @Matches(/^[a-zA-Z]+[a-zA-Z0-9]*$/, {
        message:'Username must start with letters and cannot contain spaces or special characters'
    })
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    @IsStrongPassword()
    password: string;

    @IsString()
    @IsEmail()
    email: string;
}