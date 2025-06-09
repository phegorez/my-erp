"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCategoryById, updateCategory, fetchAllPics } from "@/services/api"; // fetchAllPics might be needed if we allow changing PIC here
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withAuth } from '@/hoc/withAuth'; // Import HOC
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card

interface CategoryData {
  name: string;
  pic_user_id: string | null;
}

interface PicUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

function EditCategoryPageInternal() { // Renamed
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [formData, setFormData] = useState<CategoryData>({ name: "", pic_user_id: null });
  const [currentPicInfo, setCurrentPicInfo] = useState<string>("Loading PIC info...");
  const [pics, setPics] = useState<PicUser[]>([]);

  const [isLoading, setIsLoading] = useState(true); // For initial data load
  const [isSaving, setIsSaving] = useState(false);  // For form submission
  const [isPicsLoading, setIsPicsLoading] = useState(false); // To load PICs if we allow changing PIC here

  const [error, setError] = useState<string | null>(null);
  const [picsError, setPicsError] = useState<string | null>(null);


  useEffect(() => {
    if (!categoryId) {
      setError("Category ID is missing.");
      setIsLoading(false);
      return;
    }

    const loadCategoryData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) router.push('/auth/login');

        const category = await fetchCategoryById(categoryId);
        setFormData({ name: category.name, pic_user_id: category.pic_user_id || null });

        // If PIC ID exists, try to fetch PIC details to display current PIC, or load all PICs if changing PIC is allowed here
        if (category.pic_user_id) {
            // Option 1: If fetchCategoryById returns PIC details nested (e.g., category.pic_user.name)
            if (category.pic_user) {
                 setCurrentPicInfo(`${category.pic_user.first_name} ${category.pic_user.last_name} (${category.pic_user.email})`);
            } else {
            // Option 2: Fetch all PICs and find the current one (less efficient if only displaying)
            // OR have a dedicated endpoint fetchUserById(category.pic_user_id)
                setCurrentPicInfo(`ID: ${category.pic_user_id} (Full details not loaded)`);
            }
        } else {
            setCurrentPicInfo("No PIC assigned.");
        }

      } catch (err: any) {
        console.error("Failed to fetch category data:", err);
        setError(err.message || "Could not load category data.");
        if (err.status === 404) setError("Category not found.");
      } finally {
        setIsLoading(false);
      }
    };

    // Decide whether to load all PICs for a dropdown (if PIC can be changed on this page)
    // For this example, we'll assume PIC is changed via "Assign PIC" on list page,
    // so the edit page only modifies the name. If PIC change is desired here, uncomment loadPics().
    // const loadPics = async () => { ... same as create page ... };
    // loadPics();

    loadCategoryData();
  }, [categoryId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // If PIC assignment is moved to this page:
  // const handlePicChange = (value: string) => {
  //   setFormData((prev) => ({ ...prev, pic_user_id: value === "none" ? null : value }));
  // };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!formData.name.trim()) {
      setError("Category name cannot be empty.");
      setIsSaving(false);
      return;
    }

    try {
      // Only send `name` if PIC is not editable here. If PIC is editable, send `formData`.
      await updateCategory(categoryId, { name: formData.name });
      router.push("/categories?categoryUpdated=true");
    } catch (err: any) {
      console.error("Failed to update category:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading category details...</p></div>;
  }

  if (error && !formData.name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Link href="/categories"><Button variant="outline">Back to Categories</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Edit Category</CardTitle>
          <CardDescription className="text-center">Update the category details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} disabled={isSaving || !categoryId} />
            </div>

            <div className="space-y-2">
                <Label>Current PIC</Label>
                <p className="mt-1 text-sm text-muted-foreground p-2 border rounded-md bg-muted/10 h-10 flex items-center">{currentPicInfo}</p> {/* Adjusted styling */}
                <p className="text-xs text-muted-foreground">To change PIC, please use the "Assign PIC" option on the categories list page.</p>
            </div>
            {/* PIC selection is intentionally not here as per previous design decision */}

            <CardFooter className="flex justify-end space-x-3 pt-6 px-0">
              <Link href="/categories" passHref>
                <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSaving || !categoryId || isLoading}>
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const EditCategoryPage = withAuth(EditCategoryPageInternal, ['admin', 'super_admin']);
export default EditCategoryPage;
