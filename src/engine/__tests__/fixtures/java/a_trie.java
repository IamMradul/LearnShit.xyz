import java.util.*;

class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}

public class Solution {
    public List<Boolean> testTrie(String[] words) {
        TrieNode root = new TrieNode();
        TrieNode cur = root;
        for (char c : words[0].toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) cur.children[idx] = new TrieNode();
            cur = cur.children[idx];
        }
        cur.isEnd = true;

        List<Boolean> res = new ArrayList<>();
        // search words[0]
        cur = root;
        boolean f1 = true;
        for (char c : words[0].toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) { f1 = false; break; }
            cur = cur.children[idx];
        }
        res.add(f1 && cur.isEnd);

        // search words[1]
        cur = root;
        boolean f2 = true;
        for (char c : words[1].toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) { f2 = false; break; }
            cur = cur.children[idx];
        }
        res.add(f2 && cur.isEnd);
        return res;
    }
}