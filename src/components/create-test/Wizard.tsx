"use client";

import { useTestCreationStore } from "@/store/useTestCreationStore";
import { Step1Upload } from "./Step1Upload";
import { Step2AnswerKey } from "./Step2AnswerKey";
import { Step3Configure } from "./Step3Configure";
import { Step4Review } from "./Step4Review";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Upload" },
  { id: 2, name: "Answer Key" },
  { id: 3, name: "Configure" },
  { id: 4, name: "Review" },
];

export function Wizard() {
  const step = useTestCreationStore((state) => state.step);

  return (
    <div className="flex flex-col gap-8">
      {/* Step Indicator */}
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center space-x-2 md:space-x-4">
          {STEPS.map((s, idx) => (
            <li key={s.id} className="flex items-center">
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium",
                  step === s.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : step > s.id
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-muted-foreground bg-background text-muted-foreground"
                )}
              >
                {s.id}
              </span>
              <span
                className={cn(
                  "ml-2 text-sm font-medium hidden sm:block",
                  step === s.id
                    ? "text-foreground"
                    : step > s.id
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {s.name}
              </span>
              {idx < STEPS.length - 1 && (
                <div className="ml-2 md:ml-4 w-4 md:w-8 h-px bg-border" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-4">
        {step === 1 && <Step1Upload />}
        {step === 2 && <Step2AnswerKey />}
        {step === 3 && <Step3Configure />}
        {step === 4 && <Step4Review />}
      </div>
    </div>
  );
}
