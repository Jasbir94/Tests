"use client";

import { useAttemptStore } from "@/store/useAttemptStore";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronLeft, ChevronRight, Menu, X, Palette } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileExamControls() {
  const { 
    currentQuestion, 
    answers, 
    setAnswer, 
    clearAnswer, 
    markedForReview, 
    toggleMarkForReview,
    setCurrentQuestion,
    visitedQuestions
  } = useAttemptStore();
  
  const { answerKey, totalQuestions, questionPageMap } = useTestCreationStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const OPTIONS = ["A", "B", "C", "D"];
  const qData = answerKey[currentQuestion];
  const qType = qData?.type || "MCQ";
  const userAns = answers[currentQuestion] || "";

  const navigateToQuestion = (qNum: number) => {
    setCurrentQuestion(qNum);
    if (questionPageMap && questionPageMap[qNum]) {
      useAttemptStore.getState().setPdfPage(questionPageMap[qNum]);
    }
    setIsPaletteOpen(false); // Close palette on select
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) navigateToQuestion(currentQuestion + 1);
  };
  
  const handlePrev = () => {
    if (currentQuestion > 1) navigateToQuestion(currentQuestion - 1);
  };

  const handleOptionClick = (opt: string) => {
    if (qType === "MSQ") {
      const current = userAns ? userAns.split(";") : [];
      if (current.includes(opt)) {
        const updated = current.filter(o => o !== opt);
        if (updated.length > 0) setAnswer(currentQuestion, updated.sort().join(";"));
        else clearAnswer(currentQuestion);
      } else {
        setAnswer(currentQuestion, [...current, opt].sort().join(";"));
      }
    } else {
      setAnswer(currentQuestion, opt);
    }
  };

  const isMarked = !!markedForReview[currentQuestion];

  // Palette stats
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const notVisitedCount = totalQuestions - visitedQuestions.length;

  return (
    <div className="absolute bottom-0 left-0 w-full z-20 flex flex-col pointer-events-none">
      {/* Your Answer Bottom Card */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pointer-events-auto flex flex-col pb-safe">
        
        {/* Drag handle hint */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200"></div>
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[17px] text-slate-800">Your Answer</h3>
            {userAns && (
              <button 
                onClick={() => clearAnswer(currentQuestion)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {qType === "NAT" ? (
            <input 
              type="number"
              placeholder="Enter numerical answer"
              className="w-full h-14 border border-slate-200 rounded-xl px-4 text-lg font-medium text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={userAns}
              onChange={(e) => setAnswer(currentQuestion, e.target.value)}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {OPTIONS.map((opt) => {
                const isSelected = qType === "MSQ" ? userAns.split(";").includes(opt) : userAns === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(opt)}
                    className={`h-14 rounded-xl border-2 font-bold text-lg transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Action Bar */}
        <div className="flex items-center justify-between px-3 py-3 border-t bg-white">
          <Button 
            variant="ghost" 
            size="lg"
            className="rounded-xl font-semibold px-4 h-12"
            disabled={currentQuestion === 1}
            onClick={handlePrev}
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Prev
          </Button>

          <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12 w-12 rounded-full border-slate-200 shadow-sm p-0 flex-shrink-0 relative">
                <Palette className="w-5 h-5 text-slate-700" />
                {markedCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white"></div>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="font-bold text-xl">Question Palette</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsPaletteOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-4 py-4 bg-slate-50 border-b text-[13px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500"></div> Answered</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500"></div> Marked</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-200"></div> Not Visited</div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                    const isAns = !!answers[qNum];
                    const isMrk = !!markedForReview[qNum];
                    const isVis = visitedQuestions.includes(qNum);
                    const isCur = qNum === currentQuestion;

                    let bgClass = "bg-slate-200 text-slate-600 font-medium";
                    if (isAns && isMrk) bgClass = "bg-green-500 text-white border-2 border-orange-500";
                    else if (isAns) bgClass = "bg-green-500 text-white";
                    else if (isMrk) bgClass = "bg-orange-500 text-white";
                    else if (isVis) bgClass = "bg-white border-2 border-slate-300 text-slate-700";

                    return (
                      <button
                        key={qNum}
                        onClick={() => navigateToQuestion(qNum)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-base ${bgClass} ${isCur ? 'ring-2 ring-primary ring-offset-2 font-bold' : ''}`}
                      >
                        {isCur ? `Q${qNum}` : qNum}
                      </button>
                    );
                  })}
                </div>
                
                {/* Progress Donut Alternative */}
                <div className="mt-8 mb-4 flex items-center justify-center gap-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <circle cx="40" cy="40" r="36" fill="transparent" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${(answeredCount / totalQuestions) * 226} 226`} />
                    </svg>
                    <span className="absolute font-bold text-lg">{totalQuestions}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800">{totalQuestions} Total</span>
                    <span className="text-sm font-semibold text-green-600">{answeredCount} Answered</span>
                    <span className="text-sm font-medium text-slate-500">{notVisitedCount} Not Visited</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-white">
                <Button className="w-full h-14 rounded-xl text-lg font-bold" onClick={() => setIsPaletteOpen(false)}>
                  Close Palette
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            className="rounded-xl font-semibold px-4 h-12 bg-primary hover:bg-primary/90"
            disabled={currentQuestion === totalQuestions}
            onClick={handleNext}
          >
            Next <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
