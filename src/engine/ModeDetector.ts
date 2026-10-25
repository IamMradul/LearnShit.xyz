import type { SupportedLanguage } from './TraceTypes';

/**
 * Detects whether code is "function-only" (LeetCode style) or
 * "full-program" (Codeforces style, has a main/entry-point).
 */
export function detectMode(
  code: string,
  language: SupportedLanguage,
): 'function' | 'full-program' {
  const patterns: Record<SupportedLanguage, RegExp[]> = {
    python: [/^\s*if\s+__name__\s*==\s*["']__main__["']/m, /^\s*def\s+main\s*\(/m],
    javascript: [/\bfunction\s+main\s*\(/, /\bmain\s*\(\s*\)/, /process\.argv/, /readline/],
    cpp: [/int\s+main\s*\(/, /void\s+main\s*\(/],
    java: [/public\s+static\s+void\s+main\s*\(/],
    go: [/func\s+main\s*\(\s*\)/],
    rust: [/fn\s+main\s*\(\s*\)/],
  };

  const checks = patterns[language] ?? [];
  return checks.some((rx) => rx.test(code)) ? 'full-program' : 'function';
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
): string {
  if (language === 'python') return buildPythonDriver(code, input);
  if (language === 'javascript') return buildJSDriver(code, input);
  return code; // fallback — adapters for other langs handle this
}

export function splitTopLevelParams(raw: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '[' || ch === '(' || ch === '{') depth++;
    else if (ch === ']' || ch === ')' || ch === '}') depth = Math.max(0, depth - 1);
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
    if (paramCount === 1 && Array.isArray(parsed) && (parsed.length === 0 || !Array.isArray(parsed[0]))) {
      return [parsed];
    }
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Continue to advanced parsing
  }

  // Handle LeetCode format: "nums = [2,7,11,15], target = 9" or "head = [3,2,0,-4], pos = 1"
  try {
    const cleaned = trimmed
      .replace(/^\s*(?:Input:\s*)?/i, '')
      .replace(/(?:^|\n|\s*,\s*)[a-zA-Z_]\w*\s*=\s*/g, ', ')
      .replace(/^,\s*/, '');
    const wrappedJson = `[${cleaned}]`;
    const parsed = JSON.parse(wrappedJson);
    if (paramCount === 1 && Array.isArray(parsed) && (parsed.length === 0 || !Array.isArray(parsed[0]))) {
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
  if (/\b(?:reverseList|reverse_list)\b/.test(code)) return '[[1, 2, 3, 4, 5]]';
  if (/\b(?:maxSubArray|max_sub_array)\b/.test(code)) return '[[-2, 1, -3, 4, -1, 2, 1, -5, 4]]';
  if (/\b(?:climbStairs|climb_stairs)\b/.test(code)) return '[5]';
  if (/\b(?:isValid|is_valid)\b/.test(code)) return '["()[]{}"]';
  if (/\b(?:lengthOfLongestSubstring|length_of_longest_substring)\b/.test(code)) return '["abcabcbb"]';
  if (/\b(?:isPalindrome|is_palindrome)\b/.test(code)) return '["A man, a plan, a canal: Panama"]';
  if (/\b(?:coinChange|coin_change)\b/.test(code)) return '[[1, 2, 5], 11]';
  if (/\b(?:invertTree|invert_tree)\b/.test(code)) return '[[4, 2, 7, 1, 3, 6, 9]]';
  if (/\b(?:maxDepth|max_depth)\b/.test(code)) return '[[3, 9, 20, null, null, 15, 7]]';
  if (/\b(?:bubbleSort|bubble_sort|insertionSort|selectionSort)\b/.test(code)) return '[[64, 34, 25, 12, 22, 11, 90]]';
  if (/\b(?:binarySearch|binary_search|search)\b/.test(code)) return '[[ -1, 0, 3, 5, 9, 12 ], 9]';

  const methodMatch = code.match(/def\s+\w+\s*\(\s*(?:self\s*,\s*)?([^)]*)\)|function\s+\w+\s*\(([^)]*)\)/);
  if (methodMatch) {
    const raw = methodMatch[1] || methodMatch[2] || '';
    const params = splitTopLevelParams(raw).map((p) => p.split(':')[0].trim());
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
      if ((p1.includes('num') || p1.includes('arr')) && (p2.includes('target') || p2.includes('k') || p2.includes('val'))) {
        return '[[2, 7, 11, 15], 9]';
      }
      if (p1.includes('head') && p2.includes('pos')) {
        return '[[3, 2, 0, -4], 1]';
      }
    }
  }

  return null;
}

// ─── Python driver ────────────────────────────────────────────────────────────

function buildPythonDriver(code: string, input: string): string {
  // Check if user code is LeetCode class Solution style
  const classMatch = code.match(/class\s+(\w+)(?:\([^)]*\))?\s*:/);
  let caller = '';
  let paramNames: string[] = [];

  if (classMatch) {
    const className = classMatch[1];
    // Find the primary method inside the class (taking self)
    const methodMatch = code.match(/def\s+(\w+)\s*\(\s*self\s*(?:,\s*([\s\S]*?))?\)\s*(?:->[^:]+)?\s*:/);
    if (methodMatch) {
      const methodName = methodMatch[1];
      const rawParams = methodMatch[2] || '';
      paramNames = splitTopLevelParams(rawParams);
      caller = `_sol = ${className}()\n_result = _sol.${methodName}(*_converted_args)`;
    }
  }

  // If not class Solution, check top-level function
  if (!caller) {
    const fnMatch = code.match(/def\s+(\w+)\s*\(([\s\S]*?)\)\s*(?:->[^:]+)?\s*:/);
    if (!fnMatch) return code;
    const fnName = fnMatch[1];
    paramNames = splitTopLevelParams(fnMatch[2] || '');
    caller = `_result = ${fnName}(*_converted_args)`;
  }

  const args = parseDriverArgs(input, paramNames.length);
  const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');

  return `${code}

# ── AlgoLens generated driver ──────────────────────────
import json as _json

def _to_list_node(vals, pos=-1):
    if not vals:
        return None
    nodes = [ListNode(v) for v in vals]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if isinstance(pos, int) and 0 <= pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return nodes[0]

def _to_tree_node(vals):
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

def _convert_arg(arg, name_hint=""):
    hint = name_hint.lower()
    if isinstance(arg, list):
        if 'head' in hint or 'listnode' in hint:
            return _to_list_node(arg)
        if 'root' in hint or 'treenode' in hint or 'tree' in hint:
            return _to_tree_node(arg)
    return arg

def _serialize(obj):
    if obj is None:
        return None
    if isinstance(obj, ListNode):
        res = []
        curr = obj
        count = 0
        while curr and count < 100:
            res.append(curr.val)
            curr = curr.next
            count += 1
        return res
    if isinstance(obj, TreeNode):
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

try:
    ${caller}
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

// ─── JavaScript driver ────────────────────────────────────────────────────────

function buildJSDriver(code: string, input: string): string {
  const fnMatch = code.match(
    /(?:function\s+(\w+)\s*\(([^)]*)\)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(([^)]*)\))/,
  );
  const fnName = fnMatch?.[1] ?? fnMatch?.[3] ?? fnMatch?.[5];
  if (!fnName) return code;

  const rawParams = fnMatch?.[2] ?? fnMatch?.[4] ?? fnMatch?.[6] ?? '';
  const paramCount = rawParams.split(',').filter((p) => p.trim().length > 0).length;

  const args = parseDriverArgs(input, paramCount || 1);
  const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');

  return `${code}

// ── AlgoLens generated driver ──────────────────────────
(function() {
  const _result = ${fnName}(${argsRepr});
  if (_result !== undefined) console.log(JSON.stringify(_result));
})();
`;
}
