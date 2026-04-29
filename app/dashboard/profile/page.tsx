// app/dashboard/profile/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Building2, User } from 'lucide-react';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile & Bank Details</h2>
        <p className="text-muted-foreground">
          Manage your personal information and salary account details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>
              Your official contact details as per company records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (As per PAN)</Label>
              <Input id="fullName" defaultValue={session.user.name || ''} readOnly className="bg-zinc-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" type="email" defaultValue={session.user.email || ''} readOnly className="bg-zinc-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Personal Phone</Label>
              <Input id="phone" type="tel" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <Input id="pan" type="text" placeholder="ABCDE1234F" className="uppercase" />
            </div>
          </CardContent>
          <CardFooter className="border-t bg-zinc-50/50 py-4 rounded-b-xl">
            <Button variant="outline" className="w-full">Request Name/Email Change</Button>
          </CardFooter>
        </Card>

        {/* Bank Details */}
        <Card className="flex flex-col border-primary/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <CardTitle>Salary Account Details</CardTitle>
            </div>
            <CardDescription>
              This account will be used for your monthly payroll deposits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Holder Name</Label>
              <Input id="accountName" placeholder="John Doe" />
              <p className="text-xs text-muted-foreground">Must exactly match the name on your bank account.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" placeholder="e.g. HDFC Bank" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" type="password" placeholder="••••••••••••1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input id="ifsc" placeholder="HDFC0001234" className="uppercase" />
            </div>
          </CardContent>
          <CardFooter className="border-t bg-emerald-50/30 py-4 rounded-b-xl flex justify-between items-center">
            <div className="flex items-center text-xs text-emerald-700 font-medium">
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              256-bit Encrypted
            </div>
            <Button>Save Bank Details</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}