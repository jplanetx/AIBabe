import os

def add_dynamic_to_routes(api_dir='app/api'):
    for root, _, files in os.walk(api_dir):
        for file in files:
            if file.endswith(('route.ts', 'route.js')):
                path = os.path.join(root, file)
                with open(path, 'r+', encoding='utf-8') as f:
                    content = f.read()
                    if "export const dynamic = 'force-dynamic';" not in content:
                        f.seek(0, 0)
                        f.write("export const dynamic = 'force-dynamic';\n\n" + content)
                        print(f"Added dynamic export to {path}")
                    else:
                        print(f"Dynamic export already present in {path}")

if __name__ == "__main__":
    add_dynamic_to_routes()
