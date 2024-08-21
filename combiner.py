def read_file(file_path: str) -> str:
    with open(file_path, 'r') as file:
        lines = file.readlines()
    
    # ignore import statements
    lines = [line for line in lines if not line.startswith('import')]
    # remove assert statements
    lines = [line for line in lines if 'assert' not in line]
    return ''.join(lines)

def read_codingame_file(file_path: str = 'src/codingame/codingame.ts') -> str:
    with open(file_path, 'r') as file:
        lines = file.readlines()
    
    # ignore until the first line with `const`
    for i, line in enumerate(lines):
        if line.startswith('const'):
            break
    lines = lines[i:]
    return ''.join(lines)

def get_config() -> dict:
    return {
        "files": [
            "src/solver/solver.ts",
        ],
        "initials": "import { isMainThread, parentPort, Worker } from \"worker_threads\";",
    }

def main():
    config = get_config()
    content = config["initials"] + '\n\n'
    for file in config['files']:
        content += read_file(file) + '\n\n'
    content += read_codingame_file()

    with open("combined.ts", "w") as f:
        f.write(content)


if __name__ == "__main__":
    main()
