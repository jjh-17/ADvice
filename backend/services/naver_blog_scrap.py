import requests
from bs4 import BeautifulSoup


class NaverBlogScrapper:
    def __init__(self):
        self.__naver_url = "https://blog.naver.com/"

    def scrape_naver_blogs(self, url: str):
        res = requests.get(url)

        # iframe으로 구성된 경우 url 수정
        soup = BeautifulSoup(res.text, "html.parser")

        for tag in soup.select("iframe"):
            
            if tag["id"] == "mainFrame":
                frame = requests.get(self.__naver_url + tag["src"])
                soup = BeautifulSoup(frame.text, "html.parser")
                break

        return self.__scrape_internal_frame(soup)

    def __scrape_internal_frame(self, soup: BeautifulSoup):

        main_container = soup.find("div", class_="se-main-container")

        return None
