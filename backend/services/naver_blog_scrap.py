import requests
from bs4 import BeautifulSoup
from requests import ConnectionError, Timeout, TooManyRedirects

from models.exception.custom_exception import CustomException


class NaverBlogScrapper:
    def __init__(self):
        self.__naver_url = "https://blog.naver.com/"

    def scrape_naver_blogs(self, url: str):
        res = self.__download_page(url)

        # iframe으로 구성된 경우 url 수정
        soup = BeautifulSoup(res.text, "html.parser")

        for tag in soup.select("iframe"):
            if tag["id"] == "mainFrame":
                frame = requests.get(self.__naver_url + tag["src"])
                soup = BeautifulSoup(frame.text, "html.parser")
                break

        return self.__scrape_internal_frame(soup)

    def __download_page(self, url: str):
        # TODO : requests를 다른 서비스에서 사용할 경우 분리
        try:
            res = requests.get(url)
            return res
        except (ConnectionError, Timeout, TooManyRedirects):
            raise CustomException(400, "페이지에 연결할 수 없습니다")

    def __scrape_internal_frame(self, soup: BeautifulSoup):
        main_container = soup.find("div", class_="se-main-container")

        if not main_container:
            raise CustomException(400, "메인 컨테이너를 찾을 수 없습니다.")

        text = self.extract_text(main_container)
        images = self.extract_images(main_container)

        return text, images

    # 텍스트 추출
    def extract_text(self, main_container: BeautifulSoup):
        clean_lines = []
        text_tag = main_container.find_all("div", class_="se-text")

        for tag in text_tag:
            if tag.get_text().replace("\u200B", "").strip():
                clean_lines.append(
                    tag.get_text(separator=" ", strip=True)
                    .replace("\u200B", "")
                    .strip()
                )

        return clean_lines

    # 이미지 추출
    def extract_images(self, main_container: BeautifulSoup):
        images = main_container.find_all("img", recursive=True)

        images_url = []
        for img in images:
            if not img.get("src") or not img.parent.get("data-linktype"):
                continue

            if img.parent["data-linktype"] == "sticker" and ".gif" in img["src"]:
                continue

            images_url.append(img["src"])

        return images_url


if __name__ == "__main__":
    scraper = NaverBlogScrapper()

    print(scraper.scrape_naver_blogs("https://kimdj1989"))
