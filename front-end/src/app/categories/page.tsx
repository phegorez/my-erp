"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Users, UserCheck, Building } from "lucide-react"
import { CategoryCreateForm } from "@/components/category-create-form"
import { CategoryEditDialog } from "@/components/category-edit-dialog"
import { PicAssignDialog } from "@/components/pic-assign-dialog"
import { PicManagementDialog } from "@/components/pic-management-dialog"
import { useCategory } from "@/stores/categoryStore"
import { Category, Pic } from "@/types"
import { text } from "stream/consumers"


export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPicAssignDialogOpen, setIsPicAssignDialogOpen] = useState(false)
  const [isPicManagementDialogOpen, setIsPicManagementDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const { fetchAllCategories, categories, fetchAllPics, pics, deleteCategory } = useCategory()

  useEffect(() => {
    fetchAllCategories()
    fetchAllPics()

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      searchQuery === "" ||
      category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.pic?.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.pic?.user.last_name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsEditDialogOpen(true)
  }

  const handleAssignPic = (category: Category) => {
    setSelectedCategory(category)
    setIsPicAssignDialogOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      // Implement delete API call
      const messageDelete = await deleteCategory(categoryId)
      // Optionally, you can refetch categories after deletion
      await fetchAllCategories()
      alert(messageDelete)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">Manage categories and assign PICs (Person In Charge)</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsPicManagementDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            See All PICs
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>Add a new category and assign a Person In Charge (PIC).</DialogDescription>
              </DialogHeader>
              <CategoryCreateForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PICs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pics.length}</div>
            <p className="text-xs text-muted-foreground">Assigned PICs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((total, category) => total + (category._count?.items || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Items across categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Items/Category</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0
                ? Math.round(
                  categories.reduce((total, category) => total + (category._count?.items || 0), 0) /
                  categories.length,
                )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Average distribution</p>
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
              placeholder="Search categories or PICs..."
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
          <CardTitle>Categories ({filteredCategories.length})</CardTitle>
          <CardDescription>A list of all categories and their assigned PICs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Person In Charge (PIC)</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.category_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{category.category_name}</div>
                        <div className="text-sm text-muted-foreground">ID: {category.category_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.pic ? (
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(category.pic.user.first_name, category.pic.user.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {category.pic.user.first_name} {category.pic.user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{category.pic.user.email_address}</div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">No PIC Assigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category._count?.items || 0} items</Badge>
                  </TableCell>
                  <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleAssignPic(category)}>
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.category_id)}>
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

      {/* Dialogs */}
      <CategoryEditDialog category={selectedCategory} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <PicAssignDialog
        category={selectedCategory}
        open={isPicAssignDialogOpen}
        onOpenChange={setIsPicAssignDialogOpen}
      />

      <PicManagementDialog pics={pics} open={isPicManagementDialogOpen} onOpenChange={setIsPicManagementDialogOpen} />
    </div>
  )
}
