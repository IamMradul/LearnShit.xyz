public class Solution {
    public int find(int[] parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]);
    }
    public boolean union(int[] parent, int i, int j) {
        int rootI = find(parent, i);
        int rootJ = find(parent, j);
        if (rootI != rootJ) {
            parent[rootI] = rootJ;
            return true;
        }
        return false;
    }
    public int countComponents(int n, int[][] edges) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int count = n;
        for (int[] edge : edges) {
            if (union(parent, edge[0], edge[1])) count--;
        }
        return count;
    }
}