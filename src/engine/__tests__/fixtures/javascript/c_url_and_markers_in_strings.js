function sanitizeUrl(str) {
  const url = "https://example.com/api/*test*/?query=//foo";
  const commentToken = "/* keep me */ // not a comment";
  return url.length + commentToken.length;
}