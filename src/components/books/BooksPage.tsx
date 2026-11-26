import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, Play, Search, X } from 'lucide-react';
import { ALGORITHM_PRESETS } from '../../engine/presets';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { useUIStore } from '../../store/uiStore';
import { navigate } from '../../utils/router';
import {
  BOOK_CATEGORIES,
  REPO_BASE_URL,
  type BookCategory,
  type CSBook,
} from '../../data/books/csBooksData';
import { useBooksCatalog } from '../../data/books/useBooksCatalog';
import { usePdfBookCover } from '../../data/books/pdfCoverCache';
import { PdfReaderModal } from './PdfReaderModal';

const WINDOW_RADIUS = 8;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function modIndex(idx: number, len: number): number {
  if (len <= 0) return 0;
  return ((idx % len) + len) % len;
}

/* ─── Realistic Bound Book Cover Component (Real PDF Cover + Hardcover Binding) ── */
const BookCoverPlate: React.FC<{
  book: CSBook;
  uid: string;
  width: number;
  height: number;
  large?: boolean;
  isActive?: boolean;
  isNearby?: boolean;
}> = ({ book, uid, width, height, large = false, isActive = false, isNearby = false }) => {
  const { coverBg, coverInk, accent } = book.theme;
  const pdfCoverSrc = usePdfBookCover(
    book,
    Boolean(large || isActive || isNearby),
    large ? 10 : isActive ? 8 : 3,
  );
  const [coverFit, setCoverFit] = useState<'cover' | 'contain'>('cover');
  const grooveX = large ? 13 : 8;
  const pad = large ? '24px 24px 20px 30px' : '14px 12px 12px 17px';

  return (
    <div
      style={{
        width,
        height,
        background: pdfCoverSrc ? '#FAF8F2' : coverBg,
        color: coverInk,
        borderRadius: large ? '3px 7px 7px 3px' : '2px 5px 5px 2px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: pad,
        boxSizing: 'border-box',
        border: '1px solid rgba(16, 18, 22, 0.24)',
        boxShadow: large
          ? '0 28px 66px rgba(16, 18, 22, 0.30), 2px 4px 0 rgba(16, 18, 22, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.28), inset -3px 0 6px rgba(0, 0, 0, 0.12)'
          : '0 22px 44px rgba(16, 18, 22, 0.26), 1px 3px 0 rgba(16, 18, 22, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.22), inset -2px 0 5px rgba(0, 0, 0, 0.10)',
      }}
    >
      {/* Actual Page 1 Cover rendered from the PDF */}
      {pdfCoverSrc && (
        <img
          src={pdfCoverSrc}
          alt={`${book.title} cover`}
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              const natRatio = img.naturalWidth / img.naturalHeight;
              const boxRatio = width / height;
              setCoverFit(natRatio > boxRatio * 1.12 ? 'contain' : 'cover');
            }
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: coverFit,
            objectPosition: 'center',
            zIndex: 1,
            display: 'block',
          }}
        />
      )}

      {/* Publisher Cloth/Paper Hardcover Fallback (when Page 1 is still streaming or offline) */}
      {!pdfCoverSrc && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: large ? '12px 12px 12px 20px' : '8px 8px 8px 14px',
              border: `1px solid ${coverInk}`,
              opacity: 0.22,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'left' }}>
            <div
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: large ? 9.5 : 7,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                opacity: 0.72,
                marginBottom: large ? 12 : 6,
                paddingBottom: large ? 8 : 4,
                borderBottom: `1px solid ${coverInk}33`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {book.category}
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: large ? 27 : 16,
                fontWeight: 600,
                lineHeight: 1.06,
                letterSpacing: '-0.02em',
                color: coverInk,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {book.title}
            </h3>
            <div
              style={{
                marginTop: large ? 10 : 6,
                width: large ? 36 : 22,
                height: 2,
                background: accent,
              }}
            />
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              minHeight: 0,
              width: '100%',
              margin: large ? '10px 0' : '6px 0',
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(250, 248, 242, 0.14)',
              border: `1px solid ${coverInk}22`,
            }}
          >
            {book.renderScene(`${uid}-c`)}
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontStyle: 'italic',
                fontSize: large ? 14 : 10,
                lineHeight: 1.25,
                opacity: 0.85,
                marginBottom: large ? 14 : 8,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {book.author !== 'Unknown' ? book.author : book.domain}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: large ? 8 : 5,
                borderTop: `1px solid ${coverInk}28`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: large ? 9 : 7,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  opacity: 0.7,
                }}
              >
                {book.sizeLabel}
              </span>
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: large ? 10.5 : 8,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: large ? '2px 7px' : '1px 4px',
                  border: `1.5px solid ${coverInk}`,
                  color: coverInk,
                }}
              >
                {book.editionBadge}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Realistic Left Spine Hinge Groove + Paper Surface Lighting */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: grooveX + 10,
          pointerEvents: 'none',
          background: `linear-gradient(90deg, rgba(0,0,0,0.22) 0px, rgba(255,255,255,0.22) 3px, rgba(0,0,0,0.16) ${grooveX}px, rgba(255,255,255,0.14) ${grooveX + 2}px, transparent ${grooveX + 9}px)`,
          zIndex: 4,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, transparent 42%, rgba(0, 0, 0, 0.12) 100%)',
          zIndex: 4,
        }}
      />
    </div>
  );
};

export const BooksPage: React.FC = () => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  const { setCode, setInput, setLanguage } = useEditorStore();
  const { reset: resetTrace } = useTraceStore();
  const { setCenterViewMode } = useUIStore();

  const { books: allBooks } = useBooksCatalog();

  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [centerSlot, setCenterSlot] = useState<number>(0);
  const [openedBook, setOpenedBook] = useState<CSBook | null>(null);
  const [readingBook, setReadingBook] = useState<CSBook | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [cursorMode, setCursorMode] = useState<'none' | 'spine' | 'cover'>('none');

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allBooks.filter((b) => {
      if (selectedCategory !== 'All' && b.domain !== selectedCategory) return false;
      if (q) {
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.folder.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.domain.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allBooks, selectedCategory, searchQuery]);

  const count = filteredBooks.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const slotElsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  const physRef = useRef({
    pos: 0,
    target: 0,
    turns: new Map<number, number>([[0, 1]]),
    hovers: new Map<number, number>(),
    hoveredSlot: null as number | null,
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    tiltX: 0,
    tiltY: 0,
    dragging: false,
    dragStartX: 0,
    dragStartTarget: 0,
    lastCenterSlot: 0,
    isMobile: false,
    bookCount: allBooks.length,
  });

  useEffect(() => {
    physRef.current.bookCount = count;
  }, [count]);

  const resetShelfPosition = useCallback(() => {
    const p = physRef.current;
    p.pos = 0;
    p.target = 0;
    p.turns = new Map([[0, 1]]);
    p.hovers = new Map();
    p.lastCenterSlot = 0;
    setCenterSlot(0);
  }, []);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      physRef.current.isMobile = mobile;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const stepBook = useCallback((delta: number) => {
    physRef.current.target = Math.round(physRef.current.target) + delta;
  }, []);

  // Single rAF spring loop over only the windowed virtual slots [-8 .. +8]
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const rawDt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const p = physRef.current;

      const posEase = 1 - Math.exp(-9.5 * rawDt);
      const turnEase = 1 - Math.exp(-10.5 * rawDt);
      const hoverEase = 1 - Math.exp(-14 * rawDt);

      p.pos = lerp(p.pos, p.target, posEase);
      const closest = Math.round(p.pos);

      if (closest !== p.lastCenterSlot) {
        p.lastCenterSlot = closest;
        setCenterSlot(closest);
      }

      const mobile = p.isMobile;
      const WS = mobile ? 46 : 64;
      const D = mobile ? 174 : 234;
      const GAP = mobile ? 4 : 6;
      const pitch = WS + GAP;
      const halfSpread = (D - WS) * 0.54 + (mobile ? 12 : 16);
      const isSettled = Math.abs(p.target - p.pos) < 0.35;

      // Update turn/hover maps cleanly for active window
      for (const s of Array.from(p.turns.keys())) {
        if (Math.abs(s - closest) > WINDOW_RADIUS + 4) {
          p.turns.delete(s);
          p.hovers.delete(s);
        }
      }

      for (let s = closest - WINDOW_RADIUS; s <= closest + WINDOW_RADIUS; s++) {
        const wantTurn = isSettled && s === closest ? 1 : 0;
        const curTurn = p.turns.get(s) ?? 0;
        p.turns.set(s, lerp(curTurn, wantTurn, turnEase));

        const wantHover = p.hoveredSlot === s && wantTurn === 0 ? 1 : 0;
        const curHover = p.hovers.get(s) ?? 0;
        p.hovers.set(s, lerp(curHover, wantHover, hoverEase));
      }

      for (let s = closest - WINDOW_RADIUS; s <= closest + WINDOW_RADIUS; s++) {
        const el = slotElsRef.current.get(s);
        if (!el) continue;

        const delta = s - p.pos;
        let push = 0;
        for (let j = closest - 2; j <= closest + 2; j++) {
          const tj = p.turns.get(j) ?? 0;
          if (tj > 0.002) {
            if (s < j) push -= halfSpread * tj;
            else if (s > j) push += halfSpread * tj;
          }
        }

        const turn = p.turns.get(s) ?? 0;
        const hov = p.hovers.get(s) ?? 0;
        const tx = delta * pitch + push;
        const ty = lerp(0, mobile ? -8 : -10, turn) + lerp(0, -14, hov);
        const tz = lerp(0, mobile ? 78 : 114, turn) + lerp(0, 14, hov);
        const ry = lerp(90, -5 + p.tiltY * 8, turn);
        const rx = lerp(0, 1.5 + p.tiltX * 5, turn);
        const rz = lerp(0, -2.5, turn);
        const scale = lerp(1, 1.035, turn);

        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, ${tz.toFixed(2)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        el.style.zIndex = String(Math.round(turn * 100 + 20 - Math.abs(delta)));
      }

      p.cursorX = lerp(p.cursorX, p.mouseX, 1 - Math.exp(-18 * rawDt));
      p.cursorY = lerp(p.cursorY, p.mouseY, 1 - Math.exp(-18 * rawDt));
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${p.cursorX.toFixed(1)}px, ${p.cursorY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const activeBook = count > 0 ? filteredBooks[modIndex(centerSlot, count)] : allBooks[0];
  const activeBookIdx = count > 0 ? modIndex(centerSlot, count) : 0;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (readingBook) {
        return;
      }
      if (openedBook) {
        if (e.key === 'Escape') setOpenedBook(null);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepBook(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBook(-1);
      } else if (e.key === 'Enter' && count > 0) {
        setOpenedBook(filteredBooks[modIndex(Math.round(physRef.current.target), count)]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readingBook, openedBook, stepBook, filteredBooks, count]);

  const handleLoadPreset = useCallback(
    (book: CSBook) => {
      if (!book.presetId) return;
      const preset = ALGORITHM_PRESETS.find((p) => p.id === book.presetId);
      if (preset) {
        const lang = preset.languages.javascript ? 'javascript' : 'python';
        const cfg = preset.languages[lang] ?? Object.values(preset.languages)[0];
        if (cfg) {
          setLanguage(lang);
          setCode(cfg.code);
          setInput(cfg.input);
          resetTrace();
        }
      }
      setOpenedBook(null);
      setCenterViewMode('ds');
      navigate('/visualizer');
    },
    [setLanguage, setCode, setInput, resetTrace, setCenterViewMode],
  );

  const WS = isMobile ? 46 : 64;
  const D = isMobile ? 174 : 234;
  const H = isMobile ? 256 : 344;

  const paperGround = isLight ? '#EFECE6' : '#0a0b0d';
  const cobalt = '#1D4ED8';
  const ink = isLight ? '#181A1F' : '#F3EFE6';
  const tabBorder = isLight ? 'rgba(16, 18, 22, 0.72)' : 'rgba(243, 239, 230, 0.45)';

  // Compute rendered virtual slots
  const visibleSlots = useMemo(() => {
    if (count === 0) return [];
    if (count === 1) return [centerSlot];
    const list: number[] = [];
    for (let s = centerSlot - WINDOW_RADIUS; s <= centerSlot + WINDOW_RADIUS; s++) {
      list.push(s);
    }
    return list;
  }, [centerSlot, count]);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 62px)',
        marginTop: 62,
        background: paperGround,
        color: ink,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        padding: isMobile ? '18px 14px 16px' : '24px 36px 22px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Rectangular Domain Tabs + Clean Search Field ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          zIndex: 10,
        }}
      >
        <div
          role="tablist"
          aria-label="CS Library Categories"
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            border: `1px solid ${tabBorder}`,
            background: paperGround,
            maxWidth: '100%',
          }}
        >
          {BOOK_CATEGORIES.map((cat, idx) => {
            const isActive = cat === selectedCategory;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setSelectedCategory(cat);
                  resetShelfPosition();
                }}
                style={{
                  padding: isMobile ? '5px 8px' : '5.5px 12px',
                  border: 'none',
                  borderRight: idx < BOOK_CATEGORIES.length - 1 ? `1px solid ${tabBorder}` : 'none',
                  background: isActive ? cobalt : 'transparent',
                  color: isActive ? '#FFFFFF' : ink,
                  fontFamily: "'Inter Tight', 'Inter', sans-serif",
                  fontSize: isMobile ? 10 : 11,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Minimal hairline search bar */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: `1px solid ${isLight ? 'rgba(16,18,22,0.2)' : 'rgba(247,245,239,0.2)'}`,
            paddingBottom: 3,
            width: isMobile ? '85%' : 300,
          }}
        >
          <Search size={12} style={{ opacity: 0.55 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetShelfPosition();
            }}
            placeholder={`Search ${allBooks.length} CS & programming books...`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: ink,
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                resetShelfPosition();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: ink,
                opacity: 0.6,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Center 3D Endless Library Shelf ── */}
      {count === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.65 }}>
          No books matched “{searchQuery}”.
        </div>
      ) : (
        <div
          ref={stageRef}
          onMouseMove={(e) => {
            const rect = stageRef.current?.getBoundingClientRect();
            if (!rect) return;
            const p = physRef.current;
            p.mouseX = e.clientX;
            p.mouseY = e.clientY;
            p.tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            p.tiltX = -(((e.clientY - rect.top) / rect.height - 0.5) * 2);
          }}
          onMouseLeave={() => {
            setCursorMode('none');
            physRef.current.hoveredSlot = null;
            physRef.current.tiltX = 0;
            physRef.current.tiltY = 0;
            physRef.current.dragging = false;
          }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            const p = physRef.current;
            p.dragging = true;
            p.dragStartX = e.clientX;
            p.dragStartTarget = p.target;
          }}
          onPointerMove={(e) => {
            const p = physRef.current;
            if (!p.dragging) return;
            const dx = e.clientX - p.dragStartX;
            p.target = p.dragStartTarget - dx / (isMobile ? 54 : 68);
          }}
          onPointerUp={() => {
            const p = physRef.current;
            if (!p.dragging) return;
            p.dragging = false;
            p.target = Math.round(p.target);
          }}
          onWheel={(e) => {
            e.preventDefault();
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            physRef.current.target += delta * 0.008;
          }}
          style={{
            position: 'relative',
            height: isMobile ? 330 : 415,
            margin: '0 -36px',
            perspective: '1600px',
            perspectiveOrigin: '50% 48%',
            userSelect: 'none',
            cursor: cursorMode !== 'none' && !isMobile ? 'none' : 'grab',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 0,
              height: 0,
              transformStyle: 'preserve-3d',
            }}
          >
            {visibleSlots.map((slotIdx) => {
              const book = filteredBooks[modIndex(slotIdx, count)];
              const isActiveSlot = slotIdx === centerSlot;
              const initDelta = slotIdx - centerSlot;
              const initPush = initDelta < 0 ? -76 : initDelta > 0 ? 76 : 0;
              const initTx = initDelta * (WS + (isMobile ? 4 : 6)) + initPush;

              return (
                <div
                  key={`${selectedCategory}-${searchQuery}-${slotIdx}`}
                  ref={(el) => {
                    if (el) slotElsRef.current.set(slotIdx, el);
                    else slotElsRef.current.delete(slotIdx);
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                    transformStyle: 'preserve-3d',
                    transform: `translate3d(${initTx}px, ${isActiveSlot ? -10 : 0}px, ${isActiveSlot ? 114 : 0}px) rotateY(${isActiveSlot ? -5 : 90}deg)`,
                  }}
                >
                  {/* FRONT COVER PAGE FACE */}
                  <div
                    role="button"
                    tabIndex={isActiveSlot ? 0 : -1}
                    aria-label={`Open ${book.title}`}
                    onMouseEnter={() => {
                      if (isActiveSlot) setCursorMode('cover');
                    }}
                    onMouseLeave={() => setCursorMode('none')}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isActiveSlot && Math.abs(physRef.current.pos - physRef.current.target) < 0.25) {
                        setOpenedBook(book);
                      } else {
                        physRef.current.target = slotIdx;
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: D,
                      height: H,
                      transform: `translate(-50%, -50%) translateZ(${WS / 2}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <BookCoverPlate
                      book={book}
                      uid={`slot-${slotIdx}`}
                      width={D}
                      height={H}
                      isActive={isActiveSlot}
                      isNearby={Math.abs(slotIdx - centerSlot) <= 1}
                    />

                    {isActiveSlot && (
                      <button
                        type="button"
                        aria-label={`Open cover details for ${book.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenedBook(book);
                        }}
                        style={{
                          position: 'absolute',
                          left: -16,
                          bottom: 24,
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          border: `1.5px solid ${cobalt}`,
                          color: cobalt,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.22)',
                          cursor: 'pointer',
                          zIndex: 8,
                        }}
                      >
                        <Play size={13} fill={cobalt} style={{ marginLeft: 2 }} />
                      </button>
                    )}
                  </div>

                  {/* STANDING SPINE FACE */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${book.title}`}
                    onMouseEnter={() => {
                      physRef.current.hoveredSlot = slotIdx;
                      setCursorMode('spine');
                    }}
                    onMouseLeave={() => {
                      physRef.current.hoveredSlot = null;
                      setCursorMode('none');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      physRef.current.target = slotIdx;
                    }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: WS,
                      height: H,
                      transform: `translate(-50%, -50%) translateX(${-D / 2}px) rotateY(-90deg)`,
                      backfaceVisibility: 'hidden',
                      background: book.theme.spineBg,
                      color: book.theme.spineText,
                      border: '1px solid rgba(16, 18, 22, 0.22)',
                      borderRadius: 3,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: 10,
                      boxShadow:
                        'inset 4px 0 10px rgba(255,255,255,0.12), inset -4px 0 12px rgba(0,0,0,0.18), 0 10px 22px rgba(0,0,0,0.22)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: isMobile ? 64 : 84,
                        overflow: 'hidden',
                        borderBottom: '1px solid rgba(0,0,0,0.12)',
                        flexShrink: 0,
                      }}
                    >
                      {book.renderScene(`sp-${slotIdx}`)}
                    </div>

                    <div
                      style={{
                        writingMode: 'vertical-rl',
                        fontFamily: "'Newsreader', Georgia, serif",
                        fontSize: isMobile ? 12 : 14,
                        fontWeight: 500,
                        letterSpacing: '0.03em',
                        color: book.theme.spineText,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxHeight: H - 154,
                      }}
                    >
                      {book.shortTitle}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: 9.5,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          padding: '1px 5px',
                          border: `1.5px solid ${book.theme.spineText}`,
                          opacity: 0.9,
                        }}
                      >
                        {book.editionBadge}
                      </span>
                    </div>
                  </div>

                  {/* PAGE BLOCK FORE-EDGE */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: WS,
                      height: H,
                      transform: `translate(-50%, -50%) translateX(${D / 2}px) rotateY(90deg)`,
                      backfaceVisibility: 'hidden',
                      background:
                        'repeating-linear-gradient(90deg, #EDE7D9 0px, #EDE7D9 2px, #D7CEB8 2px, #D7CEB8 3px)',
                      border: '1px solid rgba(16, 18, 22, 0.16)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Centered Caption + Edge Arrows Below Shelf ── */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1440,
            margin: '0 auto',
            paddingBottom: 14,
          }}
        >
          <button
            type="button"
            aria-label="Previous book"
            onClick={() => stepBook(-1)}
            disabled={count <= 1}
            style={{
              background: 'none',
              border: 'none',
              color: ink,
              cursor: count <= 1 ? 'default' : 'pointer',
              padding: 8,
              opacity: count <= 1 ? 0.25 : 0.78,
            }}
          >
            <ArrowLeft size={16} />
          </button>

          {count > 0 && (
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0, padding: '0 12px' }}>
              <div style={{ overflow: 'hidden' }}>
                <h1
                  key={`btitle-${activeBook.id}`}
                  style={{
                    margin: 0,
                    fontFamily: "'Newsreader', Georgia, serif",
                    fontSize: 'clamp(1.45rem, 2.4vw, 2rem)',
                    fontWeight: 400,
                    lineHeight: 1.15,
                    color: ink,
                    animation: 'lsBookMaskUp 0.42s cubic-bezier(0.22, 1, 0.36, 1) both',
                  }}
                >
                  {activeBook.title}
                </h1>
              </div>
              <div style={{ overflow: 'hidden', marginTop: 4 }}>
                <div
                  key={`bmeta-${activeBook.id}`}
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: isLight ? cobalt : '#60A5FA',
                    animation: 'lsBookMaskUp 0.48s cubic-bezier(0.22, 1, 0.36, 1) both',
                  }}
                >
                  {activeBook.author} · {activeBook.folder}
                </div>
              </div>
              <div style={{ overflow: 'hidden', marginTop: 2 }}>
                <div
                  key={`byear-${activeBook.id}`}
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: 11,
                    color: ink,
                    opacity: 0.7,
                    animation: 'lsBookMaskUp 0.54s cubic-bezier(0.22, 1, 0.36, 1) both',
                  }}
                >
                  {activeBook.sizeLabel} PDF · {activeBookIdx + 1} of {count}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            aria-label="Next book"
            onClick={() => stepBook(1)}
            disabled={count <= 1}
            style={{
              background: 'none',
              border: 'none',
              color: ink,
              cursor: count <= 1 ? 'default' : 'pointer',
              padding: 8,
              opacity: count <= 1 ? 0.25 : 0.78,
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Bottom hairline footer matching reference */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0.6,
            paddingTop: 10,
            borderTop: `1px solid ${isLight ? 'rgba(16,18,22,0.08)' : 'rgba(247,245,239,0.08)'}`,
          }}
        >
          <span>CS &amp; PROGRAMMING BOOKS · {allBooks.length} VOLUMES</span>
          <a
            href={REPO_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            GITHUB.COM/IAMMRADUL/CS-AND-PROGRAMMING-BOOKS ↗
          </a>
        </div>
      </div>

      {/* ── Custom Cobalt OPEN Ring Cursor ── */}
      {!isMobile && !openedBook && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 90,
            width: cursorMode === 'cover' ? 76 : cursorMode === 'spine' ? 30 : 0,
            height: cursorMode === 'cover' ? 76 : cursorMode === 'spine' ? 30 : 0,
            borderRadius: '50%',
            background: cursorMode === 'cover' ? cobalt : 'transparent',
            border: cursorMode === 'spine' ? `1.5px solid ${cobalt}` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.12em',
            transform: 'translate3d(-999px, -999px, 0)',
            transition: 'width 0.2s ease, height 0.2s ease, background 0.2s ease',
            overflow: 'hidden',
          }}
        >
          {cursorMode === 'cover' && 'OPEN'}
        </div>
      )}

      {/* ── Full-Screen Book Cover Detail View (matching Screenshot 2) ── */}
      {openedBook && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openedBook.title}
          onClick={() => setOpenedBook(null)}
          style={{
            position: 'fixed',
            top: 62,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 115,
            background: paperGround,
            color: ink,
            overflowY: 'auto',
            animation: 'lsBookSheetExpand 0.42s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 1200,
              minHeight: 'calc(100vh - 62px)',
              margin: '0 auto',
              padding: isMobile ? '24px 20px 44px' : '40px 48px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isLight ? cobalt : '#60A5FA',
                }}
              >
                {openedBook.folder}
              </span>
              <button
                type="button"
                aria-label="Back to library shelf"
                onClick={() => setOpenedBook(null)}
                style={{
                  position: 'absolute',
                  right: 0,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: `1px solid ${isLight ? 'rgba(16,18,22,0.22)' : 'rgba(247,245,239,0.22)'}`,
                  background: 'transparent',
                  color: ink,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr',
                gap: isMobile ? 32 : 56,
                alignItems: 'center',
                margin: 'auto 0',
              }}
            >
              <div style={{ maxWidth: 480 }}>
                <div style={{ overflow: 'hidden', marginBottom: 10 }}>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isLight ? cobalt : '#60A5FA',
                      animation: 'lsBookMaskUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
                    }}
                  >
                    {openedBook.domain} · {openedBook.sizeLabel} PDF
                  </div>
                </div>

                <div style={{ overflow: 'hidden' }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: "'Newsreader', Georgia, serif",
                      fontSize: 'clamp(2.1rem, 4vw, 3.35rem)',
                      fontWeight: 400,
                      lineHeight: 0.98,
                      letterSpacing: '-0.025em',
                      color: ink,
                      animation: 'lsBookMaskUp 0.46s cubic-bezier(0.22, 1, 0.36, 1) both',
                    }}
                  >
                    {openedBook.title}
                  </h2>
                </div>

                <div style={{ overflow: 'hidden', marginTop: 18, marginBottom: 18 }}>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      opacity: 0.56,
                      animation: 'lsBookMaskUp 0.52s cubic-bezier(0.22, 1, 0.36, 1) both',
                    }}
                  >
                    VOLUME #{openedBook.catalogNo} / {openedBook.folder}
                  </div>
                </div>

                <p
                  style={{
                    margin: '0 0 18px',
                    fontFamily: "'Newsreader', Georgia, serif",
                    fontSize: 17.5,
                    lineHeight: 1.56,
                    color: ink,
                    opacity: 0.9,
                  }}
                >
                  {openedBook.summary}
                </p>

                <p
                  style={{
                    margin: '0 0 24px',
                    fontFamily: "'Newsreader', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: 14.5,
                    opacity: 0.65,
                  }}
                >
                  Authored / Curated by {openedBook.author}.
                </p>

                {/* Primary Cobalt-Bordered Book Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setReadingBook(openedBook)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 22px',
                      border: `1px solid ${isLight ? cobalt : '#60A5FA'}`,
                      background: 'transparent',
                      color: isLight ? cobalt : '#60A5FA',
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    <span>READ PDF</span>
                    <BookOpen size={12} />
                  </button>

                  <a
                    href={openedBook.downloadUrl}
                    download={`${openedBook.title}.pdf`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '12px 18px',
                      border: `1px solid ${isLight ? 'rgba(16,18,22,0.22)' : 'rgba(247,245,239,0.22)'}`,
                      background: 'transparent',
                      color: ink,
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={12} />
                    <span>DOWNLOAD</span>
                  </a>

                  {openedBook.presetId && (
                    <button
                      type="button"
                      onClick={() => handleLoadPreset(openedBook)}
                      style={{
                        padding: '12px 16px',
                        border: 'none',
                        background: 'var(--accent)',
                        color: '#FFFFFF',
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      VISUALIZE: {openedBook.presetLabel}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Large Illustrated Screen-Print Cover Page Poster */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BookCoverPlate
                  book={openedBook}
                  uid={`detail-${openedBook.id}`}
                  width={isMobile ? 248 : 340}
                  height={isMobile ? 360 : 492}
                  isActive
                  large
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── In-Site PDF.js Reader Modal ── */}
      <PdfReaderModal
        book={readingBook}
        isLight={isLight}
        isMobile={isMobile}
        onClose={() => setReadingBook(null)}
      />

      <style>{`
        @keyframes lsBookMaskUp {
          from { transform: translateY(105%); }
          to { transform: translateY(0%); }
        }
        @keyframes lsBookSheetExpand {
          from {
            clip-path: inset(12% 16% 12% 16%);
            transform: scale(0.96);
          }
          to {
            clip-path: inset(0% 0% 0% 0%);
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
