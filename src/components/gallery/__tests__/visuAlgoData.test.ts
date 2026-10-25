import { describe, it, expect } from 'vitest';
import { VISUALGO_ITEMS } from '../visuAlgoData';

describe('VisuAlgo 26 Gallery Topics', () => {
  it('contains exactly 26 distinct algorithm & data structure topics', () => {
    expect(VISUALGO_ITEMS.length).toBe(26);
    const ids = new Set(VISUALGO_ITEMS.map((item) => item.id));
    expect(ids.size).toBe(26);
  });

  it('verifies all expected VisuAlgo categories and cards exist', () => {
    const titles = VISUALGO_ITEMS.map((item) => item.title);

    const expectedTitles = [
      'Array',
      'Sorting',
      'Bitmask',
      'Linked List',
      'Binary Heap',
      'Hash Table',
      'Binary Search Tree',
      'Graph Structures',
      'Union-Find DS',
      'Fenwick Tree',
      'Segment Tree',
      'Recursion Tree/DAG',
      'Graph Traversal',
      'Min Spanning Tree',
      'SS Shortest Paths',
      'Cycle Finding',
      'Suffix Tree',
      'Suffix Array',
      'Geometry (Polygon)',
      'Convex Hull',
      'Network Flow',
      'Graph Matching',
      'Min Vertex Cover',
      'Steiner Tree',
      'Traveling Salesperson',
      'NP-complete Reductions',
    ];

    for (const expected of expectedTitles) {
      expect(titles).toContain(expected);
    }
  });

  it('validates each item has sample code, tags, and valid complexity info', () => {
    for (const item of VISUALGO_ITEMS) {
      expect(item.title).toBeTruthy();
      expect(item.bgColor).toBeTruthy();
      expect(item.tags.length).toBeGreaterThan(0);
      expect(item.complexity).toBeTruthy();
      expect(item.spaceComplexity).toBeTruthy();
      expect(item.sampleInput).toBeTruthy();
      expect(typeof item.renderThumbnail).toBe('function');
    }
  });
});
