import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { ChevronRight, Play, BookOpen, Target, Clock, TrendingUp, BarChart2 } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] || "Student";

  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Fetch data
  const [tests, attempts] = await Promise.all([
    prisma.test.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { attempts: { where: { submittedAt: { not: null } }, orderBy: { submittedAt: "desc" }, take: 1 } },
    }),
    prisma.attempt.findMany({
      where: { userId, submittedAt: { not: null } },
      select: { score: true, timeTaken: true },
    }),
  ]);

  const totalTests = attempts.length; // Actually attempts taken is better for "Tests Taken"
  const scores = attempts.map((a) => a.score ?? 0).filter((s) => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.round(Math.max(...scores)) : 0;
  
  const totalTimeSeconds = attempts.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0);
  const hoursPracticed = Math.floor(totalTimeSeconds / 3600);
  const minutesPracticed = Math.floor((totalTimeSeconds % 3600) / 60);

  const activeTest = tests[0]; // Just grabbing the latest test as "Continue Practicing" for UI purposes
  const recentTests = tests.filter(t => t.id !== activeTest?.id).slice(0, 3);

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-5xl mx-auto w-full">
      
      {/* Mobile Greeting (Desktop handles this in layout or left aligns) */}
      <div className="pt-2">
        <h1 className="text-[26px] md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
          {greeting},<br className="md:hidden" /> {firstName}
        </h1>
      </div>

      {/* Main Hero Card */}
      <div className="bg-[#2D2A4A] rounded-2xl md:rounded-[24px] p-6 md:p-10 flex flex-col items-start relative overflow-hidden shadow-md">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl"></div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 relative z-10">Ready for your next test?</h2>
        <p className="text-indigo-100/80 mb-8 text-sm md:text-base max-w-sm relative z-10">Turn any question paper into a real exam environment.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10">
          <Link href="/dashboard/create" className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold h-12 px-6 rounded-xl flex items-center justify-center transition-colors">
            Create Mock Test
          </Link>
          <Link href="/dashboard/tests" className="bg-white/10 hover:bg-white/20 text-white font-semibold h-12 px-6 rounded-xl flex items-center justify-center transition-colors">
            Browse My Tests
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">Tests Taken</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-900">{totalTests}</div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <Target className="w-4 h-4" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">Avg Score</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-900">{avgScore}%</div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">Best Score</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-900">{bestScore}%</div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">Time Practiced</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-slate-900">{hoursPracticed}h {minutesPracticed}m</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Continue Practicing */}
          {activeTest && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Continue Practicing</h3>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FileTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{activeTest.title}</h4>
                      <p className="text-xs text-slate-500">{activeTest.totalQuestions} Questions • {activeTest.duration} mins</p>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>0 / {activeTest.totalQuestions}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>

                <Link href={`/test/preview?testId=${activeTest.id}`} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 w-full rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4 fill-current" /> Continue Test
                </Link>
              </div>
            </div>
          )}

          {/* Recent Tests */}
          {recentTests.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900">Recent Tests</h3>
                <Link href="/dashboard/tests" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">See all</Link>
              </div>
              <div className="flex flex-col gap-3">
                {recentTests.map((test) => {
                  const lastAttempt = test.attempts[0];
                  const acc = lastAttempt?.score ? Math.round((lastAttempt.score / test.totalQuestions) * 100) : 0;
                  
                  return (
                    <div key={test.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex flex-col">
                        <h4 className="font-bold text-slate-900 text-sm md:text-base">{test.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                          <span>{test.totalQuestions} Qs</span>
                          {lastAttempt && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-green-600">Score {lastAttempt.score}%</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span>Acc {acc}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Link href={`/test/preview/results`} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Performance Snapshot */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Your Performance</h3>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
            
            <div className="relative w-32 h-32 mt-4 mb-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#6366f1" strokeWidth="12" strokeDasharray={`${(avgScore / 100) * 351} 351`} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">{avgScore}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-semibold text-slate-600">Average Score</span>
                <span className="text-sm font-bold text-slate-900">{avgScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-semibold text-slate-600">Tests Completed</span>
                <span className="text-sm font-bold text-slate-900">{totalTests}</span>
              </div>
            </div>

            <Link href="/dashboard/analytics" className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
              <BarChart2 className="w-4 h-4" /> View Full Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
