from fastmcp import FastMCP
import requests

# For documentation search
import os
import zipfile
from minsearch import Index

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b


# --- Documentation Search Tool Setup ---
ZIP_URL = "https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip"
ZIP_PATH = "fastmcp-main.zip"

if not os.path.exists(ZIP_PATH):
    print("Downloading ZIP...")
    import requests as _requests
    response = _requests.get(ZIP_URL)
    response.raise_for_status()
    with open(ZIP_PATH, "wb") as f:
        f.write(response.content)
    print("Download complete.")
else:
    print("ZIP already exists.")

def strip_first_part(path):
    return "/".join(path.split("/")[1:])

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

doc_index = Index(
    text_fields=["filename", "content"],
    keyword_fields=["filename", "content"]
)
doc_index.fit(docs)

@mcp.tool
def doc_search(query: str) -> list:
    """Search fastmcp documentation. Returns top 5 relevant filenames for the query."""
    results = doc_index.search(query, limit=5)
    return [doc["filename"] for doc in results]

def scrape_markdown_impl(url: str) -> str:
    """Download page content in markdown using Jina Reader."""
    proxy_url = f"https://r.jina.ai/{url}"
    response = requests.get(proxy_url)
    response.raise_for_status()
    return response.text

@mcp.tool
def scrape_markdown(url: str) -> str:
    return scrape_markdown_impl(url)

if __name__ == "__main__":
    mcp.run()