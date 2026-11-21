package main

func recurse(n int) int {
    return recurse(n + 1)
}