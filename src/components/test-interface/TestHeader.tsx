"use client";

import { useAttemptStore } from "@/store/useAttemptStore";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { Button } from "@/components/ui/button";
import { Bookmark, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TestHeader() {
  const { 
    currentQuestion, 
    answers, 
    markedForReview, 
    timeRemaining, 
    setTimeRemaining, 
    submitTest 
  } = useAttemptStore();
  const { totalQuestions, testName } = useTestCreationStore();

  const [mounted, setMounted] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      useAttemptStore.getState().setTimeRemaining(Math.max(0, useAttemptStore.getState().timeRemaining - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isLowTime = timeRemaining < 600; // Less than 10 mins

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="h-16 border-b flex items-center justify-between px-3 sm:px-6 shrink-0 bg-white shadow-sm relative z-20">
      {/* Left side: Menu, Logo, Test Name */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger */}
        <button className="md:hidden p-1.5 -ml-1.5 text-slate-600 rounded-md hover:bg-slate-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base">
            M
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight hidden md:inline-block">MockPDF</span>
        </div>
        <div className="h-6 w-px bg-border mx-1 sm:mx-2 hidden sm:block"></div>
        <span className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-xs hidden sm:block">
          {testName || "Untitled Test"}
        </span>
      </div>

      {/* Center: Question Progress (Mobile focused) */}
      <div className="flex md:hidden items-center text-[15px] font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">
        {currentQuestion} / {totalQuestions}
      </div>

      {/* Center: Desktop Progress Bar */}
      <div className="hidden md:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
        <span className="text-sm font-medium">Question {currentQuestion} of {totalQuestions}</span>
        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
      </div>

      {/* Right side: Timer & Submit */}
      <div className="flex items-center gap-2 sm:gap-6">
        <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md ${isLowTime ? 'bg-destructive/10 text-destructive font-bold' : 'text-slate-700'}`}>
          <Clock className="w-4 h-4" />
          <div className="flex flex-col">
            <span className="hidden sm:block text-[10px] leading-none uppercase text-muted-foreground font-semibold mb-0.5">Time Remaining</span>
            <span className="text-[15px] sm:text-lg leading-none font-mono tabular-nums font-semibold">{formattedTime}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-2 border rounded-md">
          <Bookmark className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span>Marked ({markedCount})</span>
        </div>

        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-4 py-2">
            Submit Test
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Test?</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit your test? You cannot change your answers after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-100">
                <span className="text-3xl font-bold text-green-600">{answeredCount}</span>
                <span className="text-sm text-green-700 font-medium">Answered</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-3xl font-bold text-gray-600">{unansweredCount}</span>
                <span className="text-sm text-gray-700 font-medium">Unanswered</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-100 col-span-2">
                <span className="text-3xl font-bold text-orange-600">{markedCount}</span>
                <span className="text-sm text-orange-700 font-medium">Marked for Review</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>Continue Testing</Button>
              <Button variant="destructive" onClick={() => {
                setIsSubmitOpen(false);
                submitTest();
              }}>Submit Final</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
