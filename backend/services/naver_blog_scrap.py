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

        text = self.extract_text(main_container)
        images, stickers = self.extract_images(main_container)

        return None

    # 텍스트 추출
    def extract_text(self, main_container: BeautifulSoup):
        clean_lines = []
        text_tag = main_container.find_all("p")

        curr = []
        for tag in text_tag:
            if tag.get_text().replace("\u200B", "").strip():
                curr.append(tag.get_text().replace("\u200B", "").strip())
            elif curr:
                clean_lines.append(curr)
                curr = []

        return clean_lines

    # 이미지 추출
    def extract_images(self, main_container: BeautifulSoup):
        images = main_container.find_all("img", recursive=True)

        images_url = []
        stickers = []
        for img in images:
            if not img.get("src") or not img.parent.get("data-linktype"):
                continue

            if img.parent["data-linktype"] == "sticker":
                stickers.append(img["src"])

            else:
                images_url.append(img["src"])

        return images_url, stickers


# if __name__ == "__main__":
#     scraper = NaverBlogScrapper()
#     scraper.scrape_naver_blogs("https://blog.naver.com/nasy1346/223206741687")
