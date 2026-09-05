"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { useAttemptStore } from "@/store/useAttemptStore";
import { FileText, Clock, Hash, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

// Pre-built demo answer key for CS22025.pdf
// Each key = question number, value = { type, key (correct answer), marks }
const DEMO_ANSWER_KEY = Object.fromEntries(
  Array.from({ length: 65 }, (_, i) => {
    const q = i + 1;
    const options = ["A", "B", "C", "D"];
    return [q, {
      type: "MCQ" as const,
      key: options[q % 4],   // distributes A/B/C/D across questions
      marks: q <= 25 ? 1 : 2, // first 25 Qs = 1 mark, rest = 2 marks
    }];
  })
);

export default function DemoPage() {
  const router = useRouter();
  const { setTestConfig, setAnswerKey, reset } = useTestCreationStore();
  const { resetAttempt } = useAttemptStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartDemo = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch the demo PDF from public folder
      const res = await fetch("/demo/CS22025.pdf");
      if (!res.ok) throw new Error("Could not load demo PDF");
      const blob = await res.blob();
      const demoFile = new File([blob], "CS22025-Demo.pdf", { type: "application/pdf" });

      // Reset stores and load demo data
      reset();
      resetAttempt(180);

      // Create object URL
      const url = URL.createObjectURL(demoFile);

      // Exact mapping of questions to their pages in CS22025.pdf
      const DEMO_PAGE_MAP: Record<number, number> = {
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
        11: 11, 12: 11, 13: 12, 14: 13, 15: 13, 16: 14, 17: 15, 18: 16, 19: 17, 20: 18,
        21: 18, 22: 19, 23: 20, 24: 20, 25: 21, 26: 21, 27: 22, 28: 22, 29: 23, 30: 24,
        31: 25, 32: 25, 33: 26, 34: 26, 35: 27, 36: 27, 37: 28, 38: 29, 39: 30, 40: 30,
        41: 31, 42: 31, 43: 32, 44: 33, 45: 34, 46: 35, 47: 36, 48: 37, 49: 38, 50: 38,
        51: 39, 52: 40, 53: 41, 54: 42, 55: 43, 56: 43, 57: 43, 58: 44, 59: 44, 60: 45,
        61: 45, 62: 46, 63: 47, 64: 47, 65: 48,
      };

      setTestConfig({
        pdfFile: demoFile,
        pdfPreviewUrl: url,
        testName: "CS22025 – Computer Science Demo Test",
        duration: 180, // 3 hours
        totalQuestions: 65,
        dbTestId: null,
        questionPageMap: DEMO_PAGE_MAP,
        questionOptionsMap: {},
      });

      setAnswerKey(DEMO_ANSWER_KEY);

      // Navigate directly into the exam
      router.push("/test/preview");
    } catch (e: any) {
      setError("Failed to load demo. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
            <FileText className="w-4 h-4" />
            Live Demo
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Try MockPDF for free</h1>
          <p className="text-slate-500 text-base">
            Experience a full mock exam right now. No sign-up required.
          </p>
        </div>

        {/* Demo Test Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-[#2D2A4A] px-6 py-5">
            <h2 className="text-white font-bold text-xl">CS22025</h2>
            <p className="text-indigo-200 text-sm mt-1">Computer Science & IT — Mock Paper 2025</p>
          </div>

          <div className="p-5 grid grid-cols-3 gap-4 border-b border-slate-100">
            <div className="flex flex-col items-center text-center">
              <Hash className="w-5 h-5 text-indigo-500 mb-1" />
              <span className="text-xl font-bold text-slate-900">65</span>
              <span className="text-xs text-slate-500 font-medium">Questions</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Clock className="w-5 h-5 text-indigo-500 mb-1" />
              <span className="text-xl font-bold text-slate-900">3 hrs</span>
              <span className="text-xs text-slate-500 font-medium">Duration</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="w-5 h-5 text-indigo-500 mb-1" />
              <span className="text-xl font-bold text-slate-900">MCQ</span>
              <span className="text-xs text-slate-500 font-medium">Type</span>
            </div>
          </div>

          <div className="p-5 space-y-2.5">
            {[
              "Full-screen PDF question viewer",
              "Timer countdown (3 hours)",
              "Answer selection with A / B / C / D",
              "Question palette & Mark for Review",
              "Submit and view results",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <button
          onClick={handleStartDemo}
          disabled={loading}
          className="w-full h-14 bg-[#2D2A4A] hover:bg-indigo-900 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading exam...
            </>
          ) : (
            <>
              Start Demo Exam
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Want to use your own PDFs?{" "}
          <a href="/register" className="text-primary font-semibold hover:underline">
            Create a free account →
          </a>
        </p>
      </div>
    </div>
  );
}
