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
import { AuthUser } from "@/types";
import { useAuth } from "@/contexts/AuthContext";


// Helper component to display profile information items
const ProfileInfoItem: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
  <div className="space-y-1"> {/* Reduced mb, added space-y for consistency */}
    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
    <p className="text-md text-foreground">{value || <span className="italic text-gray-400">N/A</span>}</p>
  </div>
);

function ProfilePageInternal() { // Renamed for HOC
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // Auth check is handled by withAuth HOC
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      router.push('/auth/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  // isLoading from useAuth() could also be checked here if needed, but withAuth handles initial load.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <p className="text-lg text-muted-foreground">No profile data found.</p>
        <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  const displayDateOfBirth = user.Personal.date_of_birth ? new Date(user.Personal.date_of_birth).toLocaleDateString() : null;
  const displayUpdatedAt = user.updated_at ? new Date(user.updated_at).toLocaleString() : null;
  const displayCreatedAt = user.created_at ? new Date(user.created_at).toLocaleString() : null;

  return (
    <div className="flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center bg-muted/30">
          <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
          <CardDescription>View your personal and professional information.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <ProfileInfoItem label="First Name" value={user.first_name} />
            <ProfileInfoItem label="Last Name" value={user.last_name} />
            <ProfileInfoItem label="Email" value={user.email_address} />
            <ProfileInfoItem label="ID Card Number" value={user.Personal.id_card} />
            <ProfileInfoItem label="Phone Number" value={user.Personal.phone_number} />
            <ProfileInfoItem label="Date of Birth" value={displayDateOfBirth} />
            <ProfileInfoItem label="Gender" value={user.Personal.gender} />
            <ProfileInfoItem label="Department" value={user.Employee.department.department_name} />
            <ProfileInfoItem label="Job Title" value={user.Employee.job_title.job_title_name} />
            <ProfileInfoItem label="Grade" value={user.Employee.grade} />
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
