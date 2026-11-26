import React, { useState, useMemo } from 'react';
import { Search, Table, LayoutGrid, RotateCcw, ArrowUpRight } from 'lucide-react';
import { DSA_TOPICS, type DsaKind, type DsaTopic } from '../../data/dsa/dsaData';
import { DsaDetailModal } from './DsaDetailModal';
import { navigate } from '../../utils/router';

interface DsaHubProps {
  onBackToHome?: () => void;
}

function findOperation(topic: DsaTopic, patterns: RegExp[]): string {
  for (const pat of patterns) {
    const match = topic.operations.find((op) => pat.test(op.name));
    if (match) return match.time;
  }
  return '—';
}

export const DsaHub: React.FC<DsaHubProps> = ({ onBackToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedKind, setSelectedKind] = useState<DsaKind | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    DSA_TOPICS.forEach((t) => set.add(t.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredTopics = useMemo(() => {
    return DSA_TOPICS.filter((t) => {
      if (selectedKind !== 'All' && t.kind !== selectedKind) return false;
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesCategory = t.category.toLowerCase().includes(q);
        const matchesOp = t.operations.some(
          (op) =>
            op.name.toLowerCase().includes(q) ||
            op.time.toLowerCase().includes(q) ||
            op.space.toLowerCase().includes(q),
        );
        if (!matchesName && !matchesCategory && !matchesOp) return false;
      }
      return true;
    });
  }, [selectedKind, selectedCategory, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategory !== 'All' || selectedKind !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedKind('All');
  };

  const getComplexityColor = (comp: string) => {
    const lower = comp.toLowerCase();
    if (
      lower.includes('o(1)') ||
      lower.includes('o(log n)') ||
      lower.includes('o(α(n))') ||
      lower.includes('o(l)')
    ) {
      return 'var(--accent-green, #2e9e5b)';
    }
    if (
      (lower.includes('o(n)') || lower.includes('o(h)') || lower.includes('o(v)')) &&
      !lower.includes('o(n log n)') &&
      !lower.includes('o(n²)')
    ) {
      return '#4a8fe7';
    }
    if (lower.includes('o(n log n)') || lower.includes('o(v + e)') || lower.includes('log')) {
      return '#c88a1e';
    }
    if (lower === '—') {
      return 'var(--text-muted)';
    }
    return 'var(--accent)';
  };

  return (
    <div
      style={{
        paddingTop: 84,
        paddingBottom: 96,
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        .dsa-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        @media (max-width: 1120px) {
          .dsa-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 680px) {
          .dsa-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 28px' }}>
        {/* ── Minimal Breadcrumb & Mode Switcher ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              color: 'var(--text-secondary)',
            }}
          >
            <button
              onClick={onBackToHome ? onBackToHome : () => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: 0,
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              Home
            </button>
            <span style={{ opacity: 0.35 }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Complexity Reference
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              gap: 4,
              padding: 3,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 999,
            }}
          >
            <button
              onClick={() => setViewMode('cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: viewMode === 'cards' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'cards' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: viewMode === 'matrix' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'matrix' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <Table size={13} />
              <span>Matrix</span>
            </button>
          </div>
        </div>

        {/* ── Editorial Header ── */}
        <div
          style={{
            marginBottom: 36,
            paddingBottom: 24,
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: 8,
              }}
            >
              Asymptotic Cheat Sheet
            </div>
            <h1
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                margin: 0,
                lineHeight: 1.05,
                color: 'var(--text-primary)',
              }}
            >
              Time &amp; Space Complexities
            </h1>
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'var(--text-muted)',
            }}
          >
            {filteredTopics.length} of {DSA_TOPICS.length} structures &amp; algorithms
          </div>
        </div>

        {/* ── Streamlined Filter Bar ── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Filter structure, algorithm, or operation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '8px 14px 8px 36px',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              padding: 3,
              gap: 2,
            }}
          >
            {(['All', 'data-structure', 'algorithm'] as const).map((k) => {
              const active = selectedKind === k;
              const label =
                k === 'All' ? 'All' : k === 'data-structure' ? 'Data Structures' : 'Algorithms';
              return (
                <button
                  key={k}
                  onClick={() => setSelectedKind(k)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: 'none',
                    background: active ? 'var(--bg-elevated)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              padding: '8px 14px',
              color: 'var(--text-primary)',
              fontSize: 12.5,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '7px 12px',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* ── Cards View: Operation-Centric Time & Space Grid ── */}
        {viewMode === 'cards' ? (
          <div className="dsa-cards-grid">
            {filteredTopics.map((topic) => (
              <article
                key={topic.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTopicId(topic.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTopicId(topic.id);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  cursor: 'pointer',
                  transition: 'border-color 0.18s ease, transform 0.18s ease',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {topic.name}
                  </h2>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      flexShrink: 0,
                    }}
                  >
                    <span>{topic.category}</span>
                    <ArrowUpRight size={12} style={{ opacity: 0.7 }} />
                  </span>
                </div>

                {/* Overall Time & Space Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: 10,
                    padding: '10px 12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 9.5,
                        color: 'var(--text-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}
                    >
                      Best
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: getComplexityColor(topic.timeComplexity.best),
                      }}
                    >
                      {topic.timeComplexity.best}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 9.5,
                        color: 'var(--text-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}
                    >
                      Average
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: getComplexityColor(topic.timeComplexity.average),
                      }}
                    >
                      {topic.timeComplexity.average}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 9.5,
                        color: 'var(--text-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}
                    >
                      Worst
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: getComplexityColor(topic.timeComplexity.worst),
                      }}
                    >
                      {topic.timeComplexity.worst}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 9.5,
                        color: 'var(--text-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}
                    >
                      Space
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-primary)',
                      }}
                    >
                      {topic.spaceComplexity}
                    </div>
                  </div>
                </div>

                {/* Operations Table: Operation | Time | Space */}
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 0.9fr',
                      gap: 10,
                      paddingBottom: 6,
                      borderBottom: '1px solid var(--border)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Operation</span>
                    <span>Time</span>
                    <span style={{ textAlign: 'right' }}>Space</span>
                  </div>

                  <div>
                    {topic.operations.map((op, i) => (
                      <div
                        key={op.name}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.5fr 1fr 0.9fr',
                          gap: 10,
                          alignItems: 'baseline',
                          padding: '8px 0',
                          borderBottom:
                            i < topic.operations.length - 1
                              ? '1px solid var(--border-subtle)'
                              : 'none',
                          fontSize: 12.5,
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {op.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: getComplexityColor(op.time),
                          }}
                        >
                          {op.time}
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11.5,
                            color: 'var(--text-primary)',
                            textAlign: 'right',
                          }}
                        >
                          {op.space}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* ── Complexity Matrix View ── */
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12.5,
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  <th style={{ padding: '14px 18px' }}>Topic</th>
                  <th style={{ padding: '14px 12px' }}>Search / Access</th>
                  <th style={{ padding: '14px 12px' }}>Insertion</th>
                  <th style={{ padding: '14px 12px' }}>Deletion</th>
                  <th style={{ padding: '14px 12px' }}>Worst Time</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Space</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((t, idx) => {
                  const searchVal = findOperation(t, [/search|lookup|find|query|bfs|dijkstra|exact/i]);
                  const insertVal = findOperation(t, [/insert|push|enqueue|union|build/i]);
                  const deleteVal = findOperation(t, [/delet|pop|extract|dequeue/i]);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTopicId(t.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--border-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      style={{
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        borderBottom:
                          idx < filteredTopics.length - 1
                            ? '1px solid var(--border-subtle)'
                            : 'none',
                      }}
                    >
                      <td style={{ padding: '13px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div>{t.name}</div>
                        <div
                          style={{
                            fontSize: 10.5,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 400,
                            color: 'var(--text-muted)',
                            marginTop: 2,
                          }}
                        >
                          {t.category}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '13px 12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          color: getComplexityColor(searchVal),
                        }}
                      >
                        {searchVal}
                      </td>
                      <td
                        style={{
                          padding: '13px 12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          color: getComplexityColor(insertVal),
                        }}
                      >
                        {insertVal}
                      </td>
                      <td
                        style={{
                          padding: '13px 12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          color: getComplexityColor(deleteVal),
                        }}
                      >
                        {deleteVal}
                      </td>
                      <td
                        style={{
                          padding: '13px 12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          color: getComplexityColor(t.timeComplexity.worst),
                        }}
                      >
                        {t.timeComplexity.worst}
                      </td>
                      <td
                        style={{
                          padding: '13px 18px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          color: 'var(--text-primary)',
                          textAlign: 'right',
                        }}
                      >
                        {t.spaceComplexity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(() => {
        if (!selectedTopicId) return null;
        const activeList = filteredTopics.length > 0 ? filteredTopics : DSA_TOPICS;
        const idx = activeList.findIndex((t) => t.id === selectedTopicId);
        const safeIdx = idx >= 0 ? idx : 0;
        const selectedTopic = activeList[safeIdx];
        if (!selectedTopic) return null;

        return (
          <DsaDetailModal
            topic={selectedTopic}
            currentIndex={safeIdx}
            totalCount={activeList.length}
            onClose={() => setSelectedTopicId(null)}
            onPrev={() =>
              setSelectedTopicId(
                activeList[(safeIdx - 1 + activeList.length) % activeList.length].id,
              )
            }
            onNext={() =>
              setSelectedTopicId(activeList[(safeIdx + 1) % activeList.length].id)
            }
            getComplexityColor={getComplexityColor}
          />
        );
      })()}
    </div>
  );
};
