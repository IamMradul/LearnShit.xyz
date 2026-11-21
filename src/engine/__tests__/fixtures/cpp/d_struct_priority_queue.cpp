#include <vector>
#include <queue>
using namespace std;

struct Node {
    int u, w;
    Node(int u, int w) : u(u), w(w) {}
    bool operator<(const Node& other) const {
        return w > other.w;
    }
};

class Solution {
public:
    int testPQ(vector<int>& weights) {
        priority_queue<Node> pq;
        for (int i = 0; i < weights.size(); i++) {
            pq.push(Node(i, weights[i]));
        }
        return pq.top().w;
    }
};