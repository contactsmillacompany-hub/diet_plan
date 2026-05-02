import urllib.request, json
query = "Paneer"
url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={query}%20food&prop=pageimages&pithumbsize=400&format=json"
with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode())
    pages = data.get("query", {}).get("pages", {})
    for page_id, page_info in pages.items():
        if "thumbnail" in page_info:
            print(f"Found for {query}:", page_info["thumbnail"]["source"])
            break
