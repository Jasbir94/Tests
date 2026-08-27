import Link from "next/link";
import { FileText } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span>MockPDF</span>
        </Link>
        <nav className="hidden md:flex gap-6 ml-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {session?.user?.name && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              {session.user.name}
            </span>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 bg-muted/20 p-4 md:p-8">{children}</main>
    </div>
  );
}
