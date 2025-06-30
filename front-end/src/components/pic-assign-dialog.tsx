"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Category {
    category_id: string
    category_name: string
    pic?: {
        user_id: string
        user: {
            first_name: string
            last_name: string
            email_address: string
        }
    }
}

interface PicAssignDialogProps {
    category: Category | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PicAssignDialog({ category, open, onOpenChange }: PicAssignDialogProps) {
    const [selectedUserId, setSelectedUserId] = useState("")
    const [loading, setLoading] = useState(false)

    // Mock users that can be assigned as PICs
    const availableUsers = [
        { user_id: "user1", name: "John Smith", email: "john.smith@company.com" },
        { user_id: "user2", name: "Sarah Johnson", email: "sarah.johnson@company.com" },
        { user_id: "user3", name: "Mike Davis", email: "mike.davis@company.com" },
        { user_id: "user4", name: "Emily Brown", email: "emily.brown@company.com" },
        { user_id: "user5", name: "David Wilson", email: "david.wilson@company.com" },
    ]

    useEffect(() => {
        if (category?.pic) {
            setSelectedUserId(category.pic.user_id)
        } else {
            setSelectedUserId("")
        }
    }, [category])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Implement API call to assign PIC
            console.log("Assigning PIC:", {
                category_id: category?.category_id,
                assigned_pic: selectedUserId,
            })

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            onOpenChange(false)
        } catch (error) {
            console.error("Error assigning PIC:", error)
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

    const selectedUser = availableUsers.find((user) => user.user_id === selectedUserId)

    if (!category) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Person In Charge (PIC)</DialogTitle>
                    <DialogDescription>
                        Assign or change the Person In Charge for the category "{category.category_name}".
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current PIC */}
                    {category.pic && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Current PIC</CardTitle>
                                <CardDescription>Currently assigned Person In Charge</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarFallback>
                                            {getInitials(`${category.pic.user.first_name} ${category.pic.user.last_name}`)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {category.pic.user.first_name} {category.pic.user.last_name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{category.pic.user.email_address}</div>
                                    </div>
                                    <Badge variant="secondary">Current PIC</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* New PIC Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assign New PIC</CardTitle>
                            <CardDescription>Select a user to assign as the new Person In Charge</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="assigned_pic">Select User</Label>
                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user to assign as PIC" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.user_id} value={user.user_id}>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{user.email}</div>
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
                                            <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-blue-900">{selectedUser.name}</div>
                                            <div className="text-sm text-blue-700">{selectedUser.email}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                    <li>• The selected user will automatically receive the "PIC" role</li>
                                    <li>• They will gain permissions to manage items in this category</li>
                                    <li>• Previous PIC permissions for this category will be updated</li>
                                    <li>• The user will be notified of their new responsibilities</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !selectedUserId}>
                            {loading ? "Assigning..." : "Assign PIC"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
