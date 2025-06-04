import { IsDateString, IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'

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
    @Length(13)
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

    @IsString()
    grade: string
}

export class UpdateUserDto {

    @IsString()
    @IsOptional()
    first_name: string;

    @IsString()
    @IsOptional()
    last_name: string;

    @IsOptional()
    @IsEnum(['admin', 'user'])
    role_name: 'admin' | 'user';
}

export class EditPersonalDto {

    @IsString()
    @Length(12)
    @IsOptional()
    id_card: string;


    @IsString()
    @IsOptional()
    phone_number: string;

    @IsDateString()
    @IsOptional()
    date_of_birth: Date;

    @IsString()
    @IsOptional()
    gender: string;
}