class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node['#'] = True

    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node:
                return False
            node = node[ch]
        return '#' in node

class Solution:
    def testTrie(self, words: List[str]) -> List[bool]:
        t = Trie()
        t.insert(words[0])
        return [t.search(words[0]), t.search(words[1])]
