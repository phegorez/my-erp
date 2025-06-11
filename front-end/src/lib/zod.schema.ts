import { z } from "zod"

export const UserFormSchema = z.object({
    first_name: z.string().min(1, { message: "First Name is required." }),
    last_name: z.string().min(1, { message: "Last Name is required." }),
    email_address: z.string().email({ message: "Invalid email address." }).min(1, { message: "Email is required." }),
    id_card: z.string().regex(/^\d{13}$/, { message: "ID Card must be 13 digits." }),
    phone_number: z.string().regex(/^\d{10}$/, { message: "Phone Number must be 10 digits." }),
    date_of_birth: z.date({
        required_error: "Date of Birth is required.",
        invalid_type_error: "Invalid Date of Birth format.",
    }),
    gender: z.string({
        required_error: "Gender is required.",
        invalid_type_error: "Invalid Gender selected.",
    }),
    department_name: z.string().min(1, { message: "Department is required." }),
    job_title_name: z.string().min(1, { message: "Job Title is required." }),
    grade: z.string({
        required_error: "Grade is required.",
        invalid_type_error: "Invalid Grade selected.",
    }),
})