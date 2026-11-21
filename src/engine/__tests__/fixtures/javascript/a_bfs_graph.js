var bfs = function(n, edges, start) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
  }
  const visited = new Array(n).fill(false);
  const queue = [start];
  visited[start] = true;
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of adj[node]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }
  return order;
};