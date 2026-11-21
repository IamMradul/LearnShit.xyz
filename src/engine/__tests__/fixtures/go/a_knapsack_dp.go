package main

func knapsack(W int, wt []int, val []int) int {
    n := len(wt)
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, W+1)
    }
    for i := 1; i <= n; i++ {
        for w := 0; w <= W; w++ {
            if wt[i-1] <= w {
                v := val[i-1] + dp[i-1][w-wt[i-1]]
                if v > dp[i-1][w] {
                    dp[i][w] = v
                } else {
                    dp[i][w] = dp[i-1][w]
                }
            } else {
                dp[i][w] = dp[i-1][w]
            }
        }
    }
    return dp[n][W]
}