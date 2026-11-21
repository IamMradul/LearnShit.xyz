from typing import List

class Solution:
    def reverseInPlace(self, arr: List[int]) -> List[int]:
        l, r = 0, len(arr) - 1
        while l < r:
            arr[l], arr[r] = arr[r], arr[l]
            l += 1
            r -= 1
        return arr
