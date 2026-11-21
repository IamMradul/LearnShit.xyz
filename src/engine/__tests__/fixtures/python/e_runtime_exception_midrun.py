class Solution:
    def crashMidway(self, nums: List[int]) -> List[int]:
        res = []
        for x in nums:
            if x < 0:
                raise ValueError("Negative number")
            res.append(x * 2)
        return res
