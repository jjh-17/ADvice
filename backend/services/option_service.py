from kss import split_sentences
import asyncio
from typing import List, Any
from pydantic import BaseModel

from models.full_request import FullRequest
from models.exception.custom_exception import CustomException
from services.naver_cafe_scrap import NaverCafeScrapper
from services.naver_blog_scrap import NaverBlogScrapper
from services.naver_in_scrap import NaverInScrapper
from internals.emotion_evaluation import EmotionEvaluation

import requests
import json

from config.config import settings

class OptionParameters(BaseModel):
    soup: Any
    sentences: List[str]
    images: List[str]
    keyword: str


class OptionService:
    def __init__(self):
        self.cafeScrap = NaverCafeScrapper()
        self.blogScrap = NaverBlogScrapper()
        self.inScrap = NaverInScrapper()
        self._options = [
            self.calc_types_information,    # 사진(image)/영상(video)/링크/지도(placeMap)/ 등 다양성
            self.calc_bad_url,              # 구매 링크나 특정 사이트로의 유도 링크가 포함되어 있는 경우
            self.calc_not_sponsored_mark,   # 내돈내산 인증 포함
            self.calc_contains_keyword,     # 특정 키워드 포함
            self.calc_ad_detection,         # 광고 문구
            self.calc_emotion_ratio,        # 장점/단점 비율
            self.calc_info_detection         # 객관적인 정보 포함
        ]

    async def option_service(self, data: FullRequest):
        select = {
            "good_option": data.goodOption,
            "bad_option": data.badOption,
            "keyword": data.keyword,
        }

        # url 갯수에 규칙이 없으므로 프로세스 수 제한
        # executor = ProcessPoolExecutor()
        # loop = asyncio.get_running_loop()
        #
        # tasks = [
        #     loop.run_in_executor(executor, self.get_score, url, select)
        #     for url in data.urlList
        # ]
        tasks = [self.get_score(url, select) for url in data.urlList]
        results = await asyncio.gather(*tasks)

        score=[]
        optionScore=[]
        for i in results:
            score.append(i[0])
            optionScore.append(i[1:])


        return {
            "scoreList": [
                {"url": url, "score": result1, "optionScore": result2}
                for url, result1, result2 in zip(data.urlList, score, optionScore)
            ]
        }

    # 동기 작업을 위한 래핑 함수
    def get_score(self, url: str, select: dict):
        return self.url_score(url, select)

    async def url_score(self, url: str, select: dict):
        # url 스크랩
        text, soup = self.url_scrap(url)
        # 문장으로 나누기
        sentences = split_sentences(text, backend="fast")
        # img url
        images = self.img_url_scrap(soup)

        param = OptionParameters(
            soup=soup, sentences=sentences, images=images, keyword=select["keyword"]
        )

        # good option과 bad option 순서 맞춤
        tasks = []
        for option in select["good_option"]:
            self._check_option_range(option)
            tasks.append(self._options[option - 1](param))

        for option in select["bad_option"]:
            self._check_option_range(option)
            tasks.append(self._options[option - 1](param))

        # good option과 bad option을 한번에 await
        result = await asyncio.gather(*tasks)

        good_score, bad_score = 0, 0
        # 결과를 각 옵션 길이에 따라 슬라이싱해서 분배
        good_option_length = len(select["good_option"])
        if good_option_length > 0:
            good_score += sum(result[:good_option_length]) / good_option_length

        bad_option_length = len(select["bad_option"])
        if bad_option_length > 0:
            bad_score += sum(result[good_option_length:]) / bad_option_length
        
        # 각 옵션별 점수
        optionScore = [980329 for i in range(8)]
        for i in range(good_option_length):
            optionScore[select["good_option"][i]] = result[i]
        for i in range(bad_option_length):
            optionScore[select["bad_option"][i]] = -1*result[i+good_option_length-1]

        return good_score - bad_score, optionScore

    async def calc_types_information(self, param: OptionParameters):
        return self.count_types_information(param.soup) * 25

    async def calc_bad_url(self, param: OptionParameters):
        return self.has_bad_url(param.soup) * 100

    async def calc_not_sponsored_mark(self, param: OptionParameters):
        return self.has_not_sponsored_mark(param.soup) * 100

    async def calc_contains_keyword(self, param: OptionParameters):
        if len(param.sentences) < 0:
            return 0

        return (
                self.contains_keyword(param.sentences, param.keyword) / len(param.sentences)
        ) * 100

    async def calc_ad_detection(self, param: OptionParameters):
        if len(param.sentences) < 0:
            return 0

        return await self.ad_detection(param.images, param.sentences) * 100

    async def calc_emotion_ratio(self, param: OptionParameters):
        if len(param.sentences) < 0:
            return 0

        return await self.emotion_ratio(param.sentences)

    async def calc_info_detection(self, param: OptionParameters):
        if len(param.sentences) < 0:
            return 0

        return (await self.info_detection(param.sentences) / len(param.sentences)) * 100

    def url_scrap(self, url: str):
        text = []
        soup = None

        if "in.naver.com" in url:  # 인플루언서 게시글인 경우
            soup = self.inScrap.scrape_naver_in_init(url)
            text = self.inScrap.scrape_naver_in_text(soup)

        if "cafe" in url:  # 카페 게시글인 경우
            soup = self.cafeScrap.scrape_naver_cafe_init(url)
            text = self.cafeScrap.scrape_naver_cafe_text(soup)

        if "blog" in url:  # 블로그 게시글인 경우
            soup = self.blogScrap.scrape_naver_blog_init(url)
            text = self.blogScrap.scrape_naver_blog_text(soup)

        if len(text) < 1:
            raise CustomException(status_code=400, message="텍스트를 찾을 수 없습니다")

        return text, soup

    def soup_get_main_container(self, soup):
        return soup.find("div", attrs={"class": "se-main-container"})

    def img_url_scrap(self, soup):
        img_url_list=[]
        soup = self.soup_get_main_container(soup)

        div_img_tags = soup.find_all("div", attrs={"class": "se-image"})
        for div_tag in div_img_tags:
            img_url = json.loads(div_tag.find("a").get("data-linkdata")).get('src')
            img_url_list.append(img_url)

        div_imgStrip_tags = soup.find_all("div", attrs={"class": "se-imageStrip"})
        for div_imgStrip_tag in div_imgStrip_tags:
            div_img_tag = div_imgStrip_tag.find_all("a")
            for div_tag in div_img_tag:
                img_url = json.loads(div_tag.get("data-linkdata")).get('src')
                img_url_list.append(img_url)

        return img_url_list


    def count_types_information(self, soup):
        cnt = 0
        soup = self.soup_get_main_container(soup)

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

    def has_bad_url(self, soup):
        flag = 0
        blockUrlList = [
            "https://coupa.ng/",
            "https://link.coupang.com/",
            "https://api3.myrealtrip.com/",
            "https://smartstore.naver.com",
        ]
        soup = self.soup_get_main_container(soup)

        div_oglink_tags = soup.find_all("div", attrs={"class": "se-oglink"})

        for div_tag in div_oglink_tags:
            url = div_tag.find("a").get("href")
            for i in blockUrlList:
                if i in url:
                    flag = 1

        # 1이면 블랙리스트 링크 존재
        return flag

    def has_not_sponsored_mark(self, soup):
        flag = 0
        if soup.find("div", attrs={"class": "not_sponsored_summary_wrap"}):
            flag = 1

        # 1이면 내돈내산 마크 존재
        return flag

    def contains_keyword(self, sentences, keyword):
        cnt = 0
        for i in sentences:
            if keyword in i:
                cnt = cnt + 1

        return cnt

    async def ad_detection(self, images, sentences):
        results = requests.post(
            url=settings.text_ad_host + "/ad-evaluate/short",
            json={"data": sentences[-3:], "path": images[-2:]}
        ).json()
        return int(results)

    # 글이 얼마나 중립적인지 반환
    async def emotion_ratio(self, sentences):
        evaluator = EmotionEvaluation()
        res = await evaluator.get_emotion(sentences)

        p_neg = len(res['negative']) / len(sentences)
        p_neu = len(res['neutral']) / len(sentences)
        p_pos = len(res['positive']) / len(sentences)

        return (p_neu + min(1 - p_neu, 1 - abs(p_neg - p_pos))) * 100

    async def info_detection(self, sentences):
        results = requests.post(
            url=settings.text_ad_host + "/info-evaluate", data=json.dumps(sentences)
        ).json()
        return results.count(1)

    def _check_option_range(self, option):
        if 0 >= option or option > len(self._options):
            raise CustomException(status_code=400, message="옵션 범위를 벗어났습니다")
