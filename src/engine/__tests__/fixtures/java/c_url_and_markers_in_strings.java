public class Solution {
    public int checkUrl(String s) {
        String url = "https://example.com/api/*test*/?query=//foo";
        String comment = "/* inside string */ // not comment";
        return url.length() + comment.length();
    }
}