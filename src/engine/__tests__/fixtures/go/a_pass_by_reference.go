package main

func reverseInPlace(arr []int) []int {
    l, r := 0, len(arr)-1
    for l < r {
        arr[l], arr[r] = arr[r], arr[l]
        l++
        r--
    }
    return arr
}