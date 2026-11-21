package main

func testClosures(nums []int) int {
    factor := 2
    doubler := func(x int) int {
        return x * factor
    }
    total := 0
    for _, x := range nums {
        total += doubler(x)
    }
    return total
}