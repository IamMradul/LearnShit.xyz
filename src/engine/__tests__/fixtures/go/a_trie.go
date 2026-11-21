package main

type TrieNode struct {
    children [26]*TrieNode
    isEnd    bool
}

func testTrie(words []string) []bool {
    root := &TrieNode{}
    // insert words[0]
    cur := root
    for _, ch := range words[0] {
        idx := ch - 'a'
        if cur.children[idx] == nil {
            cur.children[idx] = &TrieNode{}
        }
        cur = cur.children[idx]
    }
    cur.isEnd = true

    // search words[0]
    cur = root
    f1 := true
    for _, ch := range words[0] {
        idx := ch - 'a'
        if cur.children[idx] == nil {
            f1 = false
            break
        }
        cur = cur.children[idx]
    }
    f1 = f1 && cur.isEnd

    // search words[1]
    cur = root
    f2 := true
    for _, ch := range words[1] {
        idx := ch - 'a'
        if cur.children[idx] == nil {
            f2 = false
            break
        }
        cur = cur.children[idx]
    }
    f2 = f2 && cur.isEnd

    return []bool{f1, f2}
}