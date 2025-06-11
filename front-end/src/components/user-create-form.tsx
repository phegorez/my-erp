"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserStore } from "@/stores/userStore"
import { UserFormSchema } from "@/lib/zod.schema"

interface Department {
    department_id: string
    department_name: string
}

interface UserCreateFormProps {
    departments: Department[]
    onSuccess: () => void
}


type UserFormValue = z.infer<typeof UserFormSchema>

export function UserCreateForm({ departments, onSuccess }: UserCreateFormProps) {
    const { addNewUser, fetchAllUsers } = useUserStore()
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserFormValue>({
        resolver: zodResolver(UserFormSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email_address: "",
            id_card: "",
            phone_number: "",
            date_of_birth: undefined as Date | undefined,
            gender: "",
            department_name: "",
            job_title_name: "",
            grade: "",
        }
    })

    const formData = watch()

    const [loading, setLoading] = useState(false)

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setValue("date_of_birth", date, { shouldValidate: true });
        }
    };

    const handleGenderChange = (value: string) => {
        setValue("gender", value, { shouldValidate: true });
    };

    const handleDepartmentChange = (value: string) => {
        setValue("department_name", value, { shouldValidate: true });
    };

    const handleGradeChange = (value: string) => {
        setValue("grade", value, { shouldValidate: true });
    };

    const onSubmit = async (data: UserFormValue) => {
        try {
            // send data to the store
            setLoading(true)
            const handleAdd = await addNewUser(data)
            if(handleAdd) {
                // fetch all users to update the list
                await fetchAllUsers()
                setLoading(false)
                onSuccess()
            }
        } catch (error) {
            console.error("Error creating user:", error)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Basic personal details of the user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                {...register("first_name")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                {...register("last_name")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email_address">Email Address</Label>
                        <Input
                            id="email_address"
                            type="email"
                            {...register("email_address")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="id_card">ID Card Number</Label>
                            <Input
                                id="id_card"
                                {...register("id_card")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                value={formData.phone_number}
                                {...register("phone_number")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.date_of_birth && "text-muted-foreground",
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.date_of_birth ? format(formData.date_of_birth, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.date_of_birth}
                                        onSelect={handleDateChange}
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={formData.gender} onValueChange={handleGenderChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employee Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                    <CardDescription>Work-related details and position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department_name">Department</Label>
                            <Select
                                value={formData.department_name}
                                onValueChange={handleDepartmentChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.department_id} value={dept.department_name}>
                                            {dept.department_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="job_title_name">Job Title</Label>
                            <Input
                                id="job_title_name"
                                placeholder="e.g., Software Engineer"
                                {...register("job_title_name")}
                            />
                            {errors.job_title_name && (
                                <p className="text-red-500 text-sm">{errors.job_title_name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Select value={formData.grade} onValueChange={handleGradeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="7">7</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onSuccess}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create User"}
                </Button>
            </div>
        </form>
    )
}
