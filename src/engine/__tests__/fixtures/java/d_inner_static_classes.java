public class Solution {
    static class Helper {
        final int factor = 2;
        int multiply(int x) { return x * factor; }
    }
    public int testClasses(int val) {
        Helper h = new Helper();
        StringBuilder sb = new StringBuilder("val:");
        sb.append(h.multiply(val));
        Integer cached = 127;
        return sb.length() + cached;
    }
}