"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { useAttemptStore } from "@/store/useAttemptStore";
import { AnswerPanel } from "@/components/test-interface/AnswerPanel";
import { ExamControlPanel } from "@/components/test-interface/ExamControlPanel";
import { MobileExamControls } from "@/components/test-interface/MobileExamControls";
import { TestHeader } from "@/components/test-interface/TestHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PdfViewer = dynamic(
  () => import("@/components/test-interface/PdfViewer").then((mod) => mod.PdfViewer),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center bg-[#323639] border-r"><div className="animate-pulse text-white">Loading PDF Viewer...</div></div> }
);

import { startAttempt } from "@/app/actions/attemptActions";

export default function TestPreviewPage() {
  const { isSubmitted, resetAttempt, dbAttemptId } = useAttemptStore();
  const { pdfFile, duration, dbTestId } = useTestCreationStore();
  const router = useRouter();
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (!hasInitialized.current && dbTestId) {
      hasInitialized.current = true;
      
      // Start the attempt in the database
      startAttempt(dbTestId).then((result) => {
        if (result.success && result.attemptId) {
          resetAttempt(duration, result.attemptId);
        }
      });
    }
  }, [duration, dbTestId, resetAttempt]);

  useEffect(() => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      setPdfPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfFile]);

  useEffect(() => {
    if (isSubmitted) {
      router.push("/test/preview/results");
    }
  }, [isSubmitted, router]);

  if (!pdfPreviewUrl) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-4">No PDF Uploaded</h2>
        <button 
          onClick={() => router.push("/dashboard/create")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-slate-100">
      <TestHeader />
      
      <div className="flex-1 overflow-hidden min-w-0">
        {/* Desktop Layout: Fixed Flexbox (1100px+) */}
        <div className="hidden lg:flex h-full w-full">
          {/* Left: PDF (Flexible) */}
          <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-white shadow-sm rounded-tr-xl flex flex-col">
            <PdfViewer pdfUrl={pdfPreviewUrl} />
          </div>
          
          {/* Right: Exam Control Panel (Fixed Width) */}
          <div className="w-[360px] shrink-0 h-full bg-white border-l shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] relative z-10 overflow-hidden">
            <ExamControlPanel />
          </div>
        </div>

        {/* Tablet Layout: Flexible Flexbox (768px - 1099px) */}
        <div className="hidden md:flex lg:hidden h-full w-full">
          {/* Left: PDF (Flexible) */}
          <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-white shadow-sm rounded-tr-xl flex flex-col">
            <PdfViewer pdfUrl={pdfPreviewUrl} />
          </div>
          
          {/* Right: Exam Control Panel (Fixed Minimum Width) */}
          <div className="w-[320px] shrink-0 h-full bg-white border-l shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] relative z-10 overflow-hidden">
            <ExamControlPanel />
          </div>
        </div>

        {/* Mobile Layout: Modern UI (< 768px) */}
        <div className="md:hidden flex flex-col h-full w-full bg-slate-100 relative overflow-hidden">
          {/* PDF Viewer - Takes full height but adds padding at bottom to avoid overlap with answer card */}
          <div className="flex-1 w-full h-full pb-[220px] relative z-10">
            <PdfViewer pdfUrl={pdfPreviewUrl} />
          </div>
          
          {/* Answer Controls & Palette Overlay */}
          <MobileExamControls />
        </div>
      </div>
    </div>
  );
}
