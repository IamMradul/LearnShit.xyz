import React, { useState } from 'react';
import {
  Activity,
  Code2,
  Terminal,
  Cpu,
  Copy,
  Check,
  ExternalLink,
  Play,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  Zap,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

/* ─── Fast-IO Templates ──────────────────────────────────────────────────────── */
const FAST_IO_TEMPLATES = [
  {
    language: 'cpp',
    name: 'C++ Fast-IO (Competitive Template)',
    desc: 'Bypasses C stdio synchronization and unties cin/cout stream buffers for competitive programming.',
    code: `#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    if (!(cin >> n)) return;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    
    // Sort and output
    sort(a.begin(), a.end());
    for (int i = 0; i < n; i++) {
        cout << a[i] << (i + 1 == n ? '\\n' : ' ');
    }
}

int main() {
    // Fast I/O
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    solve();
    return 0;
}`,
  },
  {
    language: 'python',
    name: 'Python 3.12 sys.stdin.read Fast-IO',
    desc: 'Reads entire stdin at once and tokens are consumed linearly — 10x faster than input() in loops.',
    code: `import sys

def solve():
    # Read all tokens at once into memory
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    
    # Sort and display
    nums.sort()
    sys.stdout.write(" ".join(map(str, nums)) + "\\n")

if __name__ == '__main__':
    solve()`,
  },
  {
    language: 'java',
    name: 'Java BufferedReader + StringTokenizer Fast-IO',
    desc: 'Ultra-fast token reader avoiding slow Scanner allocation for Codeforces and HackerRank.',
    code: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.StringTokenizer;
import java.util.Arrays;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(System.out);
        StringTokenizer st = null;

        String line = br.readLine();
        if (line != null) {
            int n = Integer.parseInt(line.trim());
            int[] arr = new int[n];
            st = new StringTokenizer(br.readLine());
            for (int i = 0; i < n; i++) {
                arr[i] = Integer.parseInt(st.nextToken());
            }
            Arrays.sort(arr);
            for (int i = 0; i < n; i++) {
                out.print(arr[i] + (i + 1 == n ? "\\n" : " "));
            }
        }
        out.flush();
    }
}`,
  },
  {
    language: 'go',
    name: 'Go bufio.Scanner & Fprintf',
    desc: 'Buffered standard input scanner avoiding fmt.Scan reflection overhead.',
    code: `package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strconv"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Split(bufio.ScanWords)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	if !scanner.Scan() {
		return
	}
	n, _ := strconv.Atoi(scanner.Text())
	nums := make([]int, n)
	for i := 0; i < n; i++ {
		scanner.Scan()
		nums[i], _ = strconv.Atoi(scanner.Text())
	}

	sort.Ints(nums)
	for i, v := range nums {
		if i > 0 {
			fmt.Fprint(out, " ")
		}
		fmt.Fprint(out, v)
	}
	fmt.Fprintln(out)
}`,
  },
];

/* ─── Big-O Data Structures Matrix ───────────────────────────────────────────── */
const DATA_STRUCTURES_BIG_O = [
  { ds: 'Array / Vector', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)', space: 'O(n)' },
  { ds: 'Singly Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { ds: 'Doubly Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { ds: 'Hash Table / Map', access: 'N/A', search: 'O(1) avg', insert: 'O(1) avg', delete: 'O(1) avg', space: 'O(n)' },
  { ds: 'Binary Search Tree', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { ds: 'Binary Heap (PQ)', access: 'O(1) min/max', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { ds: 'Union-Find (DSU)', access: 'N/A', search: 'O(α(n))', insert: 'O(α(n))', delete: 'N/A', space: 'O(n)' },
  { ds: 'Trie (Prefix Tree)', access: 'N/A', search: 'O(L)', insert: 'O(L)', delete: 'O(L)', space: 'O(N × L)' },
];

/* ─── Big-O Sorting Algorithms Matrix ────────────────────────────────────────── */
const SORTING_BIG_O = [
  { algo: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: 'No' },
  { algo: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
  { algo: 'Heap Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: 'No' },
  { algo: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
  { algo: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
  { algo: 'Counting Sort', best: 'O(n + k)', avg: 'O(n + k)', worst: 'O(n + k)', space: 'O(k)', stable: 'Yes' },
];

/* ─── 14 LeetCode Algorithmic Patterns ───────────────────────────────────────── */
const LEETCODE_PATTERNS = [
  {
    title: '1. Two Pointers',
    when: 'Sorted arrays or linked lists where you need to find pairs, triples, or in-place partition without extra space.',
    problems: 'Two Sum II, 3Sum, Container With Most Water, Trapping Rain Water, Sort Colors.',
    time: 'O(n)',
    space: 'O(1)',
  },
  {
    title: '2. Sliding Window (Fixed & Dynamic)',
    when: 'Subarray or substring problems searching for minimum, maximum, or exact constraint matching in linear time.',
    problems: 'Max Subarray Sum of Size K, Longest Substring Without Repeating Characters, Minimum Window Substring.',
    time: 'O(n)',
    space: 'O(k) or O(1)',
  },
  {
    title: '3. Fast & Slow Pointers (Floyd’s Cycle)',
    when: 'Detecting cycles or finding the middle node of singly-linked lists without modifying pointers.',
    problems: 'Linked List Cycle I & II, Middle of the Linked List, Happy Number, Find the Duplicate Number.',
    time: 'O(n)',
    space: 'O(1)',
  },
  {
    title: '4. Monotonic Stack & Queue',
    when: 'Finding the Next Greater Element, Next Smaller Element, or maintaining a sliding window extremum.',
    problems: 'Daily Temperatures, Next Greater Element, Largest Rectangle in Histogram, Sliding Window Maximum.',
    time: 'O(n)',
    space: 'O(n)',
  },
  {
    title: '5. Merge Intervals & Sweep-line',
    when: 'Overlapping intervals, scheduling, room allocations, or continuous range union.',
    problems: 'Merge Intervals, Insert Interval, Meeting Rooms II, Non-overlapping Intervals.',
    time: 'O(n log n)',
    space: 'O(n)',
  },
  {
    title: '6. Backtracking & Combinations',
    when: 'Generating all valid states, permutations, subsets, board arrangements, or word searches with pruning.',
    problems: 'Permutations, Subsets, N-Queens, Sudoku Solver, Word Search, Combination Sum.',
    time: 'O(2ⁿ) or O(n!)',
    space: 'O(n)',
  },
  {
    title: '7. Tree & Graph Traversals (DFS & BFS)',
    when: 'Shortest path in unweighted graphs (BFS), tree path sums (DFS), connected components, cycle detection.',
    problems: 'Binary Tree Level Order Traversal, Number of Islands, Clone Graph, Word Ladder, Course Schedule.',
    time: 'O(V + E)',
    space: 'O(V)',
  },
  {
    title: '8. Two Heaps Pattern',
    when: 'Tracking dynamic median or streaming percentiles where elements arrive sequentially.',
    problems: 'Find Median from Data Stream, Sliding Window Median, IPO.',
    time: 'O(log n) insert, O(1) query',
    space: 'O(n)',
  },
  {
    title: '9. Top K Elements (Min/Max Heap)',
    when: 'Finding the Kth largest, K most frequent, or K closest items without sorting the entire array.',
    problems: 'Kth Largest Element in an Array, Top K Frequent Elements, K Closest Points to Origin.',
    time: 'O(n log k)',
    space: 'O(k)',
  },
  {
    title: '10. Dynamic Programming (Tabulation & Memo)',
    when: 'Overlapping subproblems with optimal substructure — knapsack, state transitions, grid paths.',
    problems: 'Climbing Stairs, Coin Change, Longest Increasing Subsequence, 0/1 Knapsack, Edit Distance.',
    time: 'O(n × k)',
    space: 'O(n) or O(1)',
  },
];

interface ResourcesSectionProps {
  onOpenVisualizer?: () => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({ onOpenVisualizer }) => {
  const [activeTab, setActiveTab] = useState<'complexity' | 'patterns' | 'fastio' | 'shortcuts'>('complexity');
  const [activeFastIoIdx, setActiveFastIoIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  const { setCode, setLanguage } = useEditorStore();

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const handleLoadTemplate = (template: typeof FAST_IO_TEMPLATES[0]) => {
    setLanguage(template.language as any);
    setCode(template.code);
    if (onOpenVisualizer) {
      onOpenVisualizer();
    } else {
      const el = document.getElementById('ide-anchor');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getComplexityBadge = (c: string) => {
    let color = '#38A169'; // green for O(1)
    if (c.includes('log n')) color = '#00ADD8'; // cyan
    else if (c.includes('O(n²)') || c.includes('O(2ⁿ)') || c.includes('O(n!)')) color = '#E53E3E'; // red
    else if (c.includes('O(n log n)') || c.includes('O(n + k)')) color = '#ED8B00'; // orange
    else if (c.includes('O(n)')) color = '#ECC94B'; // yellow

    return (
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color,
          background: `${color}16`,
          padding: '2px 8px',
          borderRadius: 4,
          border: `1px solid ${color}35`,
          display: 'inline-block',
        }}
      >
        {c}
      </span>
    );
  };

  return (
    <section
      id="resources-anchor"
      style={{
        padding: '80px 24px',
        background: '#090a0d',
        borderTop: '1px solid rgba(247, 245, 239, 0.08)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent, #D6523A)',
              marginBottom: 10,
            }}
          >
            03 // DEVELOPER CHEATSHEET &amp; ALGORITHMIC TOOLKIT
          </div>
          <h2
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#F7F5EF',
              marginBottom: 10,
            }}
          >
            RESOURCES &amp; ALGORITHM TOOLKIT
          </h2>
          <p
            style={{
              color: 'rgba(247, 245, 239, 0.65)',
              fontSize: 15,
              maxWidth: 720,
              margin: '0 auto',
              lineHeight: 1.6,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Curated Big-O complexity cheat tables, the top 10 LeetCode interview patterns, and production Fast-I/O competitive programming templates ready to load into the visualizer.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('complexity')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              background: activeTab === 'complexity' ? 'var(--accent, #D6523A)' : '#111216',
              border: `1px solid ${activeTab === 'complexity' ? 'var(--accent, #D6523A)' : 'rgba(247, 245, 239, 0.1)'}`,
              color: activeTab === 'complexity' ? '#FFFFFF' : 'rgba(247, 245, 239, 0.75)',
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === 'complexity' ? '0 2px 12px rgba(214, 82, 58, 0.35)' : 'none',
            }}
          >
            <Activity size={15} />
            <span>Big-O Complexity Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('patterns')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              background: activeTab === 'patterns' ? 'var(--accent, #D6523A)' : '#111216',
              border: `1px solid ${activeTab === 'patterns' ? 'var(--accent, #D6523A)' : 'rgba(247, 245, 239, 0.1)'}`,
              color: activeTab === 'patterns' ? '#FFFFFF' : 'rgba(247, 245, 239, 0.75)',
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === 'patterns' ? '0 2px 12px rgba(214, 82, 58, 0.35)' : 'none',
            }}
          >
            <Code2 size={15} />
            <span>10 LeetCode Patterns</span>
          </button>

          <button
            onClick={() => setActiveTab('fastio')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              background: activeTab === 'fastio' ? 'var(--accent, #D6523A)' : '#111216',
              border: `1px solid ${activeTab === 'fastio' ? 'var(--accent, #D6523A)' : 'rgba(247, 245, 239, 0.1)'}`,
              color: activeTab === 'fastio' ? '#FFFFFF' : 'rgba(247, 245, 239, 0.75)',
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === 'fastio' ? '0 2px 12px rgba(214, 82, 58, 0.35)' : 'none',
            }}
          >
            <Terminal size={15} />
            <span>Fast-IO Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              background: activeTab === 'shortcuts' ? 'var(--accent, #D6523A)' : '#111216',
              border: `1px solid ${activeTab === 'shortcuts' ? 'var(--accent, #D6523A)' : 'rgba(247, 245, 239, 0.1)'}`,
              color: activeTab === 'shortcuts' ? '#FFFFFF' : 'rgba(247, 245, 239, 0.75)',
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: activeTab === 'shortcuts' ? '0 2px 12px rgba(214, 82, 58, 0.35)' : 'none',
            }}
          >
            <Cpu size={15} />
            <span>Engine &amp; Shortcuts</span>
          </button>
        </div>

        {/* ── TAB 1: Big-O Complexity Matrix ── */}
        {activeTab === 'complexity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Data Structures Table */}
            <div
              style={{
                background: '#101217',
                borderRadius: 12,
                border: '1px solid rgba(247, 245, 239, 0.08)',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  background: '#14161d',
                  borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} color="var(--accent, #D6523A)" />
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#F7F5EF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Data Structure Operations Complexity
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(247, 245, 239, 0.5)' }}>
                  <span>Green: O(1)</span> &bull; <span>Cyan: O(log n)</span> &bull; <span>Yellow: O(n)</span>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(247, 245, 239, 0.02)', borderBottom: '1px solid rgba(247, 245, 239, 0.06)' }}>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Data Structure</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Access</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Search</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Insertion</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Deletion</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Space</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DATA_STRUCTURES_BIG_O.map((row, idx) => (
                      <tr
                        key={row.ds}
                        style={{
                          borderBottom: '1px solid rgba(247, 245, 239, 0.04)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(247, 245, 239, 0.015)',
                        }}
                      >
                        <td style={{ padding: '12px 20px', fontWeight: 600, color: '#F7F5EF' }}>{row.ds}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.access)}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.search)}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.insert)}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.delete)}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.space)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sorting Algorithms Table */}
            <div
              style={{
                background: '#101217',
                borderRadius: 12,
                border: '1px solid rgba(247, 245, 239, 0.08)',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  background: '#14161d',
                  borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Zap size={16} color="var(--accent, #D6523A)" />
                <span
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#F7F5EF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Sorting Algorithms Time &amp; Space Complexity
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(247, 245, 239, 0.02)', borderBottom: '1px solid rgba(247, 245, 239, 0.06)' }}>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Algorithm</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Best Time</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Average Time</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Worst Time</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Space Complexity</th>
                      <th style={{ padding: '12px 20px', color: '#F7F5EF', fontWeight: 600 }}>Stable?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SORTING_BIG_O.map((row, idx) => (
                      <tr
                        key={row.algo}
                        style={{
                          borderBottom: '1px solid rgba(247, 245, 239, 0.04)',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(247, 245, 239, 0.015)',
                        }}
                      >
                        <td style={{ padding: '12px 20px', fontWeight: 600, color: '#F7F5EF' }}>{row.algo}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.best)}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.avg)}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.worst)}</td>
                        <td style={{ padding: '12px 20px' }}>{getComplexityBadge(row.space)}</td>
                        <td style={{ padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", color: row.stable === 'Yes' ? '#38A169' : '#9B9A95' }}>{row.stable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: 10 LeetCode Patterns ── */}
        {activeTab === 'patterns' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 20,
            }}
          >
            {LEETCODE_PATTERNS.map((p) => (
              <div
                key={p.title}
                style={{
                  background: '#111216',
                  borderRadius: 12,
                  border: '1px solid rgba(247, 245, 239, 0.08)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.08)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#F7F5EF',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {p.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent, #D6523A)', background: 'rgba(214, 82, 58, 0.12)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                      {p.time}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(247, 245, 239, 0.45)', textTransform: 'uppercase', fontWeight: 700 }}>
                    When to use:
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#d4d2cc', lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                    {p.when}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(247, 245, 239, 0.06)' }}>
                  <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(247, 245, 239, 0.45)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Core Problems:
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--accent, #D6523A)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.problems}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: Fast-IO Templates ── */}
        {activeTab === 'fastio' && (
          <div
            style={{
              background: '#101217',
              borderRadius: 14,
              border: '1px solid rgba(247, 245, 239, 0.08)',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Template Lang Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: '#13151c',
                borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
                overflowX: 'auto',
              }}
            >
              {FAST_IO_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={tmpl.language}
                  onClick={() => setActiveFastIoIdx(idx)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    background: activeFastIoIdx === idx ? 'var(--accent, #D6523A)' : 'transparent',
                    border: activeFastIoIdx === idx ? '1px solid var(--accent, #D6523A)' : '1px solid rgba(247, 245, 239, 0.08)',
                    color: activeFastIoIdx === idx ? '#FFFFFF' : 'rgba(247, 245, 239, 0.75)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tmpl.name.split(' ')[0]}
                </button>
              ))}

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleCopyCode(FAST_IO_TEMPLATES[activeFastIoIdx].code)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#1b1d26',
                    border: '1px solid rgba(247, 245, 239, 0.12)',
                    color: copiedCode ? '#38A169' : '#F7F5EF',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => handleLoadTemplate(FAST_IO_TEMPLATES[activeFastIoIdx])}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 6,
                    background: 'var(--accent, #D6523A)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  <Play size={12} fill="#FFFFFF" />
                  <span>Load into IDE</span>
                </button>
              </div>
            </div>

            {/* Description bar */}
            <div
              style={{
                padding: '10px 20px',
                background: 'rgba(214, 82, 58, 0.06)',
                borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(247, 245, 239, 0.75)',
              }}
            >
              <strong>{FAST_IO_TEMPLATES[activeFastIoIdx].name}</strong>: {FAST_IO_TEMPLATES[activeFastIoIdx].desc}
            </div>

            {/* Code Box */}
            <pre
              style={{
                margin: 0,
                padding: '18px 20px',
                background: '#0c0d12',
                color: '#e4e2dc',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
                lineHeight: 1.6,
                overflowX: 'auto',
                maxHeight: 460,
              }}
            >
              <code>{FAST_IO_TEMPLATES[activeFastIoIdx].code}</code>
            </pre>
          </div>
        )}

        {/* ── TAB 4: Engine Architecture & Shortcuts ── */}
        {activeTab === 'shortcuts' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 24,
            }}
          >
            {/* Shortcuts Card */}
            <div
              style={{
                background: '#111216',
                borderRadius: 12,
                border: '1px solid rgba(247, 245, 239, 0.08)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Cpu size={18} color="var(--accent, #D6523A)" />
                <h3
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#F7F5EF',
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  Global Playback Keyboard Shortcuts
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'Space', action: 'Toggle Play / Pause execution animation' },
                  { key: '→ (Right Arrow)', action: 'Step 1 step forward in trace' },
                  { key: '← (Left Arrow)', action: 'Step 1 step backward in trace' },
                  { key: 'Home / R', action: 'Reset playback back to Step 0' },
                  { key: 'End', action: 'Jump directly to the final execution step' },
                ].map((s) => (
                  <div
                    key={s.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: 'rgba(247, 245, 239, 0.03)',
                      border: '1px solid rgba(247, 245, 239, 0.06)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: 'var(--accent, #D6523A)',
                        fontWeight: 700,
                        background: 'rgba(214, 82, 58, 0.12)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid rgba(214, 82, 58, 0.25)',
                      }}
                    >
                      {s.key}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(247, 245, 239, 0.75)', fontFamily: "'Inter', sans-serif" }}>
                      {s.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Card */}
            <div
              style={{
                background: '#111216',
                borderRadius: 12,
                border: '1px solid rgba(247, 245, 239, 0.08)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={18} color="var(--accent, #D6523A)" />
                <h3
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#F7F5EF',
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  Client-Side Execution Engine
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.55, color: 'rgba(247, 245, 239, 0.7)', fontFamily: "'Inter', sans-serif" }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#F7F5EF' }}>Zero Backend Execution:</strong> Every step, variable mutation, and stack frame is traced directly inside client-side Web Workers using Babel AST transforms and Pyodide WebAssembly.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#F7F5EF' }}>Memory Snapshot Model:</strong> At each step, variables and data structures are deeply cloned and formatted into standardized <code style={{ color: 'var(--accent, #D6523A)', fontFamily: "'JetBrains Mono', monospace" }}>TraceStep</code> shapes rendered by modular D3/SVG canvases.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#F7F5EF' }}>Infinite Loop Protection:</strong> Sandboxed execution guards with automatic 5,000-step ceiling and 10,000ms wall-clock safety timeouts prevent browser freeze.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
