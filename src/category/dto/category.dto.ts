import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    category_name: string;
}

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    category_name?: string;
}