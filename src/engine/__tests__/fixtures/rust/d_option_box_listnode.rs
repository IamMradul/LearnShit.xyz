pub struct Node {
    val: i32,
    next: Option<Box<Node>>,
}

impl Solution {
    pub fn test_box(x: i32) -> i32 {
        let n = Box::new(Node { val: x, next: None });
        n.val
    }
}