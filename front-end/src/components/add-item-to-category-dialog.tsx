"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useItem } from "@/stores/itemStore"
import { useCategory } from "@/stores/categoryStore"

interface Category {
    category_id: string
    category_name: string
}

interface AddItemToCategoryDialogProps {
    category: Category | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddItemToCategoryDialog({ category, open, onOpenChange }: AddItemToCategoryDialogProps) {
    const [formData, setFormData] = useState({
        item_name: "",
        description: "",
        serial_number: "",
        imei: "",
        is_available: true,
    })
    const [loading, setLoading] = useState(false)

    const { addNewItem } = useItem()
    const { getMyCategory } = useCategory()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!category) {
            console.error("No category selected")
            setLoading(false)
            return
        }

        try {
            const newItem = {
                ...formData,
                category_id: category?.category_id ?? "",
            }
            const response = await addNewItem(newItem)
            if (response) {
                alert("Item created successfully!")
            }
            // Reset form
            setFormData({
                item_name: "",
                description: "",
                serial_number: "",
                imei: "",
                is_available: true,
            })
            await getMyCategory() // Refresh categories after adding item
            onOpenChange(false)
        } catch (error) {
            console.error("Error creating item:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (!category) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Add Item to {category.category_name}</DialogTitle>
                    <DialogDescription>Create a new item in your category</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="flex gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Essential details about the item</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="item_name">Item Name</Label>
                                    <Input
                                        id="item_name"
                                        value={formData.item_name}
                                        onChange={(e) => handleInputChange("item_name", e.target.value)}
                                        placeholder="e.g., MacBook Pro 16-inch"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        placeholder="Detailed description of the item"
                                        rows={3}
                                        required
                                    />
                                </div>
                            </CardContent>

                            {/* Technical Details */}
                            <CardHeader>
                                <CardTitle>Technical Details</CardTitle>
                                <CardDescription>Serial numbers and identification details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="serial_number">Serial Number</Label>
                                        <Input
                                            id="serial_number"
                                            value={formData.serial_number}
                                            onChange={(e) => handleInputChange("serial_number", e.target.value)}
                                            placeholder="e.g., MBP2024001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="imei">IMEI (for mobile devices)</Label>
                                        <Input
                                            id="imei"
                                            value={formData.imei}
                                            onChange={(e) => handleInputChange("imei", e.target.value)}
                                            placeholder="e.g., 123456789012345"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>



                        <Card>
                            {/* Availability */}
                            <CardHeader>
                                <CardTitle>Availability</CardTitle>
                                <CardDescription>Set the initial availability status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_available"
                                        checked={formData.is_available}
                                        onCheckedChange={(checked) => handleInputChange("is_available", checked)}
                                    />
                                    <Label htmlFor="is_available">Item is available for assignment</Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {formData.is_available
                                        ? "This item will be marked as available and ready for assignment."
                                        : "This item will be marked as unavailable (already in use or under maintenance)."}
                                </p>
                            </CardContent>

                            {/* Category Info */}
                            <CardHeader>
                                <CardTitle>Category Assignment</CardTitle>
                                <CardDescription>This item will be added to your category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Target Category</h4>
                                    <p className="text-blue-800">
                                        <strong>{category.category_name}</strong> (ID: {category.category_id})
                                    </p>
                                    <p className="text-sm text-blue-700 mt-2">
                                        As the PIC of this category, you have full authority to add and manage items within it.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Item"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
