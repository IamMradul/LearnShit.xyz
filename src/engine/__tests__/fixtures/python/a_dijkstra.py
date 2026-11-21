from typing import List

class Solution:
    def shortestPath(self, n: int, edges: List[List[int]], src: int) -> List[int]:
        dist = [float('inf')] * n
        dist[src] = 0
        visited = [False] * n
        for _ in range(n):
            u = -1
            for j in range(n):
                if not visited[j] and (u == -1 or dist[j] < dist[u]):
                    u = j
            if dist[u] == float('inf'):
                break
            visited[u] = True
            for frm, to, weight in edges:
                if frm == u and dist[u] + weight < dist[to]:
                    dist[to] = dist[u] + weight
        return dist
