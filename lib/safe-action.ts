import { auth } from '@/auth';
import { headers } from 'next/headers';

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

    return action(prevState, formData, session as SessionContext);
  };
}