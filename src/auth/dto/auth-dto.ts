import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email_address: string;

    @IsString()
    @IsNotEmpty()
    password: string
}
