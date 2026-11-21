impl Solution {
    pub fn sort_array(mut nums: Vec<i32>) -> Vec<i32> {
        fn merge(arr: &mut Vec<i32>, l: usize, m: usize, r: usize) {
            let left = arr[l..=m].to_vec();
            let right = arr[m + 1..=r].to_vec();
            let mut i = 0;
            let mut j = 0;
            let mut k = l;
            while i < left.len() && j < right.len() {
                if left[i] <= right[j] {
                    arr[k] = left[i];
                    i += 1;
                } else {
                    arr[k] = right[j];
                    j += 1;
                }
                k += 1;
            }
            while i < left.len() {
                arr[k] = left[i];
                i += 1;
                k += 1;
            }
            while j < right.len() {
                arr[k] = right[j];
                j += 1;
                k += 1;
            }
        }
        fn sort(arr: &mut Vec<i32>, l: usize, r: usize) {
            if l >= r {
                return;
            }
            let m = l + (r - l) / 2;
            sort(arr, l, m);
            sort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
        if !nums.is_empty() {
            let len = nums.len();
            sort(&mut nums, 0, len - 1);
        }
        nums
    }
}