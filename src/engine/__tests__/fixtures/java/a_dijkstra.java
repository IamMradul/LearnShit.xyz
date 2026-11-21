import java.util.*;

public class Solution {
    public int[] shortestPath(int n, int[][] edges, int src) {
        int[] dist = new int[n];
        Arrays.fill(dist, 1000000000);
        dist[src] = 0;
        boolean[] visited = new boolean[n];
        for (int i = 0; i < n; i++) {
            int u = -1;
            for (int j = 0; j < n; j++) {
                if (!visited[j] && (u == -1 || dist[j] < dist[u])) {
                    u = j;
                }
            }
            if (dist[u] == 1000000000) break;
            visited[u] = true;
            for (int[] edge : edges) {
                if (edge[0] == u && dist[u] + edge[2] < dist[edge[1]]) {
                    dist[edge[1]] = dist[u] + edge[2];
                }
            }
        }
        return dist;
    }
}