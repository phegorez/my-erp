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

interface User {
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

interface Department {
    department_id: string
    department_name: string
}

interface UserEditDialogProps {
    user: User | null
    departments: Department[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserEditDialog({ user, departments, open, onOpenChange }: UserEditDialogProps) {
    const [basicInfo, setBasicInfo] = useState({
        first_name: "",
        last_name: "",
        email_address: "",
    })

    const [employeeInfo, setEmployeeInfo] = useState({
        department_name: "",
        job_title_name: "",
        grade: "",
    })

    const [personalInfo, setPersonalInfo] = useState({
        id_card: "",
        phone_number: "",
        date_of_birth: "",
        gender: "",
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setBasicInfo({
                first_name: user.user.first_name,
                last_name: user.user.last_name,
                email_address: user.user.email_address,
            })
            setEmployeeInfo({
                department_name: user.department.department_name,
                job_title_name: user.job_title.job_title_name,
                grade: user.grade || "",
            })
            // Mock personal info - in real app, fetch from API
            setPersonalInfo({
                id_card: "1234567890123",
                phone_number: "+1 (555) 123-4567",
                date_of_birth: "1990-05-15",
                gender: "Male",
            })
        }
    }, [user])

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Implement API call to update basic info
            console.log("Updating basic info:", basicInfo)
            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
            console.error("Error updating basic info:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEmployeeInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Implement API call to update employee info
            console.log("Updating employee info:", employeeInfo)
            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
            console.error("Error updating employee info:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Implement API call to update personal info
            console.log("Updating personal info:", personalInfo)
            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
            console.error("Error updating personal info:", error)
        } finally {
            setLoading(false)
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
                                <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                value={basicInfo.first_name}
                                                onChange={(e) => setBasicInfo((prev) => ({ ...prev, first_name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                value={basicInfo.last_name}
                                                onChange={(e) => setBasicInfo((prev) => ({ ...prev, last_name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email_address">Email Address</Label>
                                        <Input
                                            id="email_address"
                                            type="email"
                                            value={basicInfo.email_address}
                                            onChange={(e) => setBasicInfo((prev) => ({ ...prev, email_address: e.target.value }))}
                                            required
                                        />
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
                                <form onSubmit={handleEmployeeInfoSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="department_name">Department</Label>
                                            <Select
                                                value={employeeInfo.department_name}
                                                onValueChange={(value) => setEmployeeInfo((prev) => ({ ...prev, department_name: value }))}
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
                                                value={employeeInfo.job_title_name}
                                                onChange={(e) => setEmployeeInfo((prev) => ({ ...prev, job_title_name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="grade">Grade</Label>
                                        <Select
                                            value={employeeInfo.grade}
                                            onValueChange={(value) => setEmployeeInfo((prev) => ({ ...prev, grade: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Junior">Junior</SelectItem>
                                                <SelectItem value="Mid">Mid</SelectItem>
                                                <SelectItem value="Senior">Senior</SelectItem>
                                                <SelectItem value="Lead">Lead</SelectItem>
                                                <SelectItem value="Manager">Manager</SelectItem>
                                                <SelectItem value="Director">Director</SelectItem>
                                            </SelectContent>
                                        </Select>
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
