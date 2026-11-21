import java.util.*;

public class Solution {
    public int helper(int x) {
        return x * 2;
    }
    public List<Integer> processArray(int[] nums) {
        List<Integer> res = new ArrayList<>();
        for (int x : nums) {
            res.add(helper(x));
        }
        return res;
    }
}