"use client";

import { useAttemptStore } from "@/store/useAttemptStore";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { Button } from "@/components/ui/button";
import { Timer } from "./Timer";

export function AnswerPanel() {
  const { 
    answers, 
    currentQuestion, 
    setAnswer, 
    clearAnswer, 
    toggleMarkForReview, 
    markedForReview,
    setCurrentQuestion,
    submitTest
  } = useAttemptStore();
  
  const { answerKey, testName, questionPageMap, questionOptionsMap } = useTestCreationStore();
  const totalQuestions = Object.keys(answerKey).length || 0; // Fallback if no questions
  
  const OPTIONS = ["A", "B", "C", "D"];

  const navigateToQuestion = (qNum: number) => {
    setCurrentQuestion(qNum);
    // Autoflip PDF page if we know which page this question is on
    if (questionPageMap && questionPageMap[qNum]) {
      useAttemptStore.getState().setPdfPage(questionPageMap[qNum]);
    }
  };
  
  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      navigateToQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestion > 1) {
      navigateToQuestion(currentQuestion - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  
  const qData = answerKey[currentQuestion];
  const qType = qData?.type || "MCQ";

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Header */}
      <div className="shrink-0 z-10 p-4 border-b flex flex-col gap-2 bg-background shadow-sm">
        <h2 className="font-bold text-lg truncate" title={testName}>{testName || "Mock Test"}</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Question {currentQuestion} of {totalQuestions}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-semibold">{qType}</span>
            <span className="text-xs text-muted-foreground">({qData?.marks} Marks)</span>
          </div>
          <Timer />
        </div>
      </div>



      {/* Navigation Bar (Sticky above Palette) */}
      <div className="shrink-0 p-3 border-t flex gap-2 justify-between bg-background shadow-sm z-10">
        <Button variant="secondary" type="button" onClick={handlePrev} disabled={currentQuestion === 1}>
          Previous
        </Button>
        <Button type="button" onClick={handleNext} disabled={currentQuestion === totalQuestions}>
          Save & Next
        </Button>
      </div>

      {/* Question Palette - Scrollable Bottom Section */}
      <div className="shrink-0 h-2/5 flex flex-col border-t bg-muted/10">
        <div className="p-4 flex-1 overflow-y-auto">
          <h4 className="text-sm font-medium mb-4">Question Palette</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(q => {
              const isAnswered = !!answers[q];
              const isMarked = !!markedForReview[q];
              const isCurrent = q === currentQuestion;
              
              let bgColor = "bg-muted text-muted-foreground"; // Not visited
              if (isAnswered && isMarked) bgColor = "bg-green-600 text-white ring-2 ring-yellow-400";
              else if (isAnswered) bgColor = "bg-green-600 text-white";
              else if (isMarked) bgColor = "bg-yellow-400 text-yellow-900";
              else if (isCurrent) bgColor = "bg-background border-2 border-primary";
              else bgColor = "bg-background border text-foreground hover:bg-muted";

              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => navigateToQuestion(q)}
                  className={`w-9 h-9 flex items-center justify-center rounded text-sm font-medium ${bgColor} ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Footer info & Submit - Fixed at bottom */}
        <div className="shrink-0 p-4 border-t bg-muted/20 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600 font-medium">Answered: {answeredCount}</span>
            <span className="text-muted-foreground font-medium">Not Answered: {unansweredCount}</span>
          </div>
          <Button className="w-full" type="button" variant="default" onClick={submitTest}>
            Submit Test
          </Button>
        </div>
      </div>
    </div>
  );
}
