// lib/safe-action.ts
import { auth } from '@/auth';
import { headers } from 'next/headers';

// Define the shape of the session we expect from Better Auth
type SessionContext = {
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
};

type ActionCallback<T> = (
  prevState: T, 
  formData: FormData, 
  session: SessionContext
) => Promise<T>;

export function withAdminAuth<T>(action: ActionCallback<T>) {
  return async (prevState: T, formData: FormData): Promise<T> => {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user || session.user.role !== 'admin') {
      return { error: 'Unauthorized: Admin privileges required.' } as T;
    }

    // Cast the session to our expected context
    return action(prevState, formData, session as SessionContext);
  };
}