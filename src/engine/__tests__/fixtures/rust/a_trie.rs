struct TrieNode {
    children: [Option<Box<TrieNode>>; 26],
    is_end: bool,
}

impl Solution {
    pub fn test_trie(words: Vec<String>) -> Vec<bool> {
        let mut f1 = true;
        let mut f2 = false;
        vec![f1, f2]
    }
}