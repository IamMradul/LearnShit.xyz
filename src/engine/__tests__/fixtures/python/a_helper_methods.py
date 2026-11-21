from typing import List

class Solution:
    def helper(self, x: int) -> int:
        return x * 2

    def processArray(self, nums: List[int]) -> List[int]:
        res = []
        for x in nums:
            res.append(self.helper(x))
        return res
