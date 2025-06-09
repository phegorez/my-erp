"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// A simple logo component - replace with an actual logo if available
const Logo = () => (
  <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700">
    InvSys
  </Link>
);

export default function Navbar() {
  const { isAuthenticated, user, logout, hasRole, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login'); // Redirect to login after logout
  };

  if (isLoading) {
    // Render a minimal navbar or nothing during auth loading to prevent flicker
    return (
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div data-testid="loading-placeholder" className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div> {/* Placeholder for loading state */}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Common authenticated links */}
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/requests/my-requests">My Requests</NavLink>

                {/* Role-based links */}
                {hasRole(['admin', 'super_admin', 'pic']) && (
                  <NavLink href="/items">Items</NavLink>
                )}
                {hasRole(['admin', 'super_admin']) && (
                  <NavLink href="/categories">Categories</NavLink>
                )}
                {(hasRole(['manager', 'pic']) || hasRole(['admin', 'super_admin'])) && ( // Admins might also want to see this
                  <NavLink href="/requests/approvals">Approvals</NavLink>
                )}

                <NavLink href="/profile">{user.first_name || user.email}</NavLink>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink href="/auth/login">Login</NavLink>
                <NavLink href="/auth/register">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

// Helper component for NavLink styling
const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-2 py-1 sm:px-3 rounded-md transition-colors">
    {children}
  </Link>
);
