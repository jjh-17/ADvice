import requests
import json

from config.config import settings
from models.exception.custom_exception import CustomException
from models.detail_request import DetailRequest
from internals.detail_service import detail_service


class AdDetectService:
    async def detect_text_ad(self, data: DetailRequest):
        text, sentence = detail_service.get_text(data)

        results = requests.post(
            url=settings.text_ad_host + "/ad-evaluate", data=json.dumps(sentence)
        ).json()

        return detail_service.seperate_good_and_bad(
            sentence=sentence, result=results, text=text
        )

    async def detect_image_ad(self, data: DetailRequest):
        raise CustomException("Not Implemented")


ad_detect_service = AdDetectService()
