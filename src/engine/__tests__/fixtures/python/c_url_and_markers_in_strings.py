class Solution:
    def sanitize(self, text: str) -> int:
        url = "https://example.com/api/#frag?query=/*foo*/"
        comment_marker = "# not a real comment"
        return len(url) + len(comment_marker)
