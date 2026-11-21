var LRUCache = function(capacity) {
  this.capacity = capacity;
  this.map = new Map();
};
LRUCache.prototype.get = function(key) {
  if (!this.map.has(key)) return -1;
  const val = this.map.get(key);
  this.map.delete(key);
  this.map.set(key, val);
  return val;
};
LRUCache.prototype.put = function(key, value) {
  if (this.map.has(key)) {
    this.map.delete(key);
  } else if (this.map.size >= this.capacity) {
    const firstKey = this.map.keys().next().value;
    this.map.delete(firstKey);
  }
  this.map.set(key, value);
};
function testLRU(cap) {
  const lru = new LRUCache(cap);
  lru.put(1, 1);
  lru.put(2, 2);
  const a = lru.get(1);
  lru.put(3, 3);
  const b = lru.get(2);
  return [a, b];
}