import {} from 'class-validator'

export class ItemDto {
    item_name: string
    description: string
    category_id: string
    serial_number: string
    imei: string
}
