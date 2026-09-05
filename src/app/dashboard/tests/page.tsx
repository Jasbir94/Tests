import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  FileText, Clock, CheckCircle2, BookOpen,
  ChevronRight, Plus, Play, RotateCcw, BarChart2
} from "lucide-react";

export default async function MyTestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const tests = await prisma.test.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      attempts: {
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { score: true, submittedAt: true, timeTaken: true },
      },
      _count: { select: { attempts: true } },
    },
  });

  function formatDuration(mins: number) {
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`.trim();
    return `${mins}m`;
  }

  function timeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  return (
    <div className="pb-28 md:pb-8">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 px-4 pt-4 pb-3 md:px-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Tests</h1>
            <p className="text-sm text-slate-500 mt-0.5">{tests.length} test{tests.length !== 1 ? "s" : ""} created</p>
          </div>
          <Link
            href="/dashboard/create"
            className="flex items-center gap-1.5 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Test</span>
          </Link>
        </div>
      </div>

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-3">
        {tests.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">No tests yet</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              Upload a PDF question paper to create your first mock test
            </p>
            <Link
              href="/dashboard/create"
              className="flex items-center gap-2 h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first test
            </Link>
          </div>
        ) : (
          tests.map((test) => {
            const lastAttempt = test.attempts[0];
            const hasAttempt = !!lastAttempt;
            const score = lastAttempt?.score ?? null;
            const scoreColor =
              score === null ? "text-slate-400"
              : score >= 70 ? "text-green-600"
              : score >= 40 ? "text-amber-600"
              : "text-red-500";

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                        {test.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {test._count.attempts} attempt{test._count.attempts !== 1 ? "s" : ""}
                        {lastAttempt?.submittedAt ? ` · Last: ${timeAgo(lastAttempt.submittedAt)}` : " · Never attempted"}
                      </p>
                    </div>
                    {hasAttempt && score !== null && (
                      <div className={`text-right shrink-0`}>
                        <p className={`text-2xl font-extrabold tabular-nums ${scoreColor}`}>
                          {score.toFixed(0)}
                          <span className="text-sm font-medium">%</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Best Score</p>
                      </div>
                    )}
                  </div>

                  {/* Meta chips */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      <FileText className="w-3 h-3" />
                      {test.totalQuestions} Q
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {formatDuration(test.duration)}
                    </span>
                    {hasAttempt && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Attempted
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex border-t border-slate-100">
                  {hasAttempt && (
                    <Link
                      href={`/test/preview/results?testId=${test.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100"
                    >
                      <BarChart2 className="w-4 h-4 text-indigo-500" />
                      Results
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/create?testId=${test.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {hasAttempt ? (
                      <><RotateCcw className="w-4 h-4" /> Retake</>
                    ) : (
                      <><Play className="w-4 h-4" /> Start</>
                    )}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
