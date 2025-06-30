"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Mail, Building } from "lucide-react"

interface Pic {
    user_id: string
    user: {
        first_name: string
        last_name: string
        email_address: string
    }
    assigned_by_user_id: string
    categories: {
        category_id: string
        category_name: string
    }[]
}

interface PicManagementDialogProps {
    pics: Pic[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PicManagementDialog({ pics, open, onOpenChange }: PicManagementDialogProps) {
    const handleRemovePic = async (picId: string) => {
        if (confirm("Are you sure you want to remove this PIC? This will unassign them from all categories.")) {
            // Implement API call to remove PIC
            console.log("Removing PIC:", picId)
        }
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>PIC Management</DialogTitle>
                    <DialogDescription>Manage all Persons In Charge (PICs) and their category assignments</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total PICs</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pics.length}</div>
                                <p className="text-xs text-muted-foreground">Active PICs</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {pics.reduce((total, pic) => total + pic.categories.length, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Managed categories</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Categories/PIC</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {pics.length > 0
                                        ? Math.round(pics.reduce((total, pic) => total + pic.categories.length, 0) / pics.length)
                                        : 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Average workload</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PICs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All PICs</CardTitle>
                            <CardDescription>List of all Persons In Charge and their category assignments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PIC Details</TableHead>
                                        <TableHead>Assigned Categories</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pics.map((pic) => (
                                        <TableRow key={pic.user_id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarFallback>{getInitials(pic.user.first_name, pic.user.last_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {pic.user.first_name} {pic.user.last_name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">ID: {pic.user_id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {pic.categories.map((category) => (
                                                        <Badge key={category.category_id} variant="outline" className="text-xs">
                                                            {category.category_name}
                                                        </Badge>
                                                    ))}
                                                    {pic.categories.length === 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            No categories assigned
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{pic.user.email_address}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemovePic(pic.user_id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Detailed PIC Cards */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Detailed PIC Information</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {pics.map((pic) => (
                                <Card key={pic.user_id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarFallback>{getInitials(pic.user.first_name, pic.user.last_name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {pic.user.first_name} {pic.user.last_name}
                                                    </CardTitle>
                                                    <CardDescription>{pic.user.email_address}</CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant="default">PIC</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Assigned Categories</h4>
                                                {pic.categories.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {pic.categories.map((category) => (
                                                            <Badge key={category.category_id} variant="outline">
                                                                {category.category_name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No categories assigned</p>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Workload</h4>
                                                <p className="text-sm">
                                                    Managing {pic.categories.length} categor{pic.categories.length === 1 ? "y" : "ies"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
