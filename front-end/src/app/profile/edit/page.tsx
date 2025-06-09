"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchMyProfile, updateMyPersonalProfile } from "@/services/api";
import Link from "next/link";
import { withAuth } from '@/hoc/withAuth'; // Import HOC
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Import Card
import { Separator } from "@/components/ui/separator"; // Import Separator

// Define an interface for the editable profile data
interface EditableProfileData {
  id_card_number: string;
  phone_number: string;
  date_of_birth: string; // Store as YYYY-MM-DD for input type="date"
  gender: string;
}

// Define an interface for the full profile data (could be shared from profile/page.tsx)
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  id_card_number: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  department: string;
  job_title: string;
  grade: string;
}

function EditProfilePageInternal() { // Renamed for HOC
  const router = useRouter();
  const [formData, setFormData] = useState<EditableProfileData>({
    id_card_number: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const data: UserProfile = await fetchMyProfile();
        setOriginalProfile(data);
        setFormData({
          id_card_number: data.id_card_number || "",
          phone_number: data.phone_number || "",
          // Ensure date_of_birth is in YYYY-MM-DD for the input field
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : "",
          gender: data.gender || "",
        });
      } catch (err: any) {
        console.error("Failed to fetch profile for editing:", err);
        setError(err.message || "Could not load profile data.");
         if (err.status === 401 || err.status === 403) {
            router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Basic validation
      if (!formData.id_card_number || !formData.phone_number || !formData.date_of_birth || !formData.gender) {
          setError("All fields are required.");
          setIsSaving(false);
          return;
      }
      await updateMyPersonalProfile(formData);
      setSuccessMessage("Profile updated successfully!");
      // Optionally, refresh originalProfile or redirect
      // For now, just show success and let user navigate or make further edits
      // router.push('/profile'); // Or, update originalProfile and stay
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading form...</p></div>;
  }

  if (error && !originalProfile) { // Show full page error if initial load failed critically
    return <div className="flex flex-col items-center justify-center min-h-screen text-center"><p className="text-red-600">{error}</p><Button onClick={() => router.push('/profile')}>Back to Profile</Button></div>;
  }

  // Non-editable fields for display
  const nonEditableFields = originalProfile ? [
    { label: "First Name", value: originalProfile.first_name },
    { label: "Last Name", value: originalProfile.last_name },
    { label: "Email", value: originalProfile.email },
    { label: "Department", value: originalProfile.department },
    { label: "Job Title", value: originalProfile.job_title },
    { label: "Grade", value: originalProfile.grade },
  ] : [];


  return (
    <div className="flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Edit Profile</CardTitle>
          <CardDescription>Update your personal information below.</CardDescription>
        </CardHeader>

        {originalProfile && (
          <>
            <CardContent className="pt-2 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Current Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm p-4 border rounded-md bg-muted/40">
                  {nonEditableFields.map(field => (
                      <div key={field.label} className="space-y-1">
                          <Label className="text-muted-foreground">{field.label}</Label>
                          <p className="text-foreground font-medium">{field.value}</p>
                      </div>
                  ))}
              </div>
            </CardContent>
            <Separator />
          </>
        )}

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">{error}</div>}
            {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 border-green-400 rounded-md">{successMessage}</div>}

            <div className="space-y-2">
              <Label htmlFor="id_card_number">ID Card Number</Label>
              <Input id="id_card_number" name="id_card_number" type="text" required value={formData.id_card_number} onChange={handleChange} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input id="phone_number" name="phone_number" type="tel" required value={formData.phone_number} onChange={handleChange} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" name="date_of_birth" type="date" required value={formData.date_of_birth} onChange={handleChange} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" name="gender" type="text" required value={formData.gender} onChange={handleChange} placeholder="e.g., Male, Female, Other" disabled={isSaving} />
            </div>
            <CardFooter className="flex justify-end space-x-3 pt-6 px-0"> {/* Adjusted CardFooter */}
              <Link href="/profile" passHref>
                <Button type="button" variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const EditProfilePage = withAuth(EditProfilePageInternal); // No specific roles, just needs auth
export default EditProfilePage;
