var shortestPath = function(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const visited = new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
        u = j;
      }
    }
    if (dist[u] === Infinity) break;
    visited[u] = true;
    for (const [from, to, weight] of edges) {
      if (from === u && dist[u] + weight < dist[to]) {
        dist[to] = dist[u] + weight;
      }
    }
  }
  return dist;
};