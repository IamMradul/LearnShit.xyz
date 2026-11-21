#include <vector>
using namespace std;

class Solution {
public:
    vector<int> reverseInPlace(vector<int>& arr) {
        int l = 0, r = arr.size() - 1;
        while (l < r) {
            swap(arr[l], arr[r]);
            l++;
            r--;
        }
        return arr;
    }
};