'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
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
// 1. Import your new grid component
import { FlickeringGrid } from '@/components/ui/flickering-grid';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      
      {/* 2. Position the grid absolutely behind the content */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <FlickeringGrid
          className="w-full h-full"
          squareSize={4}
          gridGap={6}
          // Using a soft zinc-400 tone to match the Luma style
          color="rgb(161, 161, 170)" 
          maxOpacity={0.15}
          flickerChance={0.1}
        />
      </div>

      {/* 3. Elevate the card with shadow-xl and a subtle translucent background */}
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
          <form action={formAction} className="space-y-4">
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