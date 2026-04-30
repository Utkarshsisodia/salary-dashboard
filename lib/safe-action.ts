import { auth } from '@/auth';
import { Session } from 'next-auth';

// 1. Use a generic type <T> to represent the return state
type ActionCallback<T> = (
  prevState: T, 
  formData: FormData, 
  session: Session 
) => Promise<T>;

// 2. Pass the generic <T> down to the wrapper function
export function withAdminAuth<T>(action: ActionCallback<T>) {
  return async (prevState: T, formData: FormData): Promise<T> => {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      // Cast the error object to T so TypeScript accepts it as a valid return state
      return { error: 'Unauthorized: Admin privileges required.' } as T;
    }

    return action(prevState, formData, session);
  };
}