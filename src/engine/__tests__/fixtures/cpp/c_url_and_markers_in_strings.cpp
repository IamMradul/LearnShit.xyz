#include <string>
using namespace std;

class Solution {
public:
    int checkUrl(string s) {
        string url = "https://example.com/api/*test*/?query=//foo";
        string comment = "/* inside string */ // not comment";
        return url.length() + comment.length();
    }
};