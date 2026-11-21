use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut iter = input.split_whitespace();
        if let Some(n_str) = iter.next() {
            let n: usize = n_str.parse().unwrap_or(0);
            let mut sum: i64 = 0;
            for _ in 0..n {
                if let Some(val_str) = iter.next() {
                    let val: i64 = val_str.parse().unwrap_or(0);
                    sum += val;
                }
            }
            println!("{}", sum);
        }
    }
}