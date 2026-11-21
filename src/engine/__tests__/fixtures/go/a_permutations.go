package main

func permute(nums []int) [][]int {
    res := [][]int{}
    var backtrack func(start int)
    backtrack = func(start int) {
        if start == len(nums) {
            row := make([]int, len(nums))
            copy(row, nums)
            res = append(res, row)
            return
        }
        for i := start; i < len(nums); i++ {
            nums[start], nums[i] = nums[i], nums[start]
            backtrack(start + 1)
            nums[start], nums[i] = nums[i], nums[start]
        }
    }
    backtrack(0)
    return res
}