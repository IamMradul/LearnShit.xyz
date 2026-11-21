use std::collections::VecDeque;

impl Solution {
    pub fn bfs(n: i32, edges: Vec<Vec<i32>>, start: i32) -> Vec<i32> {
        let n = n as usize;
        let mut adj = vec![vec![]; n];
        for edge in edges {
            adj[edge[0] as usize].push(edge[1] as usize);
        }
        let mut visited = vec![false; n];
        let mut queue = VecDeque::new();
        queue.push_back(start as usize);
        visited[start as usize] = true;
        let mut order = Vec::new();

        while let Some(node) = queue.pop_front() {
            order.push(node as i32);
            for &neighbor in &adj[node] {
                if !visited[neighbor] {
                    visited[neighbor] = true;
                    queue.push_back(neighbor);
                }
            }
        }
        order
    }
}