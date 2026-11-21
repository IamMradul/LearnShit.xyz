#include <iostream>
#include <vector>
using namespace std;

int main() {
    int r, c;
    if (cin >> r >> c) {
        int sum = 0;
        vector<vector<int>> mat(r, vector<int>(c));
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                cin >> mat[i][j];
                sum += mat[i][j];
            }
        }
        cout << sum << endl;
    }
    return 0;
}