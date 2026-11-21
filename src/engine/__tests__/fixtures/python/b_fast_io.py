import sys

def main():
    input_func = sys.stdin.readline
    line1 = input_func()
    if not line1:
        return
    n = int(line1.strip())
    arr = list(map(int, input_func().split()))
    print(sum(arr))

if __name__ == '__main__':
    main()
