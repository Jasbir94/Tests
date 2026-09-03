"use client";

import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useAttemptStore } from '@/store/useAttemptStore';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
}

function PdfViewerInner({ pdfUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  const pdfPage = useAttemptStore((s) => s.pdfPage);
  const pdfScale = useAttemptStore((s) => s.pdfScale);
  const setPdfPage = useAttemptStore((s) => s.setPdfPage);
  const setPdfScale = useAttemptStore((s) => s.setPdfScale);

  // Measure container width for responsive scaling
  useEffect(() => {
    const isMob = window.innerWidth < 768;
    setIsMobile(isMob);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      setContainerWidth(containerRef.current.clientWidth);
    }

    return () => observer.disconnect();
  }, []);

  // On mobile, auto-fit PDF width to container instead of using fixed scale
  const effectiveWidth = useMemo(() => {
    if (containerWidth > 0 && isMobile) {
      // Let react-pdf handle scaling by width
      return containerWidth - 8; // 4px padding on each side
    }
    return undefined;
  }, [containerWidth, isMobile]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const zoomIn = useCallback(() => setPdfScale((s: number) => Math.min(s + 0.2, 3)), [setPdfScale]);
  const zoomOut = useCallback(() => setPdfScale((s: number) => Math.max(s - 0.2, 0.5)), [setPdfScale]);
  const fitWidth = useCallback(() => setPdfScale(1.0), [setPdfScale]);
  const prevPage = useCallback(() => setPdfPage(Math.max(pdfPage - 1, 1)), [pdfPage, setPdfPage]);
  const nextPage = useCallback(() => setPdfPage(Math.min(pdfPage + 1, numPages || 1)), [pdfPage, numPages, setPdfPage]);

  const fileOption = useMemo(() => pdfUrl, [pdfUrl]);

  return (
    <div className="flex flex-col h-full bg-[#404040] min-w-0">
      {/* Toolbar - Compact on mobile */}
      <div className="flex items-center justify-between px-2 py-1.5 md:px-4 md:py-2 bg-[#1e1e20] text-slate-200 shadow-md z-10 shrink-0">
        {/* Page Navigation */}
        <div className="flex items-center gap-1 md:gap-3">
          <button
            type="button"
            onClick={prevPage}
            disabled={pdfPage <= 1}
            className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs md:text-sm font-medium whitespace-nowrap tabular-nums">
            {pdfPage} / {numPages || '--'}
          </span>
          <button
            type="button"
            onClick={nextPage}
            disabled={pdfPage >= (numPages || 1)}
            className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls - hidden on mobile (auto-fit handles it) */}
        <div className="hidden md:flex items-center gap-1">
          <button type="button" onClick={zoomOut} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium w-12 text-center select-none">{Math.round(pdfScale * 100)}%</span>
          <button type="button" onClick={zoomIn} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700">
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-slate-600 mx-1" />
          <button type="button" onClick={fitWidth} className="h-8 px-2 text-xs rounded text-slate-300 hover:text-white hover:bg-slate-700">
            Fit Width
          </button>
        </div>

        {/* Mobile zoom strip */}
        <div className="flex md:hidden items-center gap-1">
          <button type="button" onClick={zoomOut} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-medium w-8 text-center select-none">{Math.round(pdfScale * 100)}%</span>
          <button type="button" onClick={zoomIn} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={fitWidth} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center bg-[#525659] min-w-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Document
          file={fileOption}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex h-full items-center justify-center text-slate-300 text-sm">
              Loading PDF...
            </div>
          }
          className="flex flex-col items-center"
        >
          <Page
            pageNumber={pdfPage}
            // On mobile: use width-based rendering so it fills the container perfectly
            // On desktop: use scale-based rendering
            width={isMobile ? effectiveWidth : undefined}
            scale={isMobile ? undefined : pdfScale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg bg-white my-2"
          />
        </Document>
      </div>
    </div>
  );
}

export const PdfViewer = memo(PdfViewerInner);
