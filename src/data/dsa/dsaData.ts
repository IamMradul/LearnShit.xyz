export type DsaKind = 'data-structure' | 'algorithm';

export type DsaCategory =
  | 'Linear Data Structures'
  | 'Trees & Hierarchies'
  | 'Graphs & Networks'
  | 'Hash & Sets'
  | 'Advanced Data Structures'
  | 'Sorting Algorithms'
  | 'Searching & Two Pointers'
  | 'Graph Algorithms'
  | 'Dynamic Programming'
  | 'Backtracking & Recursion'
  | 'Greedy Algorithms'
  | 'Bit Manipulation & Math';

export interface ComplexityEntry {
  best: string;
  average: string;
  worst: string;
}

export interface DsaOperation {
  name: string;
  time: string;
  description: string;
}

export interface DsaTopic {
  id: string;
  name: string;
  kind: DsaKind;
  category: DsaCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  timeComplexity: ComplexityEntry;
  spaceComplexity: string;
  operations?: DsaOperation[];
  keyInvariants: string[];
  commonProblems: string[];
  codeLanguage: 'javascript' | 'python';
  codeSnippet: string;
  sampleInput?: string;
  visualizerPresetId?: string;
}

export const DSA_TOPICS: DsaTopic[] = [
  // ── 1. Dynamic Array ────────────────────────────────────────────────────────
  {
    id: 'dynamic-array',
    name: 'Dynamic Array (Vector / ArrayList)',
    kind: 'data-structure',
    category: 'Linear Data Structures',
    difficulty: 'Beginner',
    summary:
      'A contiguous block of memory with random access that automatically doubles its capacity when filled. Offers amortized O(1) appends.',
    timeComplexity: {
      best: 'O(1) access',
      average: 'O(1) append amortized',
      worst: 'O(n) insert/delete at start',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Access by Index', time: 'O(1)', description: 'Direct pointer arithmetic: base + i * size.' },
      { name: 'Append (Push Back)', time: 'O(1) amortized', description: 'O(1) when capacity remains; O(n) reallocation when full.' },
      { name: 'Insert/Delete at k', time: 'O(n)', description: 'Requires shifting n - k elements.' },
      { name: 'Search', time: 'O(n)', description: 'Linear scan unless sorted.' },
    ],
    keyInvariants: [
      'Contiguous cache-friendly memory ensures maximum CPU L1/L2 cache line hits.',
      'Amortized cost of doubling strategy is 3 units of work per element.',
      'Resizing creates temporary memory overhead (up to 2x geometric capacity).',
    ],
    commonProblems: ['Two Sum', 'Maximum Subarray (Kadane)', 'Trapping Rain Water', 'Rotate Array'],
    codeLanguage: 'javascript',
    codeSnippet: `function dynamicArrayDemo() {
  const arr = [10, 20, 30];
  arr.push(40); // O(1) amortized append
  const val = arr[2]; // O(1) random access
  arr.splice(1, 0, 15); // O(n) insert with shift
  return arr;
}`,
    sampleInput: '[]',
  },

  // ── 2. Linked List ──────────────────────────────────────────────────────────
  {
    id: 'singly-linked-list',
    name: 'Singly Linked List',
    kind: 'data-structure',
    category: 'Linear Data Structures',
    difficulty: 'Beginner',
    summary:
      'Linear collection of nodes where each node contains data and a pointer to the next node. Allows O(1) insertions/deletions at known pointers without shifting.',
    timeComplexity: {
      best: 'O(1) head insertion',
      average: 'O(n) search/access',
      worst: 'O(n) access by index',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Prepend (Push Front)', time: 'O(1)', description: 'Update head to new node pointing to old head.' },
      { name: 'Append (with tail)', time: 'O(1)', description: 'Tail next points to new node.' },
      { name: 'Search / Access k-th', time: 'O(n)', description: 'Must traverse from head via pointer hops.' },
      { name: 'Delete node after ptr', time: 'O(1)', description: 'ptr.next = ptr.next.next.' },
    ],
    keyInvariants: [
      'No contiguous memory requirement; eliminates memory fragmentation.',
      'Extra memory pointer overhead per element (8 bytes on 64-bit architectures).',
      'Non-cache-friendly due to pointer chasing across arbitrary heap addresses.',
    ],
    commonProblems: ['Reverse Linked List', 'Detect Cycle (Floyd Tortoise & Hare)', 'Merge Two Sorted Lists', 'LRU Cache'],
    codeLanguage: 'javascript',
    codeSnippet: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
    sampleInput: '[[1, 2, 3, 4, 5]]',
    visualizerPresetId: 'reverse-linked-list',
  },

  // ── 3. Stack ────────────────────────────────────────────────────────────────
  {
    id: 'stack',
    name: 'Stack (LIFO & Monotonic Stack)',
    kind: 'data-structure',
    category: 'Linear Data Structures',
    difficulty: 'Beginner',
    summary:
      'Last-In First-Out (LIFO) structure supporting O(1) push and pop. Fundamental for recursive function calls, backtracking, and next-greater-element monotonic scans.',
    timeComplexity: {
      best: 'O(1) push/pop',
      average: 'O(1) push/pop',
      worst: 'O(n) search',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Push', time: 'O(1)', description: 'Add item to the top.' },
      { name: 'Pop', time: 'O(1)', description: 'Remove and return top item.' },
      { name: 'Peek (Top)', time: 'O(1)', description: 'Inspect top element without removal.' },
      { name: 'IsEmpty', time: 'O(1)', description: 'Check if element count is 0.' },
    ],
    keyInvariants: [
      'Strict LIFO order ensures reversal and nested structure matching (parentheses, XML tags).',
      'Monotonic Stack invariant: maintaining elements in strictly ascending/descending order solves Next Greater Element in O(n) total amortized time.',
    ],
    commonProblems: ['Valid Parentheses', 'Daily Temperatures', 'Largest Rectangle in Histogram', 'Evaluate Reverse Polish Notation'],
    codeLanguage: 'javascript',
    codeSnippet: `function isValidParentheses(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch in map) {
      if (stack.length === 0 || stack.pop() !== map[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
    sampleInput: '["()[]{}"]',
  },

  // ── 4. Queue & Deque ────────────────────────────────────────────────────────
  {
    id: 'queue-deque',
    name: 'Queue & Double-Ended Queue (Deque)',
    kind: 'data-structure',
    category: 'Linear Data Structures',
    difficulty: 'Beginner',
    summary:
      'First-In First-Out (FIFO) queue and bidirectional deque. Crucial for level-order BFS traversals, asynchronous event loops, and sliding window maximum queries.',
    timeComplexity: {
      best: 'O(1) enqueue/dequeue',
      average: 'O(1) enqueue/dequeue',
      worst: 'O(n) search',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Enqueue / Push Back', time: 'O(1)', description: 'Insert at rear.' },
      { name: 'Dequeue / Pop Front', time: 'O(1)', description: 'Remove from front.' },
      { name: 'Push Front / Pop Back (Deque)', time: 'O(1)', description: 'Double-ended operations.' },
    ],
    keyInvariants: [
      'FIFO order guarantees shortest path in unweighted graphs during BFS.',
      'Monotonic Deque keeps indices with decreasing values to answer Sliding Window Maximum in O(n).',
    ],
    commonProblems: ['Sliding Window Maximum', 'BFS Shortest Path', 'Implement Queue using Stacks', 'Design Circular Queue'],
    codeLanguage: 'javascript',
    codeSnippet: `function maxSlidingWindow(nums, k) {
  const deque = []; // stores indices
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    while (deque.length > 0 && deque[0] <= i - k) deque.shift();
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}`,
    sampleInput: '[[1,3,-1,-3,5,3,6,7], 3]',
  },

  // ── 5. Hash Table ───────────────────────────────────────────────────────────
  {
    id: 'hash-table',
    name: 'Hash Table / Hash Map',
    kind: 'data-structure',
    category: 'Hash & Sets',
    difficulty: 'Beginner',
    summary:
      'Associative key-value store using a hash function to map keys to bucket indices. Delivers average O(1) lookup, insert, and delete.',
    timeComplexity: {
      best: 'O(1) lookup/insert',
      average: 'O(1) amortized',
      worst: 'O(n) hash collision clustering',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Get(key)', time: 'O(1) avg', description: 'Hash key and traverse bucket chain or probe.' },
      { name: 'Set(key, val)', time: 'O(1) avg', description: 'Insert into bucket; resize if load factor exceeded.' },
      { name: 'Delete(key)', time: 'O(1) avg', description: 'Remove key entry.' },
    ],
    keyInvariants: [
      'Load factor threshold (typically 0.70-0.75) triggers array resizing to prevent chain degradation.',
      'Keys must be hashable and have stable equality semantics.',
      'Collision resolution methods: Chaining (linked lists / red-black trees) or Open Addressing (linear/quadratic probing, robin hood hashing).',
    ],
    commonProblems: ['Two Sum', 'Group Anagrams', 'Subarray Sum Equals K', 'LRU Cache Design'],
    codeLanguage: 'javascript',
    codeSnippet: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    sampleInput: '[[2, 7, 11, 15], 9]',
    visualizerPresetId: 'two-sum',
  },

  // ── 6. Binary Search Tree ───────────────────────────────────────────────────
  {
    id: 'bst',
    name: 'Binary Search Tree (BST)',
    kind: 'data-structure',
    category: 'Trees & Hierarchies',
    difficulty: 'Intermediate',
    summary:
      'Binary tree where for every node: all values in the left subtree are strictly less, and all values in the right subtree are strictly greater. Inorder traversal yields sorted order.',
    timeComplexity: {
      best: 'O(1) root access',
      average: 'O(log n) search/insert',
      worst: 'O(n) degenerate skewed tree',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Search', time: 'O(h)', description: 'Compare with current node and branch left or right.' },
      { name: 'Insert', time: 'O(h)', description: 'Find insertion leaf preserving BST invariant.' },
      { name: 'Delete', time: 'O(h)', description: 'Three cases: leaf, 1 child, or 2 children (replace with inorder successor).' },
      { name: 'Inorder Traversal', time: 'O(n)', description: 'Visits left -> node -> right in ascending order.' },
    ],
    keyInvariants: [
      'BST Invariant: Left.val < Node.val < Right.val holds recursively for all subtrees.',
      'Tree height h determines complexity: h = O(log n) when balanced, h = O(n) when sorted input produces a linked list.',
    ],
    commonProblems: ['Validate BST', 'Kth Smallest in BST', 'Lowest Common Ancestor in BST', 'Inorder Successor'],
    codeLanguage: 'javascript',
    codeSnippet: `function searchBST(root, val) {
  let curr = root;
  while (curr !== null) {
    if (curr.val === val) return curr;
    if (val < curr.val) curr = curr.left;
    else curr = curr.right;
  }
  return null;
}`,
    sampleInput: '[[4, 2, 7, 1, 3], 2]',
    visualizerPresetId: 'bst-search',
  },

  // ── 7. Binary Heap / Priority Queue ─────────────────────────────────────────
  {
    id: 'binary-heap',
    name: 'Binary Heap & Priority Queue',
    kind: 'data-structure',
    category: 'Trees & Hierarchies',
    difficulty: 'Intermediate',
    summary:
      'Complete binary tree satisfying the heap property (parent is always <= children for min-heap, >= for max-heap). Efficiently mapped to an array: children of index i are at 2i + 1 and 2i + 2.',
    timeComplexity: {
      best: 'O(1) peek min/max',
      average: 'O(log n) push/pop',
      worst: 'O(log n) push/pop',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Find Min / Max', time: 'O(1)', description: 'Direct access to root array[0].' },
      { name: 'Insert (Push)', time: 'O(log n)', description: 'Append to end and bubble up (heapify up).' },
      { name: 'Extract Min / Max', time: 'O(log n)', description: 'Swap root with last, pop last, bubble down (heapify down).' },
      { name: 'Build Heap (Heapify)', time: 'O(n)', description: 'Bottom-up sift-down of non-leaf nodes runs in linear time.' },
    ],
    keyInvariants: [
      'Complete tree shape invariant ensures array representation with zero pointer overhead.',
      'Heapify builds an n-element heap in mathematically proven O(n) time, not O(n log n).',
    ],
    commonProblems: ['Merge K Sorted Lists', 'Top K Frequent Elements', 'Find Median from Data Stream', 'Dijkstra Shortest Path'],
    codeLanguage: 'python',
    codeSnippet: `import heapq

def findKthLargest(nums, k):
    # Maintain a min-heap of size k
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
    sampleInput: '[[3, 2, 1, 5, 6, 4], 2]',
  },

  // ── 8. Trie (Prefix Tree) ───────────────────────────────────────────────────
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    kind: 'data-structure',
    category: 'Trees & Hierarchies',
    difficulty: 'Intermediate',
    summary:
      'Tree-based data structure used to store and retrieve keys in a dataset of strings. Extremely fast for autocomplete, prefix matching, and word games.',
    timeComplexity: {
      best: 'O(L) insert/search (L = word length)',
      average: 'O(L)',
      worst: 'O(L)',
    },
    spaceComplexity: 'O(N * L * Σ) (where Σ is alphabet size)',
    operations: [
      { name: 'Insert(word)', time: 'O(L)', description: 'Walk characters, creating child nodes when missing.' },
      { name: 'Search(word)', time: 'O(L)', description: 'Traverse down word characters; return true if isEndOfWord.' },
      { name: 'StartsWith(prefix)', time: 'O(L)', description: 'Return true if prefix path exists in trie.' },
    ],
    keyInvariants: [
      'Common prefixes share memory branches, reducing space for large dictionaries.',
      'Lookup time is strictly dependent on word length L, independent of dictionary size N.',
    ],
    commonProblems: ['Implement Trie', 'Word Search II', 'Design Add and Search Words', 'Maximum XOR of Two Numbers'],
    codeLanguage: 'javascript',
    codeSnippet: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }
}`,
    sampleInput: '[]',
  },

  // ── 9. Disjoint Set Union (DSU / Union-Find) ────────────────────────────────
  {
    id: 'dsu-union-find',
    name: 'Disjoint Set Union (DSU / Union-Find)',
    kind: 'data-structure',
    category: 'Advanced Data Structures',
    difficulty: 'Intermediate',
    summary:
      'Tracks elements partitioned into disjoint subsets. Supports near-constant time operations to determine if two elements belong to the same set and merge sets using Path Compression and Union by Rank.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(α(n)) ≈ O(1)',
      worst: 'O(α(n)) (Inverse Ackermann)',
    },
    spaceComplexity: 'O(n)',
    operations: [
      { name: 'Find(x)', time: 'O(α(n))', description: 'Returns root representative of x, flattening tree via path compression.' },
      { name: 'Union(x, y)', time: 'O(α(n))', description: 'Attaches smaller rank root under larger rank root.' },
      { name: 'Connected(x, y)', time: 'O(α(n))', description: 'Find(x) === Find(y).' },
    ],
    keyInvariants: [
      'Path compression makes tree depth flat (<= 4 for all practical universe sizes).',
      'Union by rank/size prevents long degenerated trees.',
    ],
    commonProblems: ['Number of Connected Components', 'Redundant Connection', 'Kruskal MST', 'Accounts Merge'],
    codeLanguage: 'javascript',
    codeSnippet: `class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  union(x, y) {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else { this.parent[ry] = rx; this.rank[rx]++; }
    return true;
  }
}`,
    sampleInput: '[]',
  },

  // ── 10. Segment Tree & Fenwick Tree ─────────────────────────────────────────
  {
    id: 'segment-tree',
    name: 'Segment Tree & Fenwick Tree (BIT)',
    kind: 'data-structure',
    category: 'Advanced Data Structures',
    difficulty: 'Advanced',
    summary:
      'Tree structure for answering dynamic range queries (sum, min, max, gcd) and point/range updates in O(log n) time.',
    timeComplexity: {
      best: 'O(1) build leaf',
      average: 'O(log n) query & update',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(4n) for Segment Tree, O(n) for Fenwick Tree',
    operations: [
      { name: 'Range Query [L, R]', time: 'O(log n)', description: 'Breaks query into at most 2 * log n canonical node intervals.' },
      { name: 'Point Update', time: 'O(log n)', description: 'Updates leaf and recalculates ancestors.' },
      { name: 'Lazy Propagation', time: 'O(log n)', description: 'Defers updates to subtrees to allow O(log n) range updates.' },
    ],
    keyInvariants: [
      'Segment tree represents associative binary operations on segments.',
      'Fenwick tree uses lowest set bit (i & -i) to compress prefix sums into a single 1-indexed array.',
    ],
    commonProblems: ['Range Sum Query - Mutable', 'Count of Smaller Numbers After Self', 'Interval Minimum Queries'],
    codeLanguage: 'javascript',
    codeSnippet: `class FenwickTree {
  constructor(n) {
    this.tree = Array(n + 1).fill(0);
  }
  update(i, delta) {
    for (; i < this.tree.length; i += i & -i) this.tree[i] += delta;
  }
  query(i) {
    let sum = 0;
    for (; i > 0; i -= i & -i) sum += this.tree[i];
    return sum;
  }
}`,
    sampleInput: '[]',
  },

  // ── 11. Sorting: Merge Sort & Quick Sort ────────────────────────────────────
  {
    id: 'merge-quick-sort',
    name: 'Divide & Conquer Sorting (Merge & Quick Sort)',
    kind: 'algorithm',
    category: 'Sorting Algorithms',
    difficulty: 'Intermediate',
    summary:
      'Merge Sort guarantees O(n log n) stable sorting by dividing in half and merging. Quick Sort sorts in-place by partitioning around a pivot, achieving fast cache-friendly performance with O(n log n) average time.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'Merge: O(n log n) | Quick: O(n²)',
    },
    spaceComplexity: 'Merge Sort: O(n) auxiliary | Quick Sort: O(log n) recursion stack',
    operations: [
      { name: 'Merge Sort', time: 'O(n log n)', description: 'Stable, predictable, ideal for linked lists and external storage.' },
      { name: 'Quick Sort', time: 'O(n log n) avg', description: 'In-place cache-friendly; worst case avoided via randomized pivot.' },
    ],
    keyInvariants: [
      'Merge Sort invariant: Left and right halves are recursively sorted before merging.',
      'Quick Sort Lomuto/Hoare partition invariant: Elements left of pivot <= pivot <= elements right of pivot.',
    ],
    commonProblems: ['Sort an Array', 'Kth Largest Element in an Array', 'Reverse Pairs', 'Count Inversions'],
    codeLanguage: 'javascript',
    codeSnippet: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  const merged = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) merged.push(left[i++]);
    else merged.push(right[j++]);
  }
  return merged.concat(left.slice(i)).concat(right.slice(j));
}`,
    sampleInput: '[[38, 27, 43, 3, 9, 82, 10]]',
    visualizerPresetId: 'quick-sort',
  },

  // ── 12. Binary Search ───────────────────────────────────────────────────────
  {
    id: 'binary-search',
    name: 'Binary Search & Lower/Upper Bound',
    kind: 'algorithm',
    category: 'Searching & Two Pointers',
    difficulty: 'Beginner',
    summary:
      'Searches a monotonic (sorted or boolean-predicate) search space by repeatedly halving the search interval. Generalizes to "Binary Search on Answer".',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    operations: [
      { name: 'Exact Match', time: 'O(log n)', description: 'Finds index of target or returns -1.' },
      { name: 'Lower Bound (bisect_left)', time: 'O(log n)', description: 'First index where arr[i] >= target.' },
      { name: 'Upper Bound (bisect_right)', time: 'O(log n)', description: 'First index where arr[i] > target.' },
      { name: 'Binary Search on Answer', time: 'O(log(range) * checkCost)', description: 'Finds min/max feasible value on monotonic check predicate.' },
    ],
    keyInvariants: [
      'Calculation of mid: `mid = low + Math.floor((high - low) / 2)` prevents integer overflow.',
      'Loop condition `low <= high` vs `low < high` must match update bounds (`mid + 1` vs `mid`).',
    ],
    commonProblems: ['Binary Search', 'Search in Rotated Sorted Array', 'Capacity to Ship Packages', 'Koko Eating Bananas'],
    codeLanguage: 'javascript',
    codeSnippet: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    sampleInput: '[[-1, 0, 3, 5, 9, 12], 9]',
    visualizerPresetId: 'binary-search',
  },

  // ── 13. Graph Traversals: BFS & DFS ─────────────────────────────────────────
  {
    id: 'graph-bfs-dfs',
    name: 'Graph Traversals: BFS & DFS',
    kind: 'algorithm',
    category: 'Graph Algorithms',
    difficulty: 'Intermediate',
    summary:
      'BFS explores neighbors layer-by-layer using a queue, finding unweighted shortest paths. DFS explores deeply along branches using a stack/recursion, fundamental for cycle detection, topological sorting, and connected components.',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V) for visited set, queue / recursion stack',
    operations: [
      { name: 'BFS', time: 'O(V + E)', description: 'Level-order queue search. Finds shortest unweighted path.' },
      { name: 'DFS', time: 'O(V + E)', description: 'Recursive or stack search. Detects cycles and Euler paths.' },
      { name: 'Topological Sort', time: 'O(V + E)', description: 'Orders DAG nodes using in-degree (Kahn) or postorder DFS.' },
    ],
    keyInvariants: [
      'Visited set is mandatory on general graphs to prevent infinite loops from cycles.',
      'In a grid with R rows and C cols, V = R*C and E = 4*R*C.',
    ],
    commonProblems: ['Number of Islands', 'Course Schedule', 'Word Ladder', 'Clone Graph'],
    codeLanguage: 'javascript',
    codeSnippet: `function bfsTraversal(adj, start = 0) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);
    for (const v of adj[u] || []) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
      }
    }
  }
  return order;
}`,
    sampleInput: '[[[1, 2], [0, 3], [0, 3], [1, 2]], 0]',
    visualizerPresetId: 'graph-bfs-traversal',
  },

  // ── 14. Dijkstra's Shortest Path ────────────────────────────────────────────
  {
    id: 'dijkstra-algorithm',
    name: "Dijkstra's Shortest Path Algorithm",
    kind: 'algorithm',
    category: 'Graph Algorithms',
    difficulty: 'Intermediate',
    summary:
      'Finds shortest paths from a single source vertex to all other vertices in a directed or undirected graph with non-negative edge weights using a Priority Queue / Min-Heap.',
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
    },
    spaceComplexity: 'O(V + E)',
    operations: [
      { name: 'Shortest Distance', time: 'O((V + E) log V)', description: 'Greedily extracts min-distance node and relaxes outgoing edges.' },
      { name: 'Path Reconstruction', time: 'O(V)', description: 'Follows parent pointers backwards from target to source.' },
    ],
    keyInvariants: [
      'Greedy choice property: Once a node is popped from the priority queue, its shortest distance is finalized.',
      'DOES NOT WORK on graphs with negative edge weights (use Bellman-Ford or SPFA instead).',
    ],
    commonProblems: ['Network Delay Time', 'Cheapest Flights Within K Stops', 'Path with Minimum Effort', 'Swim in Rising Water'],
    codeLanguage: 'python',
    codeSnippet: `import heapq

def dijkstra(n, edges, start):
    adj = {i: [] for i in range(n)}
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = {i: float('inf') for i in range(n)}
    dist[start] = 0
    pq = [(0, start)] # (cost, node)
    
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in adj[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    sampleInput: '[]',
  },

  // ── 15. Dynamic Programming ─────────────────────────────────────────────────
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming (Knapsack, LCS, LIS)',
    kind: 'algorithm',
    category: 'Dynamic Programming',
    difficulty: 'Intermediate',
    summary:
      'Optimization technique that breaks complex problems into overlapping subproblems with optimal substructure. Solved via top-down memoization or bottom-up tabulation.',
    timeComplexity: {
      best: 'O(States * Transitions)',
      average: 'O(States * Transitions)',
      worst: 'O(States * Transitions)',
    },
    spaceComplexity: 'O(States) (often optimizable to O(1) or O(columns) via space compression)',
    operations: [
      { name: 'Memoization (Top-Down)', time: 'O(States)', description: 'Recursion with cache table to avoid redundant recomputations.' },
      { name: 'Tabulation (Bottom-Up)', time: 'O(States)', description: 'Iteratively fills an array in topological dependency order.' },
      { name: 'Space Optimization', time: 'O(1) or O(N)', description: 'Keeps only preceding row/states when transitions allow.' },
    ],
    keyInvariants: [
      'Optimal Substructure: An optimal solution to the problem contains optimal solutions to subproblems.',
      'Overlapping Subproblems: The same subproblems are solved repeatedly in a naive recursive solution.',
    ],
    commonProblems: ['0/1 Knapsack', 'Longest Common Subsequence', 'Longest Increasing Subsequence', 'Coin Change', 'Edit Distance'],
    codeLanguage: 'javascript',
    codeSnippet: `function knapsack01(W, wt, val) {
  const n = wt.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      if (wt[i - 1] <= w) {
        dp[i][w] = Math.max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  return dp[n][W];
}`,
    sampleInput: '[50, [10, 20, 30], [60, 100, 120]]',
    visualizerPresetId: 'fibonacci-recursion',
  },

  // ── 16. Backtracking ────────────────────────────────────────────────────────
  {
    id: 'backtracking',
    name: 'Backtracking & State-Space Search',
    kind: 'algorithm',
    category: 'Backtracking & Recursion',
    difficulty: 'Intermediate',
    summary:
      'Algorithmic paradigm that searches incrementally for candidates to solutions, abandoning ("backtracking") candidates as soon as it determines they cannot lead to a valid solution.',
    timeComplexity: {
      best: 'O(k^d) pruned',
      average: 'O(N!) permutations / O(2^N) subsets',
      worst: 'O(N!)',
    },
    spaceComplexity: 'O(N) recursion stack',
    operations: [
      { name: 'Choose', time: 'O(1)', description: 'Select candidate and modify state.' },
      { name: 'Explore', time: 'Recursive', description: 'Recurse on modified state.' },
      { name: 'Unchoose (Backtrack)', time: 'O(1)', description: 'Revert state modification to allow sibling exploration.' },
    ],
    keyInvariants: [
      'State undo invariant: Any state changed before a recursive call must be precisely undone after the call returns.',
      'Pruning / Branch & Bound: Stopping branches early cuts factorial/exponential search spaces dramatically.',
    ],
    commonProblems: ['N-Queens', 'Permutations', 'Subsets', 'Sudoku Solver', 'Combination Sum'],
    codeLanguage: 'javascript',
    codeSnippet: `function permute(nums) {
  const res = [];
  function backtrack(start) {
    if (start === nums.length) {
      res.push([...nums]);
      return;
    }
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]]; // Choose
      backtrack(start + 1); // Explore
      [nums[start], nums[i]] = [nums[i], nums[start]]; // Unchoose
    }
  }
  backtrack(0);
  return res;
}`,
    sampleInput: '[[1, 2, 3]]',
  },

  // ── 17. Bit Manipulation ────────────────────────────────────────────────────
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation & Bitmasking',
    kind: 'algorithm',
    category: 'Bit Manipulation & Math',
    difficulty: 'Intermediate',
    summary:
      'Direct manipulation of binary bits at the CPU register level. Used for representing subsets as integers (bitmask DP), finding unique elements via XOR, and lightning-fast arithmetic.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(1)',
    operations: [
      { name: 'Check k-th bit', time: 'O(1)', description: '(n >> k) & 1' },
      { name: 'Set k-th bit', time: 'O(1)', description: 'n | (1 << k)' },
      { name: 'Clear k-th bit', time: 'O(1)', description: 'n & ~(1 << k)' },
      { name: 'Toggle k-th bit', time: 'O(1)', description: 'n ^ (1 << k)' },
      { name: 'Isolate lowest set bit', time: 'O(1)', description: 'n & -n' },
      { name: 'Clear lowest set bit', time: 'O(1)', description: 'n & (n - 1)' },
    ],
    keyInvariants: [
      'XOR properties: x ^ x = 0, x ^ 0 = x, commutative and associative.',
      'Two\'s complement: -n = ~n + 1, which enables `n & -n` to extract the least significant 1-bit.',
    ],
    commonProblems: ['Single Number', 'Counting Bits', 'Number of 1 Bits', 'Subsets using Bitmask', 'Traveling Salesperson (Bitmask DP)'],
    codeLanguage: 'javascript',
    codeSnippet: `function singleNumber(nums) {
  let unique = 0;
  for (const num of nums) {
    unique ^= num; // Every duplicate cancels out: a ^ a = 0
  }
  return unique;
}`,
    sampleInput: '[[4, 1, 2, 1, 2]]',
  },
];
