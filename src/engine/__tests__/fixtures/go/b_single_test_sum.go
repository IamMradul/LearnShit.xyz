package main

import (
    "fmt"
)

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        var sum int64 = 0
        for i := 0; i < n; i++ {
            var val int
            fmt.Scan(&val)
            sum += int64(val)
        }
        fmt.Println(sum)
    }
}