impl Solution {
    pub fn recurse(n: i32) -> i32 {
        Self::recurse(n + 1)
    }
}