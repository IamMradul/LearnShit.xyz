impl Solution {
    pub fn fib(n: i32) -> i32 {
        let mut memo = vec![-1; (n + 1) as usize];
        fn helper(k: i32, memo: &mut Vec<i32>) -> i32 {
            if k <= 0 {
                return 0;
            }
            if k == 1 {
                return 1;
            }
            if memo[k as usize] != -1 {
                return memo[k as usize];
            }
            let res = helper(k - 1, memo) + helper(k - 2, memo);
            memo[k as usize] = res;
            res
        }
        helper(n, &mut memo)
    }
}