// app/dashboard/AddEmployeeForm.tsx
'use client';

import { useActionState } from 'react';
import { addEmployee } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function AddEmployeeForm() {
  const [state, formAction, isPending] = useActionState(addEmployee, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="space-y-2 flex-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required placeholder="Jane Doe" />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="jane@company.com" />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="password">Temporary Password</Label>
          <Input id="password" name="password" required placeholder="Secret123!" />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="role">Role</Label>
          <select 
            id="role" 
            name="role" 
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          {isPending ? 'Saving...' : 'Create User'}
        </Button>
      </div>

      {/* Feedback Messages */}
      {state?.error && <p className="text-sm text-red-500 font-medium">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600 font-medium">{state.success}</p>}
    </form>
  );
}