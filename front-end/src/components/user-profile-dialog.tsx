"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Briefcase, Building } from "lucide-react"
import { User } from "@/types"
import { useEffect } from "react"


interface UserProfileDialogProps {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({ user, open, onOpenChange }: UserProfileDialogProps) {
    if (!user) return null

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>Detailed information about the user</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg">
                                {getInitials(user.user.first_name, user.user.last_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl font-semibold">
                                {user.user.first_name} {user.user.last_name}
                            </h3>
                            <p className="text-muted-foreground">{user.job_title.job_title_name}</p>
                            <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">{user.department.department_name}</Badge>
                                {user.grade && <Badge variant="secondary">{user.grade}</Badge>}
                                <Badge variant="default">Active</Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building className="h-5 w-5" />
                                <span>Contact Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{user.user.email_address}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{user.user.Personal.phone_number}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employee Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Briefcase className="h-5 w-5" />
                                <span>Employee Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                                    <p>{user.user_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                                    <p>{user.department.department_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                                    <p>{user.job_title.job_title_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Grade</p>
                                    <p>{user.grade || "Not specified"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                    <p>{new Date(user.user.userMetaData[0].start_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant="default">{user.user.userMetaData[0].status}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building className="h-5 w-5" />
                                <span>Roles & Permissions</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {user.user.UserRole.map((item) => (
                                    <Badge key={item.role.role_id} variant="outline">
                                        {item.role.role_name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
