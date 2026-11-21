impl Solution {
    pub fn permute(mut nums: Vec<i32>) -> Vec<Vec<i32>> {
        let mut res = Vec::new();
        fn backtrack(nums: &mut Vec<i32>, start: usize, res: &mut Vec<Vec<i32>>) {
            if start == nums.len() {
                res.push(nums.clone());
                return;
            }
            for i in start..nums.len() {
                nums.swap(start, i);
                backtrack(nums, start + 1, res);
                nums.swap(start, i);
            }
        }
        backtrack(&mut nums, 0, &mut res);
        res
    }
}