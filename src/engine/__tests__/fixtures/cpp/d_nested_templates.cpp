#include <vector>
#include <map>
using namespace std;

class Solution {
public:
    int testTemplates(int n) {
        vector<vector<int>> grid(n, vector<int>(n, 0LL));
        map<int, vector<pair<int, int>>> complexMap;
        complexMap[1].push_back({2, 3});
        long long big = 1e9;
        return grid.size() + complexMap.size();
    }
};