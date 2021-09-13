import os, json

j = {'treeId': '', 'nodes':[]}
i = 0

def walkfn(dirname, j):
    global i
    for name in os.listdir(dirname):
        i+=1
        path = os.path.join(dirname, name)
        if os.path.isdir(path):
            n = {'id': '', 'text': name, 'type': 'folder', 'nodes':[]}
            walkfn(path, n)
            j['nodes'].append(n)
        else:
            n = {'id': '', 'text': name, 'type': 'node'}
            j['nodes'].append(n)

walkfn(".", j)
with open("c:\\temp\\files_list.json", "w") as F:
    F.write(json.dumps(j))

print(f"Total records: {i}")