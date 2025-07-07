"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MyCategory {
    category_id: string
    category_name: string
    created_at: string
    updated_at: string
}

interface MyCategoryEditDialogProps {
    category: MyCategory | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function MyCategoryEditDialog({ category, open, onOpenChange }: MyCategoryEditDialogProps) {
    const [categoryName, setCategoryName] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (category) {
            setCategoryName(category.category_name)
        }
    }, [category])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Implement API call to update category
            console.log("Updating my category:", { category_id: category?.category_id, category_name: categoryName })

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            onOpenChange(false)
        } catch (error) {
            console.error("Error updating category:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!category) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Update your category information. Only you can edit this category as the assigned PIC.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>
                            <CardDescription>Update the category name and information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_name">Category Name</Label>
                                <Input
                                    id="category_name"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Category Information</h4>
                                <div className="text-sm text-blue-800 space-y-1">
                                    <p>Category ID: {category.category_id}</p>
                                    <p>Created: {new Date(category.created_at).toLocaleDateString()}</p>
                                    <p>Last Updated: {new Date(category.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Your PIC Responsibilities</h4>
                                <ul className="text-sm text-green-800 space-y-1">
                                    <li>• Manage all items within this category</li>
                                    <li>• Update category information</li>
                                    <li>• Monitor item availability and assignments</li>
                                    <li>• Approve item requests and returns</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !categoryName.trim()}>
                            {loading ? "Updating..." : "Update Category"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
