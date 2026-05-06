import { redirect } from 'next/navigation';

export default function Home() {
  // Middleware handles the actual logic, this is just a fallback.
  redirect('/login');
}