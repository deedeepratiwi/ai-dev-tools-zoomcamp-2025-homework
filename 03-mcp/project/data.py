from server import scrape_markdown_impl

if __name__ == "__main__":
    content = scrape_markdown_impl("https://datatalks.club/")
    print(content.count("data"))