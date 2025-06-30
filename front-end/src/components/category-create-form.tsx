"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryCreateFormProps {
    onSuccess: () => void
}

export function CategoryCreateForm({ onSuccess }: CategoryCreateFormProps) {
    const [formData, setFormData] = useState({
        category_name: "",
        assigned_pic: "",
    })
    const [loading, setLoading] = useState(false)

    // Mock users that can be assigned as PICs
    const availableUsers = [
        { user_id: "user1", name: "John Smith", email: "john.smith@company.com" },
        { user_id: "user2", name: "Sarah Johnson", email: "sarah.johnson@company.com" },
        { user_id: "user3", name: "Mike Davis", email: "mike.davis@company.com" },
        { user_id: "user4", name: "Emily Brown", email: "emily.brown@company.com" },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Implement API call to create category
            console.log("Creating category:", formData)

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            onSuccess()
        } catch (error) {
            console.error("Error creating category:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const selectedUser = availableUsers.find((user) => user.user_id === formData.assigned_pic)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Category Information</CardTitle>
                    <CardDescription>Create a new category and assign a Person In Charge</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category_name">Category Name</Label>
                        <Input
                            id="category_name"
                            value={formData.category_name}
                            onChange={(e) => handleInputChange("category_name", e.target.value)}
                            placeholder="e.g., IT Equipment, Office Furniture"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assigned_pic">Assign Person In Charge (PIC)</Label>
                        <Select value={formData.assigned_pic} onValueChange={(value) => handleInputChange("assigned_pic", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user to assign as PIC" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUsers.map((user) => (
                                    <SelectItem key={user.user_id} value={user.user_id}>
                                        <div className="flex flex-col">
                                            <span>{user.name}</span>
                                            <span className="text-sm text-muted-foreground">{user.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedUser && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {selectedUser.name} ({selectedUser.email})
                            </p>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">PIC Responsibilities</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Manage items within this category</li>
                            <li>• Approve item assignments and returns</li>
                            <li>• Update category information</li>
                            <li>• Monitor item availability and condition</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onSuccess}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading || !formData.category_name || !formData.assigned_pic}>
                    {loading ? "Creating..." : "Create Category"}
                </Button>
            </div>
        </form>
    )
}
