package main

func testLRU(cap int) []int {
    m := make(map[int]int)
    m[1] = 1
    m[2] = 2
    a, ok1 := m[1]
    if !ok1 {
        a = -1
    }
    m[3] = 3
    b, ok2 := m[2]
    if !ok2 {
        b = -1
    }
    return []int{a, b}
}