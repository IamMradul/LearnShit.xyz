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

function extractLL(step: TraceStep, varName?: string): LLNode[] {
  let target = varName
    ? step.variables[varName]
    : Object.values(step.variables).find(
        (v) =>
          v.type === 'linkedList' ||
          v.type === 'ListNode' ||
          (typeof v.value === 'object' &&
            v.value !== null &&
            ('next' in (v.value as object) ||
              (Array.isArray(v.value) &&
                v.value.length > 0 &&
                typeof v.value[0] === 'object' &&
                v.value[0] !== null &&
                'val' in v.value[0]))),
      );

  // Fallback: search all steps if head not yet in current step's scope
  if (!target?.value) {
    const allSteps = useTraceStore.getState().steps;
    for (const s of allSteps) {
      const t = varName
        ? s.variables[varName]
        : Object.values(s.variables).find(
            (v) =>
              v.type === 'linkedList' ||
              v.type === 'ListNode' ||
              (typeof v.value === 'object' &&
                v.value !== null &&
                'next' in (v.value as object)),
          );
      if (t?.value) {
        target = t;
        break;
      }
    }
  }

  if (!target?.value) return [];

  // If already an array of node objects (from Python worker)
  if (Array.isArray(target.value)) {
    return target.value.map((item) => ({
      val: item && typeof item === 'object' && 'val' in item ? (item as { val: number | string }).val : String(item),
    }));
  }

  return flattenList(target.value as LLNode);
}

export const LinkedListRenderer: React.FC<LinkedListRendererProps> = ({
  step,
  varName,
  nodes: propNodes,
  height = 120,
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

    const nodes = step ? extractLL(step, varName) : propNodes ?? [];

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (!nodes.length) return;

    const W = Math.max(300, containerWidth || container.clientWidth || 400);
    const H = height;
    const nodeSize = 48;
    const arrowLen = 30;
    const totalW = nodes.length * nodeSize + (nodes.length - 1) * arrowLen;
    const startX = Math.max(20, (W - totalW) / 2);
    const cy = H / 2;

    svg.attr('width', W).attr('height', H);

    const getHighlight = (i: number) => {
      if (!step) return false;
      const m = step.mutations.find(
        (mut) => mut.highlightIndices?.includes(i),
      );
      return m?.op ?? false;
    };

    // Arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'll-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', 'var(--vis-current)');

    nodes.forEach((node, i) => {
      const x = startX + i * (nodeSize + arrowLen);
      const hl = getHighlight(i);

      // Node box
      svg
        .append('rect')
        .attr('x', x)
        .attr('y', cy - nodeSize / 2)
        .attr('width', nodeSize)
        .attr('height', nodeSize)
        .attr('rx', 8)
        .attr('fill', hl ? 'var(--vis-current)' : 'var(--bg-elevated)')
        .attr('stroke', hl ? 'var(--accent)' : 'var(--border)')
        .attr('stroke-width', 1.5);

      // Value
      svg
        .append('text')
        .attr('x', x + nodeSize / 2)
        .attr('y', cy + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 13)
        .attr('fill', 'var(--text-primary)')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(String(node.val));

      // Arrow to next
      if (i < nodes.length - 1) {
        svg
          .append('line')
          .attr('x1', x + nodeSize)
          .attr('y1', cy)
          .attr('x2', x + nodeSize + arrowLen)
          .attr('y2', cy)
          .attr('stroke', 'var(--vis-current)')
          .attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#ll-arrow)');
      } else {
        // NULL terminator
        svg
          .append('text')
          .attr('x', x + nodeSize + 8)
          .attr('y', cy + 1)
          .attr('dominant-baseline', 'central')
          .attr('font-size', 11)
          .attr('fill', 'var(--text-muted)')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text('null');
      }
    });
  }, [step, propNodes, varName, height, highlightIds, containerWidth]);

  return (
    <div ref={containerRef} style={{ width: '100%', height }}>
      <svg ref={svgRef} />
    </div>
  );
};
