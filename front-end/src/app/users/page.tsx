"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Filter, Eye, Edit, Trash2, Users } from "lucide-react"
import { UserCreateForm } from "@/components/user-create-form"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import { UserEditDialog } from "@/components/user-edit-dialog"
import { useUserStore } from "@/stores/userStore"
import { User } from "@/types"

export default function UsersPage() {

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const { fetchAllUsers, getDepartments, deleteUser, departments, users } = useUserStore();

    useEffect(() => {

        fetchAllUsers()
        getDepartments()

        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }, [])

    const filteredUsers = users.filter((user: User) => {
        const matchesSearch =
            searchQuery === "" ||
            user.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.user.email_address.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDepartment = selectedDepartment === "all" || user.department.department_name === selectedDepartment

        return matchesSearch && matchesDepartment
    })

    const handleViewProfile = (user: User) => {
        setSelectedUser(user)
        setIsProfileDialogOpen(true)
    }

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setIsEditDialogOpen(true)
    }

    const handleDeleteUser = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            deleteUser(userId)
            alert("User deleted successfully.")
        }
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage users, departments, and employee information</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Add a new user to the system with their personal and employee information.
                            </DialogDescription>
                        </DialogHeader>
                        <UserCreateForm departments={departments} onSuccess={() => setIsCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">Active employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{departments.length}</div>
                        <p className="text-xs text-muted-foreground">Active departments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engineering</CardTitle>
                        <Badge variant="secondary">Dept</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u: User) => u.department.department_name === "Engineering").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Engineers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Managers</CardTitle>
                        <Badge variant="outline">Role</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter((u: User) => u.grade === "7").length}</div>
                        <p className="text-xs text-muted-foreground">Management level</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.department_id} value={dept.department_name}>
                                        {dept.department_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                    <CardDescription>A list of all users in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user: User) => (
                                <TableRow key={user.user_id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarFallback>{getInitials(user.user.first_name, user.user.last_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">
                                                    {user.user.first_name} {user.user.last_name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{user.user.email_address}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.department.department_name}</Badge>
                                    </TableCell>
                                    <TableCell>{user.job_title.job_title_name}</TableCell>
                                    <TableCell>{user.grade && <Badge variant="secondary">{user.grade}</Badge>}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewProfile(user)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.user_id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <UserProfileDialog user={selectedUser} open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />

            <UserEditDialog
                user={selectedUser}
                departments={departments}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </div>
    )
}
