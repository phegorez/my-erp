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