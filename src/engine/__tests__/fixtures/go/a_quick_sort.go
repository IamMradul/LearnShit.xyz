package main

func quickSort(nums []int) []int {
    var partition func(arr []int, low, high int) int
    partition = func(arr []int, low, high int) int {
        pivot := arr[high]
        i := low - 1
        for j := low; j < high; j++ {
            if arr[j] < pivot {
                i++
                arr[i], arr[j] = arr[j], arr[i]
            }
        }
        arr[i+1], arr[high] = arr[high], arr[i+1]
        return i + 1
    }
    var sort func(arr []int, low, high int)
    sort = func(arr []int, low, high int) {
        if low < high {
            pi := partition(arr, low, high)
            sort(arr, low, pi-1)
            sort(arr, pi+1, high)
        }
    }
    sort(nums, 0, len(nums)-1)
    return nums
}