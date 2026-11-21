package main

func bfs(n int, edges [][]int, start int) []int {
    adj := make([][]int, n)
    for _, edge := range edges {
        adj[edge[0]] = append(adj[edge[0]], edge[1])
    }
    visited := make([]bool, n)
    queue := []int{start}
    visited[start] = true
    order := []int{}

    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        order = append(order, node)
        for _, neighbor := range adj[node] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
    return order
}