import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email_address: string;

    @IsString()
    @IsNotEmpty()
    password: string
}

export class UpdatePasswordDto {
    @IsString()
    currentPassword!: string;

    @IsString()
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
    newPassword!: string;

    @IsString()
    confirmPassword!: string;
}

