"use client";

import { useTestCreationStore } from "@/store/useTestCreationStore";
import { useAttemptStore } from "@/store/useAttemptStore";
import { Button } from "@/components/ui/button";

export function DigitalOptionsPanel() {
  const { 
    currentQuestion, 
    answers, 
    setAnswer, 
    clearAnswer, 
    markedForReview, 
    toggleMarkForReview 
  } = useAttemptStore();
  
  const { answerKey, questionOptionsMap } = useTestCreationStore();
  
  const OPTIONS = ["A", "B", "C", "D"];
  
  const qData = answerKey[currentQuestion];
  const qType = qData?.type || "MCQ";
  const userAns = answers[currentQuestion] || "";
  const currentOptions = questionOptionsMap?.[currentQuestion] || {};

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
    <div className="flex flex-col h-full bg-background p-3 sm:p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Select your answer:</h3>
      </div>
      
      {qType === "MCQ" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setAnswer(currentQuestion, opt)}
              className={`flex items-center p-2 sm:p-3 border rounded-md text-left transition-colors ${
                userAns === opt 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "hover:bg-muted"
              }`}
            >
              <span className="font-bold text-base min-w-6">({opt})</span>
              {currentOptions[opt] && (
                <span className="ml-2 text-sm leading-relaxed">{currentOptions[opt]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {qType === "MSQ" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-amber-600 mb-1">Multiple Select Question - Choose all correct options</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OPTIONS.map(opt => {
            const isSelected = userAns.split(";").includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleMsqToggle(opt)}
                className={`flex items-center p-2 sm:p-3 border rounded-md text-left transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "hover:bg-muted"
                }`}
              >
                <span className="font-bold text-base min-w-6">[{opt}]</span>
                {currentOptions[opt] && (
                  <span className="ml-2 text-sm leading-relaxed">{currentOptions[opt]}</span>
                )}
              </button>
            );
          })}
          </div>
        </div>
      )}

      {qType === "NAT" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-amber-600 mb-1">Numerical Answer Type - Enter a numeric value</p>
          <input 
            type="number"
            step="any"
            className="w-full max-w-xs text-lg p-2 border rounded-md bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter value..."
            value={userAns}
            onChange={(e) => {
              if (e.target.value) setAnswer(currentQuestion, e.target.value);
              else clearAnswer(currentQuestion);
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-auto pt-4 border-t shrink-0">
        <Button variant="ghost" size="sm" type="button" onClick={() => clearAnswer(currentQuestion)} disabled={!userAns}>
          Clear Answer
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={() => toggleMarkForReview(currentQuestion)}>
          {markedForReview[currentQuestion] ? "Unmark Review" : "Mark for Review"}
        </Button>
      </div>
    </div>
  );
}
