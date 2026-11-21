package main

func twoSum(nums []int, target int) []int {
    m := make(map[int]int)
    for i, x := range nums {
        diff := target - x
        if idx, ok := m[diff]; ok {
            return []int{idx, i}
        }
        m[x] = i
    }
    return []int{}
}