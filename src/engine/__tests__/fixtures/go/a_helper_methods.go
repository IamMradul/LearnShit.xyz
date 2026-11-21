package main

func helper(x int) int {
    return x * 2
}

func processArray(nums []int) []int {
    res := make([]int, len(nums))
    for i, x := range nums {
        res[i] = helper(x)
    }
    return res
}