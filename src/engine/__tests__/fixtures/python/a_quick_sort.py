from typing import List

class Solution:
    def quickSort(self, nums: List[int]) -> List[int]:
        def partition(arr, low, high):
            pivot = arr[high]
            i = low - 1
            for j in range(low, high):
                if arr[j] < pivot:
                    i += 1
                    arr[i], arr[j] = arr[j], arr[i]
            arr[i + 1], arr[high] = arr[high], arr[i + 1]
            return i + 1

        def sort(arr, low, high):
            if low < high:
                pi = partition(arr, low, high)
                sort(arr, low, pi - 1)
                sort(arr, pi + 1, high)

        sort(nums, 0, len(nums) - 1)
        return nums
