from models.full_request import FullRequest
from services.naver_cafe_scrap import NaverCafeScrapper
from services.naver_blog_scrap import NaverBlogScrapper
from services.text_ad_detection import TextAdDetection

from kss import split_sentences
import asyncio


class OptionService:
    def __init__(self):
        self.cafeScrap = NaverCafeScrapper()
        self.blogScrap = NaverBlogScrapper()
        self.list = None
        self.soup = None
        self.goodOption = None
        self.badOption = None
        self.keyword = None

    async def option_service(self, data: FullRequest):
        self.goodOption = data.goodOption
        self.badOption = data.badOption
        self.keyword = data.keyword

        tasks = [self.url_score(url) for url in data.urlList]
        results = await asyncio.gather(*tasks)

        return {
            "scoreList": [
                {"url": url, "score": score}
                for url, score in zip(data.urlList, results)
            ]
        }

    async def url_score(self, url: str):
        # url 스크랩
        text = self.url_scrap(url)
        # 문장으로 나누기
        await self.split_string(text)
        sentence_count = len(self.list)

        good_score = 0
        bad_score = 0

        # good : True, bad : False
        # TODO: 이거 판단을 왜 여기서 하는지?
        score_options = []

        for i in self.goodOption:
            score = 0
            if i == 1:
                score = await self.option_one() * 25
            if i == 2:
                score = await self.option_two() * 100
            if i == 3:
                score = await self.option_three() * 100
            if i == 4:
                score = (await self.option_four(self.keyword) / sentence_count) * 100
            if i == 5:
                score = (await self.option_five() / sentence_count) * 100

            good_score = good_score + score

        score = 0
        for i in self.badOption:
            if i == 1:
                score = await self.option_one() * 25
            if i == 2:
                score = await self.option_two() * 100
            if i == 3:
                score = await self.option_three() * 100
            if i == 4:
                score = (await self.option_four(self.keyword) / sentence_count) * 100
            if i == 5:
                score = (await self.option_five() / sentence_count) * 100

            bad_score = bad_score + score

        return (good_score / len(self.goodOption)) - (bad_score / len(self.badOption))

    def url_scrap(self, url: str):
        text = ""
        if "cafe" in url:  # 카페 게시글인 경우
            self.soup = self.cafeScrap.scrape_naver_cafe_init(url)
            text = self.cafeScrap.scrape_naver_cafe_text(self.soup)

        if "blog" in url:  # 블로그 게시글인 경우
            self.soup = self.blogScrap.scrape_naver_blog_init(url)
            text = self.blogScrap.scrape_naver_blog_text(self.soup)

        return text

    async def split_string(self, paragraph: str):
        self.list = split_sentences(paragraph)

    def soup_get_main_container(self):
        return self.soup.find("div", attrs={"class": "se-main-container"})

    async def option_one(self):
        cnt = 0
        soup = self.soup_get_main_container()

        # 사진 여부
        if soup.find("div", attrs={"class": "se-imageStrip"}) or soup.find(
            "div", attrs={"class": "se-image"}
        ):
            cnt = cnt + 1
        # 영상 여부
        if soup.find("div", attrs={"class": "se-video"}):
            cnt = cnt + 1
        # 링크 여부
        if soup.find("div", attrs={"class": "se-oglink"}):
            cnt = cnt + 1
        # 지도 여부
        if soup.find("div", attrs={"class": "se-placesMap"}):
            cnt = cnt + 1

        return cnt

    async def option_two(self):
        flag = 0
        blockUrlList = [
            "https://coupa.ng/",
            "https://link.coupang.com/",
            "https://api3.myrealtrip.com/",
            "https://smartstore.naver.com",
        ]
        soup = self.soup_get_main_container()

        div_oglink_tags = soup.find_all("div", attrs={"class": "se-oglink"})

        for div_tag in div_oglink_tags:
            url = div_tag.find("a").get("href")
            for i in blockUrlList:
                if i in url:
                    flag = 1

        # 1이면 블랙리스트 링크 존재
        return flag

    async def option_three(self):
        flag = 0
        if self.soup.find("div", attrs={"class": "not_sponsored_summary_wrap"}):
            flag = 1

        # 1이면 내돈내산 마크 존재
        return flag

    async def option_four(self, keyword):
        cnt = 0
        for i in self.list:
            if keyword in i:
                cnt = cnt + 1

        return cnt

    async def option_five(self):
        cnt = 0
        detector = TextAdDetection()
        ad_result = detector.predict(self.list)
        for i in range(len(self.list)):
            if ad_result[i] == 1:
                cnt = cnt + 1
        return cnt
