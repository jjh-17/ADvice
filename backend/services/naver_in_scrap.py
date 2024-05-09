from bs4 import BeautifulSoup
import requests

class NaverInScrapper:

    def __init__(self):
        self.url = None

    def scrape_naver_in_init(self, url:str):
        self.url = url
        html = requests.get(url)
        soup = BeautifulSoup(html.text, 'html.parser')
        return soup

    def scrape_naver_in_text(self, soup):
        result = ""
        if soup.find("div", attrs={"class": "se-main-container"}):
            text = soup.find("div", attrs={"class": "se-main-container"}).get_text()
            result = text.replace("\n", "")

        return result