package main

func crashMidway(nums []int) []int {
    res := []int{}
    for _, x := range nums {
        if x < 0 {
            panic("Negative number")
        }
        res = append(res, x*2)
    }
    return res
}