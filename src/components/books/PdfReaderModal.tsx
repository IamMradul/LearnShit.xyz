import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { CSBook } from '../../data/books/csBooksData';
import { bookStorage } from '../../data/books/bookStorage';

interface PdfReaderModalProps {
  book: CSBook | null;
  isLight: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.6;
const ZOOM_STEP = 0.2;

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  defaultSize: { width: number; height: number };
  shouldRender: boolean;
  hairline: string;
  paperSurface: string;
  ink: string;
  registerPageEl: (pageNumber: number, el: HTMLDivElement | null) => void;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = React.memo(
  ({
    pdfDoc,
    pageNumber,
    scale,
    defaultSize,
    shouldRender,
    hairline,
    paperSurface,
    ink,
    registerPageEl,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);
    const [pageDims, setPageDims] = useState(defaultSize);
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
      if (!shouldRender) {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Ignore cancel error
          }
          renderTaskRef.current = null;
        }
        return;
      }

      let cancelled = false;
      setIsRendering(true);

      async function renderThisPage() {
        try {
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
          }

          const page = await pdfDoc.getPage(pageNumber);
          if (cancelled || !canvasRef.current) return;

          const baseVp = page.getViewport({ scale: 1 });
          setPageDims((prev) =>
            Math.abs(prev.width - baseVp.width) > 1 || Math.abs(prev.height - baseVp.height) > 1
              ? { width: baseVp.width, height: baseVp.height }
              : prev,
          );

          const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
          const renderVp = page.getViewport({ scale: scale * dpr });
          const displayVp = page.getViewport({ scale });

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = Math.max(1, Math.floor(renderVp.width));
          canvas.height = Math.max(1, Math.floor(renderVp.height));
          canvas.style.width = `${Math.floor(displayVp.width)}px`;
          canvas.style.height = `${Math.floor(displayVp.height)}px`;

          const task = page.render({
            canvas,
            canvasContext: ctx,
            viewport: renderVp,
          });
          renderTaskRef.current = task;

          await task.promise;
          if (!cancelled) {
            setIsRendering(false);
          }
        } catch (err) {
          const name = err && typeof err === 'object' ? (err as { name?: string }).name : '';
          if (name === 'RenderingCancelledException' || cancelled) return;
          setIsRendering(false);
        }
      }

      renderThisPage();

      return () => {
        cancelled = true;
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Ignore cancel error
          }
        }
      };
    }, [pdfDoc, pageNumber, scale, shouldRender]);

    const displayW = Math.floor(pageDims.width * scale);
    const displayH = Math.floor(pageDims.height * scale);

    return (
      <div
        ref={(el) => registerPageEl(pageNumber, el)}
        data-page-number={pageNumber}
        style={{
          width: displayW,
          height: displayH,
          position: 'relative',
          background: '#FFFFFF',
          boxShadow: '0 14px 40px rgba(16, 18, 22, 0.2)',
          border: `1px solid ${hairline}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {shouldRender ? (
          <canvas
            ref={canvasRef}
            style={{ display: 'block', width: displayW, height: displayH }}
          />
        ) : (
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Page {pageNumber}
          </span>
        )}

        {shouldRender && isRendering && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '4px 8px',
              background: paperSurface,
              border: `1px solid ${hairline}`,
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 10,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: ink,
            }}
          >
            Rendering…
          </div>
        )}
      </div>
    );
  },
);

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  book,
  isLight,
  isMobile,
  onClose,
}) => {
  const modalRootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageElsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const isEditingPageRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [defaultPageSize, setDefaultPageSize] = useState({ width: 612, height: 792 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoomMode, setZoomMode] = useState<'fit' | number>('fit');
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(900);
  const [activeTransport, setActiveTransport] = useState<'range-proxy' | 'direct'>('range-proxy');

  const paperGround = isLight ? '#EFECE6' : '#0a0b0d';
  const paperSurface = isLight ? '#F7F5EF' : '#12141A';
  const cobalt = isLight ? '#1D4ED8' : '#60A5FA';
  const ink = isLight ? '#181A1F' : '#F3EFE6';
  const hairline = isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.14)';

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const updateWidth = () => {
      if (el.clientWidth > 0) setViewportWidth(el.clientWidth);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [book]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Load PDF document lazily with PDF.js using HTTP Range chunks + direct fallback
  useEffect(() => {
    if (!book) {
      setPdfDoc(null);
      setNumPages(0);
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    let activeDoc: PDFDocumentProxy | null = null;
    let currentTask: { destroy: () => Promise<void> } | null = null;

    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(1);
    setPageInput('1');
    setZoomMode('fit');
    setIsLoading(true);
    setLoadProgress(null);
    setErrorMessage(null);
    pageElsRef.current.clear();

    async function loadPdf() {
      const targetBook = book!;
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

      const primaryUrl = targetBook.readerUrl || bookStorage.getReaderPdfUrl(targetBook);
      const fallbackUrl =
        targetBook.pdfUrl || bookStorage.getDirectPdfUrl(targetBook.repoPath || targetBook.path);

      const attemptLoad = async (
        url: string,
        useRange: boolean,
        transportLabel: 'range-proxy' | 'direct',
      ) => {
        const task = pdfjsLib.getDocument({
          url,
          rangeChunkSize: 65536,
          disableAutoFetch: useRange,
          disableStream: false,
          disableRange: !useRange,
          withCredentials: false,
        });
        currentTask = task;

        task.onProgress = (progress: { loaded: number; total: number }) => {
          if (cancelled) return;
          if (progress.total > 0) {
            setLoadProgress(Math.min(100, Math.round((progress.loaded / progress.total) * 100)));
          }
        };

        const doc = await task.promise;
        if (!cancelled) {
          setActiveTransport(transportLabel);
        }
        return doc;
      };

      try {
        try {
          const isRangeProxy = primaryUrl.startsWith('/api/');
          activeDoc = await attemptLoad(
            primaryUrl,
            isRangeProxy,
            isRangeProxy ? 'range-proxy' : 'direct',
          );
        } catch (primaryErr) {
          if (cancelled) return;
          if (fallbackUrl && fallbackUrl !== primaryUrl) {
            activeDoc = await attemptLoad(fallbackUrl, false, 'direct');
          } else {
            throw primaryErr;
          }
        }

        if (cancelled) {
          await activeDoc?.cleanup();
          await currentTask?.destroy();
          return;
        }

        // Measure Page 1 baseline size so all continuous scroll page slots align cleanly
        try {
          const firstPage = await activeDoc.getPage(1);
          if (!cancelled) {
            const vp = firstPage.getViewport({ scale: 1 });
            setDefaultPageSize({ width: vp.width, height: vp.height });
          }
        } catch {
          // Keep default Letter dimensions if Page 1 pre-measure fails
        }

        if (cancelled) return;
        setPdfDoc(activeDoc);
        setNumPages(activeDoc.numPages);
        setCurrentPage(1);
        setPageInput('1');
        setIsLoading(false);
        viewportRef.current?.scrollTo({ top: 0 });
      } catch (err) {
        if (cancelled) return;
        const rawMsg = err instanceof Error ? err.message : String(err);
        const friendly =
          /404|MissingPDFException/i.test(rawMsg)
            ? 'This PDF file could not be found in the repository (404). It may have been removed or moved.'
            : /InvalidPDFException/i.test(rawMsg)
              ? 'The retrieved file does not appear to be a valid PDF document.'
              : `Failed to load PDF stream (${rawMsg}).`;
        setErrorMessage(friendly);
        setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      if (activeDoc) {
        activeDoc.cleanup().catch(() => {});
      }
      if (currentTask) {
        currentTask.destroy().catch(() => {});
      }
    };
  }, [book, reloadNonce]);

  const effectiveScale = useMemo(() => {
    const horizontalPadding = isMobile ? 20 : 64;
    const availableW = Math.max(260, viewportWidth - horizontalPadding);
    const fitScale = Math.min(2.2, Math.max(0.45, availableW / defaultPageSize.width));
    return zoomMode === 'fit' ? fitScale : zoomMode;
  }, [zoomMode, viewportWidth, defaultPageSize.width, isMobile]);

  const registerPageEl = useCallback((pageNumber: number, el: HTMLDivElement | null) => {
    if (el) pageElsRef.current.set(pageNumber, el);
    else pageElsRef.current.delete(pageNumber);
  }, []);

  // Automatically update active page number as the user scrolls continuously down/up
  const handleViewportScroll = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const vp = viewportRef.current;
      if (!vp || pageElsRef.current.size === 0) return;

      const focusY = vp.scrollTop + Math.min(vp.clientHeight * 0.35, 220);
      let bestPage = 1;
      let bestDist = Infinity;

      for (const [pageNo, el] of pageElsRef.current.entries()) {
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (focusY >= top && focusY <= bottom) {
          bestPage = pageNo;
          break;
        }
        const dist = Math.min(Math.abs(focusY - top), Math.abs(focusY - bottom));
        if (dist < bestDist) {
          bestDist = dist;
          bestPage = pageNo;
        }
      }

      setCurrentPage((prev) => {
        if (prev !== bestPage && !isEditingPageRef.current) {
          setPageInput(String(bestPage));
        }
        return bestPage;
      });
    });
  }, []);

  const goToPage = useCallback(
    (nextPage: number) => {
      if (numPages <= 0) return;
      const clamped = Math.max(1, Math.min(numPages, Math.round(nextPage)));
      setCurrentPage(clamped);
      setPageInput(String(clamped));

      const targetEl = pageElsRef.current.get(clamped);
      const vp = viewportRef.current;
      if (targetEl && vp) {
        vp.scrollTo({
          top: Math.max(0, targetEl.offsetTop - (isMobile ? 10 : 18)),
          behavior: 'smooth',
        });
      }
    },
    [numPages, isMobile],
  );

  const handleZoomIn = useCallback(() => {
    setZoomMode((prev) => {
      const base = prev === 'fit' ? effectiveScale : prev;
      return Math.min(MAX_ZOOM, Number((base + ZOOM_STEP).toFixed(2)));
    });
  }, [effectiveScale]);

  const handleZoomOut = useCallback(() => {
    setZoomMode((prev) => {
      const base = prev === 'fit' ? effectiveScale : prev;
      return Math.max(MIN_ZOOM, Number((base - ZOOM_STEP).toFixed(2)));
    });
  }, [effectiveScale]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && modalRootRef.current?.requestFullscreen) {
        await modalRootRef.current.requestFullscreen();
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen rejection cleanly
    }
  }, []);

  useEffect(() => {
    if (!book) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomMode('fit');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [book, currentPage, goToPage, handleZoomIn, handleZoomOut, onClose]);

  if (!book) return null;

  const downloadHref = book.downloadUrl || bookStorage.getDownloadPdfUrl(book);
  const directFallbackUrl = book.pdfUrl || bookStorage.getDirectPdfUrl(book.repoPath || book.path);
  const zoomPercent = Math.round(effectiveScale * 100);

  return (
    <div
      ref={modalRootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`PDF Reader: ${book.title}`}
      style={{
        position: 'fixed',
        top: isFullscreen ? 0 : 62,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 130,
        background: paperGround,
        color: ink,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Reader Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: isMobile ? '10px 12px' : '10px 24px',
          borderBottom: `1px solid ${hairline}`,
          background: paperSurface,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close PDF reader"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              border: `1px solid ${hairline}`,
              background: 'transparent',
              color: ink,
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={13} />
            {!isMobile && <span>Back</span>}
          </button>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: isMobile ? 14 : 16,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {book.title}
            </div>
            <div
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.65,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {book.category} · {book.sizeLabel} · Updated {book.lastUpdated}
              {!isMobile && activeTransport === 'range-proxy' ? ' · Range Stream' : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Page Navigation */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: `1px solid ${hairline}`,
              background: paperGround,
            }}
          >
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || numPages === 0}
              aria-label="Previous page"
              style={{
                padding: '6px 8px',
                border: 'none',
                borderRight: `1px solid ${hairline}`,
                background: 'transparent',
                color: ink,
                opacity: currentPage <= 1 || numPages === 0 ? 0.35 : 0.9,
                cursor: currentPage <= 1 || numPages === 0 ? 'default' : 'pointer',
              }}
            >
              <ChevronLeft size={13} />
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                isEditingPageRef.current = false;
                const parsed = parseInt(pageInput, 10);
                if (!Number.isNaN(parsed)) goToPage(parsed);
                else setPageInput(String(currentPage));
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 8px' }}
            >
              <input
                type="text"
                inputMode="numeric"
                aria-label="Current page number"
                value={pageInput}
                onFocus={() => {
                  isEditingPageRef.current = true;
                }}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => {
                  isEditingPageRef.current = false;
                  const parsed = parseInt(pageInput, 10);
                  if (!Number.isNaN(parsed)) goToPage(parsed);
                  else setPageInput(String(currentPage));
                }}
                disabled={numPages === 0}
                style={{
                  width: 34,
                  textAlign: 'center',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: ink,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 10.5,
                  opacity: 0.65,
                }}
              >
                / {numPages || '–'}
              </span>
            </form>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={numPages === 0 || currentPage >= numPages}
              aria-label="Next page"
              style={{
                padding: '6px 8px',
                border: 'none',
                borderLeft: `1px solid ${hairline}`,
                background: 'transparent',
                color: ink,
                opacity: numPages === 0 || currentPage >= numPages ? 0.35 : 0.9,
                cursor: numPages === 0 || currentPage >= numPages ? 'default' : 'pointer',
              }}
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Zoom Controls */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: `1px solid ${hairline}`,
              background: paperGround,
            }}
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={numPages === 0}
              aria-label="Zoom out"
              style={{
                padding: '6px 8px',
                border: 'none',
                borderRight: `1px solid ${hairline}`,
                background: 'transparent',
                color: ink,
                cursor: 'pointer',
              }}
            >
              <ZoomOut size={13} />
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('fit')}
              title="Reset zoom to fit width"
              style={{
                padding: '6px 9px',
                border: 'none',
                background: 'transparent',
                color: zoomMode === 'fit' ? cobalt : ink,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {zoomMode === 'fit' ? 'FIT' : `${zoomPercent}%`}
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={numPages === 0}
              aria-label="Zoom in"
              style={{
                padding: '6px 8px',
                border: 'none',
                borderLeft: `1px solid ${hairline}`,
                background: 'transparent',
                color: ink,
                cursor: 'pointer',
              }}
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Download + Fullscreen + Close */}
          <a
            href={downloadHref}
            download={`${book.title}.pdf`}
            aria-label={`Download ${book.title} PDF`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 11px',
              border: `1px solid ${cobalt}`,
              color: cobalt,
              textDecoration: 'none',
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <Download size={12} />
            {!isMobile && <span>Download</span>}
          </a>

          {!isMobile && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{
                padding: '6px 8px',
                border: `1px solid ${hairline}`,
                background: 'transparent',
                color: ink,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close reader"
            style={{
              padding: '6px 8px',
              border: `1px solid ${hairline}`,
              background: 'transparent',
              color: ink,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Continuous Scrollable PDF Page Stack */}
      <div
        ref={viewportRef}
        onScroll={handleViewportScroll}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isLoading || errorMessage ? 'center' : 'flex-start',
          gap: isMobile ? 12 : 20,
          padding: isMobile ? '12px 8px 32px' : '24px 28px 48px',
          position: 'relative',
        }}
      >
        {isLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              textAlign: 'center',
              padding: 24,
            }}
          >
            <Loader2 size={24} className="animate-spin" style={{ color: cobalt }} />
            <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 18 }}>
              Loading {book.title}…
            </div>
            <div
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.65,
              }}
            >
              {loadProgress !== null
                ? `Streaming PDF · ${loadProgress}% (${book.sizeLabel})`
                : `Fetching PDF header (${book.sizeLabel})`}
            </div>
          </div>
        )}

        {errorMessage && !isLoading && (
          <div
            style={{
              maxWidth: 480,
              padding: 28,
              border: `1px solid ${hairline}`,
              background: paperSurface,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 20 }}>
              Unable to Open PDF Inline
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, opacity: 0.78 }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setReloadNonce((n) => n + 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  border: `1px solid ${cobalt}`,
                  background: 'transparent',
                  color: cobalt,
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                Retry
              </button>
              <a
                href={directFallbackUrl}
                download={`${book.title}.pdf`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  border: `1px solid ${hairline}`,
                  color: ink,
                  textDecoration: 'none',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <Download size={12} />
                Download PDF
              </a>
            </div>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          pdfDoc &&
          Array.from({ length: numPages }, (_, idx) => {
            const pageNumber = idx + 1;
            // Render pages in a rolling window around the visible scroll position
            const shouldRender = pageNumber >= currentPage - 2 && pageNumber <= currentPage + 3;
            return (
              <PdfPageCanvas
                key={pageNumber}
                pdfDoc={pdfDoc}
                pageNumber={pageNumber}
                scale={effectiveScale}
                defaultSize={defaultPageSize}
                shouldRender={shouldRender}
                hairline={hairline}
                paperSurface={paperSurface}
                ink={ink}
                registerPageEl={registerPageEl}
              />
            );
          })}
      </div>
    </div>
  );
};
