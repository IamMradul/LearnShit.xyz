import java.util.*;

public class Solution {
    public int testGenerics(int n) {
        List<List<Integer>> list2d = new ArrayList<>();
        Map<String, List<Integer>> map = new HashMap<>();
        int[][] matrix = new int[n][n];
        int sum = 0;
        for (int[] row : matrix) {
            for (int val : row) {
                sum += val;
            }
        }
        return sum + list2d.size() + map.size();
    }
}