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
import { fetchAllItems, deleteItem as apiDeleteItem } from "@/services/api"; // Renamed to avoid conflict
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

// Define an interface for the item data (adjust based on your actual API response)
interface Item {
  id: string;
  name: string;
  description: string;
  category_id: string; // Assuming category is represented by an ID, could be an object
  serial_number: string | null;
  imei: string | null;
  item_type_id: string; // Assuming item_type is an ID, could be an object
  is_available: boolean;
  // Add other fields like category_name, item_type_name if your API provides them directly
  // or if you plan to fetch and join them. For now, sticking to basic structure.
  category?: { name: string }; // Optional: if category details are nested
  item_type?: { name: string }; // Optional: if item type details are nested
}

export default function ItemsPage() {
  const router = useRouter();
  const { user, hasRole, isLoading: isAuthLoading } = useAuth(); // Get user, hasRole, and auth loading state
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For items data loading
  const [error, setError] = useState<string | null>(null);

  // Define roles that can manage items
  const itemManagementRoles = ['admin', 'super_admin', 'pic'];
  const canManageItems = hasRole(itemManagementRoles);

  const loadItems = async () => {
    setIsLoading(true); // For items data loading
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const data = await fetchAllItems();
      setItems(data.items || data); // Adjust based on API response structure (e.g., if items are nested under a key)
    } catch (err: any) {
      console.error("Failed to fetch items:", err);
      setError(err.message || "Could not load items.");
      if (err.status === 401 || err.status === 403) {
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth check to complete before loading items if user is not yet available
    if (!isAuthLoading) {
        loadItems();
    }
  }, [router, isAuthLoading]); // Depend on auth loading state

  const handleDeleteItem = async (itemId: string) => {
    // Basic confirmation for now. A modal would be better.
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }
    try {
      await apiDeleteItem(itemId);
      // Refresh the list after deletion
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      alert("Item deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete item:", err);
      setError(err.message || "Could not delete item.");
      alert(`Error deleting item: ${err.message || "Unknown error"}`);
    }
  };

  if (isLoading || isAuthLoading) { // Check both item loading and auth loading
    return <div className="flex items-center justify-center min-h-screen"><p>Loading items...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Button onClick={loadItems}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Item Management</h1>
        {canManageItems && (
          <Link href="/items/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create New Item
            </Button>
          </Link>
        )}
      </div>

      {items.length === 0 && !isLoading ? (
        <div className="text-center text-gray-500 py-10">
            <p className="text-xl">No items found.</p>
            <p>Get started by creating a new item.</p>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of all items in the inventory.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead> {/* Will show ID for now, or name if available */}
              <TableHead>Serial No.</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Item Type</TableHead> {/* Will show ID for now, or name if available */}
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.category?.name || item.category_id}</TableCell>
                <TableCell>{item.serial_number || "N/A"}</TableCell>
                <TableCell>{item.imei || "N/A"}</TableCell>
                <TableCell>{item.item_type?.name || item.item_type_id}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.is_available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {item.is_available ? "Available" : "Unavailable"}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {canManageItems ? (
                    <>
                      <Link href={`/items/edit/${item.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
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
    </div>
  );
}
