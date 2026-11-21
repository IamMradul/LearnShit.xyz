package main

import (
    "fmt"
)

func main() {
    var r, c int
    if _, err := fmt.Scan(&r, &c); err == nil {
        sum := 0
        mat := make([][]int, r)
        for i := 0; i < r; i++ {
            mat[i] = make([]int, c)
            for j := 0; j < c; j++ {
                fmt.Scan(&mat[i][j])
                sum += mat[i][j]
            }
        }
        fmt.Println(sum)
    }
}