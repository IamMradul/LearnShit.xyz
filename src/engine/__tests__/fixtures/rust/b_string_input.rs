use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let s = input.trim();
        let rev: String = s.chars().rev().collect();
        println!("{}", rev);
    }
}