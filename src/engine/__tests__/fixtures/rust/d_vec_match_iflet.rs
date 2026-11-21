impl Solution {
    pub fn stress_match(val: i32) -> i32 {
        let opt = Some(val);
        if let Some(x) = opt {
            match x {
                1 => 10,
                2 => 20,
                _ => x * 2,
            }
        } else {
            0
        }
    }
}