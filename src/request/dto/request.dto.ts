import { IsNotEmpty, IsString, IsArray, ArrayMinSize, IsDateString, IsOptional, ValidateNested, IsEnum, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus } from '@prisma/client'; // Import enum from Prisma

export class RequestedItemDto {
    @IsNotEmpty()
    @IsString() // Assuming item_id is type String (e.g. nanoid)
    item_id: string;

    // Quantity might be added later if multiple units of the same item can be borrowed.
    // For now, assume 1 item_id = 1 unit.
    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateRequestDto {
    // @IsNotEmpty() // Remove user_id from here
    // @IsString()
    // user_id: string; 

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => RequestedItemDto)
    requested_items: RequestedItemDto[];

    @IsNotEmpty()
    @IsString()
    user_manager_id: string; // The manager who will approve the request

    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string; // Optional comment for the request

    @IsNotEmpty()
    @IsDateString()
    start_date: string; // Or Date type, depending on how you handle date inputs

    @IsNotEmpty()
    @IsDateString()
    end_date: string; // Or Date type

    // Status will be set by the system, not by client on creation.
}

export class UpdateRequestDto {
    @IsOptional()
    @IsEnum(RequestStatus)
    status?: RequestStatus;

    // Other fields that might be updatable, e.g., extending end_date
    @IsOptional()
    @IsDateString()
    end_date?: string;
}

export class ProcessApprovalDto {
    @IsNotEmpty()
    @IsEnum(['Success', 'Reject', 'Revise', 'Canceled', 'Approved', 'Waiting_Manager_Approval', 'Waiting_PIC_Approval'], { message: 'required status' }) // Only allow these two for this action
    status: 'Success' | 'Reject' | 'Revise' | 'Canceled' | 'Approved' | 'Waiting_Manager_Approval' | 'Waiting_PIC_Approval';

    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string;
}
