import sys

def main():
    lines = sys.stdin.read().split()
    if lines:
        n = int(lines[0])
        total = sum(int(x) for x in lines[1:n+1])
        print(total)

if __name__ == '__main__':
    main()
