import os
import re

def find_route_imports(root_dir):
    route_import_pattern = re.compile(
        r'import\s+.*\s+from\s+[\'"](.*/app/api/.*/route\.(ts|js))[\'"]'
    )
    found = []
    exclude_dirs = {'node_modules', '.next', 'dist', 'out', 'build', '.git'}

    for subdir, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(subdir, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        matches = route_import_pattern.findall(content)
                        for match in matches:
                            found.append((filepath, match[0]))
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")

    if found:
        print("Found improper imports of API route files:")
        for file, imp in found:
            print(f"  File: {file}\n  Imports: {imp}\n")
    else:
        print("No improper imports of API route files found.")

if __name__ == "__main__":
    find_route_imports('.')