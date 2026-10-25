import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TraceStep } from '../../../engine/TraceTypes';

interface TreeNode {
  val: number | string;
  left?: TreeNode | null;
  right?: TreeNode | null;
  id?: string;
  highlighted?: string;
}

interface D3TreeNode {
  id: string;
  val: number | string;
  highlight?: string;
  children?: D3TreeNode[];
}

interface TreeRendererProps {
  step: TraceStep | null;
  varName?: string;
  treeData?: TreeNode;
  height?: number;
}

function buildD3Tree(node: TreeNode | null | undefined, id = 'root'): D3TreeNode | null {
  if (!node || node.val === null || node.val === undefined) return null;
  const d: D3TreeNode = {
    id,
    val: node.val,
    highlight: node.highlighted,
    children: [],
  };
  const left = buildD3Tree(node.left, `${id}-L`);
  const right = buildD3Tree(node.right, `${id}-R`);
  if (left) d.children!.push(left);
  if (right) {
    if (!left) d.children!.push({ id: `${id}-phantom`, val: '', children: [] });
    d.children!.push(right);
  }
  if (!d.children!.length) delete d.children;
  return d;
}

function extractTree(step: TraceStep, varName?: string): TreeNode | null {
  const target = varName
    ? step.variables[varName]
    : Object.values(step.variables).find(
        (v) =>
          v.type === 'TreeNode' ||
          (typeof v.value === 'object' &&
            v.value !== null &&
            'left' in (v.value as Record<string, unknown>) &&
            'right' in (v.value as Record<string, unknown>)),
      );

  if (!target?.value) return null;
  return target.value as TreeNode;
}

export const TreeRenderer: React.FC<TreeRendererProps> = ({
  step,
  varName,
  treeData: propTreeData,
  height = 280,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const treeData = step ? extractTree(step, varName) : propTreeData;
    if (!treeData) {
      d3.select(svgEl).selectAll('*').remove();
      return;
    }

    const d3Root = buildD3Tree(treeData);
    if (!d3Root) return;

    const W = container.clientWidth || 400;
    const H = height;
    const margin = { top: 30, right: 20, bottom: 20, left: 20 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const hierarchy = d3.hierarchy(d3Root);
    const treeLayout = d3.tree<D3TreeNode>().size([innerW, innerH]);
    treeLayout(hierarchy);

    // Cast to point hierarchy after layout
    const pointHierarchy = hierarchy as d3.HierarchyPointNode<D3TreeNode>;

    const svg = d3.select(svgEl);
    svg.attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Links — use a path generator compatible with d3 HierarchyPointLink
    g.selectAll('.tree-link')
      .data(pointHierarchy.links().filter((l) => !l.target.data.id.includes('phantom')))
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('fill', 'none')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1.5)
      .attr('d', (link) => {
        const s = link.source as d3.HierarchyPointNode<D3TreeNode>;
        const t = link.target as d3.HierarchyPointNode<D3TreeNode>;
        return `M${s.x},${s.y}C${s.x},${(s.y + t.y) / 2} ${t.x},${(s.y + t.y) / 2} ${t.x},${t.y}`;
      });

    // Nodes
    const nodes = g
      .selectAll('.tree-node')
      .data(pointHierarchy.descendants().filter((d) => !d.data.id.includes('phantom')))
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    const r = Math.min(18, innerW / (pointHierarchy.leaves().length * 2 + 1));

    nodes
      .append('circle')
      .attr('r', r)
      .attr('fill', (d) => {
        const h = d.data.highlight;
        if (!h) return 'var(--bg-elevated)';
        if (h === 'current') return 'var(--vis-current)';
        if (h === 'visited') return 'var(--vis-visited)';
        if (h === 'compare') return 'var(--vis-compare)';
        return 'var(--vis-pivot)';
      })
      .attr('stroke', (d) =>
        d.data.highlight ? 'var(--accent)' : 'var(--border)',
      )
      .attr('stroke-width', 1.5);

    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', Math.min(11, r - 2))
      .attr('fill', 'var(--text-primary)')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => String(d.data.val));
  }, [step, propTreeData, varName, height]);

  return (
    <div ref={containerRef} style={{ width: '100%', height }}>
      <svg ref={svgRef} style={{ overflow: 'visible' }} />
    </div>
  );
};
