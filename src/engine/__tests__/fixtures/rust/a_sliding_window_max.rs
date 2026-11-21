use std::collections::VecDeque;

impl Solution {
    pub fn max_sliding_window(nums: Vec<i32>, k: i32) -> Vec<i32> {
        let k = k as usize;
        let mut dq = VecDeque::new();
        let mut res = Vec::new();
        for i in 0..nums.len() {
            while !dq.is_empty() && *dq.front().unwrap() + k <= i {
                dq.pop_front();
            }
            while !dq.is_empty() && nums[*dq.back().unwrap()] < nums[i] {
                dq.pop_back();
            }
            dq.push_back(i);
            if i >= k - 1 {
                res.push(nums[*dq.front().unwrap()]);
            }
        }
        res
    }
}