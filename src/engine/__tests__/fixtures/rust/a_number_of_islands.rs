impl Solution {
    pub fn num_islands(mut grid: Vec<Vec<char>>) -> i32 {
        if grid.is_empty() {
            return 0;
        }
        let rows = grid.len();
        let cols = grid[0].len();
        let mut count = 0;

        fn dfs(grid: &mut Vec<Vec<char>>, r: isize, c: isize) {
            let rows = grid.len() as isize;
            let cols = grid[0].len() as isize;
            if r < 0 || c < 0 || r >= rows || c >= cols || grid[r as usize][c as usize] != '1' {
                return;
            }
            grid[r as usize][c as usize] = '0';
            dfs(grid, r + 1, c);
            dfs(grid, r - 1, c);
            dfs(grid, r, c + 1);
            dfs(grid, r, c - 1);
        }

        for r in 0..rows {
            for c in 0..cols {
                if grid[r][c] == '1' {
                    count += 1;
                    dfs(&mut grid, r as isize, c as isize);
                }
            }
        }
        count
    }
}