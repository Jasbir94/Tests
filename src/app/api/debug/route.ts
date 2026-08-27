import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    message: "Environment Variable Diagnostics",
    AUTH_SECRET: !!process.env.AUTH_SECRET ? "✅ Set" : "❌ MISSING",
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ MISSING",
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ MISSING",
    DATABASE_URL: !!process.env.DATABASE_URL ? "✅ Set" : "❌ MISSING",
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL ? "✅ Set" : "❌ MISSING",
    NODE_ENV: process.env.NODE_ENV,
    instruction: "If any of these are ❌ MISSING in Vercel, you must add them in Project Settings -> Environment Variables, and then manually Redeploy.",
  });
}
