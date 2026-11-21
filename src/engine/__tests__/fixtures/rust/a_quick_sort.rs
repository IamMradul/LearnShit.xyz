impl Solution {
    pub fn quick_sort(mut nums: Vec<i32>) -> Vec<i32> {
        fn partition(arr: &mut Vec<i32>, low: usize, high: usize) -> usize {
            let pivot = arr[high];
            let mut i = low;
            for j in low..high {
                if arr[j] < pivot {
                    arr.swap(i, j);
                    i += 1;
                }
            }
            arr.swap(i, high);
            i
        }
        fn sort(arr: &mut Vec<i32>, low: usize, high: usize) {
            if low < high {
                let pi = partition(arr, low, high);
                if pi > 0 {
                    sort(arr, low, pi - 1);
                }
                sort(arr, pi + 1, high);
            }
        }
        if !nums.is_empty() {
            let len = nums.len();
            sort(&mut nums, 0, len - 1);
        }
        nums
    }
}