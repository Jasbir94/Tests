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

  // zoom is a multiplier on top of fit-width (1.0 = fit width exactly)
  const [zoom, setZoom] = useState(1.0);

  const pdfPage = useAttemptStore((s) => s.pdfPage);
  const setPdfPage = useAttemptStore((s) => s.setPdfPage);
  const setPdfNumPages = useAttemptStore((s) => s.setPdfNumPages);

  // Always measure container width via ResizeObserver
  useEffect(() => {
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

  // Effective render width = container width × zoom multiplier
  // This means the PDF is always at most as wide as the container at zoom=1.0
  const effectiveWidth = useMemo(() => {
    if (containerWidth > 0) {
      return Math.floor(containerWidth * zoom) - 8; // 4px padding each side
    }
    return undefined;
  }, [containerWidth, zoom]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfNumPages(numPages);
  }, [setPdfNumPages]);

  const zoomIn  = useCallback(() => setZoom(z => Math.min(+(z + 0.15).toFixed(2), 2.5)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(+(z - 0.15).toFixed(2), 0.4)), []);
  const fitWidth = useCallback(() => setZoom(1.0), []);

  const prevPage = useCallback(() => setPdfPage(Math.max(pdfPage - 1, 1)), [pdfPage, setPdfPage]);
  const nextPage = useCallback(() => setPdfPage(Math.min(pdfPage + 1, numPages || 1)), [pdfPage, numPages, setPdfPage]);

  const fileOption = useMemo(() => pdfUrl, [pdfUrl]);

  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <div className="flex flex-col h-full bg-[#404040] min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1.5 md:px-3 md:py-2 bg-[#1e1e20] text-slate-200 shadow-md z-10 shrink-0">
        {/* Page Navigation */}
        <div className="flex items-center gap-1 md:gap-2">
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

        {/* Zoom Controls — same on mobile and desktop */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={zoomOut} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700" title="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] md:text-xs font-medium w-9 text-center select-none tabular-nums">{zoomLabel}</span>
          <button type="button" onClick={zoomIn} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700" title="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={fitWidth} className="h-8 w-8 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700" title="Fit to width">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Scroll Area — containerRef measures available width */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center bg-[#525659] min-w-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Document
          file={fileOption}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex h-48 items-center justify-center text-slate-300 text-sm">
              Loading PDF...
            </div>
          }
          className="flex flex-col items-center"
        >
          {/* 
            Always use width-based rendering.
            At zoom=1.0 the page fits perfectly in the container — zero horizontal overflow.
            Zooming in (>1.0) makes it wider and enables horizontal scroll.
          */}
          <Page
            pageNumber={pdfPage}
            width={effectiveWidth}
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
