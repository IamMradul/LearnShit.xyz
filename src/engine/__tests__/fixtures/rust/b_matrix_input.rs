use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut iter = input.split_whitespace();
        if let (Some(r_str), Some(c_str)) = (iter.next(), iter.next()) {
            let r: usize = r_str.parse().unwrap_or(0);
            let c: usize = c_str.parse().unwrap_or(0);
            let mut sum: i32 = 0;
            for _ in 0..r {
                for _ in 0..c {
                    let val: i32 = iter.next().unwrap().parse().unwrap();
                    sum += val;
                }
            }
            println!("{}", sum);
        }
    }
}