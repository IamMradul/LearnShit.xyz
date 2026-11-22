import React, { useState, useMemo } from 'react';
import {
  Search,
  Code2,
  Table,
  LayoutGrid,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DSA_TOPICS, type DsaTopic, type DsaKind } from '../../data/dsa/dsaData';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { useUIStore } from '../../store/uiStore';
import { navigate } from '../../utils/router';

interface DsaHubProps {
  onBackToHome?: () => void;
}

export const DsaHub: React.FC<DsaHubProps> = ({ onBackToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedKind, setSelectedKind] = useState<DsaKind | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({});

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    DSA_TOPICS.forEach((t) => set.add(t.category));
    return ['All', ...Array.from(set)];
  }, []);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return DSA_TOPICS.filter((t) => {
      if (selectedKind !== 'All' && t.kind !== selectedKind) return false;
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'All' && t.difficulty !== selectedDifficulty) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesSummary = t.summary.toLowerCase().includes(q);
        const matchesCategory = t.category.toLowerCase().includes(q);
        const matchesProblems = t.commonProblems.some((p) => p.toLowerCase().includes(q));
        const matchesInvariants = t.keyInvariants.some((k) => k.toLowerCase().includes(q));
        if (!matchesName && !matchesSummary && !matchesCategory && !matchesProblems && !matchesInvariants) {
          return false;
        }
      }
      return true;
    });
  }, [selectedKind, selectedCategory, selectedDifficulty, searchQuery]);

  const toggleCodeExpand = (id: string) => {
    setExpandedCodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLaunchInVisualizer = (topic: DsaTopic) => {
    const editor = useEditorStore.getState();
    editor.setLanguage(topic.codeLanguage);
    editor.setCode(topic.codeSnippet);
    if (topic.sampleInput) {
      editor.setInput(topic.sampleInput);
    }
    useTraceStore.getState().setTraceSource('user');
    useUIStore.getState().setCenterViewMode('split');
    navigate('/visualizer');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedKind('All');
    setSelectedDifficulty('All');
  };

  const getComplexityColor = (comp: string) => {
    const lower = comp.toLowerCase();
    if (lower.includes('o(1)') || lower.includes('o(log n)') || lower.includes('o(α(n))')) {
      return '#3fb950'; // green
    }
    if (lower.includes('o(n)') && !lower.includes('o(n log n)') && !lower.includes('o(n²)')) {
      return '#58a6ff'; // blue
    }
    if (lower.includes('o(n log n)') || lower.includes('o(v + e)')) {
      return '#d29922'; // amber
    }
    return '#f85149'; // red/coral for O(n^2), O(2^n), O(n!)
  };

  return (
    <div
      style={{
        paddingTop: 76,
        paddingBottom: 80,
        minHeight: '100vh',
        background: '#0a0b0d',
        color: '#f0f6fc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        {/* ── Breadcrumb & Top Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 20,
            fontSize: 13,
            color: 'rgba(247, 245, 239, 0.65)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onBackToHome ? onBackToHome : () => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: 0,
                fontSize: 13,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)')}
            >
              Home
            </button>
            <span style={{ opacity: 0.35 }}>/</span>
            <span style={{ color: 'var(--accent, #D6523A)', fontWeight: 600 }}>
              Data Structures & Algorithms
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'cards' ? 'rgba(214, 82, 58, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: viewMode === 'cards' ? '1px solid rgba(214, 82, 58, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: viewMode === 'cards' ? '#fff' : 'rgba(247, 245, 239, 0.65)',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'matrix' ? 'rgba(214, 82, 58, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: viewMode === 'matrix' ? '1px solid rgba(214, 82, 58, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: viewMode === 'matrix' ? '#fff' : 'rgba(247, 245, 239, 0.65)',
                transition: 'all 0.15s ease',
              }}
            >
              <Table size={14} />
              <span>Complexity Matrix</span>
            </button>
          </div>
        </div>

        {/* ── Hero Title Header ── */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.8) 0%, rgba(13, 17, 23, 0.8) 100%)',
            border: '1px solid rgba(247, 245, 239, 0.1)',
            borderRadius: 12,
            padding: '24px 28px',
            marginBottom: 24,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--accent, #D6523A)',
                background: 'rgba(214, 82, 58, 0.14)',
                border: '1px solid rgba(214, 82, 58, 0.3)',
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Comprehensive Encyclopedia
            </span>
            <span style={{ fontSize: 12, color: 'rgba(247, 245, 239, 0.4)' }}>•</span>
            <span style={{ fontSize: 12, color: 'rgba(247, 245, 239, 0.65)' }}>
              {DSA_TOPICS.length} Core Concepts & Patterns
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#F7F5EF',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
            }}
          >
            DATA STRUCTURES & ALGORITHMS GUIDE
          </h1>
          <p
            style={{
              fontSize: 14.5,
              color: 'rgba(247, 245, 239, 0.72)',
              margin: 0,
              maxWidth: 900,
              lineHeight: 1.55,
            }}
          >
            In-depth technical breakdown of every essential data structure and algorithmic paradigm.
            Review asymptotic complexities, invariants, and implementation patterns—or click{' '}
            <strong style={{ color: '#F7F5EF' }}>"Open in Visualizer"</strong> to step through the execution
            line by line with pointer tracing.
          </p>
        </div>

        {/* ── Search and Filter Controls ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            marginBottom: 28,
            background: '#11141a',
            border: '1px solid rgba(247, 245, 239, 0.08)',
            borderRadius: 10,
            padding: '16px 20px',
          }}
        >
          {/* Row 1: Search Bar and Quick Selectors */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div
              style={{
                flex: 1,
                minWidth: 280,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={16}
                style={{ position: 'absolute', left: 12, color: 'rgba(247, 245, 239, 0.4)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search algorithms, data structures, invariants, LeetCode problems..."
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px 0 38px',
                  borderRadius: 6,
                  border: '1px solid rgba(247, 245, 239, 0.14)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(214, 82, 58, 0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(247, 245, 239, 0.14)')}
              />
            </div>

            {/* Kind Filter (All, DS, Algo) */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['All', 'data-structure', 'algorithm'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedKind(k)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedKind === k ? 'rgba(214, 82, 58, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedKind === k ? '1px solid rgba(214, 82, 58, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: selectedKind === k ? '#F7F5EF' : 'rgba(247, 245, 239, 0.65)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {k === 'All' ? 'All Types' : k === 'data-structure' ? 'Data Structures' : 'Algorithms'}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: selectedDifficulty === diff ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
                    border: selectedDifficulty === diff ? '1px solid rgba(88, 166, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: selectedDifficulty === diff ? '#58a6ff' : 'rgba(247, 245, 239, 0.6)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>

            {(searchQuery || selectedCategory !== 'All' || selectedKind !== 'All' || selectedDifficulty !== 'All') && (
              <button
                onClick={resetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(247, 245, 239, 0.7)',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Row 2: Category Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  cursor: 'pointer',
                  background: selectedCategory === cat ? '#F7F5EF' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? '#0a0b0d' : 'rgba(247, 245, 239, 0.7)',
                  border: selectedCategory === cat ? '1px solid #F7F5EF' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── View 1: Cards View ── */}
        {viewMode === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 }}>
            {filteredTopics.map((topic) => {
              const isExpanded = !!expandedCodes[topic.id];

              return (
                <div
                  key={topic.id}
                  style={{
                    background: '#12151b',
                    border: '1px solid rgba(247, 245, 239, 0.1)',
                    borderRadius: 10,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Top tags: Kind, Category, Difficulty */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: topic.kind === 'data-structure' ? 'rgba(88, 166, 255, 0.16)' : 'rgba(163, 113, 247, 0.16)',
                            color: topic.kind === 'data-structure' ? '#58a6ff' : '#a371f7',
                            border: `1px solid ${topic.kind === 'data-structure' ? 'rgba(88, 166, 255, 0.3)' : 'rgba(163, 113, 247, 0.3)'}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {topic.kind === 'data-structure' ? 'Data Structure' : 'Algorithm'}
                        </span>
                        <span
                          style={{
                            fontSize: 10.5,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'rgba(247, 245, 239, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          {topic.category}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          color:
                            topic.difficulty === 'Beginner'
                              ? '#3fb950'
                              : topic.difficulty === 'Intermediate'
                              ? '#d29922'
                              : '#f85149',
                        }}
                      >
                        {topic.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: 19,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        color: '#F7F5EF',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {topic.name}
                    </h3>

                    {/* Summary */}
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: 'rgba(247, 245, 239, 0.75)',
                        margin: '0 0 14px 0',
                      }}
                    >
                      {topic.summary}
                    </p>

                    {/* Complexity Pills Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                        background: '#0a0c10',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid rgba(247, 245, 239, 0.06)',
                        marginBottom: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                      }}
                    >
                      <div>
                        <span style={{ color: 'rgba(247, 245, 239, 0.45)', display: 'block', fontSize: 10 }}>TIME (AVG)</span>
                        <span style={{ color: getComplexityColor(topic.timeComplexity.average), fontWeight: 700 }}>
                          {topic.timeComplexity.average}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(247, 245, 239, 0.45)', display: 'block', fontSize: 10 }}>TIME (WORST)</span>
                        <span style={{ color: getComplexityColor(topic.timeComplexity.worst), fontWeight: 700 }}>
                          {topic.timeComplexity.worst}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(247, 245, 239, 0.45)', display: 'block', fontSize: 10 }}>TIME (BEST)</span>
                        <span style={{ color: getComplexityColor(topic.timeComplexity.best), fontWeight: 700 }}>
                          {topic.timeComplexity.best}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(247, 245, 239, 0.45)', display: 'block', fontSize: 10 }}>SPACE</span>
                        <span style={{ color: '#58a6ff', fontWeight: 700 }}>{topic.spaceComplexity}</span>
                      </div>
                    </div>

                    {/* Key Operations breakdown if available */}
                    {topic.operations && topic.operations.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'rgba(247, 245, 239, 0.5)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 6,
                          }}
                        >
                          Operations
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {topic.operations.slice(0, 3).map((op, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 11.5,
                                padding: '3px 0',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                              }}
                            >
                              <span style={{ color: '#F7F5EF' }}>{op.name}</span>
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontWeight: 600,
                                  color: getComplexityColor(op.time),
                                }}
                              >
                                {op.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Invariants / Notes */}
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'rgba(247, 245, 239, 0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 4,
                        }}
                      >
                        Key Mental Model
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 18,
                          fontSize: 12,
                          color: 'rgba(247, 245, 239, 0.68)',
                          lineHeight: 1.5,
                        }}
                      >
                        {topic.keyInvariants.slice(0, 2).map((inv, i) => (
                          <li key={i}>{inv}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Common LeetCode Problems */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'rgba(247, 245, 239, 0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: 6,
                        }}
                      >
                        Typical Applications
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {topic.commonProblems.map((prob) => (
                          <span
                            key={prob}
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: 'rgba(214, 82, 58, 0.1)',
                              color: 'rgba(247, 245, 239, 0.85)',
                              border: '1px solid rgba(214, 82, 58, 0.2)',
                            }}
                          >
                            {prob}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expandable Code Snippet */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: 10,
                          marginBottom: 16,
                          background: '#0d1117',
                          border: '1px solid rgba(247, 245, 239, 0.12)',
                          borderRadius: 6,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
                            fontSize: 10.5,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: 'rgba(247, 245, 239, 0.6)',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{topic.codeLanguage.toUpperCase()} IMPLEMENTATION</span>
                          <span>RUNNABLE</span>
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: 12,
                            fontSize: 11.5,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: '#e6edf3',
                            lineHeight: 1.5,
                            overflowX: 'auto',
                            maxHeight: 240,
                          }}
                        >
                          <code>{topic.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Actions: Open in Visualizer & View Code */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      paddingTop: 12,
                      borderTop: '1px solid rgba(247, 245, 239, 0.08)',
                    }}
                  >
                    <button
                      onClick={() => handleLaunchInVisualizer(topic)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 6,
                        background: 'var(--accent, #D6523A)',
                        color: '#fff',
                        fontSize: 12.5,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Open in Visualizer</span>
                    </button>

                    <button
                      onClick={() => toggleCodeExpand(topic.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#F7F5EF',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Code2 size={13} />
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── View 2: High-Density Complexity Matrix ── */}
        {viewMode === 'matrix' && (
          <div
            style={{
              background: '#12151b',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                <thead>
                  <tr
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderBottom: '1px solid rgba(247, 245, 239, 0.12)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: 'rgba(247, 245, 239, 0.65)',
                    }}
                  >
                    <th style={{ padding: '12px 16px' }}>CONCEPT</th>
                    <th style={{ padding: '12px 16px' }}>CATEGORY</th>
                    <th style={{ padding: '12px 16px' }}>BEST TIME</th>
                    <th style={{ padding: '12px 16px' }}>AVG TIME</th>
                    <th style={{ padding: '12px 16px' }}>WORST TIME</th>
                    <th style={{ padding: '12px 16px' }}>SPACE</th>
                    <th style={{ padding: '12px 16px' }}>PRIMARY USAGE</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.map((topic, idx) => (
                    <tr
                      key={topic.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(214, 82, 58, 0.06)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)')
                      }
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#F7F5EF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{topic.name}</span>
                          <span
                            style={{
                              fontSize: 9.5,
                              padding: '1px 4px',
                              borderRadius: 3,
                              fontFamily: "'JetBrains Mono', monospace",
                              background:
                                topic.kind === 'data-structure'
                                  ? 'rgba(88, 166, 255, 0.15)'
                                  : 'rgba(163, 113, 247, 0.15)',
                              color: topic.kind === 'data-structure' ? '#58a6ff' : '#a371f7',
                            }}
                          >
                            {topic.kind === 'data-structure' ? 'DS' : 'ALGO'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'rgba(247, 245, 239, 0.65)' }}>{topic.category}</td>
                      <td
                        style={{
                          padding: '12px 16px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          color: getComplexityColor(topic.timeComplexity.best),
                        }}
                      >
                        {topic.timeComplexity.best}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: getComplexityColor(topic.timeComplexity.average),
                        }}
                      >
                        {topic.timeComplexity.average}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          color: getComplexityColor(topic.timeComplexity.worst),
                        }}
                      >
                        {topic.timeComplexity.worst}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          color: '#58a6ff',
                        }}
                      >
                        {topic.spaceComplexity}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          color: 'rgba(247, 245, 239, 0.7)',
                          maxWidth: 240,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {topic.commonProblems.join(', ')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleLaunchInVisualizer(topic)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 4,
                            background: 'rgba(214, 82, 58, 0.18)',
                            border: '1px solid rgba(214, 82, 58, 0.35)',
                            color: '#F7F5EF',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Play size={10} fill="currentColor" />
                          <span>Visualize</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
