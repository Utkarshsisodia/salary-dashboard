import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import LoginForm  from './LoginForm';

export default async function LoginPage() {
  const session = await auth.api.getSession({
      headers: await headers()
    });
  
  if (session?.user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}