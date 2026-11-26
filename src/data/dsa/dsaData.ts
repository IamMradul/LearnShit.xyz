export type DsaKind = 'data-structure' | 'algorithm';

export type DsaCategory =
  | 'Linear'
  | 'Hashing'
  | 'Trees & Heaps'
  | 'Advanced Structures'
  | 'Sorting'
  | 'Searching'
  | 'Graphs'
  | 'Paradigms';

export interface ComplexityEntry {
  best: string;
  average: string;
  worst: string;
}

export interface DsaOperation {
  name: string;
  time: string;
  space: string;
}

export interface DsaTopic {
  id: string;
  monogram: string;
  name: string;
  kind: DsaKind;
  category: DsaCategory;
  insight: string;
  timeComplexity: ComplexityEntry;
  spaceComplexity: string;
  operations: DsaOperation[];
}

export const DSA_TOPICS: DsaTopic[] = [
  {
    id: 'dynamic-array',
    monogram: 'DA',
    name: 'Dynamic Array',
    kind: 'data-structure',
    category: 'Linear',
    insight:
      'Contiguous storage delivers O(1) indexed access by offset arithmetic, while geometric doubling keeps appends O(1) amortized at the cost of O(n) mid-array shifts.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1) append · O(n) scan',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Access (by index)', time: 'O(1)', space: 'O(1)' },
      { name: 'Search (unsorted / sorted)', time: 'O(n) / O(log n)', space: 'O(1)' },
      { name: 'Insertion (append)', time: 'O(1) amortized', space: 'O(1) · O(n) resize' },
      { name: 'Insertion (at index i)', time: 'O(n)', space: 'O(1)' },
      { name: 'Deletion (pop back)', time: 'O(1)', space: 'O(1)' },
      { name: 'Deletion (at index i)', time: 'O(n)', space: 'O(1)' },
    ],
  },
  {
    id: 'linked-list',
    monogram: 'LL',
    name: 'Singly & Doubly Linked List',
    kind: 'data-structure',
    category: 'Linear',
    insight:
      'Pointer-linked nodes rewire head and neighbor links in O(1) time and O(1) space, trading away O(1) random indexing in favor of O(n) traversal.',
    timeComplexity: {
      best: 'O(1) head op',
      average: 'O(n) search',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Access (by index)', time: 'O(n)', space: 'O(1)' },
      { name: 'Search (by value)', time: 'O(n)', space: 'O(1)' },
      { name: 'Insertion (head / tail w/ ptr)', time: 'O(1)', space: 'O(1)' },
      { name: 'Insertion (after given node)', time: 'O(1)', space: 'O(1)' },
      { name: 'Deletion (head)', time: 'O(1)', space: 'O(1)' },
      { name: 'Deletion (tail: singly / doubly)', time: 'O(n) / O(1)', space: 'O(1)' },
    ],
  },
  {
    id: 'stack',
    monogram: 'ST',
    name: 'Stack (LIFO)',
    kind: 'data-structure',
    category: 'Linear',
    insight:
      'Restricting mutations strictly to the top pointer guarantees deterministic O(1) push, pop, and peek with zero auxiliary space beyond stored elements.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1) push/pop',
      worst: 'O(n) search',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Access (peek top)', time: 'O(1)', space: 'O(1)' },
      { name: 'Search (by value)', time: 'O(n)', space: 'O(1)' },
      { name: 'Insertion (push)', time: 'O(1)', space: 'O(1)' },
      { name: 'Deletion (pop)', time: 'O(1)', space: 'O(1)' },
    ],
  },
  {
    id: 'queue-deque',
    monogram: 'QD',
    name: 'Queue & Deque (FIFO)',
    kind: 'data-structure',
    category: 'Linear',
    insight:
      'Ring buffers or doubly linked ends keep insertion and removal at O(1) at both front and back, with arbitrary value lookup remaining O(n).',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1) ends',
      worst: 'O(n) search',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Access (front / back)', time: 'O(1)', space: 'O(1)' },
      { name: 'Search (by value)', time: 'O(n)', space: 'O(1)' },
      { name: 'Insertion (enqueue / push ends)', time: 'O(1)', space: 'O(1)' },
      { name: 'Deletion (dequeue / pop ends)', time: 'O(1)', space: 'O(1)' },
    ],
  },
  {
    id: 'hash-table',
    monogram: 'HT',
    name: 'Hash Table / Hash Map',
    kind: 'data-structure',
    category: 'Hashing',
    insight:
      'Mapping keys directly to bucket offsets sustains expected O(1) insert, search, and delete under balanced load factors, degrading to O(n) only on severe hash collisions.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(n) collision',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Search / Lookup (get)', time: 'O(1) avg · O(n) worst', space: 'O(1)' },
      { name: 'Insertion (set / put)', time: 'O(1) avg · O(n) worst', space: 'O(1)' },
      { name: 'Deletion (remove)', time: 'O(1) avg · O(n) worst', space: 'O(1)' },
      { name: 'Rehash / Table Resize', time: 'O(n)', space: 'O(n)' },
    ],
  },
  {
    id: 'bst',
    monogram: 'BS',
    name: 'Binary Search Tree (BST)',
    kind: 'data-structure',
    category: 'Trees & Heaps',
    insight:
      'Every comparison discards half the tree only while height h stays logarithmic; unrotated monotonic inserts skew the chain to O(n) time and O(n) recursion stack.',
    timeComplexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(n) skewed',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Search', time: 'O(log n) avg · O(n) worst', space: 'O(1) iter · O(h) rec' },
      { name: 'Insertion', time: 'O(log n) avg · O(n) worst', space: 'O(1) iter · O(h) rec' },
      { name: 'Deletion', time: 'O(log n) avg · O(n) worst', space: 'O(h)' },
      { name: 'Inorder Traversal', time: 'O(n)', space: 'O(h)' },
    ],
  },
  {
    id: 'balanced-bst',
    monogram: 'AV',
    name: 'Balanced BST (AVL / Red-Black)',
    kind: 'data-structure',
    category: 'Trees & Heaps',
    insight:
      'Constant-time tree rotations strictly bound height at h = O(log n), locking worst-case search, insertion, and deletion to logarithmic time.',
    timeComplexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Search', time: 'O(log n)', space: 'O(1) iter' },
      { name: 'Insertion (w/ rotations)', time: 'O(log n)', space: 'O(log n) · O(1) iter' },
      { name: 'Deletion (w/ rotations)', time: 'O(log n)', space: 'O(log n) · O(1) iter' },
      { name: 'Find Min / Max', time: 'O(log n)', space: 'O(1)' },
    ],
  },
  {
    id: 'binary-heap',
    monogram: 'HP',
    name: 'Binary Heap (Priority Queue)',
    kind: 'data-structure',
    category: 'Trees & Heaps',
    insight:
      'Complete-tree array indexing exposes the extremum at index 0 in O(1), while sift-up and sift-down maintain heap order in O(log n) with zero pointer space.',
    timeComplexity: {
      best: 'O(1) peek',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Access (peek min / max)', time: 'O(1)', space: 'O(1)' },
      { name: 'Search (arbitrary key)', time: 'O(n)', space: 'O(1)' },
      { name: 'Insertion (push)', time: 'O(log n)', space: 'O(1)' },
      { name: 'Deletion (extract min / max)', time: 'O(log n)', space: 'O(1)' },
      { name: 'Build Heap (heapify)', time: 'O(n)', space: 'O(1) in-place' },
    ],
  },
  {
    id: 'trie',
    monogram: 'TR',
    name: 'Trie (Prefix Tree)',
    kind: 'data-structure',
    category: 'Trees & Heaps',
    insight:
      'Lookup, insert, and prefix queries scale strictly with word length L rather than corpus size N, exchanging per-edge alphabet pointer space for deterministic O(L) traversal.',
    timeComplexity: {
      best: 'O(L)',
      average: 'O(L)',
      worst: 'O(L)',
    },
    spaceComplexity: 'O(N · L · Σ)',
    operations: [
      { name: 'Search Exact Word', time: 'O(L)', space: 'O(1)' },
      { name: 'Prefix Search (startsWith)', time: 'O(L)', space: 'O(1)' },
      { name: 'Insertion (word length L)', time: 'O(L)', space: 'O(L · Σ)' },
      { name: 'Deletion', time: 'O(L)', space: 'O(L) stack' },
    ],
  },
  {
    id: 'dsu-union-find',
    monogram: 'UF',
    name: 'Disjoint Set Union (Union-Find)',
    kind: 'data-structure',
    category: 'Advanced Structures',
    insight:
      'Combining union by rank with path compression flattens parent chains so Find and Union run in near-constant O(α(n)) amortized time across linear O(n) arrays.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(α(n))',
      worst: 'O(α(n))',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Search / Find Root', time: 'O(α(n)) amortized', space: 'O(α(n))' },
      { name: 'Insertion / Union Sets', time: 'O(α(n)) amortized', space: 'O(1)' },
      { name: 'Connected Query', time: 'O(α(n))', space: 'O(1)' },
      { name: 'Initialize n Sets', time: 'O(n)', space: 'O(n)' },
    ],
  },
  {
    id: 'segment-fenwick-tree',
    monogram: 'SG',
    name: 'Segment Tree & Fenwick Tree',
    kind: 'data-structure',
    category: 'Advanced Structures',
    insight:
      'Decomposing any [L, R] range into O(log n) dyadic intervals allows both point updates and range aggregates in logarithmic time inside linear O(4n) or O(n) storage.',
    timeComplexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(4n) Seg · O(n) BIT',
    operations: [
      { name: 'Build Structure', time: 'O(n)', space: 'O(n) / O(4n)' },
      { name: 'Search / Range Query [L, R]', time: 'O(log n)', space: 'O(log n) Seg · O(1) BIT' },
      { name: 'Point Update', time: 'O(log n)', space: 'O(log n) Seg · O(1) BIT' },
      { name: 'Lazy Range Update', time: 'O(log n)', space: 'O(n) lazy array' },
    ],
  },
  {
    id: 'merge-sort',
    monogram: 'MS',
    name: 'Merge Sort',
    kind: 'algorithm',
    category: 'Sorting',
    insight:
      'Balanced recursive splitting guarantees strict O(n log n) worst-case sorting, needing O(n) scratch space for contiguous arrays or only O(log n) stack space for linked lists.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n) array · O(log n) list',
    operations: [
      { name: 'Full Sort (Array)', time: 'O(n log n)', space: 'O(n)' },
      { name: 'Full Sort (Linked List)', time: 'O(n log n)', space: 'O(log n) stack' },
      { name: 'Merge Two Halves', time: 'O(n)', space: 'O(n)' },
    ],
  },
  {
    id: 'quick-sort',
    monogram: 'QS',
    name: 'Quick Sort',
    kind: 'algorithm',
    category: 'Sorting',
    insight:
      'In-place pivot partitioning sorts in expected O(n log n) time and O(log n) stack space with high cache efficiency, spiking to O(n²) only under consistently adversarial pivots.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(log n) avg · O(n) worst',
    operations: [
      { name: 'Partition (Lomuto / Hoare)', time: 'O(n)', space: 'O(1)' },
      { name: 'Balanced Sort', time: 'O(n log n)', space: 'O(log n) stack' },
      { name: 'Worst-Case Pivot Sort', time: 'O(n²)', space: 'O(n) stack' },
    ],
  },
  {
    id: 'elementary-sorts',
    monogram: 'ES',
    name: 'Insertion / Selection / Bubble Sort',
    kind: 'algorithm',
    category: 'Sorting',
    insight:
      'Zero auxiliary memory O(1) in-place scans run in quadratic O(n²) general time, with Insertion Sort uniquely finishing nearly sorted inputs in O(n).',
    timeComplexity: {
      best: 'O(n) Ins/Bubble · O(n²) Sel',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    operations: [
      { name: 'Insertion Sort (nearly sorted / avg)', time: 'O(n) / O(n²)', space: 'O(1)' },
      { name: 'Selection Sort (min scans)', time: 'O(n²)', space: 'O(1)' },
      { name: 'Bubble Sort (adaptive flag)', time: 'O(n) best · O(n²) worst', space: 'O(1)' },
    ],
  },
  {
    id: 'counting-radix-sort',
    monogram: 'CR',
    name: 'Counting & Radix Sort',
    kind: 'algorithm',
    category: 'Sorting',
    insight:
      'Sidestepping the Ω(n log n) comparison barrier via frequency buckets yields linear-time O(n + k) sorting in exchange for O(n + k) bucket storage.',
    timeComplexity: {
      best: 'O(n + k)',
      average: 'O(n + k)',
      worst: 'O(n + k)',
    },
    spaceComplexity: 'O(n + k)',
    operations: [
      { name: 'Counting Sort (range k)', time: 'O(n + k)', space: 'O(n + k)' },
      { name: 'Radix Sort (d digits, base b)', time: 'O(d · (n + b))', space: 'O(n + b)' },
    ],
  },
  {
    id: 'binary-search',
    monogram: 'BN',
    name: 'Binary Search',
    kind: 'algorithm',
    category: 'Searching',
    insight:
      'Halving a monotonic domain drops search time from O(n) to O(log n) using strict O(1) iterative space and three pointer variables.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1) iter · O(log n) rec',
    operations: [
      { name: 'Exact Target Search', time: 'O(log n)', space: 'O(1)' },
      { name: 'Lower / Upper Bound', time: 'O(log n)', space: 'O(1)' },
      { name: 'Search on Monotonic Answer', time: 'O(log R · check)', space: 'O(1)' },
    ],
  },
  {
    id: 'graph-bfs-dfs',
    monogram: 'GR',
    name: 'Graph Traversal (BFS & DFS)',
    kind: 'algorithm',
    category: 'Graphs',
    insight:
      'Tracking visited nodes ensures every vertex V and edge E is processed once in O(V + E) time while frontier queues or recursion stacks stay within O(V) space.',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    operations: [
      { name: 'Breadth-First Search (BFS)', time: 'O(V + E)', space: 'O(V) queue + visited' },
      { name: 'Depth-First Search (DFS)', time: 'O(V + E)', space: 'O(V) stack + visited' },
      { name: 'Topological Sort (DAG)', time: 'O(V + E)', space: 'O(V)' },
    ],
  },
  {
    id: 'shortest-paths',
    monogram: 'SP',
    name: 'Shortest Paths (Dijkstra / Bellman-Ford / Floyd)',
    kind: 'algorithm',
    category: 'Graphs',
    insight:
      'Heap-driven greedy relaxation computes single-source paths in O((V + E) log V), whereas general negative weights or all-pairs tables escalate to O(V · E) and O(V³).',
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O(V³) Floyd-Warshall',
    },
    spaceComplexity: 'O(V + E) · O(V²) Floyd',
    operations: [
      { name: 'Dijkstra (Min-Heap)', time: 'O((V + E) log V)', space: 'O(V + E)' },
      { name: 'Bellman-Ford (Edge Relax)', time: 'O(V · E)', space: 'O(V)' },
      { name: 'Floyd-Warshall (All-Pairs)', time: 'O(V³)', space: 'O(V²)' },
    ],
  },
  {
    id: 'dynamic-programming',
    monogram: 'DP',
    name: 'Dynamic Programming (DP)',
    kind: 'algorithm',
    category: 'Paradigms',
    insight:
      'Caching overlapping subproblems trades O(States) memory for polynomial time proportional to State count × Transition cost, often compressing further to rolling O(1)/O(Row) arrays.',
    timeComplexity: {
      best: 'O(States · Transitions)',
      average: 'O(States · Transitions)',
      worst: 'O(States · Transitions)',
    },
    spaceComplexity: 'O(States) · O(1) rolling',
    operations: [
      { name: 'Top-Down Memoization', time: 'O(States · Trans)', space: 'O(States + Depth)' },
      { name: 'Bottom-Up Tabulation', time: 'O(States · Trans)', space: 'O(States)' },
      { name: 'Space-Compressed DP', time: 'O(States · Trans)', space: 'O(1) or O(Row)' },
    ],
  },
  {
    id: 'backtracking-bitmask',
    monogram: 'BT',
    name: 'Backtracking & Bit Manipulation',
    kind: 'algorithm',
    category: 'Paradigms',
    insight:
      'State-space search branches exponentially across O(2ⁿ) or O(n!) outcomes while mutating only O(n) call-stack depth; register bit operations settle in O(1) time and O(1) space.',
    timeComplexity: {
      best: 'O(1) bit op',
      average: 'O(2ⁿ) subsets · O(n!) perms',
      worst: 'O(n!)',
    },
    spaceComplexity: 'O(n) stack · O(1) bit ops',
    operations: [
      { name: 'Subset Enumeration', time: 'O(n · 2ⁿ)', space: 'O(n) stack' },
      { name: 'Permutation Search', time: 'O(n · n!)', space: 'O(n) stack' },
      { name: 'Bit Check / Set / Clear / Toggle', time: 'O(1)', space: 'O(1)' },
    ],
  },
];
