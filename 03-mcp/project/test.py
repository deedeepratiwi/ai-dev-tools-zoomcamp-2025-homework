from server import scrape_markdown_impl

if __name__ == "__main__":
    content = scrape_markdown_impl("https://github.com/alexeygrigorev/minsearch")
    print(f"Character count: {len(content)}")