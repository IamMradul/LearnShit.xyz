#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    vector<int> bfs(int n, vector<vector<int>>& edges, int start) {
        vector<vector<int>> adj(n);
        for (auto& edge : edges) {
            adj[edge[0]].push_back(edge[1]);
        }
        vector<bool> visited(n, false);
        queue<int> q;
        q.push(start);
        visited[start] = true;
        vector<int> order;
        while (!q.empty()) {
            int node = q.front();
            q.pop();
            order.push_back(node);
            for (int neighbor : adj[node]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
        return order;
    }
};