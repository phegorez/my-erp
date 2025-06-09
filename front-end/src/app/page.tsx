import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from 'next/link'

export default function Home() {
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
