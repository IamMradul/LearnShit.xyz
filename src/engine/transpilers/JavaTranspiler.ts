/**
 * AlgoLens Java Transpiler (Phase 2)
 *
 * Line-preserving transpiler converting Java LeetCode solutions and standard
 * algorithmic code into instrumentable JavaScript with synchronized line numbering.
 */

export interface JavaTranspileResult {
  code: string;
  isClassSolution: boolean;
  methodName?: string;
}

export function transpileJavaToJs(javaCode: string): JavaTranspileResult {
  const lines = javaCode.split('\n');
  const jsLines: string[] = [];

  let isClassSolution = false;
  let inClass = false;
  let methodName: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (!line.trim()) {
      jsLines.push('');
      continue;
    }

    if (line.trim().startsWith('//')) {
      jsLines.push(line);
      continue;
    }

    // package / import statements
    if (/^\s*(package|import)\s+/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // Class definition
    if (/^\s*(public\s+)?class\s+([A-Za-z_]\w*)/.test(line)) {
      const match = line.match(/^\s*(public\s+)?class\s+([A-Za-z_]\w*)/);
      const className = match?.[2] || 'Solution';
      if (className === 'Solution') {
        isClassSolution = true;
      }
      inClass = true;
      jsLines.push(line.replace(/^(?:\s*public\s+)?class\s+([A-Za-z_]\w*)[^{]*/, `class ${className} `));
      continue;
    }

    // Method detection
    // e.g. public int[] twoSum(int[] nums, int target) {
    // or public static void main(String[] args) {
    const methodMatch = line.match(
      /^\s*(?:(?:public|private|protected|static|final)\s+)*(?:void|int(?:\[\])*|long(?:\[\])*|double(?:\[\])*|float(?:\[\])*|boolean(?:\[\])*|char(?:\[\])*|String(?:\[\])*|List<[^>]+>|Map<[^>]+>|ListNode|TreeNode)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(\{?)\s*$/,
    );

    if (methodMatch) {
      const name = methodMatch[1];
      const rawParams = methodMatch[2];
      const hasBrace = methodMatch[3] === '{';

      if (inClass && !methodName && name !== 'Solution') {
        methodName = name;
      }

      // Clean parameters
      const cleanParams = rawParams
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const m = p.match(/([a-zA-Z_]\w*)\s*$/);
          return m ? m[1] : p;
        })
        .join(', ');

      const indent = line.match(/^\s*/)?.[0] || '';
      if (name === 'main') {
        jsLines.push(`${indent}function main(${cleanParams}) ${hasBrace ? '{' : ''}`);
      } else if (inClass) {
        jsLines.push(`${indent}${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      } else {
        jsLines.push(`${indent}function ${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      }
      continue;
    }

    // System.out.println(...) / print(...) -> console.log(...)
    if (/System\.out\.print(ln)?\s*\(/.test(line)) {
      line = line.replace(/System\.out\.print(ln)?\s*\(/g, 'console.log(');
    }

    // Array allocations:
    // int[] ans = new int[2]; -> let ans = new Array(2).fill(0);
    line = line.replace(
      /\b(?:int|long|double|float|char|boolean|String)\s*\[\]\s+([a-zA-Z_]\w*)\s*=\s*new\s+\w+\[([^\]]+)\]\s*;/g,
      'let $1 = new Array($2).fill(0);',
    );

    // int[] ans = new int[]{1, 2}; -> let ans = [1, 2];
    line = line.replace(
      /\b(?:int|long|double|float|char|boolean|String)\s*\[\]\s+([a-zA-Z_]\w*)\s*=\s*new\s+\w+\[\]\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];',
    );

    // int[] ans = {1, 2}; -> let ans = [1, 2];
    line = line.replace(
      /\b(?:int|long|double|float|char|boolean|String)\s*\[\]\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];',
    );

    // List / Map instantiations
    // Map<Integer, Integer> map = new HashMap<>(); -> let map = new Map();
    line = line.replace(
      /\bMap\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*=\s*new\s+HashMap\s*(?:<[^>]*>)?\s*\(\)\s*;/g,
      'let $1 = new Map();',
    );

    // List<Integer> list = new ArrayList<>(); -> let list = [];
    line = line.replace(
      /\bList\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*=\s*new\s+ArrayList\s*(?:<[^>]*>)?\s*\(\)\s*;/g,
      'let $1 = [];',
    );

    // Variable declarations: int n = ...; -> let n = ...;
    line = line.replace(
      /\b(?:int|long|double|float|boolean|char|String)\s+([a-zA-Z_]\w*)\s*(=|;)/g,
      'let $1 $2',
    );

    // for (int i = 0; ...) -> for (let i = 0; ...)
    line = line.replace(/\bfor\s*\(\s*int\s+/g, 'for (let ');

    // map.put(k, v) -> map.set(k, v)
    line = line.replace(/\.put\s*\(/g, '.set(');

    // map.containsKey(k) -> map.has(k)
    line = line.replace(/\.containsKey\s*\(/g, '.has(');

    // list.add(x) -> list.push(x)
    line = line.replace(/\.add\s*\(/g, '.push(');

    // .length() -> .length (for Strings)
    line = line.replace(/\.length\(\)/g, '.length');

    jsLines.push(line);
  }

  return {
    code: jsLines.join('\n'),
    isClassSolution,
    methodName,
  };
}
