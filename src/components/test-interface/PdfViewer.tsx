"use client";

import { useState, useMemo, useCallback, memo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useAttemptStore } from '@/store/useAttemptStore';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
}

function PdfViewerInner({ pdfUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();

  // Use individual selectors so we only re-render when PDF-specific state changes
  const pdfPage = useAttemptStore((s) => s.pdfPage);
  const pdfScale = useAttemptStore((s) => s.pdfScale);
  const setPdfPage = useAttemptStore((s) => s.setPdfPage);
  const setPdfScale = useAttemptStore((s) => s.setPdfScale);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const zoomIn = useCallback(() => setPdfScale((s: number) => Math.min(s + 0.2, 3)), [setPdfScale]);
  const zoomOut = useCallback(() => setPdfScale((s: number) => Math.max(s - 0.2, 0.5)), [setPdfScale]);
  
  const prevPage = useCallback(() => setPdfPage(Math.max(pdfPage - 1, 1)), [pdfPage, setPdfPage]);
  const nextPage = useCallback(() => setPdfPage(Math.min(pdfPage + 1, numPages || 1)), [pdfPage, numPages, setPdfPage]);

  // Memoize the file prop so Document doesn't think it's a new file on every render
  const fileOption = useMemo(() => pdfUrl, [pdfUrl]);

  return (
    <div className="flex flex-col h-full bg-[#323639] border-r min-w-0">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e20] text-slate-200 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={prevPage} disabled={pdfPage <= 1} className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium whitespace-nowrap">
            Page {pdfPage} / {numPages || '--'}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={nextPage} disabled={pdfPage >= (numPages || 1)} className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={zoomOut} className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center select-none">{Math.round(pdfScale * 100)}%</span>
          <Button type="button" variant="ghost" size="sm" onClick={zoomIn} className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700">
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-4 bg-slate-600 mx-2" />
          
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-700" onClick={() => setPdfScale(1.5)}>
            Fit Width
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#525659] min-w-0">
        <div className="max-w-full overflow-x-auto">
          <Document
            file={fileOption}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="flex items-center justify-center h-full text-slate-300">Loading PDF...</div>}
            className="flex flex-col items-center max-w-full"
          >
            <Page 
              pageNumber={pdfPage} 
              scale={pdfScale} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg max-w-full bg-white"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}

// Memoize the entire component so it ONLY re-renders when pdfUrl changes
export const PdfViewer = memo(PdfViewerInner);
