import React from 'react';
import type { TraceStep } from '../../../engine/TraceTypes';
import { Binary, Check, X, Sparkles, Layers } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';

interface BitmaskRendererProps {
  step: TraceStep | null;
  varName?: string;
  height?: number;
}

export const BitmaskRenderer: React.FC<BitmaskRendererProps> = ({
  step,
  varName,
  height = 340,
}) => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  const accentGreen = isLight ? '#15803d' : '#2ed573';
  const accentAmber = isLight ? '#b45309' : '#E5A93C';
  const accentHex = isLight ? '#0369a1' : '#38bdf8';

  if (!step) return null;

  // Extract variables
  const rawMask =
    step.variables['mask']?.value ??
    step.variables['bitmask']?.value ??
    step.variables['bits']?.value ??
    (typeof step.variables[varName ?? '']?.value === 'number'
      ? step.variables[varName ?? ''].value
      : 0);

  const mask = typeof rawMask === 'number' ? rawMask : 0;

  const rawN = step.variables['n']?.value;
  const n =
    typeof rawN === 'number' && rawN > 0 && rawN <= 16
      ? rawN
      : Math.max(3, mask > 0 ? Math.floor(Math.log2(mask)) + 1 : 3);

  const rawCurr = step.variables['curr']?.value ?? step.variables['sub']?.value;
  const curr = (Array.isArray(rawCurr) ? rawCurr : []) as (number | string)[];

  const rawSubsets =
    step.variables['subsets']?.value ??
    step.variables['res']?.value ??
    step.variables['result']?.value ??
    step.variables['ans']?.value;
  const subsets = (Array.isArray(rawSubsets) ? rawSubsets : []) as (number | string)[][];

  const rawI = step.variables['i']?.value;
  const activeBitIndex = typeof rawI === 'number' ? rawI : null;

  const totalSubsets = 1 << n;
  const binaryString = mask.toString(2).padStart(n, '0');

  // Build bit descriptors from MSB (n-1) down to LSB (0)
  const bits: { index: number; isSet: boolean; weight: number; isTesting: boolean }[] = [];
  for (let b = n - 1; b >= 0; b--) {
    const isSet = (mask & (1 << b)) !== 0;
    const isTesting = activeBitIndex === b;
    bits.push({ index: b, isSet, weight: 1 << b, isTesting });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        maxWidth: 820,
        minHeight: height,
        margin: '0 auto',
        padding: '16px 20px',
        background: 'var(--surface-glass-strong)',
        backdropFilter: 'blur(16px)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        boxShadow: isLight ? '0 10px 28px rgba(16, 18, 22, 0.08)' : '0 16px 36px rgba(0,0,0,0.5)',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(214, 82, 58, 0.15)',
              border: '1px solid rgba(214, 82, 58, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Binary size={16} color="var(--accent)" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 14,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                fontWeight: 700,
              }}
            >
              Binary Bitmask Register
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              Total elements: n = {n} (2ⁿ = {totalSubsets} subsets)
            </div>
          </div>
        </div>

        {/* Mask stats pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--border-subtle)',
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>mask:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{mask}</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>bin:</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>0b{binaryString}</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>hex:</span>
          <span style={{ color: accentHex, fontWeight: 600 }}>0x{mask.toString(16).toUpperCase()}</span>
        </div>
      </div>

      {/* ── Bit Cells Row ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={12} color="var(--accent)" />
          <span>Active Bit Register (MSB → LSB)</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${bits.length}, minmax(70px, 1fr))`,
            gap: 10,
          }}
        >
          {bits.map((bit) => (
            <div
              key={bit.index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 6px',
                borderRadius: 10,
                background: bit.isSet
                  ? 'linear-gradient(180deg, rgba(214, 82, 58, 0.2) 0%, rgba(214, 82, 58, 0.06) 100%)'
                  : 'var(--border-subtle)',
                border: bit.isTesting
                  ? `2px solid ${accentAmber}`
                  : bit.isSet
                  ? '1.5px solid var(--accent)'
                  : '1px solid var(--border)',
                boxShadow: bit.isTesting
                  ? '0 0 14px rgba(229, 169, 60, 0.35)'
                  : bit.isSet
                  ? '0 0 10px rgba(214, 82, 58, 0.2)'
                  : 'none',
                transition: 'all 0.18s ease',
                position: 'relative',
              }}
            >
              {bit.isTesting && (
                <div
                  style={{
                    position: 'absolute',
                    top: -9,
                    background: '#E5A93C',
                    color: '#0a0b0d',
                    fontSize: 9,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '1px 6px',
                    borderRadius: 8,
                    letterSpacing: '0.03em',
                  }}
                >
                  TESTING
                </div>
              )}

              {/* Bit Index label */}
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                }}
              >
                bit [{bit.index}]
              </div>

              {/* Bit Value 1 or 0 */}
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: bit.isSet ? 'var(--text-primary)' : 'var(--text-muted)',
                  lineHeight: 1,
                  margin: '4px 0',
                }}
              >
                {bit.isSet ? '1' : '0'}
              </div>

              {/* Bit Weight (1 << index) */}
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: bit.isSet ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                2^{bit.index} = {bit.weight}
              </div>

              {/* Inclusion Pill */}
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: bit.isSet ? accentGreen : 'var(--text-muted)',
                  background: bit.isSet
                    ? isLight ? 'rgba(21, 128, 61, 0.12)' : 'rgba(46, 213, 115, 0.12)'
                    : 'var(--bg-tertiary)',
                  padding: '2px 6px',
                  borderRadius: 6,
                }}
              >
                {bit.isSet ? <Check size={11} /> : <X size={11} />}
                <span>{bit.isSet ? `Elem ${bit.index}` : 'Excluded'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Current Subset Card ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '10px 14px',
          background: 'var(--border-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Current Subset (curr):
          </span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(214, 82, 58, 0.15)',
              border: '1px solid rgba(214, 82, 58, 0.4)',
              padding: '4px 12px',
              borderRadius: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {curr.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>∅ (Empty Set)</span>
            ) : (
              <span>&#123; {curr.join(', ')} &#125;</span>
            )}
          </div>
        </div>

        {activeBitIndex !== null && (
          <div
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: accentAmber,
            }}
          >
            Operation:{' '}
            <strong>
              ({mask} &amp; (1 &lt;&lt; {activeBitIndex})) = {mask & (1 << activeBitIndex)}
            </strong>{' '}
            → {(mask & (1 << activeBitIndex)) !== 0 ? 'TRUE (Include)' : 'FALSE'}
          </div>
        )}
      </div>

      {/* ── Generated Subsets List ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={12} color={accentGreen} />
            <span>Accumulated Power Set (subsets)</span>
          </div>
          <span style={{ color: accentGreen, fontWeight: 600 }}>
            {subsets.length} / {totalSubsets} Generated
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            maxHeight: 140,
            overflowY: 'auto',
            padding: '4px 2px',
          }}
        >
          {subsets.length === 0 ? (
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                padding: '6px 0',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              No subsets appended yet
            </div>
          ) : (
            subsets.map((sub, idx) => {
              const isLatest = idx === subsets.length - 1;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: isLatest
                      ? isLight ? 'rgba(21, 128, 61, 0.12)' : 'rgba(46, 213, 115, 0.15)'
                      : 'var(--border-subtle)',
                    border: isLatest
                      ? isLight ? '1px solid rgba(21, 128, 61, 0.45)' : '1px solid rgba(46, 213, 115, 0.5)'
                      : '1px solid var(--border)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>#{idx}:</span>
                  <span style={{ color: isLatest ? accentGreen : 'var(--text-primary)', fontWeight: 600 }}>
                    {sub.length === 0 ? '∅' : `{ ${sub.join(', ')} }`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
