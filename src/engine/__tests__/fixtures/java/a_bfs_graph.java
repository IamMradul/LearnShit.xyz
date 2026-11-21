import java.util.*;

public class Solution {
    public List<Integer> bfs(int n, int[][] edges, int start) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] edge : edges) {
            adj.get(edge[0]).add(edge[1]);
        }
        boolean[] visited = new boolean[n];
        Queue<Integer> queue = new LinkedList<>();
        queue.add(start);
        visited[start] = true;
        List<Integer> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.add(node);
            for (int neighbor : adj.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.add(neighbor);
                }
            }
        }
        return order;
    }
}