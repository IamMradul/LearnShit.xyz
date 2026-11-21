impl Solution {
    pub fn check_url(s: String) -> i32 {
        let url = "https://example.com/api/*test*/?query=//foo";
        let comment = "/* inside string */ // not comment";
        (url.len() + comment.len()) as i32
    }
}