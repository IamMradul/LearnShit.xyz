#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int t;
    if (cin >> t) {
        while (t--) {
            int n;
            cin >> n;
            int maxVal = -1e9;
            for (int i = 0; i < n; i++) {
                int x;
                cin >> x;
                if (x > maxVal) maxVal = x;
            }
            cout << maxVal << endl;
        }
    }
    return 0;
}