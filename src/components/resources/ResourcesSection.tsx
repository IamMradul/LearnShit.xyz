import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Bookmark, FileText, Flame } from 'lucide-react';
import { ResourcesHub } from './ResourcesHub';
import { RESOURCES_DATA } from '../../data/resources/resourcesData';
import { ALGOARENA_CUSTOM_SHEET_INFO } from '../../data/resources/customSheetData';

export type ResourceTab = 'sheets' | 'books' | 'learnshit-sheet';
const BOOKMARKS_KEY = 'learnshit-resource-bookmarks-v1';

function readBookmarks(): Set<string> {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return new Set(stored ? (JSON.parse(stored) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function ResourcesSection({
  onBack,
  initialTab = 'sheets',
  onTabChange,
}: {
  onBack: () => void;
  initialTab?: ResourceTab;
  onTabChange?: (tab: ResourceTab) => void;
}) {
  const [tab, setTab] = useState<ResourceTab>(initialTab);
  const [bookmarkedIds, setBookmarkedIds] = useState(readBookmarks);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [initialTab]);

  const handleTabSelect = (nextTab: ResourceTab) => {
    setTab(nextTab);
    onTabChange?.(nextTab);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...next]));
      } catch {
        // Keep the current session usable when browser storage is unavailable.
      }
      return next;
    });
  };

  const tabs: { id: ResourceTab; label: string; icon: typeof FileText }[] = [
    { id: 'sheets', label: 'Sheets', icon: FileText },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'learnshit-sheet', label: 'LearnShit Sheet', icon: Flame },
  ];

  return (
    <section id="resources-anchor" className="resources-section">
      <header className="resources-topbar">
        <div className="resources-topbar-inner">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text-secondary)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'inherit',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Home
            </button>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Resources</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--accent, #D6523A)', fontWeight: 600 }}>
              {tab === 'books' ? 'Books' : tab === 'sheets' ? 'Sheets' : 'LearnShit Sheet'}
            </span>
          </div>

          <button type="button" className="resources-back" onClick={onBack}>
            <ArrowLeft size={14} /> Back to Visualizer
          </button>
        </div>
      </header>

      <div className="resources-shell">
        <header className="resources-heading">
          <div>
            <h2>Resources &amp; Tooling</h2>
            <p>Curated problem sheets, competitive programming books, and the upcoming LearnShit master track.</p>
          </div>
          <span className="resources-bookmark-count">
            <Bookmark size={14} /> {bookmarkedIds.size} saved
          </span>
        </header>

        <nav className="resources-tabs" aria-label="Resource subsections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => handleTabSelect(id)}
              aria-pressed={tab === id}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {tab === 'sheets' && (
          <ResourcesHub
            resources={RESOURCES_DATA.filter((resource) => resource.category === 'sheets')}
            categoryScope="sheets"
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            showOnlyBookmarks={showOnlyBookmarks}
            setShowOnlyBookmarks={setShowOnlyBookmarks}
            onNavigateToCustomSheet={() => handleTabSelect('learnshit-sheet')}
          />
        )}

        {tab === 'books' && (
          <ResourcesHub
            resources={RESOURCES_DATA.filter((resource) => resource.category === 'books')}
            categoryScope="books"
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            showOnlyBookmarks={showOnlyBookmarks}
            setShowOnlyBookmarks={setShowOnlyBookmarks}
            onNavigateToCustomSheet={() => handleTabSelect('learnshit-sheet')}
          />
        )}

        {tab === 'learnshit-sheet' && (
          <div className="learnshit-sheet-card">
            <span className="resources-eyebrow">COMING SOON · VERSION {ALGOARENA_CUSTOM_SHEET_INFO.version}</span>
            <h3>LearnShit Core Problem Sheet</h3>
            <p>{ALGOARENA_CUSTOM_SHEET_INFO.subtitle}</p>
            <p>
              A carefully ordered progression through foundational techniques and competitive programming patterns.
              Problem tracking and visualizer links are planned for a future release.
            </p>
            <div className="learnshit-sheet-topics">
              {ALGOARENA_CUSTOM_SHEET_INFO.topics
                .filter((topic) => topic !== 'All Topics')
                .map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
