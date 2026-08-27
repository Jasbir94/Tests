"use client";

import { useTestCreationStore } from "@/store/useTestCreationStore";
import { useAttemptStore } from "@/store/useAttemptStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, MinusCircle, Trophy, Clock, Target, TrendingUp } from "lucide-react";

function getFeedback(pct: number) {
  if (pct >= 85) return { label: "Excellent", color: "text-green-700", bg: "bg-green-50 border-green-200", message: "Outstanding performance! You have a strong command of the subject. Keep up the excellent work and focus on any remaining weak spots." };
  if (pct >= 70) return { label: "Good", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", message: "Good performance! You understand the core concepts. Review the questions you got wrong and focus on improving speed for the next attempt." };
  if (pct >= 50) return { label: "Average", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", message: "You're on the right track. Revisit the topics where you made mistakes and practice more timed tests to improve your score." };
  return { label: "Needs Improvement", color: "text-red-700", bg: "bg-red-50 border-red-200", message: "Don't get discouraged! Review the fundamentals for all incorrect answers, and take more practice tests. Consistent effort will improve your score significantly." };
}

export default function ResultsPage() {
  const { testName, answerKey, duration } = useTestCreationStore();
  const { answers, timeRemaining } = useAttemptStore();

  const totalQuestions = Object.keys(answerKey).length;

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let mcqCorrect = 0, mcqTotal = 0;
  let msqCorrect = 0, msqTotal = 0;
  let natCorrect = 0, natTotal = 0;

  const resultDetails = Array.from({ length: totalQuestions }, (_, i) => {
    const qNum = i + 1;
    const qData = answerKey[qNum];
    const userAns = answers[qNum];

    let status = "Skipped";
    let marksAwarded = 0;

    if (qData) {
      maxScore += qData.marks;

      // Track per-type totals
      if (qData.type === "MCQ") mcqTotal++;
      else if (qData.type === "MSQ") msqTotal++;
      else if (qData.type === "NAT") natTotal++;

      if (!userAns) {
        skippedCount++;
      } else {
        let isCorrect = false;

        if (qData.type === "MCQ" || qData.type === "MSQ") {
          isCorrect = userAns === qData.key;
        } else if (qData.type === "NAT") {
          const userNum = parseFloat(userAns);
          if (qData.key.includes(" to ")) {
            const [min, max] = qData.key.split(" to ").map(Number);
            isCorrect = userNum >= min && userNum <= max;
          } else {
            isCorrect = userNum === parseFloat(qData.key);
          }
        }

        if (isCorrect) {
          correctCount++;
          status = "Correct";
          marksAwarded = qData.marks;
          if (qData.type === "MCQ") mcqCorrect++;
          else if (qData.type === "MSQ") msqCorrect++;
          else if (qData.type === "NAT") natCorrect++;
        } else {
          wrongCount++;
          status = "Wrong";
          if (qData.type === "MCQ") {
            marksAwarded = -(qData.marks / 3);
          }
        }
      }

      totalScore += marksAwarded;
    }

    return {
      qNum,
      type: qData?.type || "MCQ",
      correctAns: qData?.key || "—",
      userAns: userAns || "—",
      status,
      marks: marksAwarded,
      maxMarks: qData?.marks || 0,
    };
  });

  const accuracy = (correctCount + wrongCount) > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0;

  const timeTakenSeconds = (duration * 60) - timeRemaining;
  const timeTakenMins = Math.floor(timeTakenSeconds / 60);
  const timeTakenSecs = timeTakenSeconds % 60;
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const feedback = getFeedback(scorePercent);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
          <p className="text-muted-foreground">{testName || "Mock Test"}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/create" className={buttonVariants({ variant: "default" })}>
            New Test
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Dashboard
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      <div className={`flex items-start gap-4 p-4 rounded-xl border ${feedback.bg}`}>
        <Trophy className={`h-8 w-8 mt-0.5 shrink-0 ${feedback.color}`} />
        <div>
          <p className={`font-bold text-lg ${feedback.color}`}>{feedback.label} — {scorePercent}%</p>
          <p className={`text-sm mt-0.5 ${feedback.color} opacity-80`}>{feedback.message}</p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Target className="h-4 w-4" /> Total Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalScore.toFixed(1)} <span className="text-xl font-normal opacity-80">/ {maxScore}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{accuracy}%</div>
            <p className="text-xs text-muted-foreground mt-1">{correctCount + wrongCount} answered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Time Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{timeTakenMins}m {timeTakenSecs}s</div>
            <p className="text-xs text-muted-foreground mt-1">of {duration} mins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attempted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{correctCount + wrongCount} <span className="text-lg font-normal text-muted-foreground">/ {totalQuestions}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Correct / Wrong / Skipped */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Correct</p>
              <p className="text-3xl font-bold text-green-700">{correctCount}</p>
            </div>
            <CheckCircle2 className="h-9 w-9 text-green-400" />
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Wrong</p>
              <p className="text-3xl font-bold text-red-700">{wrongCount}</p>
            </div>
            <XCircle className="h-9 w-9 text-red-400" />
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Skipped</p>
              <p className="text-3xl font-bold text-slate-700">{skippedCount}</p>
            </div>
            <MinusCircle className="h-9 w-9 text-slate-300" />
          </CardContent>
        </Card>
      </div>

      {/* Section-wise Breakdown */}
      {(mcqTotal > 0 || msqTotal > 0 || natTotal > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Section-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {mcqTotal > 0 && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">MCQ</p>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mcqTotal > 0 ? (mcqCorrect / mcqTotal) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{mcqCorrect}/{mcqTotal} correct ({mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0}%)</p>
                </div>
              )}
              {msqTotal > 0 && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">MSQ</p>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${msqTotal > 0 ? (msqCorrect / msqTotal) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{msqCorrect}/{msqTotal} correct ({msqTotal > 0 ? Math.round((msqCorrect / msqTotal) * 100) : 0}%)</p>
                </div>
              )}
              {natTotal > 0 && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">NAT</p>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${natTotal > 0 ? (natCorrect / natTotal) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{natCorrect}/{natTotal} correct ({natTotal > 0 ? Math.round((natCorrect / natTotal) * 100) : 0}%)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question-wise Table */}
      <Card>
        <CardHeader>
          <CardTitle>Question-wise Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Q.No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Your Answer</TableHead>
                <TableHead>Correct Answer</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultDetails.map((row) => (
                <TableRow key={row.qNum} className={row.status === "Correct" ? "bg-green-50/40" : row.status === "Wrong" ? "bg-red-50/40" : ""}>
                  <TableCell className="font-medium">{row.qNum}</TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">{row.type}</span></TableCell>
                  <TableCell className={row.status === "Wrong" ? "text-red-600 font-medium" : ""}>{row.userAns}</TableCell>
                  <TableCell className="font-semibold text-green-700">{row.correctAns}</TableCell>
                  <TableCell>
                    {row.status === "Correct" && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Correct</span>}
                    {row.status === "Wrong" && <span className="text-red-600 font-medium flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Wrong</span>}
                    {row.status === "Skipped" && <span className="text-slate-400 flex items-center gap-1"><MinusCircle className="h-3.5 w-3.5" />Skipped</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={row.marks > 0 ? "text-green-600 font-medium" : row.marks < 0 ? "text-red-600 font-medium" : "text-slate-400"}>
                      {row.marks > 0 ? `+${row.marks.toFixed(2)}` : row.marks !== 0 ? row.marks.toFixed(2) : "0"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/ {row.maxMarks}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
