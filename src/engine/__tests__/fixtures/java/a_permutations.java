import java.util.*;

public class Solution {
    public void backtrack(int[] nums, int start, List<List<Integer>> res) {
        if (start == nums.length) {
            List<Integer> list = new ArrayList<>();
            for (int x : nums) list.add(x);
            res.add(list);
            return;
        }
        for (int i = start; i < nums.length; i++) {
            int temp = nums[start];
            nums[start] = nums[i];
            nums[i] = temp;
            backtrack(nums, start + 1, res);
            int temp2 = nums[start];
            nums[start] = nums[i];
            nums[i] = temp2;
        }
    }
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, res);
        return res;
    }
}