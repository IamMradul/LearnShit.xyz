impl Solution {
    pub fn count_components(n: i32, edges: Vec<Vec<i32>>) -> i32 {
        let n = n as usize;
        let mut parent: Vec<usize> = (0..n).collect();
        fn find(parent: &mut Vec<usize>, i: usize) -> usize {
            if parent[i] == i {
                return i;
            }
            let p = parent[i];
            parent[i] = find(parent, p);
            parent[i]
        }
        let mut count = n as i32;
        for edge in edges {
            let ri = find(&mut parent, edge[0] as usize);
            let rj = find(&mut parent, edge[1] as usize);
            if ri != rj {
                parent[ri] = rj;
                count -= 1;
            }
        }
        count
    }
}