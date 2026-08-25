"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { createTest } from "@/app/actions/testActions";

export function Step4Review() {
  const router = useRouter();
  const store = useTestCreationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mappedAnswersCount = Object.keys(store.answerKey).length;
  
  // Need to compute totalQuestions since it's dynamic based on user mapping
  // In a real app we might set this explicitly in step 2.
  const highestQ = mappedAnswersCount > 0 
    ? Math.max(...Object.keys(store.answerKey).map(Number))
    : 0;
  
  const missingAnswers = highestQ - mappedAnswersCount;

  const handleSubmit = async () => {
    if (!store.pdfFile) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', store.pdfFile);
      formData.append('testData', JSON.stringify({
        testName: store.testName,
        duration: store.duration,
        totalQuestions: highestQ,
        answerKey: store.answerKey
      }));

      const result = await createTest(formData);
      
      if (result.success && result.testId) {
        store.setTestConfig({ dbTestId: result.testId });
        router.push("/test/preview");
      } else {
        alert("Failed to save test. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Review Your Test</h2>
        <p className="text-muted-foreground">Please review all settings before saving.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-sm text-muted-foreground">Test Name</p>
              <p className="font-semibold text-lg">{store.testName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PDF File</p>
              <p className="font-semibold">{store.pdfFile?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{store.duration} mins</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="font-medium">{highestQ}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Answers Mapped</p>
              <p className="font-medium">{mappedAnswersCount}</p>
            </div>
          </div>

          {missingAnswers > 0 && (
            <div className="flex items-start gap-3 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Missing Answers Detected</p>
                <p className="text-sm">You have mapped answers up to question {highestQ}, but {missingAnswers} questions in between are missing answers.</p>
              </div>
            </div>
          )}
          
          {missingAnswers === 0 && mappedAnswersCount > 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-500/10 text-green-600 dark:text-green-500 rounded-md">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Ready to go!</p>
                <p className="text-sm">All answers mapped successfully.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={store.prevStep} variant="outline" size="lg" disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} size="lg" disabled={isSubmitting || store.testName === ""}>
          {isSubmitting ? "Saving Test..." : "Start Test / Save"}
        </Button>
      </div>
    </div>
  );
}
