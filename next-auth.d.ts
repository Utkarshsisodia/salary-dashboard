import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  // Augment the User interface
  interface User {
    role: 'admin' | 'employee';
  }

  // Augment the Session interface
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'employee';
    } & DefaultSession['user'];
  }
}