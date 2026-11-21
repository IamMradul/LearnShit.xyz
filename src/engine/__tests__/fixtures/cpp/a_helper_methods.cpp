#include <vector>
using namespace std;

class Solution {
public:
    int helper(int x) {
        return x * 2;
    }
    vector<int> processArray(vector<int>& nums) {
        vector<int> res;
        for (int x : nums) {
            res.push_back(helper(x));
        }
        return res;
    }
};