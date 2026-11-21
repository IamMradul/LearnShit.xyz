from typing import List
from collections import deque

class Solution:
    def bfs(self, n: int, edges: List[List[int]], start: int) -> List[int]:
        adj = [[] for _ in range(n)]
        for u, v in edges:
            adj[u].append(v)
        visited = [False] * n
        queue = deque([start])
        visited[start] = True
        order = []

        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor in adj[node]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    queue.append(neighbor)
        return order
