use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    let _ = io::stdin().read_to_string(&mut input);
    if input.trim().is_empty() {
        println!("EMPTY");
    } else {
        println!("NONEMPTY");
    }
}