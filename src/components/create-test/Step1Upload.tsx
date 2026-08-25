"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTestCreationStore } from "@/store/useTestCreationStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Trash2, ScanSearch, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function Step1Upload() {
  const { pdfFile, setPdfFile, nextStep, setTestConfig } = useTestCreationStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>("");
  const [detectedQuestions, setDetectedQuestions] = useState<number | null>(null);
  const [scanConfidence, setScanConfidence] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPdfFile(acceptedFiles[0]);
      setDetectedQuestions(null);
      setScanConfidence(null);
    }
  }, [setPdfFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setPdfFile(null);
    setDetectedQuestions(null);
    setScanConfidence(null);
  };

  const handleScanPdf = async () => {
    if (!pdfFile) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus("Loading OCR engine...");

    try {
      // Dynamic import to avoid SSR issues
      const { extractTextSmart } = await import("@/lib/ocr");
      const { countQuestions } = await import("@/lib/questionCounter");

      const pages = await extractTextSmart(pdfFile, (progress) => {
        setScanProgress(progress.percent);
        if (progress.stage === "rendering") {
          setScanStatus(`Rendering page ${progress.currentPage} of ${progress.totalPages}...`);
        } else if (progress.stage === "preprocessing") {
          setScanStatus(`Enhancing image quality on page ${progress.currentPage}...`);
        } else {
          setScanStatus(`Recognizing text on page ${progress.currentPage} of ${progress.totalPages}...`);
        }
      });

      setScanStatus("Analyzing questions...");
      const result = countQuestions(pages);
      setDetectedQuestions(result.totalQuestions);
      setScanConfidence(result.confidence);
      
      if (result.totalQuestions > 0) {
        setTestConfig({ 
          totalQuestions: result.totalQuestions,
          questionPageMap: result.questionPageMap,
          questionOptionsMap: result.questionOptionsMap
        });
      }
      
      setScanStatus("");
    } catch (err) {
      console.error("OCR scan failed:", err);
      setScanStatus("Scan failed. You can still proceed manually.");
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload Question Paper</h2>
        <p className="text-muted-foreground">Upload the PDF of the question paper you want to use for the mock test.</p>
      </div>

      {!pdfFile ? (
        <Card>
          <CardContent className="p-0">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Drag & drop your PDF here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <File className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>

            {/* Scan Section */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Auto-detect Questions</p>
                  <p className="text-xs text-muted-foreground">Scan the PDF to find how many questions it contains</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleScanPdf} 
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
                  ) : (
                    <><ScanSearch className="h-4 w-4 mr-2" /> Scan PDF</>
                  )}
                </Button>
              </div>

              {/* Progress Bar */}
              {isScanning && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${scanProgress}%` }} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{scanStatus}</p>
                </div>
              )}

              {/* Results */}
              {detectedQuestions !== null && !isScanning && scanConfidence !== null && (
                <div className={`flex items-start gap-3 p-3 rounded-md ${
                  scanConfidence >= 90 
                    ? "bg-green-500/10 text-green-600" 
                    : scanConfidence >= 50 
                      ? "bg-yellow-500/10 text-yellow-600" 
                      : "bg-orange-500/10 text-orange-600"
                }`}>
                  {scanConfidence >= 90 ? (
                    <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      Detected {detectedQuestions} questions
                    </p>
                    <p className="text-xs">
                      Confidence: {scanConfidence}% — {
                        scanConfidence >= 90 
                          ? "Perfect map generated." 
                          : "Some questions may have been missed. You can adjust this in the next step."
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={nextStep} disabled={!pdfFile} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
