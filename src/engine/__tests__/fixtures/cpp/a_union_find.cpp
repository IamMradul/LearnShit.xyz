#include <vector>
using namespace std;

class Solution {
public:
    int find(vector<int>& parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]);
    }
    bool unite(vector<int>& parent, int i, int j) {
        int rootI = find(parent, i);
        int rootJ = find(parent, j);
        if (rootI != rootJ) {
            parent[rootI] = rootJ;
            return true;
        }
        return false;
    }
    int countComponents(int n, vector<vector<int>>& edges) {
        vector<int> parent(n);
        for (int i = 0; i < n; i++) parent[i] = i;
        int count = n;
        for (auto& edge : edges) {
            if (unite(parent, edge[0], edge[1])) count--;
        }
        return count;
    }
};