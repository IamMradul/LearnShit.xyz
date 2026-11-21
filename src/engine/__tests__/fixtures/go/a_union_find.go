package main

func countComponents(n int, edges [][]int) int {
    parent := make([]int, n)
    for i := range parent {
        parent[i] = i
    }
    var find func(i int) int
    find = func(i int) int {
        if parent[i] == i {
            return i
        }
        parent[i] = find(parent[i])
        return parent[i]
    }
    count := n
    for _, edge := range edges {
        ri := find(edge[0])
        rj := find(edge[1])
        if ri != rj {
            parent[ri] = rj
            count--
        }
    }
    return count
}