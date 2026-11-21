from typing import List

class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        def merge(arr, l, m, r):
            left = arr[l:m + 1]
            right = arr[m + 1:r + 1]
            i, j, k = 0, 0, l
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    arr[k] = left[i]
                    i += 1
                else:
                    arr[k] = right[j]
                    j += 1
                k += 1
            while i < len(left):
                arr[k] = left[i]
                i += 1
                k += 1
            while j < len(right):
                arr[k] = right[j]
                j += 1
                k += 1

        def sort(arr, l, r):
            if l >= r:
                return
            m = (l + r) // 2
            sort(arr, l, m)
            sort(arr, m + 1, r)
            merge(arr, l, m, r)

        sort(nums, 0, len(nums) - 1)
        return nums
