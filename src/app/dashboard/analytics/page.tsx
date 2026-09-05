import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  TrendingUp, Target, Clock, CheckCircle2,
  XCircle, SkipForward, BarChart2, BookOpen, Award
} from "lucide-react";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch all completed attempts with test info
  const attempts = await prisma.attempt.findMany({
    where: { userId, submittedAt: { not: null } },
    orderBy: { submittedAt: "desc" },
    include: {
      test: { select: { title: true, totalQuestions: true } },
    },
  });

  // ── Aggregate stats ──────────────────────────────────────────────
  const totalAttempts = attempts.length;
  const scores = attempts.map((a) => a.score ?? 0);
  const avgScore = totalAttempts > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts > 0 ? Math.round(Math.max(...scores)) : 0;
  const totalTimeSec = attempts.reduce((acc, a) => acc + (a.timeTaken || 0), 0);
  const hoursStr = totalTimeSec >= 3600
    ? `${Math.floor(totalTimeSec / 3600)}h ${Math.floor((totalTimeSec % 3600) / 60)}m`
    : `${Math.floor(totalTimeSec / 60)}m`;

  const totalCorrect = attempts.reduce((acc, a) => acc + (a.correct || 0), 0);
  const totalWrong = attempts.reduce((acc, a) => acc + (a.wrong || 0), 0);
  const totalSkipped = attempts.reduce((acc, a) => acc + (a.skipped || 0), 0);
  const totalAnswered = totalCorrect + totalWrong + totalSkipped;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

  function scoreColor(s: number) {
    if (s >= 70) return "text-green-600";
    if (s >= 40) return "text-amber-600";
    return "text-red-500";
  }

  function scoreBg(s: number) {
    if (s >= 70) return "bg-green-50 border-green-100";
    if (s >= 40) return "bg-amber-50 border-amber-100";
    return "bg-red-50 border-red-100";
  }

  function timeAgo(date: Date | null) {
    if (!date) return "—";
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }

  return (
    <div className="pb-28 md:pb-8">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100 px-4 pt-4 pb-3 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your performance across all tests</p>
        </div>
      </div>

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-5">

        {totalAttempts === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <BarChart2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">No data yet</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              Complete a test to see your performance analytics here
            </p>
            <Link
              href="/dashboard/tests"
              className="flex items-center gap-2 h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Go to My Tests
            </Link>
          </div>
        ) : (
          <>
            {/* ── Summary Stats Grid ── */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Target className="w-5 h-5 text-indigo-500" />} label="Avg Score" value={`${avgScore}%`} />
              <StatCard icon={<Award className="w-5 h-5 text-amber-500" />} label="Best Score" value={`${bestScore}%`} />
              <StatCard icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} label="Accuracy" value={`${accuracy}%`} />
              <StatCard icon={<Clock className="w-5 h-5 text-blue-500" />} label="Time Studied" value={hoursStr} />
            </div>

            {/* ── Answered breakdown ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Answer Breakdown</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center py-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                  <span className="text-2xl font-extrabold text-green-600 tabular-nums">{totalCorrect}</span>
                  <span className="text-[11px] text-green-700 font-medium">Correct</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-red-50 rounded-xl border border-red-100">
                  <XCircle className="w-5 h-5 text-red-400 mb-1" />
                  <span className="text-2xl font-extrabold text-red-500 tabular-nums">{totalWrong}</span>
                  <span className="text-[11px] text-red-600 font-medium">Wrong</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-slate-50 rounded-xl border border-slate-200">
                  <SkipForward className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-2xl font-extrabold text-slate-600 tabular-nums">{totalSkipped}</span>
                  <span className="text-[11px] text-slate-500 font-medium">Skipped</span>
                </div>
              </div>
            </div>

            {/* ── Score trend (recent attempts) ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recent Attempts</h2>
                <span className="text-xs text-slate-400">{totalAttempts} total</span>
              </div>
              <div className="space-y-2.5">
                {attempts.slice(0, 8).map((attempt) => {
                  const s = attempt.score ?? 0;
                  return (
                    <div key={attempt.id} className={`flex items-center justify-between p-3 rounded-xl border ${scoreBg(s)}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{attempt.test.title}</p>
                        <p className="text-xs text-slate-400">{timeAgo(attempt.submittedAt)}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`text-xl font-extrabold tabular-nums ${scoreColor(s)}`}>
                          {s.toFixed(0)}<span className="text-sm">%</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {attempts.length > 8 && (
                <Link
                  href="/dashboard/tests"
                  className="block text-center text-sm font-semibold text-indigo-600 mt-3 hover:underline"
                >
                  View all tests →
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-extrabold text-slate-900 tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}
