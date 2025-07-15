export interface Personal {
    personal_id: string;
    user_id: string;
    id_card: string;
    phone_number: string;
    date_of_birth: string;
    gender: 'male' | 'female';
}

export interface AddNewUser {
    first_name: string;
    last_name: string;
    email_address: string;
    id_card: string;
    phone_number: string;
    date_of_birth: Date;
    gender: string;
    department_name: string;
    job_title_name: string;
    grade: string;
}

export interface User {
    user_id: string;
    grade: string;
    user: UserData;
    department: Department;
    job_title: JobTitle;
}

export interface UserData {
    first_name: string;
    last_name: string;
    email_address: string;
    Personal: Personal;
    userMetaData: UserMetaData[];
    UserRole: UserRole[]
}

export interface UserMetaData {
    start_date: Date;
    status: string;
}

export interface Department {
    department_id: string;
    department_name: string;
}

export interface JobTitle {
    job_title_id: string;
    job_title_name: string;
}

export interface Employee {
    employee_id: string;
    user_id: string;
    department_id: string;
    job_title_id: string;
    grade: string;
    department: Department;
    job_title: JobTitle;
}

export interface Role {
    role_id: string;
    role_name: string;
}

export interface UserRole {
    role: Role;
}

export interface AuthUser {
    first_name: string;
    last_name: string;
    email_address: string;
    created_at: string;
    updated_at: string;
    Personal: Personal;
    Employee: Employee;
    UserRole: UserRole[];
}

enum UserRoleName {
    Admin = 'admin',
    User = 'user'
}

export interface EditedUserData {
    first_name?: string;
    last_name?: string;

    // enum {admin, user}
    role_name?: UserRoleName;

    department_name?: string;
    job_title_name?: string;
    grade?: string;
}

export interface formUserEdit {
    user_id: string
    user: {
        first_name: string
        last_name: string
        email_address: string
    }
    department: {
        department_name: string
    }
    job_title: {
        job_title_name: string
    }
    grade?: string
}


// category & pic
export interface Category {
    category_id: string
    category_name: string
    item_type: ItemType
    created_at: string
    updated_at: string
    pic?: {
        user_id: string
        user: {
            first_name: string
            last_name: string
            email_address: string
        }
        assigned_by_user_id: string
    }
    _count?: {
        items: number
    }
}

export interface Pic {
    user_id: string
    user: {
        first_name: string
        last_name: string
        email_address: string
    }
    assigned_by_user_id: string
    categories: {
        category_id: string
        category_name: string
    }[]
}

export interface AddNewCategory {
    category_name: string;
    item_type: ItemType;
    assigned_pic: string;
}

// item

export enum ItemType {
    It_Assets = 'It_Assets',
    Non_It_Assets = 'Non_It_Assets'
}

export interface Item {
    item_id: string
    item_name: string
    description?: string
    category_id: string
    item_type: string
    serial_number?: string
    imei?: string
    created_at: string
    updated_at: string
    is_available: boolean
}

export interface newItem {
    item_name: string
    description?: string
    is_available: boolean
    serial_number?: string
    imei?: string
    category_id: string
}

export interface MyCategory {
    category_id: string
    category_name: string
    created_at: string
    updated_at: string
    _count: {
        items: number
    }
    items: Item[]
}

export interface CategoryWithItems {
    category_id: string
    category_name: string
    items: Item[]
    _count: {
        items: number
    }
}

export interface EditedItem {
    item_name?: string
    description?: string
    category_id?: string
    item_type?: ItemType
    serial_number?: string
    imei?: string
    is_available?: boolean
}