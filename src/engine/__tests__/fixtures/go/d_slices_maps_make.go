package main

func stressGoFeatures(n int) []int {
    s := make([]int, 0, n)
    m := make(map[string]int)
    for i := 0; i < n; i++ {
        s = append(s, i*i)
        m["key"] = i
    }
    a, b := s[0], len(s)
    return []int{a, b, m["key"]}
}