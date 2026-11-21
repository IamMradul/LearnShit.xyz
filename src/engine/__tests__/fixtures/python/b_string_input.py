import sys

def main():
    data = sys.stdin.read().strip()
    if data:
        print(data[::-1])

if __name__ == '__main__':
    main()
