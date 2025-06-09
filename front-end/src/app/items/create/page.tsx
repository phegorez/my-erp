"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Added
import { Checkbox } from "@/components/ui/checkbox"; // Added
import { createItem } from "@/services/api";
import { withAuth } from '@/hoc/withAuth'; // Import the HOC
import { useAuth } from '@/contexts/AuthContext'; // To potentially get user info if needed inside component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card

// Interface for the form data
interface CreateItemData {
  name: string;
  description: string;
  category_id: string; // Assuming this will be an ID string. Could be number.
  serial_number: string;
  imei: string;
  item_type_id: string; // Assuming this will be an ID string.
  is_available: boolean; // Added for completeness, though not in initial spec
}

function CreateItemPageInternal() { // Renamed original component
  const router = useRouter();
  const { user } = useAuth(); // Example: if you need user details for some reason

  const [formData, setFormData] = useState<CreateItemData>({
    name: "",
    description: "",
    category_id: "",
    serial_number: "",
    imei: "",
    item_type_id: "",
    is_available: true, // Default to available
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        // Ensure 'checked' property exists for Checkbox (though HTMLInputElement covers it)
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Specific handler for Shadcn Checkbox as its onCheckedChange returns boolean directly
  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') { // Ignore 'indeterminate' state for this simple case
        setFormData((prev) => ({ ...prev, is_available: checked }));
    }
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name || !formData.category_id || !formData.item_type_id) {
      setError("Name, Category ID, and Item Type ID are required.");
      setIsLoading(false);
      return;
    }

    try {
      await createItem(formData);
      // alert("Item created successfully!"); // Optional: use a toast notification library
      router.push("/items?itemCreated=true"); // Redirect to items list
    } catch (err: any) {
      console.error("Failed to create item:", err);
      setError(err.message || "An unexpected error occurred while creating the item.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Create New Item</CardTitle>
          <CardDescription className="text-center">Fill in the details of the new item below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5"> {/* Reduced space-y from space-y-6 */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4"> {/* Further reduced space-y for form elements */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required value={formData.description} onChange={handleChange} disabled={isLoading} placeholder="Detailed description of the item..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category ID</Label>
                <Input id="category_id" name="category_id" type="text" required value={formData.category_id} onChange={handleChange} disabled={isLoading} placeholder="e.g., CAT-LAPTOP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item_type_id">Item Type ID</Label>
                <Input id="item_type_id" name="item_type_id" type="text" required value={formData.item_type_id} onChange={handleChange} disabled={isLoading} placeholder="e.g., TYPE-STANDARD" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input id="serial_number" name="serial_number" type="text" value={formData.serial_number} onChange={handleChange} disabled={isLoading} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI</Label>
                <Input id="imei" name="imei" type="text" value={formData.imei} onChange={handleChange} disabled={isLoading} placeholder="Optional, for mobile devices" />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2"> {/* Added pt-2 for slight separation */}
                <Checkbox
                    id="is_available"
                    name="is_available"
                    checked={formData.is_available}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isLoading}
                />
                <Label htmlFor="is_available" className="text-sm">
                    Item is currently available?
                </Label>
            </div>
            <CardFooter className="flex justify-end space-x-3 pt-6 px-0"> {/* Use CardFooter for actions */}
              <Link href="/items" passHref>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}> {/* Removed isPicsLoading as it's not on this form */}
                {isLoading ? "Saving..." : "Save Item"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap the page component with withAuth HOC
const CreateItemPage = withAuth(CreateItemPageInternal, ['admin', 'super_admin', 'pic']);
export default CreateItemPage;
