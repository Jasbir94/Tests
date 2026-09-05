"use client";

import { useTestCreationStore } from "@/store/useTestCreationStore";
import { useAttemptStore } from "@/store/useAttemptStore";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function ExamControlPanel() {
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
  const pdfNumPages = useAttemptStore((s) => s.pdfNumPages);
  
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  const OPTIONS = ["A", "B", "C", "D"];
  const qData = answerKey[currentQuestion];
  const qType = qData?.type || "MCQ";
  const userAns = answers[currentQuestion] || "";

  const navigateToQuestion = (qNum: number) => {
    setCurrentQuestion(qNum);
    if (questionPageMap && questionPageMap[qNum]) {
      // Use explicit mapping (set during test creation)
      useAttemptStore.getState().setPdfPage(questionPageMap[qNum]);
    } else if (pdfNumPages > 0 && totalQuestions > 0) {
      // Ceiling ensures Q3 → page 3, not page 2 (avoids off-by-one)
      const proportionalPage = Math.max(1, Math.ceil((qNum / totalQuestions) * pdfNumPages));
      useAttemptStore.getState().setPdfPage(proportionalPage);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) navigateToQuestion(currentQuestion + 1);
  };
  
  const handlePrev = () => {
    if (currentQuestion > 1) navigateToQuestion(currentQuestion - 1);
  };

  const handleMsqToggle = (opt: string) => {
    const current = userAns ? userAns.split(";") : [];
    if (current.includes(opt)) {
      const updated = current.filter(o => o !== opt);
      if (updated.length > 0) setAnswer(currentQuestion, updated.sort().join(";"));
      else clearAnswer(currentQuestion);
    } else {
      setAnswer(currentQuestion, [...current, opt].sort().join(";"));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {/* Scrollable Upper Area (Question Data & Options) */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 flex flex-col gap-6">
          {/* Question Info Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Question {currentQuestion}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {qType}
              </span>
              <span className="text-xs font-medium text-slate-500">
                +{qData?.marks?.toFixed(2) || "1.00"} / -{((qData?.marks || 1) / 3).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Options Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm text-slate-500 font-medium">Select your answer</h3>
            
            {qType === "MCQ" && (
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswer(currentQuestion, opt)}
                    className={`flex items-center justify-center p-4 border rounded-xl transition-all ${
                      userAns === opt 
                        ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]" 
                        : "bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${userAns === opt ? 'border-white' : 'border-slate-300'}`}>
                      {userAns === opt && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    <span className="font-bold text-lg">{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {qType === "MSQ" && (
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map(opt => {
                  const isSelected = userAns.split(";").includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleMsqToggle(opt)}
                      className={`flex items-center justify-center p-4 border rounded-xl transition-all ${
                        isSelected 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]" 
                          : "bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-[4px] border-2 mr-3 flex items-center justify-center ${isSelected ? 'border-white' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-3 h-3 bg-white rounded-sm" />}
                      </div>
                      <span className="font-bold text-lg">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {qType === "NAT" && (
              <input 
                type="number"
                step="any"
                className="w-full text-2xl p-4 border rounded-xl bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-mono shadow-sm"
                placeholder="Enter numerical value..."
                value={userAns}
                onChange={(e) => {
                  if (e.target.value) setAnswer(currentQuestion, e.target.value);
                  else clearAnswer(currentQuestion);
                }}
              />
            )}
            
            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-3 mt-2">
              <Button 
                variant="outline" 
                className="flex-1 text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 border-slate-200 shadow-sm"
                type="button" 
                onClick={() => clearAnswer(currentQuestion)} 
                disabled={!userAns}
              >
                Clear Answer
              </Button>
              <Button 
                variant="outline" 
                className={`flex-1 shadow-sm transition-colors ${markedForReview[currentQuestion] ? 'border-orange-500 text-orange-700 bg-orange-50 hover:bg-orange-100' : 'text-slate-600 bg-white hover:bg-slate-100 border-slate-200'}`}
                type="button" 
                onClick={() => toggleMarkForReview(currentQuestion)}
              >
                {markedForReview[currentQuestion] ? "Unmark Review" : "Mark for Review"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Question Palette */}
      <div className="shrink-0 border-t border-slate-200 bg-white flex flex-col max-h-[50%] shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] z-10">
        <button 
          onClick={() => setIsPaletteOpen(!isPaletteOpen)}
          className="w-full flex items-center justify-between p-3 border-b border-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <span>Question Palette</span>
          {isPaletteOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        
        {isPaletteOpen && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-medium text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /> Answered</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-white border border-slate-300" /> Not Answered</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-400" /> Marked</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-200" /> Not Visited</div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(q => {
                const isAnswered = !!answers[q];
                const isMarked = !!markedForReview[q];
                const isVisited = !!visitedQuestions[q];
                const isCurrent = q === currentQuestion;
                
                let styleClass = "";
                
                if (isAnswered) {
                  styleClass = "bg-green-500 text-white border-green-600";
                  if (isMarked) styleClass = "bg-green-500 text-white border-green-600 relative overflow-hidden before:absolute before:bottom-0 before:right-0 before:w-0 before:h-0 before:border-l-[12px] before:border-l-transparent before:border-b-[12px] before:border-b-orange-400"; // Tiny orange triangle for answered+marked
                } else if (isMarked) {
                  styleClass = "bg-orange-400 text-white border-orange-500";
                } else if (isVisited) {
                  styleClass = "bg-white text-slate-700 border-slate-300"; // Visited, not answered
                } else {
                  styleClass = "bg-slate-200 text-slate-500 border-transparent"; // Not visited
                }

                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => navigateToQuestion(q)}
                    className={`w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] flex items-center justify-center rounded-md text-sm font-semibold border transition-all ${styleClass} ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10 shadow-md' : 'hover:brightness-95'}`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="shrink-0 p-4 border-t border-slate-200 flex gap-3 bg-white z-20">
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold"
          type="button" 
          onClick={handlePrev} 
          disabled={currentQuestion === 1}
        >
          Previous
        </Button>
        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
          type="button" 
          onClick={handleNext} 
          disabled={currentQuestion === totalQuestions}
        >
          Save & Next
        </Button>
      </div>
    </div>
  );
}
