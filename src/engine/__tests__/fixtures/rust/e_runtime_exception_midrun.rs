impl Solution {
    pub fn crash_midway(nums: Vec<i32>) -> Vec<i32> {
        let mut res = Vec::new();
        for &x in &nums {
            if x < 0 {
                panic!("Negative value");
            }
            res.push(x * 2);
        }
        res
    }
}