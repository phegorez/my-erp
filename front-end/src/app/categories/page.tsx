"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { fetchAllCategories, deleteCategory as apiDeleteCategory } from "@/services/api";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Define an interface for the category data
interface Category {
  id: string;
  name: string;
  pic_user_id: string | null; // User ID of the Person In Charge
  pic_user?: { // Optional: If PIC details (like name) are nested in the response
    first_name: string;
    last_name: string;
    email: string;
  };
  // Add other fields as necessary
}

export default function CategoriesPage() {
  const router = useRouter();
  const { hasRole, isLoading: isAuthLoading } = useAuth(); // Get hasRole and auth loading state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For categories data
  const [error, setError] = useState<string | null>(null);

  const categoryManagementRoles = ['admin', 'super_admin'];
  const canManageCategories = hasRole(categoryManagementRoles);

  const loadCategories = async () => {
    setIsLoading(true); // For categories data
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const data = await fetchAllCategories();
      // Ensure data is an array, FastAPI might return {categories: []} or just []
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setError(err.message || "Could not load categories.");
      if (err.status === 401 || err.status === 403) {
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) { // Wait for auth check
        loadCategories();
    }
  }, [router, isAuthLoading]);

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This might affect existing items.")) {
      return;
    }
    try {
      await apiDeleteCategory(categoryId);
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
      alert("Category deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      setError(err.message || "Could not delete category.");
      alert(`Error deleting category: ${err.message || "Unknown error"}`);
    }
  };

  const handleOpenAssignPic = (category: Category) => {
    // setSelectedCategoryForPic(category);
    // setShowAssignPicModal(true);
    // For now, let's assume it navigates to a page or opens a modal (to be built in step 4)
    router.push(`/categories/assign-pic/${category.id}`);
    alert(`Assign PIC for category: ${category.name} (ID: ${category.id}) - Modal/Page to be implemented.`);
  };

  if (isLoading || isAuthLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading categories...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Button onClick={loadCategories}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
        {canManageCategories && (
          <Link href="/categories/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create New Category
            </Button>
          </Link>
        )}
      </div>

      {categories.length === 0 && !isLoading ? (
         <div className="text-center text-gray-500 py-10">
            <p className="text-xl">No categories found.</p>
            <p>Get started by creating a new category.</p>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of all item categories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Assigned PIC</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  {category.pic_user ? `${category.pic_user.first_name} ${category.pic_user.last_name} (${category.pic_user.email})` : category.pic_user_id || "N/A"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {canManageCategories ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleOpenAssignPic(category)}>
                        Assign PIC
                      </Button>
                      <Link href={`/categories/edit/${category.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                     <span className="text-xs text-gray-500">No actions</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {/* Modal for Assign PIC will go here or be a separate page */}
    </div>
  );
}
