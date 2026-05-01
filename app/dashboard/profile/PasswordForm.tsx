// app/dashboard/profile/PasswordForm.tsx
'use client';

import { useActionState } from 'react';
import { useForm, getFormProps, getInputProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import type { SubmissionResult } from '@conform-to/react';
import { updatePassword } from './actions';
import { updatePasswordSchema } from './schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type FormState = SubmissionResult<string[]> & { successMessage?: string } | undefined | null;
export function PasswordForm() {
  const [lastResult, formAction, isPending] = useActionState<FormState, FormData>(
    updatePassword as unknown as (state: FormState, payload: FormData) => Promise<FormState>, 
    undefined
  );

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updatePasswordSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <form {...getFormProps(form)} action={formAction} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor={fields.currentPassword.id}>Current Password</Label>
        <Input {...getInputProps(fields.currentPassword, { type: 'password' })} />
        <div className="text-xs text-red-500 min-h-4">{fields.currentPassword.errors}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fields.newPassword.id}>New Password</Label>
        <Input {...getInputProps(fields.newPassword, { type: 'password' })} />
        <div className="text-xs text-red-500 min-h-4">{fields.newPassword.errors}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fields.confirmPassword.id}>Confirm New Password</Label>
        <Input {...getInputProps(fields.confirmPassword, { type: 'password' })} />
        <div className="text-xs text-red-500 min-h-4">{fields.confirmPassword.errors}</div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update Password'}
      </Button>

      {form.errors && <p className="text-sm text-red-500 font-medium">{form.errors}</p>}
      
      {lastResult?.successMessage && (
        <p className="text-sm text-green-600 font-medium p-3 bg-green-50 rounded-lg border border-green-200">
          {lastResult.successMessage}
        </p>
      )}
    </form>
  );
}