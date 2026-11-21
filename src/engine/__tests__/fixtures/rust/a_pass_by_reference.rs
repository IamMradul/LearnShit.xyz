impl Solution {
    pub fn reverse_in_place(mut arr: Vec<i32>) -> Vec<i32> {
        let mut l = 0;
        if !arr.is_empty() {
            let mut r = arr.len() - 1;
            while l < r {
                arr.swap(l, r);
                l += 1;
                r -= 1;
            }
        }
        arr
    }
}