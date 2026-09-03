"use client";

import { useAttemptStore } from "@/store/useAttemptStore";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { ChevronLeft, ChevronRight, Palette, X, Bookmark } from "lucide-react";
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
    visitedQuestions,
  } = useAttemptStore();

  const { answerKey, totalQuestions, questionPageMap } = useTestCreationStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const OPTIONS = ["A", "B", "C", "D"];
  const qData = answerKey[currentQuestion];
  const qType = qData?.type || "MCQ";
  const userAns = answers[currentQuestion] || "";
  const isMarked = !!markedForReview[currentQuestion];

  const navigateToQuestion = (qNum: number) => {
    setCurrentQuestion(qNum);
    if (questionPageMap && questionPageMap[qNum]) {
      useAttemptStore.getState().setPdfPage(questionPageMap[qNum]);
    }
    setIsPaletteOpen(false);
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
        const updated = current.filter((o) => o !== opt);
        updated.length > 0 ? setAnswer(currentQuestion, updated.sort().join(";")) : clearAnswer(currentQuestion);
      } else {
        setAnswer(currentQuestion, [...current, opt].sort().join(";"));
      }
    } else {
      if (userAns === opt) {
        clearAnswer(currentQuestion); // tap same option to deselect
      } else {
        setAnswer(currentQuestion, opt);
      }
    }
  };

  // Stats
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const notVisitedCount = totalQuestions - Object.keys(visitedQuestions).length;

  return (
    <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
      {/* Bottom Answer Panel */}
      <div className="bg-white border-t border-slate-200 pointer-events-auto shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">

        {/* Question meta + Mark for Review — compact single row */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-700">Q.{currentQuestion}</span>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{qType}</span>
            {qData && (
              <span className="text-[11px] text-slate-400 font-medium">
                +{qData.marks} marks
              </span>
            )}
            {userAns && (
              <button
                onClick={() => clearAnswer(currentQuestion)}
                className="text-[11px] font-semibold text-red-500 ml-1"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => toggleMarkForReview(currentQuestion)}
            className={`flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
              isMarked
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isMarked ? "fill-amber-600" : ""}`} />
            {isMarked ? "Marked" : "Mark"}
          </button>
        </div>

        {/* Answer Options */}
        {qType === "NAT" ? (
          <div className="px-4 pb-3">
            <input
              type="number"
              placeholder="Enter numerical answer"
              className="w-full h-12 border-2 border-slate-200 rounded-xl px-4 text-base font-medium text-center focus:outline-none focus:border-primary"
              value={userAns}
              onChange={(e) => setAnswer(currentQuestion, e.target.value)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 px-4 pb-3">
            {OPTIONS.map((opt) => {
              const isSelected =
                qType === "MSQ" ? userAns.split(";").includes(opt) : userAns === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className={`h-12 rounded-xl border-2 font-bold text-base transition-all active:scale-95 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-slate-100 bg-white text-slate-700"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Nav Bar: Prev | Palette | Next */}
        <div className="flex items-center border-t border-slate-100 bg-slate-50">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 1}
            className="flex-1 h-12 flex items-center justify-center gap-1 text-[14px] font-semibold text-slate-600 disabled:opacity-40 active:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {/* Palette trigger */}
          <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
            <SheetTrigger render={
              <button className="h-12 w-16 flex flex-col items-center justify-center border-x border-slate-200 relative">
                <Palette className="w-5 h-5 text-slate-600" />
                {markedCount > 0 && (
                  <span className="absolute top-2 right-3 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </button>
            } />

            {/* Question Palette Sheet */}
            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl p-0 flex flex-col">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-8 h-1 rounded-full bg-slate-200"></div>
              </div>

              <div className="flex items-center justify-between px-5 pb-3 shrink-0">
                <h3 className="font-bold text-lg">Question Palette</h3>
                <button onClick={() => setIsPaletteOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 py-2 bg-slate-50 border-y text-[12px] font-semibold text-slate-600 shrink-0">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500"></div> Answered</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-400"></div> Marked</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-200 border"></div> Not Visited</div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-6 gap-2.5">
                  {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                    const isAns = !!answers[qNum];
                    const isMrk = !!markedForReview[qNum];
                    const isVis = !!visitedQuestions[qNum];
                    const isCur = qNum === currentQuestion;

                    let cls = "bg-slate-100 text-slate-500";
                    if (isAns && isMrk) cls = "bg-green-500 text-white border-2 border-amber-400";
                    else if (isAns) cls = "bg-green-500 text-white";
                    else if (isMrk) cls = "bg-amber-400 text-white";
                    else if (isVis) cls = "bg-white border border-slate-300 text-slate-700";

                    return (
                      <button
                        key={qNum}
                        onClick={() => navigateToQuestion(qNum)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[13px] font-semibold transition-transform active:scale-90 ${cls} ${
                          isCur ? "ring-2 ring-primary ring-offset-1" : ""
                        }`}
                      >
                        {qNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats footer */}
              <div className="shrink-0 px-5 py-3 border-t bg-slate-50 flex items-center justify-between text-sm font-semibold">
                <span className="text-green-600">{answeredCount} Answered</span>
                <span className="text-amber-600">{markedCount} Marked</span>
                <span className="text-slate-500">{notVisitedCount} Not Visited</span>
              </div>
            </SheetContent>
          </Sheet>

          <button
            onClick={handleNext}
            disabled={currentQuestion === totalQuestions}
            className="flex-1 h-12 flex items-center justify-center gap-1 text-[14px] font-bold text-primary disabled:opacity-40 active:bg-slate-100"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
