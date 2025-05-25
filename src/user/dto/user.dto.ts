import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UserDto {

    // use with model User
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsNotEmpty()
    @IsString()
    last_name: string;

    @IsNotEmpty()
    @IsEmail()
    email_address: string;

    // use with model Personal
    @IsNotEmpty()
    @IsString()
    id_card: string;

    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @IsDateString()
    date_of_birth: Date;

    @IsString()
    gender: string;

    // use with model Department
    @IsString()
    department_name: string;

    // use with model JobTitle
    @IsString()
    job_title_name: string
}