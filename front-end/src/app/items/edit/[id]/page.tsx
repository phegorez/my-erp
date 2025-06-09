"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation"; // useParams to get [id]
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchItemById, updateItem } from "@/services/api";
import { withAuth } from '@/hoc/withAuth'; // Import the HOC
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card
// import { useAuth } from '@/contexts/AuthContext'; // Optional: if user info needed directly

// Interface for the item data (can be shared or more specific if needed)
interface ItemData {
  name: string;
  description: string;
  category_id: string;
  serial_number: string | null; // Nullable if optional
  imei: string | null;        // Nullable if optional
  item_type_id: string;
  is_available: boolean;
}

function EditItemPageInternal() { // Renamed original component
  const router = useRouter();
  const params = useParams();
  // const { user } = useAuth(); // Optional: if needed
  const itemId = params.id as string; // Get item ID from route

  const [formData, setFormData] = useState<ItemData>({
    name: "",
    description: "",
    category_id: "",
    serial_number: "",
    imei: "",
    item_type_id: "",
    is_available: true,
  });
  const [isLoading, setIsLoading] = useState(true); // For initial data load
  const [isSaving, setIsSaving] = useState(false);  // For form submission
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
        setError("Item ID is missing.");
        setIsLoading(false);
        return;
    }
    const loadItemData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const item = await fetchItemById(itemId);
        setFormData({
          name: item.name || "",
          description: item.description || "",
          category_id: item.category_id || "", // Ensure these fields exist on `item`
          serial_number: item.serial_number || "",
          imei: item.imei || "",
          item_type_id: item.item_type_id || "",
          is_available: item.is_available === undefined ? true : item.is_available,
        });
      } catch (err: any) {
        console.error("Failed to fetch item data:", err);
        setError(err.message || "Could not load item data for editing.");
        if (err.status === 401 || err.status === 403) {
            router.push('/auth/login');
        } else if (err.status === 404) {
            setError("Item not found."); // Specific error for 404
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadItemData();
  }, [itemId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
        setFormData((prev) => ({ ...prev, is_available: checked }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!formData.name || !formData.category_id || !formData.item_type_id) {
      setError("Name, Category ID, and Item Type ID are required.");
      setIsSaving(false);
      return;
    }

    try {
      await updateItem(itemId, formData);
      // alert("Item updated successfully!"); // Optional
      router.push("/items?itemUpdated=true");
    } catch (err: any) {
      console.error("Failed to update item:", err);
      setError(err.message || "An unexpected error occurred while saving the item.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading item details...</p></div>;
  }

  if (error && !formData.name) { // If error and form data is not loaded, show critical error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Link href="/items">
          <Button variant="outline">Back to Items List</Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Edit Item</CardTitle>
          <CardDescription className="text-center">Update the details of the item below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && ( /* General error display, e.g., if item not found initially */
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
              {error}
            </div>
          )}
          {/* Only render form if item ID is valid and not in critical error state for data loading */}
          {itemId && !(!formData.name && error) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && formData.name && ( /* Error during submission */
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} disabled={isSaving} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required value={formData.description} onChange={handleChange} disabled={isSaving} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category ID</Label>
                  <Input id="category_id" name="category_id" type="text" required value={formData.category_id} onChange={handleChange} disabled={isSaving} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item_type_id">Item Type ID</Label>
                  <Input id="item_type_id" name="item_type_id" type="text" required value={formData.item_type_id} onChange={handleChange} disabled={isSaving} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input id="serial_number" name="serial_number" type="text" value={formData.serial_number || ""} onChange={handleChange} disabled={isSaving} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imei">IMEI</Label>
                  <Input id="imei" name="imei" type="text" value={formData.imei || ""} onChange={handleChange} disabled={isSaving} />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                      id="is_available"
                      name="is_available"
                      checked={formData.is_available}
                      onCheckedChange={handleCheckboxChange}
                      disabled={isSaving}
                  />
                  <Label htmlFor="is_available" className="text-sm">
                      Item is currently available?
                  </Label>
              </div>
              <CardFooter className="flex justify-end space-x-3 pt-6 px-0">
                <Link href="/items" passHref>
                  <Button type="button" variant="outline" disabled={isSaving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap the page component with withAuth HOC
const EditItemPage = withAuth(EditItemPageInternal, ['admin', 'super_admin', 'pic']);
export default EditItemPage;
