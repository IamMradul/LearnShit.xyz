package main

import (
    "fmt"
)

func main() {
    var t int
    if _, err := fmt.Scan(&t); err == nil {
        for c := 0; c < t; c++ {
            var n int
            fmt.Scan(&n)
            maxVal := -1000000000
            for i := 0; i < n; i++ {
                var x int
                fmt.Scan(&x)
                if x > maxVal {
                    maxVal = x
                }
            }
            fmt.Println(maxVal)
        }
    }
}