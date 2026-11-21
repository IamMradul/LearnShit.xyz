import java.util.*;

public class Solution {
    public int helper(int k, int[] memo) {
        if (k <= 0) return 0;
        if (k == 1) return 1;
        if (memo[k] != -1) return memo[k];
        return memo[k] = helper(k - 1, memo) + helper(k - 2, memo);
    }
    public int fib(int n) {
        int[] memo = new int[n + 1];
        Arrays.fill(memo, -1);
        return helper(n, memo);
    }
}