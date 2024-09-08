import sys
import json

def main():
    data = json.loads(sys.argv[1])
    # Perform some operation with data
    print(f"Received data: {data}")

main()
