"use client";

import { Button } from "@/components/ui/button";
import Link from 'next/link'
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, []);
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center flex flex-col gap-2">
        <h1>Welcome To My-ERP</h1>
        <Link href={'/auth/login'}>
          <Button className="cursor-pointer">
            Login
          </Button>
        </Link>
      </div>
    </main>
  );
}
