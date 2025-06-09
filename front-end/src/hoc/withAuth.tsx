"use client"; // HOCs that use hooks like useRouter or useAuth need to be client components

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { NextPage } from 'next'; // For typing the wrapped component
import { AuthUser } from '@/types';

// Define a type for component props that might include the user
export interface WithAuthProps {
  authUser?: AuthUser | null; // Make user available to wrapped component if needed
}

export function withAuth<P extends object>(
  WrappedComponent: NextPage<P & WithAuthProps>, // Allow original props P and add WithAuthProps
  allowedRoles?: string[] // Optional array of roles allowed to access
): NextPage<P> { // The HOC returns a NextPage that accepts original props P

  const ComponentWithAuth: NextPage<P> = (props) => {
    const router = useRouter();
    const { isAuthenticated, user, isLoading, hasRole } = useAuth();

    if (isLoading) {
      // You can render a loading spinner or a blank page while auth state is loading
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading authentication status...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      // Preserve the intended destination via query param for redirect after login
      if (typeof window !== 'undefined') { // Ensure window is defined for window.location.pathname
        router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      } else {
        router.push('/auth/login'); // Fallback if window is not available (e.g. during SSR pre-flight)
      }
      return null; // Render nothing while redirecting
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userHasRequiredRole = hasRole(allowedRoles);
      if (!userHasRequiredRole) {
        router.push('/unauthorized'); // Redirect to unauthorized page
        return null; // Render nothing while redirecting
      }
    }

    // If authenticated and (no roles specified or user has one of the allowed roles)
    // Pass the authUser prop to the wrapped component
    return <WrappedComponent {...props} authUser={user} />;
  };

  // Set a display name for easier debugging in React DevTools
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithAuth.displayName = `withAuth(${displayName})`;

  return ComponentWithAuth;
}
