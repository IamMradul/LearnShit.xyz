use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(line1)) = lines.next() {
        let n: usize = line1.trim().parse().unwrap_or(0);
        if let Some(Ok(line2)) = lines.next() {
            let mut total: i64 = 0;
            for token in line2.split_whitespace() {
                let val: i64 = token.parse().unwrap_or(0);
                total += val;
            }
            println!("{}", total);
        }
    }
}