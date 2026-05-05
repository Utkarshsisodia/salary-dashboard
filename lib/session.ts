import { auth } from "@/auth";
import { headers } from "next/headers";
import { cache } from "react";

// The cache() wrapper is the magic here.
export const getCachedSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});