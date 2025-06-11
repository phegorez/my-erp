import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider
import Navbar from "@/components/layout/Navbar"; // Import Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyERP⚙️", // Updated title
  description: "Frontend for MyERP System", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      {/* Added bg-gray-50 for overall page background */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <AuthProvider> {/* Wrap children with AuthProvider */}
          <Navbar />
          <main suppressHydrationWarning={false}> {/* Added padding and max-width */}
            {children}
          </main>
          {/* Potential Footer could go here */}
        </AuthProvider>
      </body>
    </html>
  );
}
