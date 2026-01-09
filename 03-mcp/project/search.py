import os
import requests
import zipfile

import minsearch
from minsearch import Index


def strip_first_part(path):
    return "/".join(path.split("/")[1:])

def search(query):
    results = index.search(query)
    return results


ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
ZIP_PATH = "fastmcp-main.zip"

if not os.path.exists(ZIP_PATH):
    print("Downloading ZIP...")
    response = requests.get(ZIP_URL)
    response.raise_for_status()
    with open(ZIP_PATH, "wb") as f:
        f.write(response.content)
    print("Download complete.")
else:
    print("ZIP already exists.")


md_files = []
with zipfile.ZipFile(ZIP_PATH, "r") as zipf:
    for name in zipf.namelist():
        if name.endswith(".md") or name.endswith(".mdx"):
            md_files.append(name)



docs = []
with zipfile.ZipFile(ZIP_PATH, "r") as zipf:
    for name in md_files:
        with zipf.open(name) as f:
            content = f.read().decode("utf-8", errors="ignore")
            docs.append({
                "filename": strip_first_part(name),
                "content": content
            })

# Create and fit the index
index = Index(
    text_fields=["filename", "content"],
    keyword_fields=["filename", "content"]
)
index.fit(docs)


if __name__ == "__main__":
    results = search("demo")
    for doc in results:
        print(doc["filename"])