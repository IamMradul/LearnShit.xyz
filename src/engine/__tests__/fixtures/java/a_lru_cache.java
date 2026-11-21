import java.util.*;

public class Solution {
    public List<Integer> testLRU(int cap) {
        Map<Integer, Integer> map = new LinkedHashMap<>();
        map.put(1, 1);
        map.put(2, 2);
        int a = map.getOrDefault(1, -1);
        map.put(3, 3);
        int b = map.getOrDefault(2, -1);
        List<Integer> res = new ArrayList<>();
        res.add(a);
        res.add(b);
        return res;
    }
}