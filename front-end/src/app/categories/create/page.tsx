"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added
import { createCategory, fetchAllPics } from "@/services/api";
import { withAuth } from '@/hoc/withAuth'; // Import HOC
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card
// import { useAuth } from '@/contexts/AuthContext'; // Optional, if needed

// Interface for PIC user data (adjust based on actual API response for PICs)
interface PicUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  // Add other relevant fields
}

// Interface for the form data
interface CreateCategoryData {
  name: string;
  pic_user_id: string | null; // User ID of the PIC, can be null if no PIC is assigned
}

function CreateCategoryPageInternal() { // Renamed
  const router = useRouter();
  // const { user } = useAuth(); // Optional
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    pic_user_id: null,
  });
  const [pics, setPics] = useState<PicUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPicsLoading, setIsPicsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picsError, setPicsError] = useState<string | null>(null);

  useEffect(() => {
    const loadPics = async () => {
      setIsPicsLoading(true);
      setPicsError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login'); // Should ideally check this at a higher level
          return;
        }
        const data = await fetchAllPics();
        // Assuming data is an array of users or { users: [] }
        setPics(Array.isArray(data) ? data : data.users || []);
      } catch (err: any) {
        console.error("Failed to fetch PICs:", err);
        setPicsError(err.message || "Could not load PICs for selection.");
      } finally {
        setIsPicsLoading(false);
      }
    };
    loadPics();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  // Specifically for Shadcn Select component
  const handlePicChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pic_user_id: value === "none" ? null : value }));
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setError("Category name is required.");
      setIsLoading(false);
      return;
    }

    try {
      await createCategory(formData);
      router.push("/categories?categoryCreated=true");
    } catch (err: any) {
      console.error("Failed to create category:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Create New Category</CardTitle>
          <CardDescription className="text-center">Define a new item category and optionally assign a PIC.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pic_user_id">Assign PIC (Person In Charge)</Label>
              {isPicsLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading PICs...</p>}
              {picsError && <p className="text-sm text-destructive">{picsError}</p>}
              {!isPicsLoading && !picsError && (
                <Select
                  name="pic_user_id"
                  value={formData.pic_user_id || "none"}
                  onValueChange={handlePicChange}
                  disabled={isLoading || pics.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a PIC (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No PIC Assigned</SelectItem>
                    {pics.map((pic) => (
                      <SelectItem key={pic.id} value={pic.id}>
                        {pic.first_name} {pic.last_name} ({pic.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!isPicsLoading && pics.length === 0 && !picsError && (
                <p className="text-sm text-muted-foreground">No PICs available to assign.</p>
              )}
            </div>
            <CardFooter className="flex justify-end space-x-3 pt-6 px-0">
              <Link href="/categories" passHref>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || isPicsLoading}>
                {isLoading ? "Saving..." : "Save Category"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const CreateCategoryPage = withAuth(CreateCategoryPageInternal, ['admin', 'super_admin']);
export default CreateCategoryPage;
