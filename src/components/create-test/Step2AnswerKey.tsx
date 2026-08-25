"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTestCreationStore, QuestionData } from "@/store/useTestCreationStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileText, Loader2, ScanSearch } from "lucide-react";

export function Step2AnswerKey() {
  const { answerKey, setAnswerKey, nextStep, prevStep } = useTestCreationStore();
  const [pasteData, setPasteData] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  // OCR State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [ocrErrors, setOcrErrors] = useState<string[]>([]);

  // --- Paste Handler ---
  const handleParse = async () => {
    if (!pasteData.trim()) return;
    
    const { parseAnswerKeyText } = await import("@/lib/answerKeyParser");
    const result = parseAnswerKeyText(pasteData);
    
    if (result.totalParsed > 0) {
      setAnswerKey(result.answerMap);
      setError(result.errors.length > 0 ? `Parsed ${result.totalParsed} questions. ${result.errors.length} lines skipped.` : "");
      setPasteData("");
    } else {
      setError("No valid questions found. Please check the format.");
    }
  };

  // --- OCR Upload Handler ---
  const onDropAnswerKey = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setIsScanning(true);
    setScanProgress(0);
    setScanStatus("Loading OCR engine...");
    setOcrErrors([]);
    setError("");

    try {
      const { extractTextSmart } = await import("@/lib/ocr");
      const { parseAnswerKeyFromPages } = await import("@/lib/answerKeyParser");

      const pages = await extractTextSmart(file, (progress) => {
        setScanProgress(progress.percent);
        if (progress.stage === "rendering") {
          setScanStatus(`Rendering page ${progress.currentPage} of ${progress.totalPages}...`);
        } else if (progress.stage === "preprocessing") {
          setScanStatus(`Enhancing image quality on page ${progress.currentPage}...`);
        } else {
          setScanStatus(`Recognizing text on page ${progress.currentPage} of ${progress.totalPages}...`);
        }
      });

      setScanStatus("Parsing answer key...");
      const result = parseAnswerKeyFromPages(pages);

      if (result.totalParsed > 0) {
        setAnswerKey(result.answerMap);
        setOcrErrors(result.errors);
        setScanStatus(`Successfully parsed ${result.totalParsed} questions!`);
      } else {
        setError("Could not parse any questions from the PDF. Try pasting the text manually instead.");
        setScanStatus("");
      }
    } catch (err) {
      console.error("Answer key OCR failed:", err);
      setError("Scan failed. Please try pasting the answer key text manually.");
      setScanStatus("");
    } finally {
      setIsScanning(false);
    }
  }, [setAnswerKey]);

  const { getRootProps: getAkRootProps, getInputProps: getAkInputProps, isDragActive: isAkDragActive } = useDropzone({
    onDrop: onDropAnswerKey,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isScanning,
  });

  const parsedQuestions = Object.entries(answerKey).map(([q, data]) => ({
    qNum: parseInt(q),
    ...data
  })).sort((a, b) => a.qNum - b.qNum);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Import Answer Key</h2>
        <p className="text-muted-foreground">Upload the official GATE answer key PDF or paste the text directly.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "upload" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ScanSearch className="h-4 w-4 inline-block mr-2" />
          Upload PDF (OCR)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("paste")}
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "paste" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4 inline-block mr-2" />
          Paste Text
        </button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                {...getAkRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isScanning 
                    ? "border-primary/30 bg-primary/5 pointer-events-none" 
                    : isAkDragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                }`}
              >
                <input {...getAkInputProps()} />
                {isScanning ? (
                  <Loader2 className="h-10 w-10 text-primary mb-3 animate-spin" />
                ) : (
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                )}
                <p className="text-sm font-medium">
                  {isScanning ? "Scanning..." : "Drop answer key PDF here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The official GATE answer key PDF will be auto-parsed
                </p>
              </div>

              {/* Progress */}
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

              {/* OCR Errors */}
              {ocrErrors.length > 0 && (
                <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md space-y-1">
                  <p className="font-medium">Some lines could not be parsed:</p>
                  {ocrErrors.slice(0, 5).map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                  {ocrErrors.length > 5 && <p>...and {ocrErrors.length - 5} more</p>}
                </div>
              )}
            </div>
          )}

          {/* Paste Tab */}
          {activeTab === "paste" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Paste Answer Key Text</label>
                <Button onClick={handleParse} variant="secondary" size="sm" type="button">Parse Text</Button>
              </div>
              <Textarea 
                placeholder={"Paste the answer key table here, e.g.:\n1 5 MCQ GA A 1\n34 5 NAT AE 0.16 to 0.17 1"}
                className="h-40 font-mono text-sm"
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Parsed Results Table */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Parsed Questions ({parsedQuestions.length})</h3>
                <Button variant="ghost" size="sm" type="button" onClick={() => setAnswerKey({})}>Clear All</Button>
              </div>
              <div className="max-h-[400px] overflow-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Q.No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Key / Range</TableHead>
                      <TableHead>Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedQuestions.map((q) => (
                      <TableRow key={q.qNum}>
                        <TableCell className="font-medium">{q.qNum}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            q.type === "MCQ" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                            q.type === "MSQ" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                            "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}>
                            {q.type}
                          </span>
                        </TableCell>
                        <TableCell>{q.key}</TableCell>
                        <TableCell>{q.marks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {!isScanning && scanStatus && (
                <p className="text-sm text-green-600 font-medium">{scanStatus}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline" size="lg" type="button">
          Back
        </Button>
        <Button onClick={nextStep} disabled={parsedQuestions.length === 0} size="lg" type="button">
          Continue
        </Button>
      </div>
    </div>
  );
}
