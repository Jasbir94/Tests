"use client";

import { useTestCreationStore } from "@/store/useTestCreationStore";
import { useAttemptStore } from "@/store/useAttemptStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

export default function ResultsPage() {
  const { testName, answerKey, duration } = useTestCreationStore();
  const { answers, timeRemaining } = useAttemptStore();

  const totalQuestions = Object.keys(answerKey).length;
  
  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  const resultDetails = Array.from({ length: totalQuestions }, (_, i) => {
    const qNum = i + 1;
    const qData = answerKey[qNum];
    const userAns = answers[qNum];
    
    let status = "Skipped";
    let marksAwarded = 0;
    
    if (qData) {
      maxScore += qData.marks;
      
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
        } else {
          wrongCount++;
          status = "Wrong";
          // Only MCQ has negative marking (1/3 of marks)
          if (qData.type === "MCQ") {
            marksAwarded = -(qData.marks / 3);
          } else {
            marksAwarded = 0;
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
      maxMarks: qData?.marks || 0
    };
  });

  const accuracy = (correctCount + wrongCount) > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  const timeTakenSeconds = (duration * 60) - timeRemaining;
  const timeTakenMins = Math.floor(timeTakenSeconds / 60);
  const timeTakenSecs = timeTakenSeconds % 60;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
          <p className="text-muted-foreground">{testName || "Mock Test"}</p>
        </div>
        <div className="space-x-4">
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalScore.toFixed(2)} <span className="text-xl font-normal opacity-80">/ {maxScore}</span></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{accuracy}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{timeTakenMins}m {timeTakenSecs}s</div>
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

      {/* Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600 dark:text-green-500">Correct Answers</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{correctCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500/50" />
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-500">Wrong Answers</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{wrongCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500/50" />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Skipped</p>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{skippedCount}</p>
            </div>
            <MinusCircle className="h-8 w-8 text-slate-400/50" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Question-wise Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Q.No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Your Answer</TableHead>
                <TableHead>Correct Answer</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultDetails.map((row) => (
                <TableRow key={row.qNum}>
                  <TableCell className="font-medium">{row.qNum}</TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">{row.type}</span></TableCell>
                  <TableCell>{row.userAns}</TableCell>
                  <TableCell className="font-semibold">{row.correctAns}</TableCell>
                  <TableCell>
                    {row.status === "Correct" && <span className="text-green-600 font-medium">Correct</span>}
                    {row.status === "Wrong" && <span className="text-red-600 font-medium">Wrong</span>}
                    {row.status === "Skipped" && <span className="text-slate-500">Skipped</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={row.marks > 0 ? "text-green-600 font-medium" : row.marks < 0 ? "text-red-600" : ""}>
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
