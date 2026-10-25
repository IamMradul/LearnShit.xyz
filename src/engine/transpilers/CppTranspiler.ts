/**
 * AlgoLens C++ Transpiler (Phase 2)
 *
 * Lightweight, line-preserving transpiler that converts common algorithmic C++
 * (e.g. LeetCode solutions, competitive programming loops, vectors, sorting)
 * into instrumentable JavaScript while keeping line numbers 1:1 for synchronized
 * Monaco code gutter highlighting and trace stepping.
 */

export interface TranspileResult {
  code: string;
  entryPoint?: string;
  isClassSolution: boolean;
  methodName?: string;
}

export function transpileCppToJs(cppCode: string): TranspileResult {
  const lines = cppCode.split('\n');
  const jsLines: string[] = [];

  let isClassSolution = false;
  let inClass = false;
  let methodName: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Preserve empty lines
    if (!line.trim()) {
      jsLines.push('');
      continue;
    }

    // Single-line comments
    if (line.trim().startsWith('//')) {
      jsLines.push(line);
      continue;
    }

    // #include directives
    if (/^\s*#include\b/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // using namespace std;
    if (/^\s*using\s+namespace\s+std\s*;/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // Detect class Solution
    if (/^\s*class\s+Solution\b/.test(line)) {
      isClassSolution = true;
      inClass = true;
      jsLines.push(line.replace(/class\s+Solution[^{]*/, 'class Solution '));
      continue;
    }

    // Access specifiers inside class: public:, private:, protected:
    if (/^\s*(public|private|protected)\s*:/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // If closing class brace
    if (inClass && /^\s*\}\s*;\s*$/.test(line)) {
      inClass = false;
      jsLines.push('}');
      continue;
    }

    // Function / Method detection
    // e.g. vector<int> twoSum(vector<int>& nums, int target) {
    // or int main() {
    const fnMatch = line.match(
      /^\s*(?:(?:static|inline|virtual)\s+)*(?:void|int|long|double|float|bool|char|string|auto|vector\s*<[^>]+>|ListNode\*?|TreeNode\*?)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(\{?)\s*$/,
    );

    if (fnMatch) {
      const name = fnMatch[1];
      const rawParams = fnMatch[2];
      const hasBrace = fnMatch[3] === '{';

      if (inClass && !methodName && name !== 'Solution') {
        methodName = name;
      }

      // Clean parameters: remove types like 'vector<int>& nums' -> 'nums'
      const cleanParams = rawParams
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          // Extract the last identifier
          const m = p.match(/([a-zA-Z_]\w*)\s*$/);
          return m ? m[1] : p;
        })
        .join(', ');

      const indent = line.match(/^\s*/)?.[0] || '';
      if (inClass) {
        jsLines.push(`${indent}${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      } else {
        jsLines.push(`${indent}function ${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      }
      continue;
    }

    // Replace std::
    line = line.replace(/std::/g, '');

    // cout << ... << endl; -> console.log(...)
    if (/\bcout\s*<<\s*/.test(line)) {
      const indent = line.match(/^\s*/)?.[0] || '';
      const content = line
        .replace(/^\s*cout\s*<<\s*/, '')
        .replace(/;\s*$/, '')
        .split(/<<\s*/)
        .map((part) => part.trim())
        .filter((part) => part && part !== 'endl')
        .join(', ');
      jsLines.push(`${indent}console.log(${content});`);
      continue;
    }

    // swap(a[i], a[j]) -> [a[i], a[j]] = [a[j], a[i]]
    line = line.replace(/\bswap\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, '([$1, $2] = [$2, $1])');

    // Vector initialization: vector<int> arr = {1, 2, 3}; -> let arr = [1, 2, 3];
    line = line.replace(
      /\bvector\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];',
    );

    // Vector declaration with size and default value: vector<int> dp(n, 0); -> let dp = new Array(n).fill(0);
    line = line.replace(
      /\bvector\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*\(([^,]+),\s*([^)]+)\)\s*;/g,
      'let $1 = new Array($2).fill($3);',
    );

    // Vector declaration empty: vector<int> res; -> let res = [];
    line = line.replace(/\bvector\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*;/g, 'let $1 = [];');

    // Common array declaration: int arr[] = {1, 2, 3}; -> let arr = [1, 2, 3];
    line = line.replace(
      /\b(?:int|long|double|float|char|string|bool)\s+([a-zA-Z_]\w*)\s*\[\]\s*=\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];',
    );

    // Common scalar declaration: int n = ...; -> let n = ...;
    line = line.replace(
      /\b(?:int|long|double|float|char|string|bool|auto|size_t)\s+([a-zA-Z_]\w*)\s*(=|;)/g,
      'let $1 $2',
    );

    // for loop: for (int i = 0; ...) -> for (let i = 0; ...)
    line = line.replace(/\bfor\s*\(\s*(?:int|size_t|auto)\s+/g, 'for (let ');

    // .size() -> .length
    line = line.replace(/\.size\(\)/g, '.length');

    // .push_back(...) -> .push(...)
    line = line.replace(/\.push_back\(/g, '.push(');

    // .pop_back() -> .pop()
    line = line.replace(/\.pop_back\(\)/g, '.pop()');

    // .empty() -> .length === 0
    line = line.replace(/\.empty\(\)/g, '.length === 0');

    // max/min/abs -> Math.max/Math.min/Math.abs
    line = line.replace(/\b(?<!\.)max\s*\(/g, 'Math.max(');
    line = line.replace(/\b(?<!\.)min\s*\(/g, 'Math.min(');
    line = line.replace(/\b(?<!\.)abs\s*\(/g, 'Math.abs(');

    // nullptr / NULL -> null
    line = line.replace(/\b(nullptr|NULL)\b/g, 'null');

    jsLines.push(line);
  }

  return {
    code: jsLines.join('\n'),
    isClassSolution,
    methodName,
  };
}
