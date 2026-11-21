use std::rc::Rc;
use std::cell::RefCell;

pub struct TreeNode {
    pub val: i32,
    pub left: Option<Rc<RefCell<TreeNode>>>,
    pub right: Option<Rc<RefCell<TreeNode>>>,
}

impl Solution {
    pub fn inorder_traversal(root: Option<Rc<RefCell<TreeNode>>>) -> Vec<i32> {
        let mut res = Vec::new();
        fn dfs(node: Option<Rc<RefCell<TreeNode>>>, res: &mut Vec<i32>) {
            if let Some(n) = node {
                let b = n.borrow();
                dfs(b.left.clone(), res);
                res.push(b.val);
                dfs(b.right.clone(), res);
            }
        }
        dfs(root, &mut res);
        res
    }
}