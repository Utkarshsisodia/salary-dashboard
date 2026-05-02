'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
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
      router.push("/dashboard");
      router.refresh(); 
    }
  };

  const handleOpenChange = (isOpen: boolean) => {};
  
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <FlickeringGrid className="w-full h-full" squareSize={4} gridGap={6} color="rgb(161, 161, 170)" maxOpacity={0.15} flickerChance={0.1}/>
      </div>

      
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm shadow-2xl border-zinc-200/60 bg-white/95 backdrop-blur-sm">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Sign In
            </DialogTitle>
            <DialogDescription>
              Enter your email and password to access your dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSignIn} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@company.com" required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required/>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}