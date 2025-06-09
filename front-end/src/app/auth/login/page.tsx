"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser as apiLoginUser } from "@/services/api"; // Renamed to avoid conflict
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

export default function LoginPage() {
  const router = useRouter();
  const { login: contextLogin, isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get login from context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API call loading

  // Redirect if already authenticated and not loading
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const redirectPath = router.query?.redirect as string || "/dashboard";
      router.push(redirectPath);
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const validateEmail = (email: string) => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Reset error message

    if (!email.trim() || !password.trim()) {
      setError("Both email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true); // For API call
    try {
      const response = await apiLoginUser({ email, password }); // Call the API function
      console.log("Login API success:", response);

      if (response.access_token) { // Assuming backend returns { access_token: "..." }
        contextLogin(response.access_token); // Use AuthContext's login
        // Redirect based on query param or to dashboard
        const redirectPath = router.query?.redirect as string || "/dashboard";
        router.push(redirectPath);
      } else {
        setError("Login successful, but no token received."); // Should not happen with correct backend
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      // err might be { message: "..." } from api.ts or other Axios error structure
      setError(err.detail || err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Skip rendering form if already authenticated and redirecting
  if (isAuthLoading || isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] "> {/* Adjusted min-height considering navbar */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription className="mt-2">
            Welcome back! Please enter your credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isAuthLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#" // TODO: Implement password reset page
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isAuthLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isAuthLoading}
            >
              {isLoading || isAuthLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="mt-4 text-sm text-center">
          <p> Not a member?{" "}
            <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
