"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCategoryById, fetchAllPics, assignPicToCategory } from "@/services/api";
import { withAuth } from '@/hoc/withAuth'; // Import HOC
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card

interface Category {
  id: string;
  name: string;
  pic_user_id: string | null;
}

interface PicUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

function AssignPicPageInternal() { // Renamed
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [pics, setPics] = useState<PicUser[]>([]);
  const [selectedPicId, setSelectedPicId] = useState<string | null>(null);

  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [isLoadingPics, setIsLoadingPics] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setError("Category ID is missing.");
      setIsLoadingCategory(false);
      setIsLoadingPics(false);
      return;
    }

    const loadCategoryDetails = async () => {
      setIsLoadingCategory(true);
      try {
        const catData = await fetchCategoryById(categoryId);
        setCategory(catData);
        setSelectedPicId(catData.pic_user_id || null); // Pre-select current PIC
      } catch (err: any) {
        console.error("Failed to fetch category details:", err);
        setError(err.message || "Could not load category details.");
      } finally {
        setIsLoadingCategory(false);
      }
    };

    const loadPics = async () => {
      setIsLoadingPics(true);
      try {
        const picsData = await fetchAllPics();
        setPics(Array.isArray(picsData) ? picsData : picsData.users || []);
      } catch (err: any) {
        console.error("Failed to fetch PICs:", err);
        setError(err.message || "Could not load PICs for selection.");
        // Keep existing error if category load also failed
        if (!error) setError(err.message || "Could not load PICs for selection.");
      } finally {
        setIsLoadingPics(false);
      }
    };

    loadCategoryDetails();
    loadPics();
  }, [categoryId, error]); // Added error to dependency array for re-evaluation

  const handlePicSelectionChange = (value: string) => {
    setSelectedPicId(value === "none" ? null : value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPicId) {
      // If "No PIC Assigned" is chosen, this could mean unassigning.
      // The backend should handle pic_user_id: null to unassign.
      // For now, we assume a PIC must be selected if this form is submitted with a value.
      // If unassigning is a feature, the button text/logic might need to adapt.
      // Forcing a selection for "Assign" button:
      if(selectedPicId === null && category?.pic_user_id === null){
        setError("No PIC selected and no PIC was previously assigned.");
        return;
      }
       if(selectedPicId === null && category?.pic_user_id !== null){
        // This means user selected "No PIC Assigned", intending to unassign.
         // Proceed with null selectedPicId for unassignment.
      } else if (selectedPicId === null) {
        setError("Please select a PIC to assign or choose 'No PIC Assigned' to unassign.");
        return;
      }
    }

    setIsAssigning(true);
    setError(null);

    try {
      await assignPicToCategory(categoryId, selectedPicId as string); // API expects string, null handled by API
      router.push("/categories?picAssigned=true");
    } catch (err: any) {
      console.error("Failed to assign PIC:", err);
      setError(err.message || "An unexpected error occurred while assigning PIC.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoadingCategory || isLoadingPics) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading data...</p></div>;
  }

  if (error && !category) { // Critical error if category couldn't be loaded
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
          <CardTitle className="text-3xl font-bold text-center">Assign PIC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {category && (
            <div className="mb-4 p-3 border rounded-md bg-muted/40">
                <CardDescription className="text-center text-lg font-semibold text-foreground">
                    Category: {category.name}
                </CardDescription>
                {category.pic_user_id && !isLoadingPics && pics.find(p => p.id === category.pic_user_id) && (
                    <p className="text-sm text-muted-foreground mt-1 text-center">
                        Current PIC: {pics.find(p => p.id === category.pic_user_id)?.first_name} {pics.find(p => p.id === category.pic_user_id)?.last_name}
                    </p>
                )}
                {category.pic_user_id && isLoadingPics && (
                    <p className="text-sm text-muted-foreground mt-1 text-center animate-pulse">Loading current PIC info...</p>
                )}
                {!category.pic_user_id && (
                    <p className="text-sm text-muted-foreground mt-1 text-center">No PIC currently assigned.</p>
                )}
            </div>
          )}

          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pic_user_select">Select User for PIC Role</Label>
              {isLoadingPics && <p className="text-sm text-muted-foreground animate-pulse">Loading PICs...</p>}
              {!isLoadingPics && picsError && <p className="text-sm text-destructive">{error}</p>} {/* Show general error if pics error caused it */}
              {!isLoadingPics && !picsError && (
                <Select
                  name="pic_user_select"
                  value={selectedPicId || "none"}
                  onValueChange={handlePicSelectionChange}
                  disabled={isAssigning || pics.length === 0 || !category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No PIC Assigned (Unassign)</SelectItem>
                    {pics.map((pic) => (
                      <SelectItem key={pic.id} value={pic.id}>
                        {pic.first_name} {pic.last_name} ({pic.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!isLoadingPics && pics.length === 0 && !picsError && (
                <p className="text-sm text-muted-foreground">No users available to be assigned as PIC.</p>
              )}
            </div>

            <CardFooter className="flex justify-end space-x-3 pt-6 px-0">
              <Link href="/categories" passHref>
                <Button type="button" variant="outline" disabled={isAssigning}>Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={isAssigning || isLoadingPics || isLoadingCategory || !category || (selectedPicId === category?.pic_user_id)}
              >
                {isAssigning ? "Assigning..." : "Save PIC Assignment"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const AssignPicPage = withAuth(AssignPicPageInternal, ['admin', 'super_admin']);
export default AssignPicPage;
