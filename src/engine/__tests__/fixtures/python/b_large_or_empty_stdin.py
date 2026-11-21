import sys

def main():
    content = sys.stdin.read().strip()
    if not content:
        print("EMPTY")
    else:
        print("NONEMPTY")

if __name__ == '__main__':
    main()
