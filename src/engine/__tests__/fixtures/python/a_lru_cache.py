class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            first_key = next(iter(self.cache))
            del self.cache[first_key]
        self.cache[key] = value

class Solution:
    def testLRU(self, cap: int) -> List[int]:
        lru = LRUCache(cap)
        lru.put(1, 1)
        lru.put(2, 2)
        a = lru.get(1)
        lru.put(3, 3)
        b = lru.get(2)
        return [a, b]
