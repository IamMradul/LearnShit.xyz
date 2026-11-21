package main

func sortArray(nums []int) []int {
    var merge func(arr []int, l, m, r int)
    merge = func(arr []int, l, m, r int) {
        left := make([]int, m-l+1)
        right := make([]int, r-m)
        copy(left, arr[l:m+1])
        copy(right, arr[m+1:r+1])
        i, j, k := 0, 0, l
        for i < len(left) && j < len(right) {
            if left[i] <= right[j] {
                arr[k] = left[i]
                i++
            } else {
                arr[k] = right[j]
                j++
            }
            k++
        }
        for i < len(left) {
            arr[k] = left[i]
            i++
            k++
        }
        for j < len(right) {
            arr[k] = right[j]
            j++
            k++
        }
    }
    var sort func(arr []int, l, r int)
    sort = func(arr []int, l, r int) {
        if l >= r {
            return
        }
        m := l + (r-l)/2
        sort(arr, l, m)
        sort(arr, m+1, r)
        merge(arr, l, m, r)
    }
    sort(nums, 0, len(nums)-1)
    return nums
}