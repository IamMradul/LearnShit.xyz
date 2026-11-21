#include <vector>
using namespace std;

class Solution {
public:
    vector<int> shortestPath(int n, vector<vector<int>>& edges, int src) {
        vector<int> dist(n, 1e9);
        dist[src] = 0;
        vector<bool> visited(n, false);
        for (int i = 0; i < n; i++) {
            int u = -1;
            for (int j = 0; j < n; j++) {
                if (!visited[j] && (u == -1 || dist[j] < dist[u])) {
                    u = j;
                }
            }
            if (dist[u] == 1e9) break;
            visited[u] = true;
            for (auto& edge : edges) {
                if (edge[0] == u && dist[u] + edge[2] < dist[edge[1]]) {
                    dist[edge[1]] = dist[u] + edge[2];
                }
            }
        }
        return dist;
    }
};