import React from 'react';
import {
  BOOKS_CATALOG,
  BOOK_CATEGORIES,
  REPO_BASE_URL,
  buildGithubBlobUrl,
  buildGithubRawUrl,
  type BookCatalogEntry,
  type BookCategory,
} from './booksCatalog';
import { bookStorage } from './bookStorage';

export { BOOK_CATEGORIES, BOOKS_CATALOG, REPO_BASE_URL, buildGithubBlobUrl, buildGithubRawUrl };
export type { BookCategory };

export interface BookCardPalette {
  coverBg: string;
  coverInk: string;
  accent: string;
  secondary: string;
  spineBg: string;
  spineText: string;
}

export interface CSBook extends BookCatalogEntry {
  githubUrl: string;
  downloadUrl: string;
  readerUrl: string;
  theme: BookCardPalette;
  renderScene: (uid: string) => React.ReactNode;
}

const PALETTES: BookCardPalette[] = [
  { coverBg: '#EDE5D2', coverInk: '#1A1B1E', accent: '#C9442E', secondary: '#1D4ED8', spineBg: '#EAE1CE', spineText: '#1A1B1E' },
  { coverBg: '#193B85', coverInk: '#EAE6DC', accent: '#F5EFE0', secondary: '#93C5FD', spineBg: '#183A84', spineText: '#EFEAE0' },
  { coverBg: '#E6DDCB', coverInk: '#1A1815', accent: '#D6523A', secondary: '#1D4ED8', spineBg: '#E3D9C6', spineText: '#1A1815' },
  { coverBg: '#232022', coverInk: '#F0ECE2', accent: '#E04F33', secondary: '#9CA3AF', spineBg: '#221F20', spineText: '#EFEBE0' },
  { coverBg: '#23594D', coverInk: '#F3EFE4', accent: '#E8A848', secondary: '#D6523A', spineBg: '#215449', spineText: '#F2EDE2' },
  { coverBg: '#E4DEC9', coverInk: '#1A1D22', accent: '#1D4ED8', secondary: '#D6523A', spineBg: '#E4DFC9', spineText: '#1A1D22' },
  { coverBg: '#27292E', coverInk: '#EFECE3', accent: '#D6523A', secondary: '#9CA3AF', spineBg: '#25272C', spineText: '#ECE8DF' },
  { coverBg: '#6B241A', coverInk: '#FAF3E6', accent: '#F7E7C4', secondary: '#D6523A', spineBg: '#6B241A', spineText: '#F5EDE0' },
];

export function renderBookScene(
  variant: number,
  pal: BookCardPalette,
  uid: string,
): React.ReactNode {
  const { coverBg: bg, coverInk: ink, accent, secondary } = pal;
  const gId = `ls-book-grad-${uid}`;

  switch (variant % 12) {
    case 0:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={gId} cx="50%" cy="42%" r="45%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.92" />
              <stop offset="70%" stopColor={accent} stopOpacity="0.58" />
              <stop offset="100%" stopColor={bg} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="88" r="56" fill={`url(#${gId})`} />
          <line x1="110" y1="68" x2="62" y2="148" stroke={ink} strokeWidth="2.2" />
          <line x1="110" y1="68" x2="158" y2="148" stroke={ink} strokeWidth="2.2" />
          <line x1="62" y1="148" x2="36" y2="206" stroke={ink} strokeWidth="1.8" />
          <line x1="158" y1="148" x2="184" y2="206" stroke={secondary} strokeWidth="2" />
          <circle cx="110" cy="68" r="7.5" fill={ink} />
          <circle cx="62" cy="148" r="5.5" fill={ink} />
          <circle cx="158" cy="148" r="5.5" fill={secondary} />
          {[188, 198, 208].map((y, i) => (
            <line key={y} x1={26 + i * 16} y1={y} x2={194 - i * 16} y2={y} stroke={accent} strokeOpacity="0.55" strokeWidth="1.8" />
          ))}
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          {[24, 46, 68, 90].map((r, i) => (
            <circle key={r} cx="110" cy="96" r={r} stroke={i % 2 === 0 ? accent : secondary} strokeOpacity={0.35 + i * 0.12} strokeWidth={i === 1 ? 2 : 1.2} fill="none" />
          ))}
          <path d="M12 152 Q110 132 208 152 V230 H12 Z" fill={ink} opacity="0.22" />
          {[164, 176, 190, 206].map((y, idx) => (
            <line key={y} x1={22 + idx * 14} y1={y} x2={198 - idx * 14} y2={y} stroke={ink} strokeOpacity="0.45" strokeWidth="1.5" />
          ))}
          <rect x="103" y="89" width="14" height="14" fill={accent} transform="rotate(45 110 96)" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <path d="M0 156 L58 118 L108 144 L164 110 L220 148 V230 H0 Z" fill={ink} fillOpacity="0.86" />
          <polygon points="34,62 96,34 176,58 148,128 62,118" stroke={ink} strokeOpacity="0.42" strokeWidth="1.4" fill="none" />
          <line x1="34" y1="62" x2="148" y2="128" stroke={accent} strokeWidth="2.4" />
          <line x1="96" y1="34" x2="62" y2="118" stroke={secondary} strokeWidth="1.8" />
          <circle cx="34" cy="62" r="6" fill={accent} />
          <circle cx="148" cy="128" r="6" fill={accent} />
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={gId} cx="50%" cy="62%" r="48%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.92" />
              <stop offset="60%" stopColor={accent} stopOpacity="0.3" />
              <stop offset="100%" stopColor={bg} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="220" height="230" fill={`url(#${gId})`} />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={36 + col * 38}
                y={38 + row * 38}
                width="28"
                height="28"
                rx="2"
                fill={(row === 1 && col === 2) || (row === 2 && col === 1) ? accent : ink}
                fillOpacity={(row === 1 && col === 2) || (row === 2 && col === 1) ? 0.9 : 0.14}
                stroke={ink}
                strokeOpacity="0.24"
              />
            )),
          )}
        </svg>
      );
    case 4:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <path d="M110 22 C84 62 146 92 98 134 C66 162 128 190 110 226" stroke={ink} strokeOpacity="0.52" strokeWidth="16" strokeLinecap="round" fill="none" />
          <circle cx="110" cy="52" r="10" fill={accent} />
          <circle cx="122" cy="108" r="10" fill={secondary} />
          <circle cx="88" cy="160" r="10" fill={ink} />
        </svg>
      );
    case 5:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <circle cx="110" cy="60" r="36" fill={accent} fillOpacity="0.22" />
          <rect x="44" y="88" width="132" height="20" rx="3" fill={accent} fillOpacity="0.86" />
          <rect x="44" y="118" width="96" height="20" rx="3" fill={ink} fillOpacity="0.82" />
          <rect x="44" y="148" width="114" height="20" rx="3" fill={secondary} fillOpacity="0.84" />
          {[184, 198, 212].map((y) => (
            <line key={y} x1="20" y1={y} x2="200" y2={y} stroke={accent} strokeOpacity="0.45" strokeWidth="2" />
          ))}
        </svg>
      );
    case 6:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="110" cy="112" rx="84" ry="34" transform="rotate(-18 110 112)" stroke={secondary} strokeOpacity="0.65" strokeWidth="1.6" fill="none" />
          <ellipse cx="110" cy="112" rx="84" ry="34" transform="rotate(20 110 112)" stroke={ink} strokeOpacity="0.45" strokeWidth="1.4" fill="none" />
          <path d="M84 174 L110 54 L136 174" stroke={ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M98 112 L74 174" stroke={accent} strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="174" cy="72" r="8" fill={accent} />
        </svg>
      );
    case 7:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <path d="M0 198 L46 138 L92 178 L142 128 L220 194 V230 H0 Z" fill={ink} fillOpacity="0.88" />
          <path d="M72 52 Q84 44 92 52 Q100 44 112 52" stroke={ink} strokeWidth="2.4" fill="none" />
          <path d="M126 70 Q136 62 144 70 Q152 62 162 70" stroke={accent} strokeWidth="2.4" fill="none" />
          <rect x="86" y="102" width="48" height="20" rx="2" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.6" />
        </svg>
      );
    case 8:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={gId} cx="46%" cy="38%" r="60%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
              <stop offset="70%" stopColor={accent} stopOpacity="0.42" />
              <stop offset="100%" stopColor={bg} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="220" height="230" fill={`url(#${gId})`} />
          <polygon points="104,54 220,24 220,76" fill={ink} fillOpacity="0.18" />
          <path d="M90 162 L98 62 H110 L118 162 Z" fill={accent} stroke={ink} strokeWidth="2" />
          <rect x="94" y="48" width="20" height="14" fill={ink} />
          <path d="M0 170 Q58 148 112 162 T220 156 V230 H0 Z" fill={ink} fillOpacity="0.9" />
        </svg>
      );
    case 9:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <circle cx="136" cy="54" r="24" fill={accent} />
          <path d="M0 132 H220 V230 H0 Z" fill={ink} opacity="0.25" />
          {[144, 156, 168, 180, 194, 208].map((y, idx) => (
            <rect key={y} x={74 - idx * 6} y={y} width={110 + idx * 8} height="4" fill={ink} fillOpacity={0.72 - idx * 0.08} />
          ))}
        </svg>
      );
    case 10:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="110" cy="52" rx="68" ry="18" fill={accent} fillOpacity="0.24" stroke={ink} strokeWidth="2" />
          <path d="M42 52 V112 C42 124 178 124 178 112 V52" stroke={ink} strokeWidth="2" fill="none" />
          <path d="M42 112 V172 C42 184 178 184 178 172 V112" stroke={accent} strokeWidth="2.2" fill="none" />
          <ellipse cx="110" cy="112" rx="68" ry="18" stroke={ink} strokeOpacity="0.45" strokeWidth="1.4" fill="none" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 220 230" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={gId} cx="50%" cy="46%" r="38%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
              <stop offset="50%" stopColor={secondary} stopOpacity="0.45" />
              <stop offset="100%" stopColor={bg} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="220" height="230" fill={`url(#${gId})`} />
          <path d="M84 156 V94 A26 26 0 0 1 136 94 V156 Z" fill={accent} />
          <line x1="20" y1="220" x2="84" y2="156" stroke={ink} strokeOpacity="0.45" strokeWidth="1.4" />
          <line x1="200" y1="220" x2="136" y2="156" stroke={ink} strokeOpacity="0.45" strokeWidth="1.4" />
        </svg>
      );
  }
}

export function mapCatalogEntryToCSBook(entry: BookCatalogEntry): CSBook {
  const pal = PALETTES[entry.paletteIndex % PALETTES.length];
  const directPdf = entry.pdfUrl || bookStorage.getDirectPdfUrl(entry.repoPath || entry.path);
  const normalizedEntry: BookCatalogEntry = {
    ...entry,
    pdfUrl: directPdf,
    path: entry.path || entry.repoPath,
    repoPath: entry.repoPath || entry.path,
  };

  return {
    ...normalizedEntry,
    githubUrl: bookStorage.getRepositoryBrowseUrl(normalizedEntry.repoPath),
    downloadUrl: bookStorage.getDownloadPdfUrl(normalizedEntry),
    readerUrl: bookStorage.getReaderPdfUrl(normalizedEntry),
    theme: pal,
    renderScene: (uid: string) => renderBookScene(entry.artVariant, pal, uid),
  };
}

export const CS_BOOKS: CSBook[] = BOOKS_CATALOG.map(mapCatalogEntryToCSBook);
