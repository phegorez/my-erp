import { IsNotEmpty, IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    category_name: string;

    @IsNotEmpty()
    @IsEnum(['It_Assets', 'Non_It_Assets'], { message: 'item_type must be either It_Assets or Non_It_Assets' })
    item_type: 'It_Assets' | 'Non_It_Assets';
    

    @IsNotEmpty()
    @IsString()
    assigned_pic: string;
}

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    category_name?: string;
}