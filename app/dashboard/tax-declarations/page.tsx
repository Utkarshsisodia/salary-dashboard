// app/dashboard/tax-declarations/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export default async function TaxDeclarationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tax Declarations (ITR)</h2>
          <p className="text-muted-foreground">
            Declare your investments for FY 2026-27 to optimize your TDS deductions.
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-sm">
          Status: Pending Review
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Section 80C */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Section 80C</CardTitle>
              <span className="text-sm font-medium text-muted-foreground">Max: ₹1,50,000</span>
            </div>
            <CardDescription>
              Life Insurance, PPF, ELSS Mutual Funds, Principal on Home Loan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="elss">ELSS Mutual Funds (₹)</Label>
              <Input id="elss" type="number" placeholder="50000" defaultValue="50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lic">Life Insurance Premium (₹)</Label>
              <Input id="lic" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppf">Public Provident Fund - PPF (₹)</Label>
              <Input id="ppf" type="number" placeholder="0" />
            </div>
          </CardContent>
        </Card>

        {/* House Rent Allowance (HRA) */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>House Rent Allowance (HRA)</CardTitle>
            <CardDescription>
              Declare your annual rent paid to claim HRA exemption.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="rent">Total Annual Rent Paid (₹)</Label>
              <Input id="rent" type="number" placeholder="120000" defaultValue="180000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metro">Metro / Non-Metro City</Label>
              <Select defaultValue="metro">
                <SelectTrigger>
                  <SelectValue placeholder="Select city type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metro">Metro (50% of Basic)</SelectItem>
                  <SelectItem value="non-metro">Non-Metro (40% of Basic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">Landlord PAN (If rent {'>'} ₹1 Lakh)</Label>
              <Input id="pan" type="text" placeholder="ABCDE1234F" defaultValue="ABCDE1234F" className="uppercase" />
            </div>
          </CardContent>
        </Card>

        {/* Proof Uploads */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Proof Submission</CardTitle>
            <CardDescription>
              Upload supporting documents for your declarations. Uploads are typically unlocked in Q4 (Jan-Mar).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 bg-zinc-50/50">
              <div className="p-3 bg-white rounded-full shadow-sm border">
                <UploadCloud className="h-6 w-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Drag and drop your investment proofs here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (Max 5MB per file)</p>
              </div>
              <Button variant="secondary" size="sm" className="mt-2">Browse Files</Button>
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-50 border-t flex justify-between items-center rounded-b-xl py-4">
            <p className="text-sm text-muted-foreground flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
              Last saved: Just now
            </p>
            <Button>Submit Declarations</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}