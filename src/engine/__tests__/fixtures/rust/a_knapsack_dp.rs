use std::cmp::max;

impl Solution {
    pub fn knapsack(w: i32, wt: Vec<i32>, val: Vec<i32>) -> i32 {
        let n = wt.len();
        let w = w as usize;
        let mut dp = vec![vec![0; w + 1]; n + 1];
        for i in 1..=n {
            for j in 0..=w {
                if (wt[i - 1] as usize) <= j {
                    dp[i][j] = max(val[i - 1] + dp[i - 1][j - wt[i - 1] as usize], dp[i - 1][j]);
                } else {
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }
        dp[n][w]
    }
}