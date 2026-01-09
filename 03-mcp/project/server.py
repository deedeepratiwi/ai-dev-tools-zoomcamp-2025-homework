from fastmcp import FastMCP
import requests

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

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