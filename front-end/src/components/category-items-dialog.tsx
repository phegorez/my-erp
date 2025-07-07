"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Package, Edit, Trash2 } from "lucide-react"

interface CategoryItem {
    item_id: string
    item_name: string
    item_type: string
    is_available: boolean
    serial_number?: string
    imei?: string
}

interface CategoryWithItems {
    category_id: string
    category_name: string
    items: CategoryItem[]
    _count: {
        items: number
    }
}

interface CategoryItemsDialogProps {
    category: CategoryWithItems | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CategoryItemsDialog({ category, open, onOpenChange }: CategoryItemsDialogProps) {
    if (!category) return null

    const availableItems = category.items.filter((item) => item.is_available)
    const inUseItems = category.items.filter((item) => !item.is_available)

    const handleEditItem = (itemId: string) => {
        console.log("Edit item:", itemId)
        // Implement edit item functionality
    }

    const handleDeleteItem = (itemId: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            console.log("Delete item:", itemId)
            // Implement delete item functionality
        }
    }

    const handleToggleAvailability = (itemId: string) => {
        console.log("Toggle availability for item:", itemId)
        // Implement toggle availability functionality
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Items in {category.category_name}</DialogTitle>
                    <DialogDescription>Manage all items within this category</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{category.items.length}</div>
                                <p className="text-xs text-muted-foreground">Items in category</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Available</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{availableItems.length}</div>
                                <p className="text-xs text-muted-foreground">Ready for assignment</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">In Use</CardTitle>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{inUseItems.length}</div>
                                <p className="text-xs text-muted-foreground">Currently assigned</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Items</CardTitle>
                            <CardDescription>Complete list of items in this category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Identifiers</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {category.items.map((item) => (
                                        <TableRow key={item.item_id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-medium">{item.item_name}</div>
                                                    <div className="text-sm text-muted-foreground">ID: {item.item_id}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.item_type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {item.serial_number && <div>SN: {item.serial_number}</div>}
                                                    {item.imei && <div>IMEI: {item.imei}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={item.is_available ? "default" : "destructive"}
                                                    className="cursor-pointer"
                                                    onClick={() => handleToggleAvailability(item.item_id)}
                                                >
                                                    {item.is_available ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Available
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            In Use
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditItem(item.item_id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.item_id)}>
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

                    {/* Available vs In Use Breakdown */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-green-700">Available Items ({availableItems.length})</CardTitle>
                                <CardDescription>Items ready for assignment</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {availableItems.length > 0 ? (
                                        availableItems.map((item) => (
                                            <div key={item.item_id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                                                <div>
                                                    <div className="font-medium text-green-900">{item.item_name}</div>
                                                    <div className="text-sm text-green-700">{item.item_type}</div>
                                                </div>
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    Available
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No available items</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-red-700">Items In Use ({inUseItems.length})</CardTitle>
                                <CardDescription>Items currently assigned</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {inUseItems.length > 0 ? (
                                        inUseItems.map((item) => (
                                            <div key={item.item_id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                                                <div>
                                                    <div className="font-medium text-red-900">{item.item_name}</div>
                                                    <div className="text-sm text-red-700">{item.item_type}</div>
                                                </div>
                                                <Badge variant="destructive" className="bg-red-100 text-red-800">
                                                    In Use
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No items in use</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
