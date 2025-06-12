"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import z from "zod"
import { BasicInfoSchema, EmployeeInfoSchema } from "@/lib/zod.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Alert, AlertDescription } from "./ui/alert"
import { Department, formUserEdit } from "@/types"
import { useUserStore } from "@/stores/userStore"

interface UserEditDialogProps {
    user: formUserEdit | null
    departments: Department[]
    open: boolean
    onOpenChange: (open: boolean) => void
}
type BasicInfoFormValue = z.infer<typeof BasicInfoSchema>
type EmployeeInfoFormValue = z.infer<typeof EmployeeInfoSchema>

export function UserEditDialog({ user, departments, open, onOpenChange }: UserEditDialogProps) {
    const [loading, setLoading] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const { editeUser } = useUserStore()


    // Form สำหรับ Basic Info
    const basicForm = useForm<BasicInfoFormValue>({
        resolver: zodResolver(BasicInfoSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
        }
    })

    // Form สำหรับ Employee Info
    const employeeForm = useForm<EmployeeInfoFormValue>({
        resolver: zodResolver(EmployeeInfoSchema),
        defaultValues: {
            department_name: "",
            job_title_name: "",
            grade: "",
        }
    })

    useEffect(() => {
        if (user) {
            // Set ค่าให้ basic form
            basicForm.reset({
                first_name: user.user.first_name,
                last_name: user.user.last_name,
            })

            // Set ค่าให้ employee form
            employeeForm.reset({
                department_name: user.department.department_name,
                job_title_name: user.job_title.job_title_name,
                grade: user.grade || "",
            })

            setValidationErrors([])
        }
    }, [user, basicForm, employeeForm])

    // useEffect เพื่อ validate แบบ real-time
    useEffect(() => {
        const subscription = basicForm.watch((value, { name, type }) => {
            if (type === 'change') {
                // Validate เมื่อมีการเปลี่ยนแปลงค่า
                const result = BasicInfoSchema.safeParse(value)
                if (!result.success) {
                    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
                    setValidationErrors(errors)
                } else {
                    setValidationErrors([])
                }
            }
        })
        return () => subscription.unsubscribe()
    }, [basicForm])

    useEffect(() => {
        const subscription = employeeForm.watch((value, { name, type }) => {
            if (type === 'change') {
                // Validate เมื่อมีการเปลี่ยนแปลงค่า
                const result = EmployeeInfoSchema.safeParse(value)
                if (!result.success) {
                    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
                    setValidationErrors(errors)
                } else {
                    setValidationErrors([])
                }
            }
        })
        return () => subscription.unsubscribe()
    }, [employeeForm])

    // Handle submit สำหรับ Basic Info
    const handleBasicInfoSubmit = async (data: BasicInfoFormValue) => {
        if (user?.user_id) {
            setLoading(true)
            try {
                // Validate ด้วย Zod ก่อน submit
                const validatedData = BasicInfoSchema.parse(data)

                // Update main form values
                basicForm.setValue('first_name', validatedData.first_name)
                basicForm.setValue('last_name', validatedData.last_name)

                // console.log("Updating basic info:", validatedData)

                editeUser(user.user_id, validatedData)

                // Show success message or close dialog
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
                    setValidationErrors(errors)
                } else {
                    console.error("Error updating basic info:", error)
                }
            } finally {
                setLoading(false)
            }
        }


    }

    // Handle submit สำหรับ Employee Info
    const handleEmployeeInfoSubmit = async (data: EmployeeInfoFormValue) => {
        if (user?.user_id) {
            setLoading(true)
            try {
                // Validate ด้วย Zod ก่อน submit
                const validatedData = EmployeeInfoSchema.parse(data)

                // Update main form values
                employeeForm.setValue('department_name', validatedData.department_name)
                employeeForm.setValue('job_title_name', validatedData.job_title_name)
                employeeForm.setValue('grade', validatedData.grade || "")

                // console.log("Updating employee info:", validatedData)
            
                editeUser(user.user_id, validatedData)

                // Show success message or close dialog
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
                    setValidationErrors(errors)
                } else {
                    console.error("Error updating employee info:", error)
                }
            } finally {
                setLoading(false)
            }
        }

    }

    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user information and settings</DialogDescription>
                </DialogHeader>

                {/* แสดง validation errors */}
                {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="employee">Employee</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Update basic user details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={basicForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                {...basicForm.register('first_name')}
                                                id="first_name"
                                            />
                                            {basicForm.formState.errors.first_name && (
                                                <p className="text-red-500 text-sm">{basicForm.formState.errors.first_name.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                {...basicForm.register('last_name')}
                                                id="last_name"
                                            />
                                            {basicForm.formState.errors.last_name && (
                                                <p className="text-red-500 text-sm">{basicForm.formState.errors.last_name.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Updating..." : "Update Basic Info"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="employee" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Employee Information</CardTitle>
                                <CardDescription>Update work-related details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={employeeForm.handleSubmit(handleEmployeeInfoSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="department_name">Department</Label>
                                            <Controller
                                                name="department_name"
                                                control={employeeForm.control}
                                                render={({ field }) => (
                                                    <Select value={field.value} onValueChange={field.onChange}>
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
                                                )}
                                            />
                                            {employeeForm.formState.errors.department_name && (
                                                <p className="text-red-500 text-sm">{employeeForm.formState.errors.department_name.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="job_title_name">Job Title</Label>
                                            <Input
                                                {...employeeForm.register('job_title_name')}
                                                id="job_title_name"
                                            />
                                            {employeeForm.formState.errors.job_title_name && (
                                                <p className="text-red-500 text-sm">{employeeForm.formState.errors.job_title_name.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="grade">Grade</Label>
                                        <Controller
                                            name="grade"
                                            control={employeeForm.control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
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
                                            )}
                                        />
                                        {employeeForm.formState.errors.grade && (
                                            <p className="text-red-500 text-sm">{employeeForm.formState.errors.grade.message}</p>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Updating..." : "Update Employee Info"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
