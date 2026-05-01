import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import LoginForm  from './LoginForm';

export default async function LoginPage() {
  // Run a secure server-side check before rendering anything
  const session = await auth.api.getSession({
      headers: await headers()
    });
  
  if (session?.user) {
    redirect('/dashboard');
  }

  // If no session, show the client form
  return <LoginForm />;
}