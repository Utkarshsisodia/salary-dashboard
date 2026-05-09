import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

// The cache() wrapper is the magic here.
export const getCachedSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});
export async function requireAdmin() {
  const session = await getCachedSession();
  
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }
  
  return session;
}