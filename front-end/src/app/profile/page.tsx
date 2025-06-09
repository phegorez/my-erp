"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchMyProfile } from "@/services/api";
import Link from "next/link";
import { withAuth } from '@/hoc/withAuth'; // Import HOC
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Import Card
import { Separator } from "@/components/ui/separator"; // Import Separator

// Define an interface for the user profile data
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  id_card_number: string;
  phone_number: string;
  date_of_birth: string; // Keep as string for display, can be Date object if needed
  gender: string;
  department: string;
  job_title: string;
  grade: string;
  created_at: string;
  updated_at: string;
  // Add any other fields your API returns
}

// Helper component to display profile information items
const ProfileInfoItem: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
  <div className="space-y-1"> {/* Reduced mb, added space-y for consistency */}
    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
    <p className="text-md text-foreground">{value || <span className="italic text-gray-400">N/A</span>}</p>
  </div>
);

function ProfilePageInternal() { // Renamed for HOC
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auth check is handled by withAuth HOC
    const loadProfile = async () => {
      setIsLoading(true); // Already true by default, but good practice if loadProfile is callable elsewhere
      setError(null);
      try {
        // Check for auth token before fetching
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login'); // Redirect if not authenticated
          return;
        }
        const data = await fetchMyProfile();
        setProfile(data);
      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || "Could not load profile. Please try again later.");
        if (err.status === 401 || err.status === 403) { // Example: handle auth errors
            router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  // isLoading from useAuth() could also be checked here if needed, but withAuth handles initial load.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center">
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">Go to Dashboard</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <p className="text-lg text-muted-foreground">No profile data found.</p>
         <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  const displayDateOfBirth = profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : null;
  const displayUpdatedAt = profile.updated_at ? new Date(profile.updated_at).toLocaleString() : null;
  const displayCreatedAt = profile.created_at ? new Date(profile.created_at).toLocaleString() : null;

  return (
    <div className="flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center bg-muted/30">
          <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
          <CardDescription>View your personal and professional information.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <ProfileInfoItem label="First Name" value={profile.first_name} />
            <ProfileInfoItem label="Last Name" value={profile.last_name} />
            <ProfileInfoItem label="Email" value={profile.email} />
            <ProfileInfoItem label="ID Card Number" value={profile.id_card_number} />
            <ProfileInfoItem label="Phone Number" value={profile.phone_number} />
            <ProfileInfoItem label="Date of Birth" value={displayDateOfBirth} />
            <ProfileInfoItem label="Gender" value={profile.gender} />
            <ProfileInfoItem label="Department" value={profile.department} />
            <ProfileInfoItem label="Job Title" value={profile.job_title} />
            <ProfileInfoItem label="Grade" value={profile.grade} />
          </div>
          <Separator className="my-6" />
           <div className="text-sm text-muted-foreground space-y-1">
            <p>Profile last updated: {displayUpdatedAt || "N/A"}</p>
            <p>Member since: {displayCreatedAt || "N/A"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-6 border-t">
            <Link href="/profile/edit" passHref>
              <Button size="lg">Edit Profile</Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

const ProfilePage = withAuth(ProfilePageInternal); // Any authenticated user can view their own profile
export default ProfilePage;
