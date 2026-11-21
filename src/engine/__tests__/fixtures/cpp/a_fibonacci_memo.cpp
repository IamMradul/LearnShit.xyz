#include <vector>
using namespace std;

class Solution {
public:
    int helper(int k, vector<int>& memo) {
        if (k <= 0) return 0;
        if (k == 1) return 1;
        if (memo[k] != -1) return memo[k];
        return memo[k] = helper(k - 1, memo) + helper(k - 2, memo);
    }
    int fib(int n) {
        vector<int> memo(n + 1, -1);
        return helper(n, memo);
    }
};