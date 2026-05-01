// app/login/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

export default function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message || "Invalid credentials.");
      setIsPending(false);
    } else {
      // Better Auth automatically set the secure HTTP-only cookie.
      // Now we just push them to the dashboard!
      router.push("/dashboard");
      router.refresh(); // Force Next.js to re-evaluate the layout auth check
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <FlickeringGrid
          className="w-full h-full"
          squareSize={4}
          gridGap={6}
          color="rgb(161, 161, 170)" 
          maxOpacity={0.15}
          flickerChance={0.1}
        />
      </div>

      <Card className="relative z-10 w-full max-w-sm shadow-xl border-zinc-200/60 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign In
          </CardTitle>
          <CardDescription>
            Enter your email and password to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Swap action={...} for onSubmit={...} */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
            
            {errorMessage && (
              <p className="text-sm text-red-500 text-center font-medium">
                {errorMessage}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}