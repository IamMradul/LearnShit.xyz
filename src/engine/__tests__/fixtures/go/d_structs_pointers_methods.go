package main

type Counter struct {
    val int
}

func (c *Counter) Inc() {
    c.val++
}

func testStruct(init int) int {
    c := &Counter{val: init}
    c.Inc()
    c.Inc()
    return c.val
}