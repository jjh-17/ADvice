from kss import split_sentences

from models.exception.custom_exception import CustomException
from internals.emotion_evaluation import EmotionEvaluation
from internals.naver_blog_scrap import NaverBlogScrapper
from services.naver_cafe_scrap import NaverCafeScrapper


class SummaryService:
    def __init__(self):
        self._emotion_evaluator = EmotionEvaluation()
        self._naver_blog_scraper = NaverBlogScrapper()
        self._naver_cafe_scrapper = NaverCafeScrapper()

    async def get_emotion_base_summary(self, url: str):
        text = self._crawl_text(url)
        sentences = split_sentences(text)

        return await self._emotion_evaluator.get_emotion_summary(sentences)

    def _crawl_text(self, url: str):
        text = []

        # 블로그인 경우
        if "blog.naver" in url:
            text, _ = self._naver_blog_scraper.scrape_naver_blogs(url)

        # 카페인 경우
        if "cafe.naver" in url:
            # TODO: blog, cafe scrap 사이에 format 통일
            soup = self._naver_cafe_scrapper.scrape_naver_cafe_init(url)
            text = self._naver_cafe_scrapper.scrape_naver_cafe_text(soup)
            return text

        if len(text) < 1:
            raise CustomException(status_code=400, message="텍스트를 찾을 수 없습니다")

        return "".join(text)
