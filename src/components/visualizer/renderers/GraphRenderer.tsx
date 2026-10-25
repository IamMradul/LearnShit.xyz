import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TraceStep } from '../../../engine/TraceTypes';
import { useTraceStore } from '../../../store/traceStore';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface GraphEdge {
  u: string;
  v: string;
  weight?: number | string;
  isDirected?: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphRendererProps {
  step: TraceStep | null;
  varName?: string;
  height?: number;
}

function parseGraph(step: TraceStep, varName?: string, width = 600, height = 340): GraphData {
  // 1. Locate the graph variable
  let target = varName ? step.variables[varName] : undefined;
  if (!target) {
    const entries = Object.entries(step.variables);
    // Look for graph/adj/edges names first
    const found =
      entries.find(([k]) => /^(graph|adj|edges|adj_list|edge_list|network)$/i.test(k)) ||
      entries.find(([k]) => /adj|edge|graph/i.test(k)) ||
      entries.find(([, v]) => v.type === 'graph');
    if (found) target = found[1];
  }

  // Fallback: search all steps if graph not yet in current step's scope
  if (!target?.value) {
    const allSteps = useTraceStore.getState().steps;
    for (const s of allSteps) {
      const entries = Object.entries(s.variables);
      const found =
        entries.find(([k]) => /^(graph|adj|edges|adj_list|edge_list|network)$/i.test(k)) ||
        entries.find(([k]) => /adj|edge|graph/i.test(k)) ||
        entries.find(([, v]) => v.type === 'graph');
      if (found?.[1]?.value) {
        target = found[1];
        break;
      }
    }
  }

  if (!target?.value) {
    return { nodes: [], edges: [] };
  }

  const raw = target.value;
  const nodesSet = new Set<string>();
  const edges: GraphEdge[] = [];
  let isDirected = false;

  // Case A: 2D Array
  if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) {
      // Check if it's an edge list: [[u, v], ...] or [[u, v, w], ...]
      const isEdgeList = raw.every(
        (row) =>
          Array.isArray(row) &&
          (row.length === 2 || row.length === 3) &&
          typeof row[0] === 'number' &&
          typeof row[1] === 'number',
      );

      if (isEdgeList) {
        for (const row of raw) {
          const u = String(row[0]);
          const v = String(row[1]);
          const w = row.length === 3 ? row[2] : undefined;
          nodesSet.add(u);
          nodesSet.add(v);
          edges.push({ u, v, weight: w, isDirected: false });
        }
      } else {
        // Adjacency list: raw[u] = [v1, v2, ...] or raw[u] = [[v1, w1], [v2, w2], ...]
        isDirected = true;
        for (let u = 0; u < raw.length; u++) {
          nodesSet.add(String(u));
          const neighbors = raw[u];
          if (Array.isArray(neighbors)) {
            for (const item of neighbors) {
              if (Array.isArray(item) && item.length >= 2) {
                // Weighted: [v, w]
                const v = String(item[0]);
                const w = item[1];
                nodesSet.add(v);
                edges.push({ u: String(u), v, weight: w, isDirected: true });
              } else if (typeof item === 'number' || typeof item === 'string') {
                const v = String(item);
                nodesSet.add(v);
                edges.push({ u: String(u), v, isDirected: true });
              }
            }
          }
        }
      }
    }
  } else if (typeof raw === 'object' && raw !== null) {
    // Case B: Adjacency dictionary: { "0": [1, 2], "1": [...] }
    isDirected = true;
    for (const [u, neighbors] of Object.entries(raw as Record<string, unknown>)) {
      nodesSet.add(u);
      if (Array.isArray(neighbors)) {
        for (const item of neighbors) {
          if (Array.isArray(item) && item.length >= 2) {
            const v = String(item[0]);
            nodesSet.add(v);
            edges.push({ u, v, weight: item[1] as number, isDirected: true });
          } else if (typeof item === 'number' || typeof item === 'string') {
            const v = String(item);
            nodesSet.add(v);
            edges.push({ u, v, isDirected: true });
          }
        }
      }
    }
  }

  // Also check if step has 'n' (number of vertices), ensure all vertices 0..n-1 are present
  const nVal = step.variables['n']?.value;
  if (typeof nVal === 'number' && nVal > 0 && nVal <= 30) {
    for (let i = 0; i < nVal; i++) {
      nodesSet.add(String(i));
    }
  }

  // Layout vertices in a circular graph
  const nodeList = Array.from(nodesSet).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
  });

  const N = nodeList.length;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(70, Math.min(width, height) / 2 - 55);

  const nodes: GraphNode[] = nodeList.map((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, N) - Math.PI / 2;
    return {
      id,
      label: id,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return { nodes, edges };
}

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  step,
  varName,
  height = 340,
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
    if (!container || !svgEl || !step) return;

    const W = Math.max(340, containerWidth || container.clientWidth || 600);
    const H = height;

    const { nodes, edges } = parseGraph(step, varName, W, H);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H);

    if (nodes.length === 0) return;

    // Node lookup map
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    // Identify active elements from step variables
    const activeNodes = new Set<string>();
    const visitedNodes = new Set<string>();
    const inQueueNodes = new Set<string>();

    for (const [k, tv] of Object.entries(step.variables)) {
      const lk = k.toLowerCase();
      // Active node variable: u, v, curr, node, start, src
      if (['u', 'v', 'curr', 'node', 'start', 'src', 'ru', 'rv'].includes(lk)) {
        if (tv.value !== undefined && tv.value !== null) {
          activeNodes.add(String(tv.value));
        }
      }
      // Visited collection
      if (lk.includes('visited') || lk.includes('seen')) {
        if (Array.isArray(tv.value)) {
          tv.value.forEach((val) => visitedNodes.add(String(val)));
        } else if (typeof tv.value === 'object' && tv.value !== null) {
          Object.keys(tv.value).forEach((val) => visitedNodes.add(String(val)));
        }
      }
      // Queue / PQ
      if (lk.includes('queue') || lk.includes('pq') || lk.includes('order')) {
        if (Array.isArray(tv.value)) {
          tv.value.forEach((item) => {
            if (typeof item === 'number' || typeof item === 'string') {
              inQueueNodes.add(String(item));
            } else if (Array.isArray(item) && item.length >= 2) {
              inQueueNodes.add(String(item[1])); // (dist, node)
            }
          });
        }
      }
    }

    // Check if active edge (u, v) is being traversed
    const uVal = step.variables['u']?.value;
    const vVal = step.variables['v']?.value;
    const activeEdgeU = uVal !== undefined ? String(uVal) : null;
    const activeEdgeV = vVal !== undefined ? String(vVal) : null;

    // Arrowhead marker defs
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'graph-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', 'rgba(247, 245, 239, 0.45)');

    defs
      .append('marker')
      .attr('id', 'graph-arrow-active')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', 'var(--accent)');

    // ── Render Edges ──────────────────────────────────────────────────────
    const edgesGroup = svg.append('g').attr('class', 'edges');

    edges.forEach((edge) => {
      const source = nodeMap.get(edge.u);
      const target = nodeMap.get(edge.v);
      if (!source || !target) return;

      const isEdgeActive =
        activeEdgeU !== null &&
        activeEdgeV !== null &&
        ((edge.u === activeEdgeU && edge.v === activeEdgeV) ||
          (!edge.isDirected && edge.u === activeEdgeV && edge.v === activeEdgeU));

      // Edge line
      edgesGroup
        .append('line')
        .attr('x1', source.x)
        .attr('y1', source.y)
        .attr('x2', target.x)
        .attr('y2', target.y)
        .attr('stroke', isEdgeActive ? 'var(--accent)' : 'rgba(247, 245, 239, 0.22)')
        .attr('stroke-width', isEdgeActive ? 3 : 1.5)
        .attr('marker-end', edge.isDirected ? (isEdgeActive ? 'url(#graph-arrow-active)' : 'url(#graph-arrow)') : null);

      // Edge Weight badge
      if (edge.weight !== undefined && edge.weight !== null) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        const badge = edgesGroup.append('g').attr('transform', `translate(${midX}, ${midY})`);

        badge
          .append('rect')
          .attr('x', -14)
          .attr('y', -9)
          .attr('width', 28)
          .attr('height', 18)
          .attr('rx', 6)
          .attr('fill', isEdgeActive ? 'rgba(214, 82, 58, 0.9)' : 'rgba(16, 18, 22, 0.92)')
          .attr('stroke', isEdgeActive ? 'var(--accent)' : 'rgba(247, 245, 239, 0.25)')
          .attr('stroke-width', 1);

        badge
          .append('text')
          .attr('x', 0)
          .attr('y', 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('fill', '#F7F5EF')
          .attr('font-family', "'JetBrains Mono', monospace")
          .text(String(edge.weight));
      }
    });

    // ── Render Nodes ──────────────────────────────────────────────────────
    const nodesGroup = svg.append('g').attr('class', 'nodes');

    nodes.forEach((node) => {
      const isActive = activeNodes.has(node.id);
      const isVisited = visitedNodes.has(node.id);
      const isInQueue = inQueueNodes.has(node.id);

      const g = nodesGroup.append('g').attr('transform', `translate(${node.x}, ${node.y})`);

      // Outer glow for active node
      if (isActive) {
        g.append('circle')
          .attr('r', 27)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(214, 82, 58, 0.35)')
          .attr('stroke-width', 6);
      }

      // Main Vertex Circle
      g.append('circle')
        .attr('r', 19)
        .attr('fill', isActive ? '#D6523A' : isVisited ? 'rgba(56, 161, 105, 0.25)' : isInQueue ? 'rgba(229, 169, 60, 0.2)' : '#141720')
        .attr('stroke', isActive ? '#FF7657' : isVisited ? '#38A169' : isInQueue ? '#E5A93C' : 'rgba(247, 245, 239, 0.35)')
        .attr('stroke-width', isActive ? 2.5 : 1.5)
        .attr('filter', 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))');

      // Vertex Label
      g.append('text')
        .attr('x', 0)
        .attr('y', 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#F7F5EF')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(node.label);

      // Status pill badge below node
      if (isActive) {
        const badge = g.append('g').attr('transform', 'translate(0, 29)');
        badge
          .append('rect')
          .attr('x', -24)
          .attr('y', -7)
          .attr('width', 48)
          .attr('height', 14)
          .attr('rx', 4)
          .attr('fill', 'rgba(214, 82, 58, 0.95)');
        badge
          .append('text')
          .attr('x', 0)
          .attr('y', 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 8.5)
          .attr('font-weight', 800)
          .attr('letter-spacing', '0.04em')
          .attr('fill', '#FFF')
          .attr('font-family', "'JetBrains Mono', monospace")
          .text('ACTIVE');
      } else if (isVisited) {
        const badge = g.append('g').attr('transform', 'translate(0, 27)');
        badge
          .append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 8)
          .attr('font-weight', 700)
          .attr('fill', '#38A169')
          .attr('font-family', "'JetBrains Mono', monospace")
          .text('visited');
      }
    });
  }, [step, varName, height, containerWidth]);

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
