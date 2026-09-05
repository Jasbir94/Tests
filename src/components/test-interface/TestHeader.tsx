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
    <div className="h-14 md:h-16 border-b flex items-center px-3 sm:px-6 shrink-0 bg-white shadow-sm relative z-20 gap-2">

      {/* ── LEFT: Logo (mobile) / Logo + Test Name (desktop) ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile Hamburger */}
        <button className="md:hidden p-1 text-slate-500 rounded-md hover:bg-slate-100">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          M
        </div>
        <span className="font-bold text-base tracking-tight hidden md:inline">MockPDF</span>
        <div className="h-5 w-px bg-slate-200 hidden md:block mx-1" />
        <span className="font-medium text-sm truncate max-w-[140px] hidden md:inline text-slate-600">
          {testName || "Untitled Test"}
        </span>
      </div>

      {/* ── CENTER: Question counter (mobile) / Progress bar (desktop) ── */}
      {/* On mobile: use flex-1 + text-center so it takes remaining space cleanly */}
      <div className="flex-1 flex items-center justify-center">
        {/* Mobile: compact Q counter */}
        <div className="md:hidden flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-slate-500">Q</span>
          <span className="text-[17px] font-extrabold text-slate-900 tabular-nums">{currentQuestion}</span>
          <span className="text-[13px] font-medium text-slate-400">/ {totalQuestions}</span>
        </div>

        {/* Desktop: progress bar */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Question {currentQuestion} of {totalQuestions}</span>
          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-xs text-slate-400 font-medium">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* ── RIGHT: Timer + Submit ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Timer chip */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${isLowTime ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className={`font-mono tabular-nums font-bold tracking-tight ${isLowTime ? 'text-red-600' : 'text-slate-900'} text-[15px] md:text-base`}>
            {formattedTime}
          </span>
        </div>

        {/* Marked counter — desktop only */}
        <div className="hidden sm:flex items-center gap-1 text-sm font-medium px-3 py-1.5 border rounded-lg">
          <Bookmark className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span className="text-slate-600">{markedCount}</span>
        </div>

        {/* Submit button */}
        <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-colors bg-red-500 text-white hover:bg-red-600 h-9 px-3 md:px-4">
            Submit
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Test?</DialogTitle>
              <DialogDescription>
                Are you sure? You cannot change your answers after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl border border-green-100">
                <span className="text-3xl font-bold text-green-600">{answeredCount}</span>
                <span className="text-sm text-green-700 font-medium">Answered</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-3xl font-bold text-gray-600">{unansweredCount}</span>
                <span className="text-sm text-gray-700 font-medium">Unanswered</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-xl border border-orange-100 col-span-2">
                <span className="text-3xl font-bold text-orange-600">{markedCount}</span>
                <span className="text-sm text-orange-700 font-medium">Marked for Review</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>Continue Testing</Button>
              <Button variant="destructive" onClick={() => { setIsSubmitOpen(false); submitTest(); }}>Submit Final</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
