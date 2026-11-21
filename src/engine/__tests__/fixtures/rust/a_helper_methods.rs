impl Solution {
    pub fn helper(x: i32) -> i32 {
        x * 2
    }
    pub fn process_array(nums: Vec<i32>) -> Vec<i32> {
        let mut res = Vec::new();
        for x in nums {
            res.push(Self::helper(x));
        }
        res
    }
}