"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

interface CategoryEditDialogProps {
    category: Category | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CategoryEditDialog({ category, open, onOpenChange }: CategoryEditDialogProps) {
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
            console.log("Updating category:", { category_id: category?.category_id, category_name: categoryName })

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
                        Update category information. Only PICs can edit their assigned categories.
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

                            {category.pic && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Current PIC</h4>
                                    <p className="text-sm text-gray-700">
                                        {category.pic.user.first_name} {category.pic.user.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500">{category.pic.user.email_address}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Note: Only the assigned PIC can edit this category. To change the PIC, use the "Assign PIC" action.
                                    </p>
                                </div>
                            )}
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
