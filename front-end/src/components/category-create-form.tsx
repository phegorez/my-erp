"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCategory } from "@/stores/categoryStore"
import { useUserStore } from "@/stores/userStore"
import { AddNewCategory, ItemType } from "@/types"

interface CategoryCreateFormProps {
    onSuccess: () => void
}

export function CategoryCreateForm({ onSuccess }: CategoryCreateFormProps) {
    const [formData, setFormData] = useState<AddNewCategory>({
        category_name: "",
        item_type: "" as ItemType, // Default to empty string, will be set by user
        assigned_pic: "",
    })
    const [loading, setLoading] = useState(false)

    const { fetchAllCategories, addNewCategory } = useCategory()
    const { fetchAllUsers, users } = useUserStore();

    useEffect(() => {

        fetchAllUsers()

        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true)
            console.log("Creating category:", formData)
            const handleAdd = await addNewCategory(formData)
            if (handleAdd) {
                await fetchAllCategories()
                setLoading(false)
                onSuccess()
            }

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

    const selectedUser = users.find((user) => user.user_id === formData.assigned_pic)

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
                        <Label htmlFor="item_type">Select Item Type</Label>
                        <Select value={formData.item_type} onValueChange={(value) => handleInputChange("item_type", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user to assign as PIC" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={"It_Assets"}>
                                    <span className="text-sm text-muted-foreground">It Assets</span>
                                </SelectItem>
                                <SelectItem value={"Non_It_Assets"}>
                                    <span className="text-sm text-muted-foreground">Non It_Assets</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assigned_pic">Assign Person In Charge (PIC)</Label>
                        <Select value={formData.assigned_pic} onValueChange={(value) => handleInputChange("assigned_pic", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user to assign as PIC" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.user_id} value={user.user_id}>
                                        <div className="flex flex-col">
                                            <span>{user.user.first_name} {user.user.last_name}</span>
                                            <span className="text-sm text-muted-foreground">{user.user.email_address}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedUser && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {selectedUser.user.first_name} {selectedUser.user.last_name} ({selectedUser.user.email_address})
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
