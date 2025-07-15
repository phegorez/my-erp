"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Eye, Package, CheckCircle, XCircle, Plus, Settings } from "lucide-react"
import { MyCategoryEditDialog } from "@/components/my-category-edit-dialog"
import { CategoryItemsDialog } from "@/components/category-items-dialog"
import { AddItemToCategoryDialog } from "@/components/add-item-to-category-dialog"
import { useCategory } from "@/stores/categoryStore"
import { useAuth } from "@/contexts/AuthContext"
import { MyCategory } from "@/types"

export default function MyCategoriesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<MyCategory | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false)
    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const { getMyCategory, myCategories } = useCategory()
    const { user } = useAuth()

    useEffect(() => {
        const fetchCategories = async () => {
            await getMyCategory()
            setLoading(false)
        }
        fetchCategories()
    }, [])

    const filteredCategories = myCategories.filter((category) => {
        const matchesSearch = searchQuery === "" || category.category_name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    const handleEditCategory = (category: MyCategory) => {
        setSelectedCategory(category)
        setIsEditDialogOpen(true)
    }

    const handleViewItems = (category: MyCategory) => {
        setSelectedCategory(category)
        setIsItemsDialogOpen(true)
    }

    const handleAddItem = (category: MyCategory) => {
        setSelectedCategory(category)
        setIsAddItemDialogOpen(true)
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    const totalItems = myCategories.reduce((total, category) => total + category._count.items, 0)
    const availableItems = myCategories.reduce(
        (total, category) => total + category.items.filter((item) => item.is_available).length,
        0,
    )

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
                    <h1 className="text-3xl font-bold tracking-tight">My Categories</h1>
                    <p className="text-muted-foreground">Manage your assigned categories and items</p>
                </div>
                {user && (
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">
                                {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                <Badge variant="default" className="text-xs">
                                    PIC
                                </Badge>
                                <span>{user.email_address}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Categories</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myCategories.length}</div>
                        <p className="text-xs text-muted-foreground">Categories under your management</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">Items across all categories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Items</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{availableItems}</div>
                        <p className="text-xs text-muted-foreground">Ready for assignment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Use</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{totalItems - availableItems}</div>
                        <p className="text-xs text-muted-foreground">Currently assigned</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search your categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Categories ({filteredCategories.length})</CardTitle>
                    <CardDescription>Categories you are responsible for managing</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Items Count</TableHead>
                                <TableHead>Available Items</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => {
                                const availableCount = category.items.filter((item) => item.is_available).length
                                const inUseCount = category.items.length - availableCount

                                return (
                                    <TableRow key={category.category_id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Settings className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{category.category_name}</div>
                                                    <div className="text-sm text-muted-foreground">ID: {category.category_id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{category._count.items} items</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    {availableCount} available
                                                </Badge>
                                                {inUseCount > 0 && (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                                                        {inUseCount} in use
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(category.updated_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleViewItems(category)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleAddItem(category)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Category Cards View */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Category Overview</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map((category) => {
                        const availableCount = category.items.filter((item) => item.is_available).length
                        const inUseCount = category.items.length - availableCount

                        return (
                            <Card key={category.category_id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{category.category_name}</CardTitle>
                                        <Badge variant="outline">{category._count.items} items</Badge>
                                    </div>
                                    <CardDescription>Last updated: {new Date(category.updated_at).toLocaleDateString()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600">Available: {availableCount}</span>
                                            <span className="text-red-600">In Use: {inUseCount}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{
                                                    width: `${category.items.length > 0 ? (availableCount / category.items.length) * 100 : 0}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleViewItems(category)} className="flex-1">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Items
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleAddItem(category)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Dialogs */}
            <MyCategoryEditDialog category={selectedCategory} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

            <CategoryItemsDialog
                categoryId={selectedCategory?.category_id || null}
                open={isItemsDialogOpen}
                onOpenChange={setIsItemsDialogOpen}
            />

            <AddItemToCategoryDialog
                category={selectedCategory}
                open={isAddItemDialogOpen}
                onOpenChange={setIsAddItemDialogOpen}
            />
        </div>
    )

}