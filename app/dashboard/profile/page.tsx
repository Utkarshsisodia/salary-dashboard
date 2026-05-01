// app/dashboard/profile/page.tsx
import { auth } from "@/auth";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserCircle, Mail, Briefcase, Calendar, ShieldCheck } from "lucide-react";
import { PasswordForm } from "./PasswordForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.query.employees.findFirst({
    where: eq(employees.id, session.user.id),
  });

  if (!user) redirect("/login");

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 pt-2">
      <div className="grid gap-6 md:grid-cols-3">
        
        <Card className="shadow-sm md:col-span-1 h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
              {initials}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span className="capitalize">{user.role}</span>
              </p>
            </div>

            <Badge variant={user.role === 'admin' ? 'destructive' : 'default'} className="mt-2">
              {user.role === 'admin' ? 'Admin Access' : 'Standard Access'}
            </Badge>

            <div className="w-full pt-6 space-y-4 text-sm text-left">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>To update your official details, please contact HR.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Legal Name</Label>
                <Input value={user.name} readOnly className="bg-zinc-50 text-zinc-500" />
              </div>
              <div className="space-y-2">
                <Label>Work Email</Label>
                <Input value={user.email} readOnly className="bg-zinc-50 text-zinc-500" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="Not provided" readOnly className="bg-zinc-50 text-zinc-500" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input placeholder="General" readOnly className="bg-zinc-50 text-zinc-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-rose-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-500" />
                Security Settings
              </CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}