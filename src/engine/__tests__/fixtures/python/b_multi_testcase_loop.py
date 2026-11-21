import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    ptr = 0
    t = int(tokens[ptr])
    ptr += 1
    for _ in range(t):
        n = int(tokens[ptr])
        ptr += 1
        arr = [int(x) for x in tokens[ptr:ptr+n]]
        ptr += n
        print(max(arr))

if __name__ == '__main__':
    main()
