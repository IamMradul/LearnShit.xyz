class Solution:
    def stressComprehensions(self, nums: List[int]) -> List[int]:
        squares = [x * x for x in nums if x > 0]
        cubes_dict = {x: x**3 for x in nums}
        set_evens = {x for x in nums if x % 2 == 0}
        reversed_slice = nums[::-1]
        a, *rest, b = nums
        return [len(squares), len(cubes_dict), len(set_evens), len(reversed_slice), a + b]
