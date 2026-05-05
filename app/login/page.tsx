import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import LoginForm from './LoginForm';
import { getCachedSession } from '@/lib/session';

async function LoginContent() {
  const session = await getCachedSession();
  
  if (session?.user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <LoginContent />
    </Suspense>
  );
}