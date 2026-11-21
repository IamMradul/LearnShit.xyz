use std::collections::HashMap;

impl Solution {
    pub fn test_hashmap(nums: Vec<i32>) -> i32 {
        let mut map = HashMap::new();
        for &x in &nums {
            let count = map.entry(x).or_insert(0);
            *count += 1;
        }
        let total = nums.len() as i32;
        let total = total + 1; // shadowing
        total
    }
}