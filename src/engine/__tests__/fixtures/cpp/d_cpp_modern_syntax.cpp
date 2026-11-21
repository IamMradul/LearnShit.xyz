#include <vector>
using namespace std;

class Solution {
public:
    int modernFeatures(vector<int>& nums) {
        auto lambda = [](int a, int b) -> int { return a + b; };
        int sum = 0;
        for (const auto& val : nums) {
            sum = lambda(sum, val);
        }
        int* ptr = nullptr;
        bool flag = (ptr == nullptr) ? true : false;
        return flag ? sum : -1;
    }
};