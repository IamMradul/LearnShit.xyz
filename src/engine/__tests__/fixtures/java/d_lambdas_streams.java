import java.util.*;

public class Solution {
    public int testLambdas(int[] nums) {
        List<Integer> list = new ArrayList<>();
        for (int x : nums) list.add(x);
        list.sort((a, b) -> Integer.compare(a, b));
        return list.get(0);
    }
}