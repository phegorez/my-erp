"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import Link from "next/link"; // Import Link for footer

// Define an interface for the form data for better type safety
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password_hash: string; // Field name expected by backend
  id_card_number: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  department: string;
  job_title: string;
  grade: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password_hash: "",
    id_card_number: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    department: "",
    job_title: "",
    grade: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Basic Validation
    for (const key in formData) {
      if (formData[key as keyof FormData].trim() === "") {
        setError(`Please fill in all fields. ${key} is missing.`);
        return;
      }
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password_hash.length < 6) { // Example: password length
        setError("Password must be at least 6 characters long.");
        return;
    }

    // Map frontend field names to backend field names if they differ
    // The backend expects 'password_hash', 'id_card_number', 'phone_number', 'date_of_birth', 'job_title'
    // Our frontend state uses 'password_hash', 'id_card_number', 'phone_number', 'date_of_birth', 'job_title' for these already.
    // It expects 'first_name' and 'last_name' for 'firstName' and 'lastName'.
    const submissionData = {
        ...formData,
        first_name: formData.firstName,
        last_name: formData.lastName,
    };
    // remove original camelCase keys if necessary, but backend might ignore them
    // delete submissionData.firstName;
    // delete submissionData.lastName;


    setIsLoading(true);
    try {
      // Make sure to send data in the format expected by the backend
      // The backend API expects: first_name, last_name, email, password_hash, id_card_number, phone_number, date_of_birth, gender, department, job_title, grade
      await registerUser(submissionData);
      console.log("Registration successful");
      router.push("/auth/login?registrationSuccess=true"); // Redirect to login with a success message
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] py-12"> {/* Adjusted min-height & padding */}
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription className="mt-2">
            Fill in the details below to register.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}> {/* Slightly reduced space-y for tighter packing in card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Reduced gap */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" type="text" required placeholder="John" value={formData.firstName} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" type="text" required placeholder="Doe" value={formData.lastName} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_hash">Password</Label>
              <Input id="password_hash" name="password_hash" type="password" autoComplete="new-password" required placeholder="••••••••" value={formData.password_hash} onChange={handleChange} disabled={isLoading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_card_number">ID Card Number</Label>
                <Input id="id_card_number" name="id_card_number" type="text" required placeholder="1234567890" value={formData.id_card_number} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" name="phone_number" type="tel" autoComplete="tel" required placeholder="+1234567890" value={formData.phone_number} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input id="date_of_birth" name="date_of_birth" type="date" required value={formData.date_of_birth} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" name="gender" type="text" required placeholder="e.g., Male, Female, Other" value={formData.gender} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" type="text" required placeholder="e.g., Engineering" value={formData.department} onChange={handleChange} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input id="job_title" name="job_title" type="text" required placeholder="e.g., Software Engineer" value={formData.job_title} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade/Level</Label>
              <Input id="grade" name="grade" type="text" required placeholder="e.g., P1, Senior" value={formData.grade} onChange={handleChange} disabled={isLoading} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="mt-4 text-sm text-center">
          <p>Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
