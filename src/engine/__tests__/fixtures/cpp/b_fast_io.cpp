#include <iostream>
#include <vector>
#define ll long long
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    if (cin >> n) {
        ll total = 0;
        for (int i = 0; i < n; i++) {
            ll val;
            cin >> val;
            total += val;
        }
        cout << total << "
";
    }
    return 0;
}