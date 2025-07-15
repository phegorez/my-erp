import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength, IsUUID, IsEnum } from 'class-validator';

export class CreateItemDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    item_name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString() // Assuming category_id is a string like nanoid
    // If you have a specific format like UUID for category_id, you can use @IsUUID()
    // For now, simple string validation.
    category_id: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    serial_number?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    imei?: string;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean; // Will default to true in schema/service
}

export class UpdateItemDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    item_name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    serial_number?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    imei?: string;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean;
}