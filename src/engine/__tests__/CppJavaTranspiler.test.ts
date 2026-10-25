import { describe, it, expect } from 'vitest';
import { transpileCppToJs } from '../transpilers/CppTranspiler';
import { transpileJavaToJs } from '../transpilers/JavaTranspiler';

describe('Phase 2: C++ & Java Transpilers', () => {
  it('transpiles C++ LeetCode TwoSum class Solution to JavaScript', () => {
    const cppCode = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    vector<int> ans = {i, j};
                    return ans;
                }
            }
        }
        vector<int> empty;
        return empty;
    }
};`;

    const res = transpileCppToJs(cppCode);
    expect(res.isClassSolution).toBe(true);
    expect(res.methodName).toBe('twoSum');
    expect(res.code).toContain('twoSum(nums, target)');
    expect(res.code).toContain('nums.length');
    expect(res.code).toContain('let ans = [i, j];');
  });

  it('transpiles C++ swap correctly', () => {
    const code = `swap(arr[i], arr[j]);`;
    const res = transpileCppToJs(code);
    expect(res.code).toContain('[arr[i], arr[j]] = [arr[j], arr[i]]');
  });

  it('transpiles Java LeetCode TwoSum class Solution to JavaScript', () => {
    const javaCode = `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                int[] ans = new int[]{map.get(complement), i};
                return ans;
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`;

    const res = transpileJavaToJs(javaCode);
    expect(res.isClassSolution).toBe(true);
    expect(res.methodName).toBe('twoSum');
    expect(res.code).toContain('twoSum(nums, target)');
    expect(res.code).toContain('new Map()');
    expect(res.code).toContain('map.has(complement)');
    expect(res.code).toContain('map.set(nums[i], i)');
  });
});
