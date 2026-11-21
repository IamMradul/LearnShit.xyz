import java.util.*;

public class Solution {
    public int[] crashMidway(int[] nums) {
        for (int x : nums) {
            if (x < 0) throw new IllegalArgumentException("Negative value");
        }
        return nums;
    }
}