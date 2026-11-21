import heapq
from collections import deque, defaultdict, Counter

class Solution:
    def testCollections(self, nums: List[int]) -> List[int]:
        counts = Counter(nums)
        dd = defaultdict(list)
        for i, val in enumerate(nums):
            dd[val].append(i)
        h = list(nums)
        heapq.heapify(h)
        smallest = heapq.heappop(h)
        return [counts[nums[0]], len(dd), smallest]
