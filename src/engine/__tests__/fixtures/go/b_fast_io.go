package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Split(bufio.ScanWords)
    if scanner.Scan() {
        var n int
        fmt.Sscan(scanner.Text(), &n)
        var total int64 = 0
        for i := 0; i < n && scanner.Scan(); i++ {
            var val int64
            fmt.Sscan(scanner.Text(), &val)
            total += val
        }
        fmt.Println(total)
    }
}