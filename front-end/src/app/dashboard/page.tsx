"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
import { useAuth } from "@/contexts/AuthContext"; // Use the actual AuthContext
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, hasRole, isLoading } = useAuth(); // Get user from useAuth

  useEffect(() => {
    // withAuth HOC should handle this, but as a fallback or if HOC not applied directly on this page
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout(); // Use logout from useAuth
    router.push('/auth/login');
  };

  if (isLoading || !user) {
    // AuthProvider is loading or user is null (which means redirect will happen)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Quick Links/Actions based on role
  const quickLinks = [
    { href: "/requests/my-requests", label: "View My Requests", roles: [] }, // Accessible to all authenticated
    { href: "/profile", label: "My Profile", roles: [] },
    { href: "/items", label: "Manage Items", roles: ['admin', 'super_admin', 'pic'] },
    { href: "/categories", label: "Manage Categories", roles: ['admin', 'super_admin'] },
    { href: "/requests/approvals", label: "Approve Requests", roles: ['manager', 'pic', 'admin', 'super_admin'] },
    // Add more links as needed
  ];

  const availableLinks = quickLinks.filter(link => link.roles.length === 0 || hasRole(link.roles));


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">Welcome to Your Dashboard, {user.first_name || user.email}!</CardTitle>
          <CardDescription>Here's a quick overview and access to your tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableLinks.map(link => (
                <Link href={link.href} key={link.href} passHref>
                  <Button variant="outline" className="w-full h-16 text-left justify-start p-4 hover:bg-accent">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
             <h3 className="text-xl font-semibold mb-3 text-gray-700">Account Information</h3>
             <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
             <p className="text-gray-600"><strong>Roles:</strong> {user.roles.join(', ')}</p>
             {/* Add more user info if desired */}
          </div>

        </CardContent>
      </Card>

      {/* Example of another card for stats or recent activity - placeholder */}
      {/* <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent><p>No recent activity to display yet.</p></CardContent>
      </Card> */}

      <div className="text-center mt-10">
         <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
      </div>
    </div>
  );
}

// This page should also be wrapped with withAuth if it's not the default landing for authenticated users
// For example, in its own file:
// import { withAuth } from '@/hoc/withAuth';
// const ProtectedDashboardPage = withAuth(DashboardPage);
// export default ProtectedDashboardPage;
// However, if it's the primary redirect target after login, the checks within are fine.
