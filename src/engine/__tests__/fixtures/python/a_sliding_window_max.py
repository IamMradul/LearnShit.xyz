from typing import List
from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        q = deque()
        res = []
        for i, n in enumerate(nums):
            while q and q[0] < i - k + 1:
                q.popleft()
            while q and nums[q[-1]] < n:
                q.pop()
            q.append(i)
            if i >= k - 1:
                res.append(nums[q[0]])
        return res
