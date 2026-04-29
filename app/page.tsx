import { redirect } from 'next/navigation';

export default function Home() {
  // Instantly route localhost:3000 to the dashboard
  redirect('/dashboard');
}