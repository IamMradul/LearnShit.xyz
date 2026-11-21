use std::collections::HashMap;

impl Solution {
    pub fn test_lru(cap: i32) -> Vec<i32> {
        let mut map = HashMap::new();
        map.insert(1, 1);
        map.insert(2, 2);
        let a = *map.get(&1).unwrap_or(&-1);
        map.insert(3, 3);
        let b = *map.get(&2).unwrap_or(&-1);
        vec![a, b]
    }
}