package main

func maxSlidingWindow(nums []int, k int) []int {
    q := []int{}
    res := []int{}
    for i, x := range nums {
        for len(q) > 0 && q[0] < i-k+1 {
            q = q[1:]
        }
        for len(q) > 0 && nums[q[len(q)-1]] < x {
            q = q[:len(q)-1]
        }
        q = append(q, i)
        if i >= k-1 {
            res = append(res, nums[q[0]])
        }
    }
    return res
}