import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/auth";
import { headers } from "next/headers";

// 1. Base Client (Public)
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);
    return e.message || "Something went wrong on the server.";
  },
});

// 2. Protected Client (Any logged-in Employee or Admin)
export const protectedActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized. Please log in.");
  }

  // Inject user into context!
  return next({ ctx: { user: session.user } });
});

// 3. Admin Client (Strictly Admins only)
export const adminActionClient = protectedActionClient.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Unauthorized: Admin privileges required.");
  }
  return next({ ctx });
});