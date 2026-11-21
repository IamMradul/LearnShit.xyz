package main

func fib(n int) int {
    memo := make([]int, n+1)
    for i := range memo {
        memo[i] = -1
    }
    var helper func(k int) int
    helper = func(k int) int {
        if k <= 0 {
            return 0
        }
        if k == 1 {
            return 1
        }
        if memo[k] != -1 {
            return memo[k]
        }
        memo[k] = helper(k-1) + helper(k-2)
        return memo[k]
    }
    return helper(n)
}