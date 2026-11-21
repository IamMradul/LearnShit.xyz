var Trie = function() {
  this.root = {};
};
Trie.prototype.insert = function(word) {
  let node = this.root;
  for (const ch of word) {
    if (!node[ch]) node[ch] = {};
    node = node[ch];
  }
  node.isEnd = true;
};
Trie.prototype.search = function(word) {
  let node = this.root;
  for (const ch of word) {
    if (!node[ch]) return false;
    node = node[ch];
  }
  return node.isEnd === true;
};
function testTrie(words) {
  const trie = new Trie();
  trie.insert(words[0]);
  return [trie.search(words[0]), trie.search(words[1])];
}