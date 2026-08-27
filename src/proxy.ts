import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16 uses proxy.ts (renamed from middleware.ts)
// Only use edge-safe authConfig here (no Prisma/Node.js modules)
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
