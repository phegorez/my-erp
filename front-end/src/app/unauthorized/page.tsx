"use client"; // Can be a client component for consistency or if interactivity is added later

import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming Button component is available

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700 mb-8">
          Sorry, you do not have the necessary permissions to access this page.
        </p>
        <div className="space-x-4">
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
          {/* Optionally, add a button to go back if history is available, or login if not authenticated */}
          {/* <Button onClick={() => window.history.back()}>Go Back</Button> */}
        </div>
      </div>
    </div>
  );
}
