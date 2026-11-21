package main

import (
    "fmt"
)

func main() {
    var s string
    if _, err := fmt.Scan(&s); err != nil {
        fmt.Println("EMPTY")
    } else {
        fmt.Println("NONEMPTY")
    }
}