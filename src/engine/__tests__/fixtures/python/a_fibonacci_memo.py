class Solution:
    def fib(self, n: int) -> int:
        memo = [-1] * (n + 1)
        def helper(k):
            if k <= 0:
                return 0
            if k == 1:
                return 1
            if memo[k] != -1:
                return memo[k]
            memo[k] = helper(k - 1) + helper(k - 2)
            return memo[k]
        return helper(n)
