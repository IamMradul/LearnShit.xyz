import type { SupportedLanguage } from './TraceTypes';

/**
 * Strips line and block comments from source code while preserving exact line
 * counts and character offsets (replacing comment text with spaces).
 * String-aware: preserves literals in single, double, and backtick quotes.
 */
export function stripCommentsPreservingLines(code: string): string {
  let result = '';
  let inString: string | null = null;
  let inLineComment = false;
  let inBlockComment = false;
  let inDocstring: string | null = null;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = i + 1 < code.length ? code[i + 1] : '';
    const next2 = i + 2 < code.length ? code[i + 2] : '';

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        result += '\n';
      } else if (ch === '\r') {
        result += '\r';
      } else {
        result += ' ';
      }
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        result += '  ';
        i++;
      } else if (ch === '\n') {
        result += '\n';
      } else if (ch === '\r') {
        result += '\r';
      } else {
        result += ' ';
      }
      continue;
    }

    if (inDocstring) {
      if (ch === inDocstring[0] && next === inDocstring[0] && next2 === inDocstring[0]) {
        inDocstring = null;
        result += '   ';
        i += 2;
      } else if (ch === '\n') {
        result += '\n';
      } else if (ch === '\r') {
        result += '\r';
      } else {
        result += ' ';
      }
      continue;
    }

    if (inString) {
      result += ch;
      if (ch === '\\') {
        if (i + 1 < code.length) {
          result += code[i + 1];
          i++;
        }
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    // Check for comment starts
    if (ch === '/' && next === '/') {
      inLineComment = true;
      result += '  ';
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      result += '  ';
      i++;
      continue;
    }
    if (ch === '#') {
      inLineComment = true;
      result += ' ';
      continue;
    }
    if ((ch === '"' || ch === "'") && next === ch && next2 === ch) {
      inDocstring = ch + ch + ch;
      result += '   ';
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      result += ch;
      continue;
    }

    result += ch;
  }

  return result;
}

/**
 * Detects whether code is "function-only" (LeetCode style) or
 * "full-program" (Codeforces style, has a main/entry-point).
 */
const STDIN_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
  python: [/\binput\s*\(/, /\bsys\.stdin/, /\bstdin\.readline/],
  javascript: [
    /\brequire\s*\(\s*['"](?:fs|readline)['"]\s*\)/,
    /\bprocess\.(?:stdin|argv|stdout)/,
    /\bfs\.readFileSync/,
    /\breadline\b/,
    /\bprompt\s*\(/,
  ],
  cpp: [/\bcin\s*>>/, /\bscanf\s*\(/],
  java: [/\bScanner\b/, /\bSystem\.in\b/],
  go: [/\bfmt\.Scan/, /\bbufio\b/, /\bos\.Stdin/],
  rust: [/\bstd::io/, /\bstdin\s*\(/],
};

const MAIN_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
  python: [/^\s*if\s+__name__\s*==\s*["']__main__["']/m, /^\s*def\s+main\s*\(/m],
  javascript: [
    /\bfunction\s+main\s*\(/,
    /\b(?:const|let|var)\s+main\s*=/,
  ],
  cpp: [/int\s+main\s*\(/, /void\s+main\s*\(/],
  java: [/public\s+static\s+void\s+main\s*\(/],
  go: [/func\s+main\s*\(\s*\)/],
  rust: [/fn\s+main\s*\(\s*\)/],
};

function hasJsCallableEntry(code: string): boolean {
  if (/\bclass\s+Solution\b/.test(code)) return true;
  if (/\bfunction\s+(?!main\b)[A-Za-z_$]\w*\s*\(/.test(code)) return true;
  if (
    /\b(?:export\s+)?(?:async\s+)?(?:var|let|const)\s+(?!main\b)[A-Za-z_$]\w*\s*=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w]*\s*=>)/.test(
      code,
    )
  ) {
    return true;
  }
  return false;
}

function hasPythonCallableEntry(code: string): boolean {
  if (/\bclass\s+Solution\b/.test(code)) return true;
  return /^def\s+(?!main\b)[A-Za-z_]\w*\s*\(/m.test(code);
}

/**
 * Function mode = LeetCode-style entry (function, arrow, var fn = function, class Solution).
 * Full-program = main(), stdin usage, or no callable entry (run from the top).
 */
export function detectMode(
  code: string,
  language: SupportedLanguage,
): 'function' | 'full-program' {
  const cleanCode = stripCommentsPreservingLines(code);
  const mains = MAIN_PATTERNS[language] ?? [];
  if (mains.some((rx) => rx.test(cleanCode))) return 'full-program';

  const stdins = STDIN_PATTERNS[language] ?? [];
  if (stdins.some((rx) => rx.test(cleanCode))) return 'full-program';

  if (language === 'javascript') {
    return hasJsCallableEntry(cleanCode) ? 'function' : 'full-program';
  }
  if (language === 'python') {
    return hasPythonCallableEntry(cleanCode) ? 'function' : 'full-program';
  }
  if (language === 'cpp' || language === 'java') {
    if (/\bclass\s+Solution\b/.test(cleanCode)) return 'function';
  }
  return 'function';
}

export function effectiveStdin(request: {
  stdin?: string;
  input: string;
  mode: 'function' | 'full-program' | 'auto';
}): string {
  if (typeof request.stdin === 'string' && request.stdin.length > 0) return request.stdin;
  if (request.mode === 'full-program') return request.input || '';
  return '';
}

/**
 * Wraps a function-only snippet in a driver that calls it with the
 * provided input. Returns the full runnable program.
 *
 * Currently implemented for Python and JavaScript.
 */
export function buildDriver(
  code: string,
  input: string,
  language: SupportedLanguage,
  mode: 'function' | 'full-program' = 'function',
): string {
  if (language === 'python') {
    if (mode === 'full-program') return buildPythonFullProgramDriver(code);
    return buildPythonDriver(code, input);
  }
  if (language === 'javascript') {
    if (mode === 'full-program') return buildJSFullProgramDriver(code);
    return buildJSDriver(code, input);
  }
  return code; // fallback — adapters for other langs handle this
}

export function splitTopLevelParams(raw: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '[' || ch === '(' || ch === '{' || ch === '<') depth++;
    else if (ch === ']' || ch === ')' || ch === '}' || ch === '>') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function parseDriverArgs(input: string, paramCount: number = 0): unknown[] {
  if (!input || !input.trim()) return [];
  const trimmed = input.trim();

  // Try standard JSON parse first
  try {
    const parsed = JSON.parse(trimmed);
    if (paramCount === 1) {
      if (Array.isArray(parsed)) {
        // LeetCode linked list cycle format: [[3, 2, 0, -4], 1]
        if (parsed.length === 2 && Array.isArray(parsed[0]) && typeof parsed[1] === 'number') {
          return parsed;
        }
        if (parsed.length === 1) {
          return parsed;
        }
        return [parsed];
      }
      return [parsed];
    }
    if (
      paramCount > 1 &&
      Array.isArray(parsed) &&
      parsed.length !== paramCount &&
      parsed.every((x) => typeof x !== 'object' || x === null || !Array.isArray(x))
    ) {
      return [parsed];
    }
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Continue to advanced parsing
  }

  // Handle relaxed JS object / array expressions like [{ a: 1 }]
  if (!trimmed.includes('=')) {
    try {
      const fn = new Function('return (' + trimmed + ');');
      const parsed = fn();
      if (parsed !== undefined) {
        if (paramCount === 1) {
          if (Array.isArray(parsed) && parsed.length === 1) return parsed;
          return [parsed];
        }
        return Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch {
      // Continue
    }
  }

  // Handle LeetCode format: "nums = [2,7,11,15], target = 9" or "head = [3,2,0,-4], pos = 1"
  try {
    const cleaned = trimmed
      .replace(/^\s*(?:Input:\s*)?/i, '')
      .replace(/(?:^|\n|\s*,\s*)[a-zA-Z_]\w*\s*=\s*/g, ', ')
      .replace(/^,\s*/, '');
    const wrappedJson = `[${cleaned}]`;
    const parsed = JSON.parse(wrappedJson);
    if (paramCount === 1) {
      if (Array.isArray(parsed)) {
        if (parsed.length === 2 && Array.isArray(parsed[0]) && typeof parsed[1] === 'number') {
          return parsed;
        }
        if (parsed.length === 1) {
          return parsed;
        }
        return [parsed];
      }
      return [parsed];
    }
    if (
      paramCount > 1 &&
      Array.isArray(parsed) &&
      parsed.length !== paramCount &&
      parsed.every((x) => typeof x !== 'object' || x === null || !Array.isArray(x))
    ) {
      return [parsed];
    }
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Fallback: line-by-line
    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedLines: unknown[] = [];
    for (const line of lines) {
      const valPart = line.includes('=') ? line.slice(line.indexOf('=') + 1).trim() : line;
      try {
        parsedLines.push(JSON.parse(valPart));
      } catch {
        parsedLines.push(valPart);
      }
    }
    if (parsedLines.length > 0) {
      if (paramCount === 1 && parsedLines.length === 1 && Array.isArray(parsedLines[0])) {
        return parsedLines;
      }
      return parsedLines;
    }
    return [trimmed];
  }
}

/**
 * Infers matching sample input for common LeetCode problems or based on function signature.
 */
export function inferDefaultInput(code: string): string | null {
  if (!code || !code.trim()) return null;

  if (/\b(?:twoSum|two_sum)\b/.test(code)) return '[[2, 7, 11, 15], 9]';
  if (/\b(?:hasCycle|has_cycle)\b/.test(code)) return '[[3, 2, 0, -4], 1]';
  if (/\b(?:bfsTraversal|bfs|dfsTraversal|dfs)\b/i.test(code)) return '[[[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]], 0]';
  if (/\b(?:frequencyMap|charCount|wordCount|countFreq|hashTable|firstUniqChar)\b/i.test(code)) return '["leetcode"]';
  if (/\b(?:reverseList|reverse_list)\b/.test(code)) return '[[1, 2, 3, 4, 5]]';
  if (/\b(?:maxSubArray|max_sub_array)\b/.test(code)) return '[[-2, 1, -3, 4, -1, 2, 1, -5, 4]]';
  if (/\b(?:addTwoNumbers|add_two_numbers)\b/.test(code)) return '[[2, 4, 3], [5, 6, 4]]';
  if (/\b(?:mergeTwoLists|merge_two_lists)\b/.test(code)) return '[[1, 2, 4], [1, 3, 4]]';
  if (/\b(?:climbStairs|climb_stairs)\b/.test(code)) return '[5]';
  if (/\b(?:isValid|is_valid)\b/.test(code)) return '["()[]{}"]';
  if (/\b(?:inorderTraversal|inorder_traversal|inorder|preorderTraversal|postorderTraversal)\b/i.test(code)) return '[[1, null, 2, 3]]';
  if (/\b(?:numIslands|num_islands|maxAreaOfIsland)\b/i.test(code)) return '[[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]]';
  if (/\b(?:lengthOfLongestSubstring|length_of_longest_substring)\b/.test(code)) return '["abcabcbb"]';
  if (/\b(?:isPalindrome|is_palindrome)\b/.test(code)) return '["A man, a plan, a canal: Panama"]';
  if (/\b(?:coinChange|coin_change)\b/.test(code)) return '[[1, 2, 5], 11]';
  if (/\b(?:invertTree|invert_tree)\b/.test(code)) return '[[4, 2, 7, 1, 3, 6, 9]]';
  if (/\b(?:bubbleSort|bubble_sort|insertionSort|insertion_sort|selectionSort|selection_sort)\b/i.test(code)) return '[[64, 34, 25, 12, 22, 11, 90]]';
  if (/\b(?:binarySearch|binary_search|search)\b/i.test(code)) return '[[ -1, 0, 3, 5, 9, 12 ], 9]';
  if (/\b(?:insert|insertion|insert_at|insertAt|arrayInsertion|array_insertion)\b/i.test(code)) return '[[10, 20, 30, 40, 50], 2, 25]';
  if (/\b(?:int|void)\s+main\s*\(/.test(code) || /\bcin\s*>>/.test(code)) return '[1, 5, 2, 3, 4]';

  const methodMatch =
    code.match(/def\s+\w+\s*\(\s*(?:self\s*,\s*)?([^)]*)\)|function\s+\w+\s*\(([^)]*)\)/) ||
    code.match(/(?:(?:static|inline|virtual)\s+)*(?:void|int|long(?:\s+long)?|double|float|bool|char|string|auto|vector\s*<[^>]+>|ListNode\*?|TreeNode\*?)(?:\s+|(?<=[*>]))[a-zA-Z_]\w*\s*\(([^)]*)\)/);

  if (methodMatch) {
    const raw = methodMatch[1] || methodMatch[2] || '';
    const params = splitTopLevelParams(raw).map((p) => {
      const clean = p.split(':')[0].trim();
      const m = clean.match(/([a-zA-Z_]\w*)\s*$/);
      return m ? m[1] : clean;
    });
    if (params.length === 1) {
      const p = params[0].toLowerCase();
      if (p.includes('arr') || p.includes('num') || p.includes('list')) return '[[64, 34, 25, 12, 22, 11, 90]]';
      if (p.includes('head')) return '[[1, 2, 3, 4, 5]]';
      if (p.includes('root') || p.includes('tree')) return '[[4, 2, 7, 1, 3, 6, 9]]';
      if (p.includes('s') || p.includes('str')) return '["racecar"]';
      if (p.includes('n')) return '[10]';
    } else if (params.length === 2) {
      const p1 = params[0].toLowerCase();
      const p2 = params[1].toLowerCase();
      if ((p1.includes('num') || p1.includes('arr') || p1.includes('list')) && (p2.includes('target') || p2.includes('k') || p2.includes('val') || p2.includes('elem') || p2.includes('item') || p2.includes('x'))) {
        return '[[2, 7, 11, 15], 9]';
      }
      if (p1.includes('head') && p2.includes('pos')) {
        return '[[3, 2, 0, -4], 1]';
      }
      if (p1.includes('arr') || p1.includes('num') || p1.includes('list')) {
        return '[[10, 20, 30, 40, 50], 25]';
      }
    } else if (params.length === 3) {
      const p1 = params[0].toLowerCase();
      if (p1.includes('arr') || p1.includes('num') || p1.includes('list')) {
        return '[[10, 20, 30, 40, 50], 2, 25]';
      }
    }
  }

  return null;
}

// ─── Python driver ────────────────────────────────────────────────────────────

function buildPythonDriver(code: string, input: string): string {
  const cleanCode = stripCommentsPreservingLines(code);
  let targetClass = '';
  let methodName = '';
  let paramNames: string[] = [];
  let callerLines: string[] = [];

  // 1. Look for explicit class Solution
  const solutionMatch = cleanCode.match(/class\s+(Solution[a-zA-Z0-9_]*)(?:\([^)]*\))?\s*:/);
  if (solutionMatch) {
    targetClass = solutionMatch[1];
    const classIdx = cleanCode.indexOf(solutionMatch[0]);
    const afterClass = cleanCode.slice(classIdx);
    const methodMatches = afterClass.matchAll(/def\s+([a-zA-Z0-9_]+)\s*\(\s*self\s*(?:,\s*([\s\S]*?))?\)\s*(?:->[^:]+)?\s*:/g);
    const methods: Array<{ name: string; rawParams: string }> = [];
    for (const m of methodMatches) {
      if (!m[1].startsWith('__')) {
        methods.push({ name: m[1], rawParams: m[2] || '' });
      }
    }
    if (methods.length > 0) {
      let chosen = methods[0];
      const knownProblem = methods.find((m) =>
        /^(?:twoSum|reverseList|isValid|inorderTraversal|preorderTraversal|postorderTraversal|numIslands|maxSubArray|climbStairs|mergeTwoLists|lengthOfLongestSubstring|isPalindrome|coinChange|invertTree|hasCycle|search|binarySearch)$/i.test(m.name),
      );
      if (knownProblem) {
        chosen = knownProblem;
      } else if (methods.length > 1) {
        const nonHelper = methods.find(
          (m) => !/^(?:_|helper|dfs|bfs|solve|inorder$|preorder$|postorder$)/i.test(m.name),
        );
        if (nonHelper) chosen = nonHelper;
      }
      methodName = chosen.name;
      paramNames = splitTopLevelParams(chosen.rawParams);
      callerLines = [`_sol = ${targetClass}()`, `_result = _sol.${methodName}(*_converted_args)`];
    }
  }

  // 2. If no Solution class, check if any class has a non-dunder algorithm method
  if (callerLines.length === 0) {
    const classRegex = /class\s+([a-zA-Z0-9_]+)(?:\([^)]*\))?\s*:/g;
    let cm: RegExpExecArray | null;
    while ((cm = classRegex.exec(cleanCode)) !== null) {
      const cName = cm[1];
      if (/^(ListNode|TreeNode|Node|TrieNode|GraphNode)$/i.test(cName)) continue;
      const classStart = cm.index;
      const afterClass = cleanCode.slice(classStart);
      const mMatches = afterClass.matchAll(/def\s+([a-zA-Z0-9_]+)\s*\(\s*self\s*(?:,\s*([\s\S]*?))?\)\s*(?:->[^:]+)?\s*:/g);
      for (const m of mMatches) {
        if (!m[1].startsWith('__')) {
          targetClass = cName;
          methodName = m[1];
          paramNames = splitTopLevelParams(m[2] || '');
          const initMatch = afterClass.match(/def\s+__init__\s*\(\s*self\s*(?:,\s*([^)]*))?\)\s*:/);
          const initParams = initMatch ? splitTopLevelParams(initMatch[1] || '') : [];
          if (initParams.length > 0) {
            callerLines = [
              `_init_arg = _converted_args[0] if len(_converted_args) > 0 and isinstance(_converted_args[0], int) else 6`,
              `_sol = ${targetClass}(_init_arg)`,
              `_result = _sol.${methodName}(*_converted_args)`,
            ];
          } else {
            callerLines = [`_sol = ${targetClass}()`, `_result = _sol.${methodName}(*_converted_args)`];
          }
          break;
        }
      }
      if (callerLines.length > 0) break;
    }
  }

  // 3. Fall back to top-level function outside classes
  if (callerLines.length === 0) {
    const fnMatches = cleanCode.matchAll(/^\s*def\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)\s*(?:->[^:]+)?\s*:/gm);
    for (const fm of fnMatches) {
      const fName = fm[1];
      if (fName.startsWith('__')) continue;
      const lineStart = cleanCode.lastIndexOf('\n', fm.index) + 1;
      const indent = fm.index - lineStart;
      if (indent > 0) continue; // inside a class

      const fnName = fName;
      paramNames = splitTopLevelParams(fm[2] || '');
      callerLines = [`_result = ${fnName}(*_converted_args)`];
      break;
    }
  }

  if (callerLines.length === 0) return code;

  const effectiveInput = input && input.trim() ? input : (inferDefaultInput(code) ?? '');
  const args = parseDriverArgs(effectiveInput, paramNames.length);
  const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');
  const indentedCaller = callerLines.map((l) => `    ${l}`).join('\n');

  return `${code}

# ── AlgoLens generated driver ──────────────────────────
import json as _json
import math as _math

null = None
true = True
false = False

def _is_list_node(obj):
    return obj is not None and (type(obj).__name__ == 'ListNode' or (hasattr(obj, 'val') and hasattr(obj, 'next')))

def _is_tree_node(obj):
    return obj is not None and (type(obj).__name__ == 'TreeNode' or (hasattr(obj, 'val') and hasattr(obj, 'left') and hasattr(obj, 'right')))

def _to_list_node(vals, pos=-1):
    if vals is None:
        return None
    if isinstance(vals, dict):
        v = vals.get('val', vals.get('value', 0))
        node = ListNode(v)
        nxt = vals.get('next')
        if nxt is not None:
            node.next = _to_list_node(nxt)
        return node
    if isinstance(vals, (list, tuple)) and len(vals) == 2 and isinstance(vals[0], (list, tuple)) and isinstance(vals[1], int) and pos == -1:
        vals, pos = vals[0], vals[1]
    if _is_list_node(vals):
        return vals
    if isinstance(vals, (int, float)):
        return ListNode(int(vals))
    if not isinstance(vals, (list, tuple)):
        try:
            vals = list(vals)
        except Exception:
            return ListNode(vals)
    if not vals:
        return None
    nodes = []
    for v in vals:
        if _is_list_node(v):
            nodes.append(v)
        else:
            nodes.append(ListNode(v))
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if isinstance(pos, int) and 0 <= pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return nodes[0]

def _to_tree_node(vals):
    if vals is None:
        return None
    if isinstance(vals, dict):
        v = vals.get('val', vals.get('value', 0))
        node = TreeNode(v)
        left = vals.get('left')
        right = vals.get('right')
        if left is not None:
            node.left = _to_tree_node(left)
        if right is not None:
            node.right = _to_tree_node(right)
        return node
    if _is_tree_node(vals):
        return vals
    if isinstance(vals, (int, float)):
        return TreeNode(int(vals))
    if not isinstance(vals, (list, tuple)):
        try:
            vals = list(vals)
        except Exception:
            return TreeNode(vals)
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    queue = [root]
    i = 1
    while queue and i < len(vals):
        node = queue.pop(0)
        if node:
            if i < len(vals) and vals[i] is not None:
                node.left = TreeNode(vals[i])
                queue.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = TreeNode(vals[i])
                queue.append(node.right)
            i += 1
    return root

class _GraphList(list):
    def get(self, key, default=None):
        if isinstance(key, int) and 0 <= key < len(self):
            return self[key]
        return default

def _make_gettable(obj):
    if isinstance(obj, list) and not isinstance(obj, _GraphList):
        return _GraphList([_make_gettable(x) for x in obj])
    return obj

def _convert_arg(arg, name_hint=""):
    raw_hint = name_hint.strip().lower()
    hint = raw_hint.split(':', 1)[0].strip()
    is_list_node = any(k in hint for k in ['head', 'l1', 'l2']) or hint == 'node' or 'listnode' in raw_hint
    is_tree_node = any(k in hint for k in ['root']) or (hint == 'tree' and 'trees' not in hint) or 'treenode' in raw_hint
    is_collection = not (is_list_node or is_tree_node) and (any(k in hint for k in ['nums', 'arr', 'vals', 'values', 'list', 'items', 'elements', 'matrix', 'grid', 'queries', 'edges', 'nodes', 'points', 'intervals']) or (hint.endswith('s') and hint not in ('pos', 'radius')))
    scalar_names = {'n', 'k', 'target', 'val', 'num', 'size', 'pos', 'index', 'idx', 'p', 'start', 'end', 'src', 'dst', 'u', 'v', 'mask', 'root_val', 'x', 'y', 'z', 'mid', 'low', 'high', 'limit', 'threshold', 'capacity', 'radius', 'scale', 'multiplier', 'amount'}
    is_scalar_num = not is_collection and not (is_list_node or is_tree_node) and (hint in scalar_names or hint.endswith(('_id', '_idx', '_val', '_index', '_num')))

    if is_scalar_num and not (is_list_node or is_tree_node):
        if isinstance(arg, (int, float)):
            return arg
        if isinstance(arg, (list, tuple)) and len(arg) == 1 and isinstance(arg[0], (int, float)):
            return arg[0]

    if ('edge' in hint or 'graph' in hint) and not is_collection:
        if isinstance(arg, list) and len(arg) == 1 and isinstance(arg[0], list) and len(arg[0]) > 0 and isinstance(arg[0][0], list):
            arg = arg[0]

    if is_list_node and not is_tree_node:
        if _is_list_node(arg):
            return arg
        if isinstance(arg, (int, float)):
            return ListNode(int(arg))
        return _to_list_node(arg)

    if is_tree_node:
        if _is_tree_node(arg):
            return arg
        if isinstance(arg, (int, float)):
            return TreeNode(int(arg))
        return _to_tree_node(arg)

    if isinstance(arg, list):
        return _make_gettable(arg)

    return arg

def _serialize(obj):
    if obj is None:
        return None
    if isinstance(obj, float):
        if _math.isinf(obj):
            return "Infinity" if obj > 0 else "-Infinity"
        if _math.isnan(obj):
            return "NaN"
        return obj
    if _is_list_node(obj):
        def _node_to_dict(n, depth=0):
            if not n or depth > 100:
                return None
            return {"val": n.val, "next": _node_to_dict(n.next, depth + 1)}
        return _node_to_dict(obj)
    if _is_tree_node(obj):
        res = []
        q = [obj]
        while q:
            n = q.pop(0)
            if n:
                res.append(n.val)
                q.append(n.left)
                q.append(n.right)
            else:
                res.append(None)
        while res and res[-1] is None:
            res.pop()
        return res
    return obj

_raw_args = [${argsRepr}]
_params_names = ${JSON.stringify(paramNames)}

if len(_params_names) == 1 and len(_raw_args) >= 2 and isinstance(_raw_args[1], int) and any('head' in p.lower() or 'listnode' in p.lower() for p in _params_names):
    _converted_args = [_to_list_node(_raw_args[0], _raw_args[1])]
else:
    _converted_args = [_convert_arg(a, _params_names[i] if i < len(_params_names) else "") for i, a in enumerate(_raw_args)]

while len(_converted_args) < len(_params_names):
    _missing_idx = len(_converted_args)
    _p_name = _params_names[_missing_idx].lower()
    if any(k in _p_name for k in ['head', 'listnode', 'l1', 'l2']) or _p_name == 'node':
        _converted_args.append(_to_list_node([5, 6, 4] if 'l2' in _p_name else [1, 2, 3]))
    elif any(k in _p_name for k in ['root', 'treenode', 'tree']):
        _converted_args.append(_to_tree_node([1, 2, 3]))
    elif any(k in _p_name for k in ['start', 'src', 'source']):
        _converted_args.append(0)
    elif any(k in _p_name for k in ['target', 'k', 'val']):
        _converted_args.append(9)
    elif any(k in _p_name for k in ['memo', 'cache', 'seen', 'map', 'dict']):
        _converted_args.append({})
    elif any(k in _p_name for k in ['visited', 'visited_set']):
        _converted_args.append(set())
    else:
        _converted_args.append(None)

try:
${indentedCaller}
    if _result is not None:
        try:
            print(_json.dumps(_serialize(_result)))
        except Exception:
            print(str(_result))
except TypeError as _te:
    if "missing" in str(_te) and "positional argument" in str(_te):
        print(f"\\n[AlgoLens Notice] Function expects arguments: {_params_names}.")
        print("Please enter input arguments in the 'INPUT ARGUMENTS (JSON)' panel below.")
    raise
`;
}

// ─── Full program drivers ───────────────────────────────────────────────────

function buildPythonFullProgramDriver(code: string): string {
  let driver = code;
  // If def main(): exists but is not invoked at top-level
  if (/^\s*def\s+main\s*\(/m.test(code) && !/^\s*(?:if\s+__name__\s*==\s*["']__main__["']|main\s*\()/m.test(code.replace(/^\s*def\s+main\s*\([^)]*\)\s*:/m, ''))) {
    driver += '\n\n# ── AlgoLens Full Program Auto-Invoke ──\nif "main" in locals() and callable(locals()["main"]):\n    main()\n';
  }
  return driver;
}

function buildJSFullProgramDriver(code: string): string {
  let driver = code;
  // If function main() exists but is not invoked at top-level
  if (/\bfunction\s+main\s*\(/.test(code) && !/\bmain\s*\(\s*\)/.test(code.replace(/\bfunction\s+main\s*\([^)]*\)\s*\{/, ''))) {
    driver += '\n\n// ── AlgoLens Full Program Auto-Invoke ──\nif (typeof main === "function") {\n  try { main(); } catch(e) { console.error(e); }\n}\n';
  }
  return driver;
}

function isTopLevelMatch(code: string, matchIndex: number): boolean {
  let depth = 0;
  let inString: string | null = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < matchIndex; i++) {
    const ch = code[i];
    const next = code[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        i++;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '{') depth++;
    else if (ch === '}') depth = Math.max(0, depth - 1);
  }

  return depth === 0;
}

function extractClassBody(source: string, openBraceIndex: number): string {
  let depth = 1;
  for (let i = openBraceIndex + 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(openBraceIndex + 1, i);
      }
    }
  }
  return source.slice(openBraceIndex + 1);
}

// ─── JavaScript driver ────────────────────────────────────────────────────────

function buildJSDriver(code: string, input: string): string {
  const cleanCode = stripCommentsPreservingLines(code);

  let isSolutionClass = false;
  let className = '';
  let methodName = '';
  let fnName = '';
  let paramNames: string[] = [];

  // Top-level function / runner detection first
  const candidates: Array<{ name: string; rawParams: string }> = [];
  const fnRegex =
    /(?:(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$]\w*)\s*\(([^)]*)\)|(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$]\w*)\s*=\s*(?:async\s+)?(?:function(?:\s+[A-Za-z_$]\w*)?\s*\(([^)]*)\)|(?:\(([^)]*)\)|([A-Za-z_$]\w*))\s*=>))/g;
  let m: RegExpExecArray | null;
  while ((m = fnRegex.exec(cleanCode)) !== null) {
    const name = m[1] || m[3] || '';
    const rawParams = m[2] || m[4] || m[5] || m[6] || '';
    if (
      name &&
      name !== 'main' &&
      name !== 'ListNode' &&
      name !== 'TreeNode' &&
      name !== 'Node' &&
      isTopLevelMatch(cleanCode, m.index)
    ) {
      candidates.push({ name, rawParams });
    }
  }

  const runner = candidates.find((c) => /^(?:test|run)[A-Z_]/i.test(c.name));
  if (runner) {
    fnName = runner.name;
    paramNames = splitTopLevelParams(runner.rawParams);
  }

  // Check if user code has class Solution or a problem class (if no runner found)
  if (!fnName) {
    const classRegex = /class\s+([A-Za-z_$]\w*)\s*\{/g;
    let cm: RegExpExecArray | null;
    const foundClasses: Array<{ name: string; body: string; methods: Array<{ name: string; rawParams: string }>; ctorParams: string }> = [];
    while ((cm = classRegex.exec(cleanCode)) !== null) {
      const cName = cm[1];
      if (cName === 'ListNode' || cName === 'TreeNode' || cName === 'Node') continue;
      const openBrace = cm.index + cm[0].length - 1;
      const classBody = extractClassBody(cleanCode, openBrace);
      const methodRegex = /(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/g;
      const methods: Array<{ name: string; rawParams: string }> = [];
      let ctorParams = '';
      let mm: RegExpExecArray | null;
      while ((mm = methodRegex.exec(classBody)) !== null) {
        if (mm[1] !== 'constructor') {
          methods.push({ name: mm[1], rawParams: mm[2] || '' });
        } else {
          ctorParams = mm[2] || '';
        }
      }
      if (methods.length > 0) {
        foundClasses.push({ name: cName, body: classBody, methods, ctorParams });
      }
    }

    const solutionClass =
      foundClasses.find((c) => /^Solution/i.test(c.name)) ||
      foundClasses.find((c) => !c.ctorParams.trim());

    if (solutionClass) {
      isSolutionClass = true;
      className = solutionClass.name;
      let chosen = solutionClass.methods[0];
      const knownProblem = solutionClass.methods.find((m) =>
        /^(?:twoSum|reverseList|isValid|inorderTraversal|preorderTraversal|postorderTraversal|numIslands|maxSubArray|climbStairs|mergeTwoLists|lengthOfLongestSubstring|isPalindrome|coinChange|invertTree|hasCycle|search|binarySearch)$/i.test(m.name),
      );
      if (knownProblem) {
        chosen = knownProblem;
      } else if (solutionClass.methods.length > 1) {
        const nonHelper = solutionClass.methods.find(
          (m) => !/^(?:_|helper|dfs|bfs|solve|inorder$|preorder$|postorder$)/i.test(m.name),
        );
        if (nonHelper) chosen = nonHelper;
      }
      methodName = chosen.name;
      paramNames = splitTopLevelParams(chosen.rawParams);
    }
  }

  // Top-level function, prototype-style class, or function expression
  let isProtoClass = false;
  if (!isSolutionClass && !fnName) {
    if (candidates.length === 0) return code;

    let chosen = candidates[candidates.length - 1];
    const knownProblem = candidates.find((c) =>
      /^(?:twoSum|reverseList|isValid|inorderTraversal|preorderTraversal|postorderTraversal|numIslands|maxSubArray|climbStairs|mergeTwoLists|lengthOfLongestSubstring|isPalindrome|coinChange|invertTree|hasCycle|search|binarySearch|bubbleSort|insertionSort|selectionSort|dfsTraversal|dfs|bfsTraversal|bfs)$/i.test(c.name),
    );
    if (knownProblem) {
      chosen = knownProblem;
    } else {
      const nonHelper = candidates.find(
        (c) => !/^(?:_|helper|swap|partition)/i.test(c.name),
      );
      if (nonHelper) chosen = nonHelper;
    }
    fnName = chosen.name;
    paramNames = splitTopLevelParams(chosen.rawParams);
    isProtoClass = new RegExp(`\\b${fnName}\\.prototype\\.`).test(cleanCode);
  }

  const effectiveInput = input && input.trim() ? input : (inferDefaultInput(code) ?? '');
  const args = parseDriverArgs(effectiveInput, paramNames.length || 1);
  const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');

  const needsConversion = paramNames.some((p) => {
    const hint = p.toLowerCase();
    return hint.includes('head') || hint.includes('root') || hint.includes('tree') || hint.includes('listnode') || hint.includes('treenode') || hint.includes('l1') || hint.includes('l2');
  });

  const serializeFn = `function _serialize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && ('val' in obj || 'value' in obj) && 'next' in obj) {
    const res = [];
    let curr = obj;
    let count = 0;
    while (curr && count < 1000) {
      res.push(curr.val !== undefined ? curr.val : curr.value);
      curr = curr.next;
      count++;
    }
    return res;
  }
  if (typeof obj === 'object' && ('val' in obj || 'value' in obj) && ('left' in obj || 'right' in obj)) {
    const res = [];
    const q = [obj];
    while (q.length > 0) {
      const n = q.shift();
      if (n) {
        res.push(n.val !== undefined ? n.val : n.value);
        q.push(n.left || null);
        q.push(n.right || null);
      } else {
        res.push(null);
      }
    }
    while (res.length > 0 && res[res.length - 1] === null) {
      res.pop();
    }
    return res;
  }
  return obj;
};`;

  if (!needsConversion) {
    const directCall = isSolutionClass
      ? `new ${className}().${methodName}(${argsRepr})`
      : (isProtoClass ? `new ${fnName}(${argsRepr})` : `${fnName}(${argsRepr})`);
    return `${code}

// ── AlgoLens generated driver ──────────────────────────
${serializeFn}
(function() {
  const _result = ${directCall};
  if (_result !== undefined) console.log(JSON.stringify(_serialize(_result)));
})();
`;
  }

  const caller = isSolutionClass
    ? `const _sol = new ${className}();\n    const _result = _sol.${methodName}(..._converted_args);`
    : (isProtoClass ? `const _result = new ${fnName}(..._converted_args);` : `const _result = ${fnName}(..._converted_args);`);

  return `${code}

// ── AlgoLens generated driver ──────────────────────────
${serializeFn}

const _ListNodeClass = typeof ListNode !== 'undefined' ? ListNode : class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
};

const _TreeNodeClass = typeof TreeNode !== 'undefined' ? TreeNode : class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
};

function _to_list_node(vals, pos = -1) {
  if (vals === null || vals === undefined) return null;
  if (Array.isArray(vals) && vals.length === 2 && Array.isArray(vals[0]) && typeof vals[1] === 'number' && pos === -1) {
    pos = vals[1];
    vals = vals[0];
  }
  if (vals instanceof _ListNodeClass || (typeof vals === 'object' && vals && 'val' in vals && 'next' in vals)) return vals;
  if (typeof vals === 'number') return new _ListNodeClass(vals);
  if (!Array.isArray(vals) || !vals.length) return null;
  const nodes = vals.map((v) => (v instanceof _ListNodeClass || (typeof v === 'object' && v && 'val' in v) ? v : new _ListNodeClass(v)));
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].next = nodes[i + 1];
  }
  if (typeof pos === 'number' && pos >= 0 && pos < nodes.length) {
    nodes[nodes.length - 1].next = nodes[pos];
  }
  return nodes[0];
}

function _to_tree_node(vals) {
  if (!Array.isArray(vals) || !vals.length || vals[0] == null) return null;
  const root = new _TreeNodeClass(vals[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < vals.length) {
    const node = queue.shift();
    if (node) {
      if (i < vals.length && vals[i] != null) {
        node.left = new _TreeNodeClass(vals[i]);
        queue.push(node.left);
      }
      i++;
      if (i < vals.length && vals[i] != null) {
        node.right = new _TreeNodeClass(vals[i]);
        queue.push(node.right);
      }
      i++;
    }
  }
  return root;
}

(function() {
  const _raw_args = [${argsRepr}];
  const _param_names = ${JSON.stringify(paramNames)};
  const _converted_args = _raw_args.map((arg, idx) => {
    const hint = (_param_names[idx] || '').trim().toLowerCase();
    const isCollection = ['nums', 'arr', 'vals', 'values', 'list', 'items', 'elements'].some((k) => hint.includes(k)) || (hint.endsWith('s') && !['pos', 'radius'].includes(hint));
    const isListNode = (hint.includes('head') || hint.includes('listnode') || hint.includes('l1') || hint.includes('l2')) && !isCollection;
    const isTreeNode = (hint.includes('root') || hint.includes('treenode') || (hint === 'tree' && !isCollection)) && !isCollection;
    if (isListNode) return _to_list_node(arg);
    if (isTreeNode) return _to_tree_node(arg);
    return arg;
  });
  while (_converted_args.length < _param_names.length) {
    const idx = _converted_args.length;
    const hint = (_param_names[idx] || '').toLowerCase();
    if (hint.includes('head') || hint.includes('listnode') || hint.includes('l1') || hint.includes('l2')) {
      _converted_args.push(_to_list_node(hint.includes('l2') ? [5, 6, 4] : [1, 2, 3]));
    } else if (hint.includes('memo') || hint.includes('cache') || hint.includes('seen') || hint.includes('map') || hint.includes('dict')) {
      _converted_args.push({});
    } else if (hint.includes('visited')) {
      _converted_args.push(new Set());
    } else {
      _converted_args.push(null);
    }
  }

  try {
    ${caller}
    if (_result !== undefined) console.log(JSON.stringify(_serialize(_result)));
  } catch (err) {
    console.error(err);
    throw err;
  }
})();
`;
}
