"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Hash } from "lucide-react"
import { useItem } from "@/stores/itemStore"

interface ItemToEdit {
    item_id: string
    item_name: string
    description: string
    serial_number?: string
    imei?: string
    is_available: boolean
    created_at: string
    updated_at: string
    category: {
        category_id: string
        category_name: string
    }
}

interface EditItemDialogProps {
    item: ItemToEdit | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditItemDialog({ item, open, onOpenChange, onSuccess }: EditItemDialogProps) {

    const { editItem } = useItem()

    const [basicInfo, setBasicInfo] = useState({
        item_name: "",
        description: "",
    })

    const [technicalInfo, setTechnicalInfo] = useState({
        serial_number: "",
        imei: "",
    })

    const [availabilityInfo, setAvailabilityInfo] = useState({
        is_available: true,
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (item) {
            setBasicInfo({
                item_name: item.item_name,
                description: item.description
            })
            setTechnicalInfo({
                serial_number: item.serial_number || "",
                imei: item.imei || "",
            })
            setAvailabilityInfo({
                is_available: item.is_available,
            })
        }
    }, [item])

    if (!item) return null

    const assembleEditData = {...basicInfo, ...technicalInfo, ...availabilityInfo}

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (item) {
                const success = await editItem(item.item_id, assembleEditData)
                if (success) {
                    onOpenChange(false)
                    onSuccess?.()
                }
            }
        } catch (error) {
            console.error("Error updating basic info:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTechnicalInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Implement API call to update technical info
            if (item) {
                const success = await editItem(item.item_id, assembleEditData)
                if (success) {
                    onOpenChange(false)
                    onSuccess?.()
                }
            }
            onSuccess?.()
        } catch (error) {
            console.error("Error updating technical info:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAvailabilitySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Implement API call to update availability
            if (item) {
                const success = await editItem(item.item_id, assembleEditData)
                if (success) {
                    onOpenChange(false)
                    onSuccess?.()
                }
            }
            onSuccess?.()
        } catch (error) {
            console.error("Error updating availability:", error)
        } finally {
            setLoading(false)
        }
    }



    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // is loading
    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Loading...</DialogTitle>
                        <DialogDescription>Please wait while we load the item details.</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                    <DialogDescription>Update item information and settings</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Item Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center space-x-2">
                                        <Package className="h-5 w-5" />
                                        <span>{item.item_name}</span>
                                    </CardTitle>
                                    <CardDescription className="mt-2">{item.description}</CardDescription>
                                    <div className="flex items-center space-x-2 mt-3">
                                        <Badge variant="outline">{item.category.category_name}</Badge>
                                        <Badge variant={item.is_available ? "default" : "destructive"}>
                                            {item.is_available ? "Available" : "In Use"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Item ID</p>
                                    <p className="font-mono">{item.item_id}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Category</p>
                                    <p>{item.category.category_name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p>{formatDate(item.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last Updated</p>
                                    <p>{formatDate(item.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Tabs */}
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="technical">Technical</TabsTrigger>
                            <TabsTrigger value="availability">Availability</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Update basic item details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="item_name">Item Name</Label>
                                            <Input
                                                id="item_name"
                                                value={basicInfo.item_name}
                                                onChange={(e) => setBasicInfo((prev) => ({ ...prev, item_name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={basicInfo.description}
                                                onChange={(e) => setBasicInfo((prev) => ({ ...prev, description: e.target.value }))}
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? "Updating..." : "Update"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="technical" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Hash className="h-5 w-5" />
                                        <span>Technical Information</span>
                                    </CardTitle>
                                    <CardDescription>Update serial numbers and identification details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleTechnicalInfoSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="serial_number">Serial Number</Label>
                                            <Input
                                                id="serial_number"
                                                value={technicalInfo.serial_number}
                                                onChange={(e) => setTechnicalInfo((prev) => ({ ...prev, serial_number: e.target.value }))}
                                                placeholder="e.g., MBP2024001"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Unique serial number for tracking and identification
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="imei">IMEI (for mobile devices)</Label>
                                            <Input
                                                id="imei"
                                                value={technicalInfo.imei}
                                                onChange={(e) => setTechnicalInfo((prev) => ({ ...prev, imei: e.target.value }))}
                                                placeholder="e.g., 123456789012345"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                International Mobile Equipment Identity for mobile devices
                                            </p>
                                        </div>

                                        {/* Current Technical Info Display */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">Current Technical Details</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Serial Number</p>
                                                    <p className="font-mono">{item.serial_number || "Not set"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">IMEI</p>
                                                    <p className="font-mono">{item.imei || "Not set"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={loading}>
                                            {loading ? "Updating..." : "Update"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="availability" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Availability Status</CardTitle>
                                    <CardDescription>Update item availability for assignment</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_available"
                                                checked={availabilityInfo.is_available}
                                                onCheckedChange={(checked) =>
                                                    setAvailabilityInfo((prev) => ({ ...prev, is_available: checked }))
                                                }
                                            />
                                            <Label htmlFor="is_available">Item is available for assignment</Label>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-blue-900 mb-2">Status Information</h4>
                                            <p className="text-sm text-blue-800">
                                                {availabilityInfo.is_available
                                                    ? "This item is marked as available and ready for assignment to users."
                                                    : "This item is marked as unavailable (currently in use or under maintenance)."}
                                            </p>
                                        </div>

                                        {/* Current Status Display */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={item.is_available ? "default" : "destructive"}>
                                                    {item.is_available ? "Available" : "In Use"}
                                                </Badge>
                                                <span className="text-sm text-gray-600">
                                                    {item.is_available ? "Ready for assignment" : "Currently assigned or unavailable"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                                            <ul className="text-sm text-yellow-800 space-y-1">
                                                <li>• Changing availability status will affect item assignment capabilities</li>
                                                <li>• Items marked as "In Use" cannot be assigned to other users</li>
                                                <li>• Available items can be requested and assigned through the system</li>
                                                <li>• Status changes are logged for audit purposes</li>
                                            </ul>
                                        </div>

                                        <Button type="submit" disabled={loading}>
                                            {loading ? "Updating..." : "Update"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}
