impl Solution {
    pub fn shortest_path(n: i32, edges: Vec<Vec<i32>>, src: i32) -> Vec<i32> {
        let n = n as usize;
        let mut dist = vec![1000000000; n];
        dist[src as usize] = 0;
        let mut visited = vec![false; n];
        for _ in 0..n {
            let mut u: Option<usize> = None;
            for j in 0..n {
                if !visited[j] && (u.is_none() || dist[j] < dist[u.unwrap()]) {
                    u = Some(j);
                }
            }
            if u.is_none() || dist[u.unwrap()] == 1000000000 {
                break;
            }
            let u = u.unwrap();
            visited[u] = true;
            for edge in &edges {
                if edge[0] as usize == u && dist[u] + edge[2] < dist[edge[1] as usize] {
                    dist[edge[1] as usize] = dist[u] + edge[2];
                }
            }
        }
        dist
    }
}