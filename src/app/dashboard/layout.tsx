import Link from "next/link";
import { FileText, LayoutDashboard, User } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Link
            href="/dashboard/tests"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            My Tests
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/20 p-4 md:p-8">{children}</main>
    </div>
  );
}
