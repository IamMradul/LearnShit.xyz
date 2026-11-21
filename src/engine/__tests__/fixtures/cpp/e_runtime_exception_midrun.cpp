#include <vector>
#include <stdexcept>
using namespace std;

class Solution {
public:
    vector<int> crashMidway(vector<int>& nums) {
        vector<int> res;
        for (int x : nums) {
            if (x < 0) throw runtime_error("Negative number");
            res.push_back(x * 2);
        }
        return res;
    }
};