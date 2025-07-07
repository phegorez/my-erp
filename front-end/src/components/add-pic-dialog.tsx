"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserStore } from "@/stores/userStore"

interface AddPicDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function AddPicDialog({ open, onOpenChange, onSuccess }: AddPicDialogProps) {
    const [selectedUserId, setSelectedUserId] = useState("")
    const [loading, setLoading] = useState(false)

    const { fetchAllUsers, users } = useUserStore();

    useEffect(() => {
    
            fetchAllUsers()
    
            setTimeout(() => {
                setLoading(false)
            }, 1000)
        }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Implement API call to create PIC and assign categories
            console.log("Creating PIC:", {
                user_id: selectedUserId,
            })

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Reset form
            setSelectedUserId("")

            onSuccess()
        } catch (error) {
            console.error("Error creating PIC:", error)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const selectedUser = users.find((user) => user.user_id === selectedUserId)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New PIC</DialogTitle>
                    <DialogDescription>
                        Assign a user as Person In Charge (PIC) and optionally assign them to categories.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select User</CardTitle>
                            <CardDescription>Choose a user to assign as a new PIC</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user_select">Available Users</Label>
                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user to assign as PIC" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.user_id} value={user.user_id}>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs">{getInitials(user.user.first_name)} {getInitials(user.user.last_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.user.first_name} {user.user.last_name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {user.user.email_address} • {user.department.department_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedUser && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Selected User</h4>
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarFallback>{getInitials(selectedUser.user.first_name)} {getInitials(selectedUser.user.last_name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-blue-900">{selectedUser.user.first_name} {selectedUser.user.last_name}</div>
                                            <div className="text-sm text-blue-700">{selectedUser.user.email_address}</div>
                                            <div className="text-sm text-blue-600">Department: {selectedUser.department.department_name}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* PIC Responsibilities Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>PIC Responsibilities</CardTitle>
                            <CardDescription>What this user will be able to do as a PIC</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm space-y-2">
                                <li className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Manage items within assigned categories</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Create, edit, and delete items in their categories</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Update category information</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Monitor item availability and assignments</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Receive notifications about their categories</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !selectedUserId}>
                            {loading ? "Assigning PIC..." : "Assign PIC"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}