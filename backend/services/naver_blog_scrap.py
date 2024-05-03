from bs4 import BeautifulSoup
import requests

class NaverBlogScrapper:

    def __init__(self):
        self.url = None

    def scrape_naver_blog_init(self, url:str):
        self.url = url
        html = requests.get(url)
        soup = BeautifulSoup(html.text, 'html.parser')
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'}

        iframe = soup.find("iframe", attrs={"id": "mainFrame"})
        iframe_url = "https://blog.naver.com" + iframe["src"]

        iframe_response = requests.get(iframe_url, headers=headers)
        iframe_content = iframe_response.content

        iframe_soup = BeautifulSoup(iframe_content, 'html.parser')
        return iframe_soup

    def scrape_naver_blog_text(self, soup):
        result = ""
        if soup.find("div", attrs={"class": "se-main-container"}):
            text = soup.find("div", attrs={"class": "se-main-container"}).get_text()
            result = text.replace("\n", "")

        return result
