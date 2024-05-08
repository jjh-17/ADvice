from kss import split_sentences
import asyncio

from models.full_request import FullRequest
from models.exception.custom_exception import CustomException
from services.naver_cafe_scrap import NaverCafeScrapper
from services.naver_blog_scrap import NaverBlogScrapper
from services.text_ad_detection import TextAdDetection


class OptionService:
    def __init__(self):
        self.cafeScrap = NaverCafeScrapper()
        self.blogScrap = NaverBlogScrapper()
        self.list = None
        self.soup = None
        self.goodOption = None
        self.badOption = None
        self.keyword = None
        self._options = [
            self.calc_types_information,
            self.calc_bad_url,
            self.calc_not_sponsored_mark,
            self.calc_contains_keyword,
            self.calc_ad_detection,
        ]

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

        # good option과 bad option 순서 맞춤
        good_tasks = []
        for option in self.goodOption:
            self._check_option_range(option)
            good_tasks.append(self._options[option - 1]())

        bad_tasks = []
        for option in self.badOption:
            self._check_option_range(option)
            bad_tasks.append(self._options[option - 1]())

        # good option과 bad option을 한번에 await
        result = await asyncio.gather(*(good_tasks + bad_tasks))

        # 결과를 각 옵션 길이에 따라 슬라이싱해서 분배
        good_score, bad_score = 0, 0
        if len(self.goodOption) > 0:
            good_score += sum(result[: len(self.goodOption)]) / len(self.goodOption)

        if len(self.badOption) > 0:
            bad_score += sum(result[len(self.goodOption) :]) / len(self.goodOption)

        return good_score - bad_score

    async def calc_types_information(self):
        return await self.count_types_information() * 25

    async def calc_bad_url(self):
        return await self.has_bad_url() * 100

    async def calc_not_sponsored_mark(self):
        return await self.has_not_sponsored_mark() * 100

    async def calc_contains_keyword(self):
        return (await self.contains_keyword(self.keyword) / len(self.list)) * 100

    async def calc_ad_detection(self):
        return (await self.ad_detection() / len(self.list)) * 100

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

    async def count_types_information(self):
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

    async def has_bad_url(self):
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

    async def has_not_sponsored_mark(self):
        flag = 0
        if self.soup.find("div", attrs={"class": "not_sponsored_summary_wrap"}):
            flag = 1

        # 1이면 내돈내산 마크 존재
        return flag

    async def contains_keyword(self, keyword):
        cnt = 0
        for i in self.list:
            if keyword in i:
                cnt = cnt + 1

        return cnt

    async def ad_detection(self):
        cnt = 0
        detector = TextAdDetection()
        ad_result = detector.predict(self.list)
        for i in range(len(self.list)):
            if ad_result[i] == 1:
                cnt = cnt + 1
        return cnt

    def _check_option_range(self, option):
        if 0 >= option or option > len(self._options):
            raise CustomException(status_code=400, message="옵션 범위를 벗어났습니다")
