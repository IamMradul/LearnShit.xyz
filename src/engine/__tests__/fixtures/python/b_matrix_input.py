import sys

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        r = int(tokens[0])
        c = int(tokens[1])
        idx = 2
        total = 0
        grid = []
        for _ in range(r):
            row = [int(tokens[idx + j]) for j in range(c)]
            total += sum(row)
            grid.append(row)
            idx += c
        print(total)

if __name__ == '__main__':
    main()
