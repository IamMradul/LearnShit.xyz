var countComponents = function(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(i) {
    if (parent[i] === i) return i;
    return parent[i] = find(parent[i]);
  }
  function union(i, j) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true;
    }
    return false;
  }
  let count = n;
  for (const [u, v] of edges) {
    if (union(u, v)) count--;
  }
  return count;
};