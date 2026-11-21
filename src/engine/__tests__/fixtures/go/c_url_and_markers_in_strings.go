package main

func checkUrl(s string) int {
    url := "https://example.com/api/*test*/?query=//foo"
    comment := "/* inside string */ // not comment"
    return len(url) + len(comment)
}