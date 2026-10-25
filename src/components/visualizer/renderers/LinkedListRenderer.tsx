import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TraceStep } from '../../../engine/TraceTypes';
import { useTraceStore } from '../../../store/traceStore';

interface LLNode {
  val: number | string;
  next?: LLNode | null;
  id?: string;
}

interface LinkedListRendererProps {
  step: TraceStep | null;
  varName?: string;
  nodes?: LLNode[];
  height?: number;
  highlightIds?: Set<string>;
}

const POINTER_COLORS: Record<string, string> = {
  curr: '#D6523A',
  current: '#D6523A',
  head: '#58a6ff',
  prev: '#a371f7',
  nxt: '#2ed573',
  next: '#2ed573',
  slow: '#e5a93c',
  fast: '#ff4757',
  tail: '#38A169',
};

function flattenList(head: LLNode | null | undefined, max = 50): LLNode[] {
  const result: LLNode[] = [];
  const seen = new Set<LLNode>();
  let cur: LLNode | null | undefined = head;
  while (cur && result.length < max && !seen.has(cur)) {
    seen.add(cur);
    result.push({ ...cur });
    cur = cur.next;
  }
  return result;
}

function extractNodesFromVal(raw: unknown): LLNode[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => ({
      val: item && typeof item === 'object' && 'val' in item ? (item as { val: number | string }).val : String(item),
    }));
  }
  if (typeof raw === 'object' && raw !== null && 'val' in raw) {
    return flattenList(raw as LLNode);
  }
  return [];
}

function extractLL(step: TraceStep, varName?: string): { nodes: LLNode[]; hasCycle: boolean } {
  let longestNodes: LLNode[] = [];

  // 1. Check all listNode variables in current step
  const candKeys = varName ? [varName] : Object.keys(step.variables);
  for (const k of candKeys) {
    const tv = step.variables[k];
    if (!tv?.value) continue;
    const extracted = extractNodesFromVal(tv.value);
    if (extracted.length > longestNodes.length) {
      longestNodes = extracted;
    }
  }

  // 2. If nothing in current step, search all trace steps
  if (!longestNodes.length) {
    const allSteps = useTraceStore.getState().steps;
    for (const s of allSteps) {
      for (const tv of Object.values(s.variables)) {
        if (!tv?.value) continue;
        const extracted = extractNodesFromVal(tv.value);
        if (extracted.length > longestNodes.length) {
          longestNodes = extracted;
        }
      }
      if (longestNodes.length >= 3) break;
    }
  }

  // Check cycle flag in step variables (e.g. pos, slow == fast, hasCycle)
  const posVal = step.variables['pos']?.value;
  const hasCycle = typeof posVal === 'number' && posVal >= 0 && posVal < longestNodes.length;

  return { nodes: longestNodes, hasCycle };
}

export const LinkedListRenderer: React.FC<LinkedListRendererProps> = ({
  step,
  varName,
  nodes: propNodes,
  height = 200,
  highlightIds,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const { nodes, hasCycle } = step ? extractLL(step, varName) : { nodes: propNodes ?? [], hasCycle: false };

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (!nodes.length) return;

    const W = Math.max(340, containerWidth || container.clientWidth || 600);
    const H = height;
    const nodeSize = 50;
    const arrowLen = 34;
    const totalW = nodes.length * nodeSize + (nodes.length - 1) * arrowLen + 50;
    const startX = Math.max(28, (W - totalW) / 2);
    const cy = H / 2 + 10;

    svg.attr('width', W).attr('height', H);

    // Collect active pointer variables in scope and map to node index
    const pointerMap: Record<number, { name: string; color: string }[]> = {};
    if (step) {
      for (const [k, tv] of Object.entries(step.variables)) {
        const lk = k.toLowerCase();
        if (['head', 'curr', 'prev', 'nxt', 'next', 'slow', 'fast', 'p1', 'p2', 'tail'].includes(lk)) {
          if (!tv.value) continue;
          let targetVal: unknown = null;
          if (Array.isArray(tv.value) && tv.value.length > 0 && typeof tv.value[0] === 'object' && tv.value[0] !== null && 'val' in tv.value[0]) {
            targetVal = tv.value[0].val;
          } else if (typeof tv.value === 'object' && tv.value !== null && 'val' in (tv.value as Record<string, unknown>)) {
            targetVal = (tv.value as Record<string, unknown>).val;
          }

          if (targetVal !== null && targetVal !== undefined) {
            const matchedIdx = nodes.findIndex((n) => String(n.val) === String(targetVal));
            if (matchedIdx !== -1) {
              if (!pointerMap[matchedIdx]) pointerMap[matchedIdx] = [];
              pointerMap[matchedIdx].push({
                name: k,
                color: POINTER_COLORS[lk] || 'var(--accent)',
              });
            }
          }
        }
      }
    }

    // Arrow markers
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'll-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', 'rgba(247, 245, 239, 0.45)');

    defs
      .append('marker')
      .attr('id', 'll-arrow-active')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', 'var(--accent)');

    nodes.forEach((node, i) => {
      const x = startX + i * (nodeSize + arrowLen);
      const pointers = pointerMap[i] || [];
      const hasActivePointer = pointers.length > 0;

      const g = svg.append('g').attr('transform', `translate(${x}, ${cy - nodeSize / 2})`);

      // Outer active halo if pointer is on this node
      if (hasActivePointer) {
        g.append('rect')
          .attr('x', -3)
          .attr('y', -3)
          .attr('width', nodeSize + 6)
          .attr('height', nodeSize + 6)
          .attr('rx', 12)
          .attr('fill', 'none')
          .attr('stroke', pointers[0].color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);
      }

      // Node box
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', nodeSize)
        .attr('height', nodeSize)
        .attr('rx', 10)
        .attr('fill', hasActivePointer ? 'rgba(255, 255, 255, 0.08)' : '#141720')
        .attr('stroke', hasActivePointer ? pointers[0].color : 'rgba(247, 245, 239, 0.22)')
        .attr('stroke-width', 1.5)
        .attr('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.45))');

      // Value text
      g.append('text')
        .attr('x', nodeSize / 2)
        .attr('y', nodeSize / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .attr('fill', '#F7F5EF')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(String(node.val));

      // Index label below
      g.append('text')
        .attr('x', nodeSize / 2)
        .attr('y', nodeSize + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(`[${i}]`);

      // Pointer badges above the node
      if (pointers.length > 0) {
        pointers.forEach((p, pIdx) => {
          const badgeY = -18 - pIdx * 18;
          const badge = g.append('g').attr('transform', `translate(${nodeSize / 2}, ${badgeY})`);

          badge
            .append('rect')
            .attr('x', -24)
            .attr('y', -8)
            .attr('width', 48)
            .attr('height', 16)
            .attr('rx', 4)
            .attr('fill', p.color);

          badge
            .append('text')
            .attr('x', 0)
            .attr('y', 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', 9)
            .attr('font-weight', 800)
            .attr('letter-spacing', '0.04em')
            .attr('fill', '#FFFFFF')
            .attr('font-family', "'JetBrains Mono', monospace")
            .text(p.name);
        });
      }

      // Arrow to next node
      if (i < nodes.length - 1) {
        svg
          .append('line')
          .attr('x1', x + nodeSize)
          .attr('y1', cy)
          .attr('x2', x + nodeSize + arrowLen)
          .attr('y2', cy)
          .attr('stroke', hasActivePointer ? 'var(--accent)' : 'rgba(247, 245, 239, 0.4)')
          .attr('stroke-width', hasActivePointer ? 2 : 1.5)
          .attr('marker-end', hasActivePointer ? 'url(#ll-arrow-active)' : 'url(#ll-arrow)');
      } else if (!hasCycle) {
        // NULL terminator badge
        const nullG = svg.append('g').attr('transform', `translate(${x + nodeSize + 14}, ${cy})`);
        nullG
          .append('rect')
          .attr('x', 0)
          .attr('y', -11)
          .attr('width', 36)
          .attr('height', 22)
          .attr('rx', 6)
          .attr('fill', 'rgba(247, 245, 239, 0.05)')
          .attr('stroke', 'rgba(247, 245, 239, 0.15)')
          .attr('stroke-width', 1);

        nullG
          .append('text')
          .attr('x', 18)
          .attr('y', 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 10)
          .attr('font-weight', 600)
          .attr('fill', 'var(--text-muted)')
          .attr('font-family', "'JetBrains Mono', monospace")
          .text('null');
      }
    });

    // If cyclic linked list, draw curved loop back arrow
    const posVal = step?.variables['pos']?.value;
    if (typeof posVal === 'number' && posVal >= 0 && posVal < nodes.length) {
      const lastX = startX + (nodes.length - 1) * (nodeSize + arrowLen) + nodeSize / 2;
      const targetX = startX + posVal * (nodeSize + arrowLen) + nodeSize / 2;
      const arcY = cy - 44;

      const pathData = `M ${lastX} ${cy - nodeSize / 2} Q ${(lastX + targetX) / 2} ${arcY - 20} ${targetX} ${cy - nodeSize / 2}`;
      svg
        .append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', '#ff4757')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('marker-end', 'url(#ll-arrow-active)');

      svg
        .append('text')
        .attr('x', (lastX + targetX) / 2)
        .attr('y', arcY - 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9.5)
        .attr('font-weight', 700)
        .attr('fill', '#ff4757')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(`CYCLE -> [${posVal}]`);
    }
  }, [step, propNodes, varName, height, highlightIds, containerWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg ref={svgRef} />
    </div>
  );
};
