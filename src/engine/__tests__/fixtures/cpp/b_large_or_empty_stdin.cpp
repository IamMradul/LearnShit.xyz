#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) {
        cout << "EMPTY" << endl;
    } else {
        cout << "NONEMPTY" << endl;
    }
    return 0;
}