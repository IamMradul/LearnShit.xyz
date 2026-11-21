use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut iter = input.split_whitespace();
        if let Some(t_str) = iter.next() {
            let t: usize = t_str.parse().unwrap_or(0);
            for _ in 0..t {
                let n: usize = iter.next().unwrap().parse().unwrap();
                let mut max_val = -1000000000;
                for _ in 0..n {
                    let x: i32 = iter.next().unwrap().parse().unwrap();
                    if x > max_val {
                        max_val = x;
                    }
                }
                println!("{}", max_val);
            }
        }
    }
}