package main

func shortestPath(n int, edges [][]int, src int) []int {
    dist := make([]int, n)
    visited := make([]bool, n)
    for i := range dist {
        dist[i] = 1000000000
    }
    dist[src] = 0
    for i := 0; i < n; i++ {
        u := -1
        for j := 0; j < n; j++ {
            if !visited[j] && (u == -1 || dist[j] < dist[u]) {
                u = j
            }
        }
        if dist[u] == 1000000000 {
            break
        }
        visited[u] = true
        for _, edge := range edges {
            if edge[0] == u && dist[u]+edge[2] < dist[edge[1]] {
                dist[edge[1]] = dist[u] + edge[2]
            }
        }
    }
    return dist
}