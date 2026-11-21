#include <unordered_map>
#include <list>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> testLRU(int cap) {
        unordered_map<int, int> mp;
        mp[1] = 1;
        mp[2] = 2;
        int a = mp.count(1) ? mp[1] : -1;
        mp[3] = 3;
        int b = mp.count(2) ? mp[2] : -1;
        return {a, b};
    }
};