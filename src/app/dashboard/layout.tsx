import Link from "next/link";
import { FileText, Home, Folder, PlusCircle, BarChart2, User, Bell } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-20 md:pb-0">
      {/* Top App Bar (Mobile & Desktop) */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 md:px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              M
            </div>
            <span className="font-bold text-lg hidden md:block">MockPDF</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-900">Dashboard</Link>
          <Link href="/dashboard/tests" className="text-sm font-medium text-slate-500 hover:text-slate-900">My Tests</Link>
          <Link href="/dashboard/analytics" className="text-sm font-medium text-slate-500 hover:text-slate-900">Analytics</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="hidden md:block">
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <Button type="submit" variant="ghost" size="sm" className="font-medium text-slate-600">Sign out</Button>
            </form>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
            {session?.user?.image ? (
              <Image src={session.user.image} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-14 h-full text-primary">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/dashboard/tests" className="flex flex-col items-center justify-center w-14 h-full text-slate-400 hover:text-slate-600">
          <Folder className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Tests</span>
        </Link>
        
        {/* Floating Create Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <Link href="/dashboard/create" className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transform transition active:scale-95">
            <PlusCircle className="w-7 h-7" />
          </Link>
        </div>

        <Link href="/dashboard/analytics" className="flex flex-col items-center justify-center w-14 h-full text-slate-400 hover:text-slate-600">
          <BarChart2 className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Analytics</span>
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center justify-center w-14 h-full text-slate-400 hover:text-slate-600">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
