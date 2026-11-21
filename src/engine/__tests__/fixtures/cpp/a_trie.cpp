#include <string>
#include <vector>
using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEnd;
    TrieNode() : isEnd(false) {
        for (int i = 0; i < 26; i++) children[i] = nullptr;
    }
};

class Solution {
public:
    vector<bool> testTrie(vector<string>& words) {
        TrieNode* root = new TrieNode();
        // insert words[0]
        TrieNode* cur = root;
        for (char c : words[0]) {
            int idx = c - 'a';
            if (!cur->children[idx]) cur->children[idx] = new TrieNode();
            cur = cur->children[idx];
        }
        cur->isEnd = true;
        
        // search words[0]
        bool f1 = true;
        cur = root;
        for (char c : words[0]) {
            int idx = c - 'a';
            if (!cur->children[idx]) { f1 = false; break; }
            cur = cur->children[idx];
        }
        f1 = f1 && cur->isEnd;

        // search words[1]
        bool f2 = true;
        cur = root;
        for (char c : words[1]) {
            int idx = c - 'a';
            if (!cur->children[idx]) { f2 = false; break; }
            cur = cur->children[idx];
        }
        f2 = f2 && cur->isEnd;

        return {f1, f2};
    }
};